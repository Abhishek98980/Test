export type SectionStatus = 'done' | 'in-progress' | 'pending' | 'skipped' | 'blocked'

export type Section = {
  title: string
  status: SectionStatus
  note?: string
}

export type Plan = {
  project: string
  goal?: string
  sections: Section[]
  updatedAt: number
}

declare module 'claude-code' {
  interface PluginState {
    'project-tracker': { plan: Plan | null }
  }
}
