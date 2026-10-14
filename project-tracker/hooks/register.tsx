import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Phase, Plan, Status, Step } from '../types'

const PANE = 'project-tracker'
const TOOL = 'mcp__project-tracker__update'
const plan = atom({ plugin: 'project-tracker', key: 'plan' } as const, null)

const STATUSES: readonly Status[] = ['done', 'in-progress', 'pending', 'blocked', 'skipped']

const MARK: Record<Status, { glyph: string; emoji: string; label: string; color?: 'success' | 'warning' | 'error' | 'subtle' }> = {
  done: { glyph: '✓', emoji: '✅', label: 'Done', color: 'success' },
  'in-progress': { glyph: '▶', emoji: '🔄', label: 'In progress', color: 'warning' },
  pending: { glyph: '○', emoji: '⏳', label: 'Pending' },
  blocked: { glyph: '✗', emoji: '⛔', label: 'Blocked', color: 'error' },
  skipped: { glyph: '↷', emoji: '⏭️', label: 'Skipped', color: 'subtle' },
}

const MODE = `# Phase tracker mode

The user asked for this to be on in every project, for the whole chat. Whenever you work on a project or any multi-step task, track it in phases with the ${TOOL} tool:
- At the start, understand the task, split it into phases in the order you will do them, and give each phase its steps. Call the tool with every phase.
- Call it again whenever a phase or step starts, finishes, is blocked or is skipped, always sending the full plan (it replaces the previous one).
- Keep exactly one phase "in-progress" while you work, and inside it the step you are on.
- Every "blocked" or "skipped" phase or step needs a note saying why. A pending phase may say what it waits on.
- End each reply about the project with the tracker text the tool returned, so the user can follow progress in the chat.
- Skip the tracker for one-off questions that aren't project work.
- The user can type /tracker to see it, or /tracker clear to reset it.`

const tally = (items: readonly { status: Status }[]) => {
  const by = Object.fromEntries(STATUSES.map(s => [s, 0])) as Record<Status, number>
  for (const one of items) by[one.status] += 1
  return by
}

