import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const TOOL = 'mcp__project-tracker__update'

const stub = (on: On) => {
  mock.clock(on)
  mock.store(on)
  on('session.root', () => ({ value: '/proj' }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
}

const PHASES = [
  { title: 'Tracker mod', status: 'done' },
  {
    title: 'Research',
    status: 'in-progress',
    steps: [
      { title: 'Read the PRD', status: 'done' },
      { title: 'Reference sites', status: 'in-progress' },
      { title: 'Gap analysis', status: 'pending' },
      { title: 'Staging audit', status: 'blocked', note: 'no access details yet' },
    ],
  },
  { title: 'Page designs', status: 'pending', note: 'waits on research' },
]

const PANE_PROPS = {
  title: 'Phase tracker',
  isFocused: false,
  bodyColumns: 50,
  placement: 'dock',
  scroll: { offset: 0, bodyRows: 40 },
  view: {},
} as const

const BAND_PROPS = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 3,
  bodyColumns: 100,
  scroll: { offset: 0, bodyRows: 3 },
  view: {},
} as const

test('phases fill the chat tracker, the pane and the band on each surface', async ($, on) => {
  stub(on)
  const ran = await $.tool.call({ tool: TOOL, project: 'Site', goal: 'Every page designed', phases: PHASES })
  expect(ran.deny).toBeUndefined()
  const md = String(ran.result)
  // 1 (mod) + 4 steps + 1 (pages) = 6 units, 2 done
  expect(md).toContain('**33%**')
  expect(md).toContain('1/3 phases done')
  expect(md).toContain('**Phase 2: Research**')
  expect(md).toContain('**Not done, and why**')
  expect(md).toContain('Research › Staging audit: no access details yet')
  expect(md).toContain('waits on research')

  for (const surface of ['terminal', 'desktop'] as const) {
    const pane = await $.ui.mount({ plugin: 'project-tracker', surface, component: 'Pane', requestId: 'project-tracker', props: PANE_PROPS })
    expect(await pane.find({ type: 'Text', text: /2\. Research/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /Reference sites/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /no access details yet/ })).toBeDefined()
    await pane.unmount()

    const band = await $.ui.mount({ plugin: 'project-tracker', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(await band.find({ type: 'Text', text: /Site · 33% · phase 2\/3: Research \(1\/4\) · 1 blocked/ })).toBeDefined()
    await band.unmount()
  }
})

test('a blocked step without a reason is refused', async ($, on) => {
  stub(on)
  const ran = await $.tool.call({
    tool: TOOL,
    project: 'Site',
    phases: [{ title: 'Research', status: 'in-progress', steps: [{ title: 'Fetch', status: 'blocked' }] }],
  })
  expect(ran.deny).toContain('add a note saying why')
})

test('two phases in progress are refused', async ($, on) => {
  stub(on)
  const ran = await $.tool.call({
    tool: TOOL,
    project: 'Site',
    phases: [
      { title: 'A', status: 'in-progress' },
      { title: 'B', status: 'in-progress' },
    ],
  })
  expect(ran.deny).toContain('only one phase can be in progress')
})

test('the 0.1 sections shape still works', async ($, on) => {
  stub(on)
  const ran = await $.tool.call({
    tool: TOOL,
    project: 'Shop',
    sections: [
      { title: 'Set up', status: 'done' },
      { title: 'Build', status: 'pending' },
    ],
  })
  expect(ran.deny).toBeUndefined()
  expect(String(ran.result)).toContain('**50%**')
})
