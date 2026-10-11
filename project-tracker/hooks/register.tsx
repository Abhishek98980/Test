import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Plan, Section, SectionStatus } from '../types'

const PANE = 'project-tracker'
const TOOL = 'mcp__project-tracker__update'
const plan = atom({ plugin: 'project-tracker', key: 'plan' } as const, null)

const STATUSES: readonly SectionStatus[] = ['done', 'in-progress', 'pending', 'skipped', 'blocked']

const MARK: Record<SectionStatus, { glyph: string; emoji: string; label: string; color?: string }> = {
  done: { glyph: '✓', emoji: '✅', label: 'Done', color: 'success' },
  'in-progress': { glyph: '▶', emoji: '🔄', label: 'In progress', color: 'warning' },
  pending: { glyph: '○', emoji: '⏳', label: 'Pending' },
  skipped: { glyph: '↷', emoji: '⏭️', label: 'Skipped', color: 'subtle' },
  blocked: { glyph: '✗', emoji: '⛔', label: 'Blocked', color: 'error' },
}

const MODE = `# Project tracker mode

The user asked for this to be on in every project, for the whole chat. Whenever you work on a project or any multi-step task, keep a tracker of the whole task with the ${TOOL} tool:
- At the start, break the work into sections and call the tool with every section and its status.
- Call it again each time a section starts, finishes, is skipped or gets blocked, always sending the full list (it replaces the previous one).
- Keep exactly one section "in-progress" while you work. Every "skipped" or "blocked" section needs a note saying why.
- End each reply about the project with the tracker text the tool returned, so the user can follow progress in the chat.
- Skip the tracker for one-off questions that aren't project work.
- The user can type /tracker to see it, or /tracker clear to reset it.`

const counts = (sections: readonly Section[]) => {
  const by = Object.fromEntries(STATUSES.map(s => [s, 0])) as Record<SectionStatus, number>
  for (const one of sections) by[one.status] += 1
  return by
}

