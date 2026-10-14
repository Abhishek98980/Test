export type Status = 'done' | 'in-progress' | 'pending' | 'blocked' | 'skipped'

export type Step = {
  title: string
  status: Status
  note?: string
}

export type Phase = {
  title: string
  status: Status
  note?: string
  steps?: Step[]
}

export type Plan = {
  project: string
  goal?: string
  phases: Phase[]
  updatedAt: number
}

declare module 'claude-code' {
  interface PluginState {
    'project-tracker': { plan: Plan | null }
  }
}
