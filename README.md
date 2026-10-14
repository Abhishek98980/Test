# project-tracker

A Claude Code mod that tracks whatever project you're working on with Claude in phases: an overall progress bar, a bar for each phase, the steps inside each phase, and the reason anything is blocked or skipped.

- **Side pane** listing every phase with its own progress bar, status and notes, and the steps of the phase in progress.
- **One-line summary above the prompt**, e.g. `📋 ████░░░░░░ Site · 42% · phase 3/7: Design system (2/5) · 1 blocked`.
- **In the chat:** Claude ends each project reply with the tracker: overall bar, phase table, current steps, and a "Not done, and why" list.
- **`/tracker`** shows it. **`/tracker clear`** resets it.
- **Saved per project folder**, so it comes back when you start a new session in the same project.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install project-tracker --marketplace abhishek98980/test
```

Answer `y` to add the marketplace, then pick the **user** scope so it's on in every project.

## How it works

The mod adds a section to Claude's system prompt that turns tracker mode on. It also registers a `mcp__project-tracker__update` tool. Claude calls the tool with the full plan (phases, each with optional steps) each time a phase or step starts, finishes, is blocked or is skipped. Blocked and skipped items are refused unless they include a reason, and only one phase may be in progress. The older `sections` shape still works.

`CLAUDE.md` in this repo holds the same instructions as a fallback, for sessions where the plugin isn't installed.