const bar = (done: number, total: number, width = 20) => {
  const filled = total === 0 ? 0 : Math.round((done / total) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export const summary = (p: Plan) => {
  const by = counts(p.sections)
  const total = p.sections.length
  const now = p.sections.find(s => s.status === 'in-progress')
  const parts = [`${by.done}/${total} done`]
  if (now) parts.push(`now: ${now.title}`)
  if (by.pending) parts.push(`${by.pending} pending`)
  if (by.skipped) parts.push(`${by.skipped} skipped`)
  if (by.blocked) parts.push(`${by.blocked} blocked`)
  return `${p.project} · ${parts.join(' · ')}`
}

export const asMarkdown = (p: Plan) => {
  const by = counts(p.sections)
  const total = p.sections.length
  const pct = total === 0 ? 0 : Math.round((by.done / total) * 100)
  const lines = [`### 📋 Project tracker: ${p.project}`]
  if (p.goal) lines.push(`_Goal: ${p.goal}_`)
  lines.push('', `\`${bar(by.done, total)}\` ${pct}% (${by.done}/${total} done)`, '')
  lines.push('| # | Section | Status | Notes |', '|---|---|---|---|')
  p.sections.forEach((s, i) => {
    const m = MARK[s.status]
    lines.push(`| ${i + 1} | ${s.title} | ${m.emoji} ${m.label} | ${s.note ?? ''} |`)
  })
  lines.push(
    '',
    `✅ ${by.done} done · 🔄 ${by['in-progress']} in progress · ⏳ ${by.pending} pending · ⏭️ ${by.skipped} skipped · ⛔ ${by.blocked} blocked`,
  )
  return lines.join('\n')
}

// Reads the tool's loose input into a Plan, or says what is wrong with it.
export const parsePlan = (input: Record<string, unknown>, now: number): Plan | string => {
  const project = typeof input.project === 'string' ? input.project.trim() : ''
  if (!project) return 'project is required.'
  if (!Array.isArray(input.sections) || input.sections.length === 0) {
    return 'sections must list at least one section.'
  }
  const sections: Section[] = []
  for (const raw of input.sections as unknown[]) {
    const one = (raw ?? {}) as Record<string, unknown>
    const title = typeof one.title === 'string' ? one.title.trim() : ''
    const status = one.status as SectionStatus
    const note = typeof one.note === 'string' && one.note.trim() ? one.note.trim() : undefined
    if (!title) return 'every section needs a title.'
    if (!STATUSES.includes(status)) return `"${title}": status must be one of ${STATUSES.join(', ')}.`
    if ((status === 'skipped' || status === 'blocked') && !note) {
      return `"${title}" is ${status}: add a note saying why.`
    }
    sections.push(note ? { title, status, note } : { title, status })
  }
  const goal = typeof input.goal === 'string' && input.goal.trim() ? input.goal.trim() : undefined
  return goal ? { project, goal, sections, updatedAt: now } : { project, sections, updatedAt: now }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'update',
      description:
        'Updates the project tracker the user watches: the project, its goal, and every section with its status ' +
        '(done, in-progress, pending, skipped, blocked). Send the full list each time; it replaces the last one. ' +
        'Skipped and blocked sections need a note saying why. Returns the tracker as markdown to show the user.',
      inputSchema: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Short name of the project or task.' },
          goal: { type: 'string', description: 'One line on what done looks like.' },
          sections: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                status: { type: 'string', enum: [...STATUSES] },
                note: { type: 'string', description: 'Why it was skipped or is blocked; optional otherwise.' },
              },
              required: ['title', 'status'],
            },
          },
        },
        required: ['project', 'sections'],
      },
      isDeferred: false,
    })
    await $.command.register({
      name: 'tracker',
      description: 'Show the project tracker (or "/tracker clear" to reset it)',
      argumentHint: '[clear]',
    })

    const saved = (await $.store.get(`plan:${await $.session.root()}`)) as Plan | undefined
    if (saved && (await read($, plan)) === null) {
      await update($, plan, () => saved)
    }

    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const current = await read($, plan)
    const text = current
      ? `${MODE}\n\nThe tracker as it stands:\n${asMarkdown(current)}`
      : MODE

    return { sections: [...composed.sections, { id: 'project-tracker:mode', text, scope: 'session' }] }
  })

  on('tool.call', { tool: TOOL }, async ($, e) => {
    const parsed = parsePlan(e as unknown as Record<string, unknown>, await $.clock.now())
    if (typeof parsed === 'string') return { deny: `project-tracker: ${parsed}` }

    await update($, plan, () => parsed)
    await $.store.set(`plan:${await $.session.root()}`, parsed)
    $.ui.status(`📋 ${summary(parsed)}`)
    void $.ui.open({ id: PANE, title: 'Project tracker' })

    return { result: asMarkdown(parsed) }
  }).catch(() => ({ deny: 'project-tracker: the tracker could not be updated; try the call again.' }))

  on('command.run', { command: 'tracker' }, async ($, e) => {
    if (e.args.trim() === 'clear') {
      await update($, plan, () => null)
      await $.store.delete(`plan:${await $.session.root()}`)
      $.ui.status(undefined)
      await $.ui.close({ id: PANE })
      return { text: 'Project tracker cleared.' }
    }
    const current = await read($, plan)
    if (!current) return { text: 'No project is being tracked yet.' }
    await $.ui.open({ id: PANE, title: 'Project tracker' })

    return { text: asMarkdown(current) }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, plan)
    if (e.props.hasSurvey || !current) return next(e)
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor wrap="truncate-end">
          📋 {summary(current)}
        </Text>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const current = await read($, plan)
    if (!current) {
      return (
        <Box flexDirection="column">
          <Text dimColor>No project is being tracked yet.</Text>
        </Box>
      )
    }
    const by = counts(current.sections)
    const total = current.sections.length
    const width = Math.max(8, Math.min(30, e.props.bodyColumns - 14))

    return (
      <Box flexDirection="column">
        <Text bold>{current.project}</Text>
        {current.goal && <Text dimColor>Goal: {current.goal}</Text>}
        <Text>
          <Text color="success">{bar(by.done, total, width)}</Text> {by.done}/{total} done
        </Text>
        <Text> </Text>
        {current.sections.map((s, i) => {
          const m = MARK[s.status]
          return (
            <Box key={`s${i}`} flexDirection="column">
              <Text color={m.color} dimColor={s.status === 'pending'} bold={s.status === 'in-progress'}>
                {m.glyph} {s.title}
                <Text dimColor> · {m.label}</Text>
              </Text>
              {s.note && <Text dimColor>{'   '}↳ {s.note}</Text>}
            </Box>
          )
        })}
        <Text> </Text>
        <Text dimColor>
          {by['in-progress']} in progress · {by.pending} pending · {by.skipped} skipped · {by.blocked} blocked
        </Text>
      </Box>
    )
  })
}
