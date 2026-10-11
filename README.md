# project-tracker

A Claude Code mod that keeps a live tracker of whatever project you're working on with Claude: which section is in progress, which are done, which are pending, and which were skipped or blocked, with the reason.

- **Side pane** listing every section with its status and notes.
- **One-line summary above the prompt**, e.g. `📋 Shop · 3/7 done · now: Build API · 2 pending · 1 skipped`.
- **In the chat:** Claude ends each project reply with the tracker table.
- **`/tracker`** shows it. **`/tracker clear`** resets it.
- **Saved per project folder**, so it comes back when you start a new session in the same project.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install project-tracker --marketplace abhishek98980/test
```

Answer `y` to add the marketplace, then pick the **user** scope so it's on in every project.

## How it works

The mod adds a section to Claude's system prompt that turns tracker mode on. It also registers a `mcp__project-tracker__update` tool. Claude calls the tool with the full list of sections each time one starts, finishes, is skipped or gets blocked. Skipped and blocked sections are refused unless they include a reason.

`CLAUDE.md` in this repo holds the same instructions as a fallback, for sessions where the plugin isn't installed.
