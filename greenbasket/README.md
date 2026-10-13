# Greenbasket — PRD and System Design

`Greenbasket_PRD_v2.docx` is the requirements baseline for the Greenbasket fresh-produce store (WordPress + WooCommerce). Version 2.0 supersedes the 1.0 document.

## What's in the folder

| Path | Contents |
|---|---|
| `Greenbasket_PRD_v2.docx` | The document to read, share or attach to Claude |
| `source/prd/*.md` | The document text, one file per part, in reading order |
| `source/diagrams/*.mmd` | Editable Mermaid sources for all 19 figures |
| `source/diagrams/png/` | Rendered figures and their sizes (`sizes.json`) |
| `source/build/` | Scripts that render the diagrams and build the `.docx` |

## Rebuilding after an edit

Edit the Markdown or Mermaid sources, not the `.docx`. Then:

```sh
cd greenbasket/source/build
npm install mermaid@11.4.1 docx@9 jszip playwright   # once
node render-diagrams.js    # only if a .mmd file changed
node build-docx.js         # writes ../../Greenbasket_PRD_v2.docx
```

`render-diagrams.js` needs a Chromium that Playwright can launch.
