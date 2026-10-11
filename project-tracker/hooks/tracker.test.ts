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

const SECTIONS = [
  { title: 'Set up repo', status: 'done' },
  { title: 'Build API', status: 'in-progress' },
  { title: 'Write docs', status: 'pending' },
  { title: 'Dark mode', status: 'skipped', note: 'not needed for v1' },
]

test('an update fills the tracker, the pane and the band on each surface', async ($, on) => {
  stub(on)
  const ran = await $.tool.call({ tool: TOOL, project: 'Shop', goal: 'Ship v1', sections: SECTIONS })
  expect(ran.deny).toBeUndefined()
  expect(String(ran.result)).toContain('1/4 done')
  expect(String(ran.result)).toContain('not needed for v1')

  for (const surface of ['terminal', 'desktop'] as const) {
    const pane = await $.ui.mount({
      plugin: 'project-tracker',
      surface,
      component: 'Pane',
      requestId: 'project-tracker',
      props: {
        title: 'Project tracker',
        isFocused: false,
        bodyColumns: 50,
        placement: 'dock',
        scroll: { offset: 0, bodyRows: 30 },
        view: {},
      },
    })
    expect(await pane.find({ type: 'Text', text: /Build API/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /not needed for v1/ })).toBeDefined()
    await pane.unmount()

    const band = await $.ui.mount({
      plugin: 'project-tracker',
      surface,
      component: 'AbovePrompt',
      props: {
        hasSurvey: false,
        isWorking: false,
        maxRows: 3,
        bodyColumns: 80,
        scroll: { offset: 0, bodyRows: 3 },
        view: {},
      },
    })
    expect(await band.find({ type: 'Text', text: /Shop · 1\/4 done · now: Build API/ })).toBeDefined()
    await band.unmount()
  }
})

test('a skipped section without a reason is refused', async ($, on) => {
  stub(on)
  const ran = await $.tool.call({
    tool: TOOL,
    project: 'Shop',
    sections: [{ title: 'Tests', status: 'skipped' }],
  })
  expect(ran.deny).toContain('add a note saying why')
})