const bar = (done: number, total: number, width = 20) => {
  const filled = total === 0 ? width : Math.round((done / total) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

const percent = (done: number, total: number) => (total === 0 ? 100 : Math.round((done / total) * 100))

// A phase's share of the work is its steps, or the phase itself when it has none.
// Skipped work leaves the total; a phase marked done counts all of its work as done.
export const phaseProgress = (p: Phase) => {
  if (p.status === 'skipped') return { done: 0, total: 0 }
  const units: readonly { status: Status }[] = p.steps && p.steps.length > 0 ? p.steps : [p]
  const total = units.filter(u => u.status !== 'skipped').length
  if (p.status === 'done') return { done: total, total }
  return { done: units.filter(u => u.status === 'done').length, total }
}

export const progress = (pl: Plan) => {
  let done = 0
  let total = 0
  for (const ph of pl.phases) {
    const r = phaseProgress(ph)
    done += r.done
    total += r.total
  }
  return { done, total, pct: percent(done, total) }
}

const currentIndex = (pl: Plan) => {
  for (const want of ['in-progress', 'blocked', 'pending'] as const) {
    const i = pl.phases.findIndex(p => p.status === want)
    if (i >= 0) return i
  }
  return -1
}

const allSteps = (pl: Plan) => pl.phases.flatMap(p => p.steps ?? [])

const blockedCount = (pl: Plan) =>
  pl.phases.filter(p => p.status === 'blocked').length + allSteps(pl).filter(s => s.status === 'blocked').length

export const summary = (pl: Plan) => {
  const { pct } = progress(pl)
  const n = pl.phases.length
  const ph = pl.phases[currentIndex(pl)]
  const parts = [pl.project, `${pct}%`]
  if (!ph) {
    parts.push(`all ${n} phases finished`)
  } else {
    const i = pl.phases.indexOf(ph)
    const r = phaseProgress(ph)
    const steps = ph.steps && ph.steps.length > 0 ? ` (${r.done}/${r.total})` : ''
    parts.push(`phase ${i + 1}/${n}: ${ph.title}${steps}`)
  }
  const blocked = blockedCount(pl)
  if (blocked) parts.push(`${blocked} blocked`)
  return parts.join(' · ')
}

export const asMarkdown = (pl: Plan) => {
  const all = progress(pl)
  const n = pl.phases.length
  const i = currentIndex(pl)
  const phasesDone = pl.phases.filter(p => p.status === 'done').length
  const lines = [`### 📋 ${pl.project}`]
  if (pl.goal) lines.push(`_Goal: ${pl.goal}_`)
  lines.push(
    '',
    `**Overall** \`${bar(all.done, all.total)}\` **${all.pct}%** · ${phasesDone}/${n} phases done · ${all.done}/${all.total} steps`,
    '',
    '| # | Phase | Progress | Status | Notes |',
    '|---|---|---|---|---|',
  )
  pl.phases.forEach((ph, k) => {
    const m = MARK[ph.status]
    const r = phaseProgress(ph)
    const count = ph.steps && ph.steps.length > 0 ? ` ${r.done}/${r.total}` : ''
    const prog = ph.status === 'skipped' ? '—' : `\`${bar(r.done, r.total, 10)}\` ${percent(r.done, r.total)}%${count}`
    lines.push(`| ${k + 1} | ${ph.title} | ${prog} | ${m.emoji} ${m.label} | ${ph.note ?? ''} |`)
  })

  const cur = pl.phases[i]
  if (cur && cur.steps && cur.steps.length > 0) {
    lines.push('', `**Phase ${i + 1}: ${cur.title}**`)
    for (const s of cur.steps) {
      lines.push(`- ${MARK[s.status].emoji} ${s.title}${s.note ? ` · _${s.note}_` : ''}`)
    }
  }

  const why: string[] = []
  pl.phases.forEach((ph, k) => {
    if ((ph.status === 'blocked' || ph.status === 'skipped') && ph.note) {
      why.push(`- ${MARK[ph.status].emoji} Phase ${k + 1}, ${ph.title}: ${ph.note}`)
    }
    for (const s of ph.steps ?? []) {
      if ((s.status === 'blocked' || s.status === 'skipped') && s.note) {
        why.push(`- ${MARK[s.status].emoji} ${ph.title} › ${s.title}: ${s.note}`)
      }
    }
  })
  if (why.length) lines.push('', '**Not done, and why**', ...why)

  const by = tally(pl.phases)
  lines.push(
    '',
    `Phases: ✅ ${by.done} done · 🔄 ${by['in-progress']} in progress · ⏳ ${by.pending} pending · ⛔ ${by.blocked} blocked · ⏭️ ${by.skipped} skipped`,
  )
  return lines.join('\n')
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

const readItem = (raw: unknown, where: string): { title: string; status: Status; note?: string } | string => {
  const one = (raw ?? {}) as Record<string, unknown>
  const title = text(one.title)
  const status = one.status as Status
  const note = text(one.note) || undefined
  if (!title) return `every ${where} needs a title.`
  if (!STATUSES.includes(status)) return `"${title}": status must be one of ${STATUSES.join(', ')}.`
  if ((status === 'blocked' || status === 'skipped') && !note) return `"${title}" is ${status}: add a note saying why.`
  return note ? { title, status, note } : { title, status }
}

// Reads the tool's loose input into a Plan, or says what is wrong with it.
// `sections` (the 0.1 shape) is read as phases without steps.
export const parsePlan = (input: Record<string, unknown>, now: number): Plan | string => {
  const project = text(input.project)
  if (!project) return 'project is required.'
  const list = Array.isArray(input.phases) ? input.phases : Array.isArray(input.sections) ? input.sections : []
  if (list.length === 0) return 'phases must list at least one phase.'
  const phases: Phase[] = []
  for (const raw of list as unknown[]) {
    const head = readItem(raw, 'phase')
    if (typeof head === 'string') return head
    const rawSteps = ((raw ?? {}) as Record<string, unknown>).steps
    const steps: Step[] = []
    if (Array.isArray(rawSteps)) {
      for (const rs of rawSteps) {
        const step = readItem(rs, 'step')
        if (typeof step === 'string') return `${head.title}: ${step}`
        steps.push(step)
      }
    }
    phases.push(steps.length > 0 ? { ...head, steps } : head)
  }
  const running = phases.filter(p => p.status === 'in-progress')
  if (running.length > 1) {
    return `only one phase can be in progress; ${running.map(p => `"${p.title}"`).join(' and ')} both are.`
  }
  const goal = text(input.goal)
  return goal ? { project, goal, phases, updatedAt: now } : { project, phases, updatedAt: now }
}

const migrate = (saved: unknown): Plan | undefined => {
  if (!saved || typeof saved !== 'object') return undefined
  const s = saved as Record<string, unknown>
  if (Array.isArray(s.phases)) return saved as Plan
  if (Array.isArray(s.sections)) {
    const parsed = parsePlan(s, typeof s.updatedAt === 'number' ? s.updatedAt : 0)
    return typeof parsed === 'string' ? undefined : parsed
  }
  return undefined
}

const ITEM = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    status: { type: 'string', enum: [...STATUSES] },
    note: { type: 'string', description: 'Why it is blocked or skipped (required then), or what it waits on.' },
  },
  required: ['title', 'status'],
} as const

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'update',
      description:
        'Updates the phase tracker the user watches: the project, its goal, and every phase in order with its status ' +
        '(done, in-progress, pending, blocked, skipped) and optional steps with their own status. Send the full plan ' +
        'each time; it replaces the last one. Blocked and skipped phases or steps need a note saying why. Only one ' +
        'phase may be in progress. Returns the tracker as markdown to show the user.',
      inputSchema: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Short name of the project or task.' },
          goal: { type: 'string', description: 'One line on what done looks like.' },
          phases: {
            type: 'array',
            minItems: 1,
            description: 'Every phase, in the order it is done.',
            items: {
              ...ITEM,
              properties: {
                ...ITEM.properties,
                steps: { type: 'array', description: 'The steps inside this phase, in order.', items: ITEM },
              },
            },
          },
        },
        required: ['project', 'phases'],
      },
      isDeferred: false,
    })
    await $.command.register({
      name: 'tracker',
      description: 'Show the phase tracker (or "/tracker clear" to reset it)',
      argumentHint: '[clear]',
    })

    const saved = migrate(await $.store.get(`plan:${await $.session.root()}`))
    if (saved && (await read($, plan)) === null) {
      await update($, plan, () => saved)
    }

    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const current = await read($, plan)
    const body = current ? `${MODE}\n\nThe tracker as it stands:\n${asMarkdown(current)}` : MODE

    return { sections: [...composed.sections, { id: 'project-tracker:mode', text: body, scope: 'session' }] }
  })

  on('tool.call', { tool: TOOL }, async ($, e) => {
    const parsed = parsePlan(e as unknown as Record<string, unknown>, await $.clock.now())
    if (typeof parsed === 'string') return { deny: `project-tracker: ${parsed}` }

    await update($, plan, () => parsed)
    await $.store.set(`plan:${await $.session.root()}`, parsed)
    $.ui.status(`📋 ${summary(parsed)}`)
    void $.ui.open({ id: PANE, title: 'Phase tracker' })

    return { result: asMarkdown(parsed) }
  }).catch(() => ({ deny: 'project-tracker: the tracker could not be updated; try the call again.' }))

  on('command.run', { command: 'tracker' }, async ($, e) => {
    if (e.args.trim() === 'clear') {
      await update($, plan, () => null)
      await $.store.delete(`plan:${await $.session.root()}`)
      $.ui.status(undefined)
      await $.ui.close({ id: PANE })
      return { text: 'Phase tracker cleared.' }
    }
    const current = await read($, plan)
    if (!current) return { text: 'No project is being tracked yet.' }
    await $.ui.open({ id: PANE, title: 'Phase tracker' })

    return { text: asMarkdown(current) }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, plan)
    if (e.props.hasSurvey || !current) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const all = progress(current)

    return (
      <Box>
        <Text dimColor wrap="truncate-end">
          📋 <Text color="success">{bar(all.done, all.total, 10)}</Text> {summary(current)}
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
    const all = progress(current)
    const n = current.phases.length
    const phasesDone = current.phases.filter(p => p.status === 'done').length
    const wide = Math.max(8, Math.min(30, e.props.bodyColumns - 8))
    const mini = Math.max(6, Math.min(16, e.props.bodyColumns - 14))
    const by = tally(current.phases)

    return (
      <Box flexDirection="column">
        <Text bold>{current.project}</Text>
        {current.goal && <Text dimColor>{current.goal}</Text>}
        <Text> </Text>
        <Text>
          <Text color="success">{bar(all.done, all.total, wide)}</Text> <Text bold>{all.pct}%</Text>
        </Text>
        <Text dimColor>
          {phasesDone}/{n} phases · {all.done}/{all.total} steps
        </Text>
        <Text> </Text>
        {current.phases.map((ph, k) => {
          const m = MARK[ph.status]
          const r = phaseProgress(ph)
          const open = ph.status === 'in-progress' || ph.status === 'blocked'
          const shown = (ph.steps ?? []).filter(s => open || s.status === 'blocked' || s.status === 'skipped')
          return (
            <Box key={`p${k}`} flexDirection="column">
              <Text color={m.color} bold={ph.status === 'in-progress'} dimColor={ph.status === 'pending'}>
                {m.glyph} {k + 1}. {ph.title}
                <Text dimColor> · {m.label}</Text>
              </Text>
              {ph.status !== 'skipped' && (
                <Text dimColor={ph.status === 'pending'}>
                  {'   '}
                  <Text color={m.color}>{bar(r.done, r.total, mini)}</Text> {percent(r.done, r.total)}%
                  {ph.steps && ph.steps.length > 0 ? ` · ${r.done}/${r.total}` : ''}
                </Text>
              )}
              {ph.note && <Text dimColor>{'   '}↳ {ph.note}</Text>}
              {shown.map((s, j) => {
                const sm = MARK[s.status]
                return (
                  <Box key={`p${k}s${j}`} flexDirection="column">
                    <Text color={sm.color} dimColor={s.status === 'pending'} bold={s.status === 'in-progress'}>
                      {'     '}
                      {sm.glyph} {s.title}
                    </Text>
                    {s.note && <Text dimColor>{'       '}↳ {s.note}</Text>}
                  </Box>
                )
              })}
            </Box>
          )
        })}
        <Text> </Text>
        <Text dimColor>
          {by.done} done · {by['in-progress']} in progress · {by.pending} pending · {by.blocked} blocked · {by.skipped} skipped
        </Text>
      </Box>
    )
  })
}
