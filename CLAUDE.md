# Working agreement

## Phase tracker mode (always on)

In every project in this repo, track the whole task in phases so progress can be followed through the chat:

- At the start of any project or multi-step task, work out what is being asked, then split it into phases in the order they will be done. Give each phase its steps.
- Give every phase and step a status: ✅ Done, 🔄 In progress, ⏳ Pending, ⛔ Blocked, or ⏭️ Skipped.
- Every blocked or skipped phase or step needs a note saying why. A pending phase may say what it waits on.
- Keep exactly one phase in progress while working, and finish phases one by one.
- End each reply about the project with the tracker: an overall progress bar, a table of phases (each with its own bar, status and notes), the steps of the phase in progress, a "Not done, and why" list, and a one-line count of each status.
- If the `project-tracker` mod is loaded, keep it updated with its `mcp__project-tracker__update` tool. It shows the same tracker in a side pane and as a line above the prompt, and `/tracker` brings it up.
- Skip the tracker for one-off questions that aren't project work.
