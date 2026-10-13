// Builds Greenbasket_PRD_v2.docx from prd/*.md and diagrams/png/*.png.
// Usage: node build-docx.js [output.docx]   (needs the `docx` npm package, v9)
//
// Supported markdown subset: # / ## / ### headings, paragraphs, **bold**, *italic*, `code`,
// "- " bullets and "1. " numbered lists (indent 2+ spaces for a nested level), "> " callouts,
// pipe tables (optional "<!-- widths: a,b,c -->" line before a table, in percent),
// ![caption](path) figures (append {landscape} for a landscape page), \pagebreak and [[CONTENTS]].
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, ImageRun, Header, Footer, PageNumber, PageOrientation, BorderStyle,
  LevelFormat, Bookmark, InternalHyperlink, PageBreak, VerticalAlign, TableLayoutType,
} = require('docx');

const ROOT = path.join(__dirname, '..');
const PRD_DIR = path.join(ROOT, 'prd');
const OUT = process.argv[2] || path.join(ROOT, '..', 'Greenbasket_PRD_v2.docx');
const SIZES = JSON.parse(fs.readFileSync(path.join(ROOT, 'diagrams', 'png', 'sizes.json'), 'utf8'));

// A4 in DXA (1440 per inch); 0.75" margins.
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = 1080;
const CONTENT_W = PAGE_W - 2 * MARGIN;                 // portrait text width
const FONT = 'Arial', MONO = 'Consolas';
const C = {
  green: '1F5130', green2: '2E6B3A', text: '1E2621', grey: '5F6B63', rule: 'B9CBBE',
  headFill: 'E3F0E6', cellBorder: 'C9D6CD', calloutFill: 'F1F7F2', codeFill: 'EEF1EF',
};
const LABELS = {
  'CONFIRMED': '1B7F3A', 'OBSERVED': '00695C', 'RECOMMENDATION': '1558A6', 'OPEN DECISION': 'A35F00',
  'CONFIGURABLE': '6A1B9A', 'BLOCKER': 'C62828', 'NOT IN SCOPE': '616161', 'NOT VERIFIED': 'C62828',
};

// ---------- inline formatting ----------
function runs(text, base = {}) {
  const out = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0, m;
  const push = (t, o) => { if (t) out.push(new TextRun({ text: t, font: FONT, ...base, ...o })); };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index), {});
    const tok = m[0];
    if (tok.startsWith('`')) {
      out.push(new TextRun({ text: tok.slice(1, -1), font: MONO, ...base, size: base.size ? base.size - 2 : 18,
        shading: { type: ShadingType.CLEAR, fill: C.codeFill, color: 'auto' } }));
    } else if (tok.startsWith('**')) {
      const inner = tok.slice(2, -2);
      const label = LABELS[inner.replace(/:$/, '')];
      push(inner, label ? { bold: true, color: label } : { bold: true });
    } else {
      push(tok.slice(1, -1), { italics: true });
    }
    last = m.index + tok.length;
  }
  push(text.slice(last), {});
  return out;
}

// ---------- helpers ----------
const slug = (s) => 'h_' + s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 36);
const cellBorders = () => {
  const b = { style: BorderStyle.SINGLE, size: 4, color: C.cellBorder };
  return { top: b, bottom: b, left: b, right: b };
};

function table(rows, widthsPct) {
  const ncol = rows[0].length;
  let pct = widthsPct && widthsPct.length === ncol ? widthsPct : Array(ncol).fill(100 / ncol);
  const sum = pct.reduce((a, b) => a + b, 0);
  const widths = pct.map((p) => Math.floor((p / sum) * CONTENT_W));
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    rows: rows.map((cells, ri) => new TableRow({
      tableHeader: ri === 0,
      cantSplit: true,
      children: cells.map((txt, ci) => new TableCell({
        width: { size: widths[ci], type: WidthType.DXA },
        borders: cellBorders(),
        verticalAlign: VerticalAlign.TOP,
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        shading: ri === 0 ? { type: ShadingType.CLEAR, fill: C.headFill, color: 'auto' } : undefined,
        children: [new Paragraph({
          spacing: { before: 0, after: 0, line: 252 },
          children: runs(txt, { size: 17, bold: ri === 0 ? true : undefined, color: ri === 0 ? C.green : undefined }),
        })],
      })),
    })),
  });
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

// ---------- read sources ----------
const files = fs.readdirSync(PRD_DIR).filter((f) => f.endsWith('.md')).sort();
const lines = files.flatMap((f) => fs.readFileSync(path.join(PRD_DIR, f), 'utf8').split('\n').concat(['']));
const h1s = lines.filter((l) => /^# /.test(l)).map((l) => l.slice(2).trim());

// ---------- page furniture ----------
const header = () => new Header({ children: [new Paragraph({
  alignment: AlignmentType.RIGHT,
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.rule, space: 4 } },
  children: [new TextRun({ text: 'Greenbasket — PRD + System Design Specification · v2.0', font: FONT, size: 16, color: C.grey })],
})] });
const footer = () => new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new TextRun({ text: 'Page ', font: FONT, size: 16, color: C.grey }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: C.grey }),
    new TextRun({ text: ' of ', font: FONT, size: 16, color: C.grey }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: C.grey }),
  ],
})] });
const sectionProps = (landscape) => ({
  page: {
    size: landscape
      ? { width: PAGE_W, height: PAGE_H, orientation: PageOrientation.LANDSCAPE }
      : { width: PAGE_W, height: PAGE_H },
    margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, header: 500, footer: 500 },
  },
});

// ---------- conversion ----------
const sections = [];
let children = [];
let numInstance = 0;
let figureNo = 0;
let pendingWidths = null;
const headingParas = new WeakSet();

function closeSection(landscape = false) {
  if (children.length) sections.push({ properties: sectionProps(landscape), headers: { default: header() }, footers: { default: footer() }, children });
  children = [];
}

// Title block
children.push(
  new Paragraph({ spacing: { before: 600, after: 120 }, children: [new TextRun({ text: 'GREENBASKET', font: FONT, size: 56, bold: true, color: C.green })] }),
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'Product Requirements Document (PRD) + System Design Specification', font: FONT, size: 34, color: C.green2 })] }),
  new Paragraph({
    spacing: { after: 360 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.green2, space: 8 } },
    children: [new TextRun({ text: 'Version 2.0 · 13 October 2026 · Draft for owner review', font: FONT, size: 22, color: C.grey })],
  }),
);

function figure(caption, src, landscape) {
  figureNo += 1;
  const abs = path.resolve(PRD_DIR, src);
  const css = SIZES[path.basename(abs)];
  if (!css) throw new Error('No size for ' + abs);
  // Usable area in CSS px (96/in): leave room for header, footer and caption.
  const maxW = landscape ? (PAGE_H - 2 * MARGIN) / 15 : CONTENT_W / 15;
  const maxH = landscape ? (PAGE_W - 2 * MARGIN) / 15 - 90 : (PAGE_H - 2 * MARGIN) / 15 - 110;
  const s = Math.min(maxW / css.width, maxH / css.height, 1);
  const img = new Paragraph({
    alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 60 },
    children: [new ImageRun({ type: 'png', data: fs.readFileSync(abs), transformation: { width: Math.round(css.width * s), height: Math.round(css.height * s) } })],
  });
  const cap = new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: `Figure ${figureNo}. ${caption}`, font: FONT, size: 17, italics: true, color: C.grey })],
  });
  if (landscape) {
    // Move any heading that directly precedes the figure onto the landscape page with it.
    const moved = [];
    while (children.length && headingParas.has(children[children.length - 1])) moved.unshift(children.pop());
    closeSection(false);
    children.push(...moved, img, cap);
    closeSection(true);
  } else {
    children.push(img, cap);
  }
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const t = line.trim();
  if (!t) continue;

  const w = t.match(/^<!--\s*widths:\s*([\d.,\s]+)-->$/);
  if (w) { pendingWidths = w[1].split(',').map(Number); continue; }

  if (t === '\\pagebreak') { children.push(new Paragraph({ children: [new PageBreak()] })); continue; }

  if (t === '[[CONTENTS]]') {
    children.push(new Paragraph({ spacing: { before: 360, after: 120 }, children: [new TextRun({ text: 'Contents', font: FONT, size: 28, bold: true, color: C.green })] }));
    for (const h of h1s) {
      const isPart = /^(PART |APPENDICES)/.test(h);
      children.push(new Paragraph({
        spacing: { before: isPart ? 100 : 0, after: 20 },
        indent: { left: isPart ? 0 : 360 },
        children: [new InternalHyperlink({ anchor: slug(h), children: [new TextRun({ text: h, font: FONT, size: isPart ? 18 : 19, bold: isPart, color: isPart ? C.green : C.text })] })],
      }));
    }
    continue;
  }

  const h = t.match(/^(#{1,3}) (.*)$/);
  if (h) {
    const level = h[1].length;
    const text = h[2].trim();
    const isPart = level === 1 && /^(PART |APPENDICES)/.test(text);
    const hl = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][level - 1];
    const content = runs(text);
    const para = new Paragraph({
      heading: hl, keepNext: true,
      ...(isPart ? { spacing: { before: 0, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.green2, space: 6 } } } : {}),
      children: level === 1 ? [new Bookmark({ id: slug(text), children: content })] : content,
    });
    headingParas.add(para);
    children.push(para);
    continue;
  }

  const fig = t.match(/^!\[([^\]]*)\]\(([^)]+)\)(\{landscape\})?$/);
  if (fig) { figure(fig[1], fig[2], !!fig[3]); continue; }

  if (t.startsWith('|')) {
    const rows = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      const r = splitRow(lines[i]);
      if (!r.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(r);
      i++;
    }
    i--;
    children.push(table(rows, pendingWidths));
    children.push(new Paragraph({ spacing: { before: 0, after: 120 }, children: [] }));
    pendingWidths = null;
    continue;
  }

  if (t.startsWith('>')) {
    const paras = [[]];
    while (i < lines.length && lines[i].trim().startsWith('>')) {
      const body = lines[i].trim().replace(/^>\s?/, '');
      if (!body) paras.push([]); else paras[paras.length - 1].push(body);
      i++;
    }
    i--;
    for (const p of paras.filter((p) => p.length)) {
      children.push(new Paragraph({
        spacing: { before: 60, after: 60, line: 276 },
        indent: { left: 240, right: 120 },
        shading: { type: ShadingType.CLEAR, fill: C.calloutFill, color: 'auto' },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.green2, space: 8 } },
        children: runs(p.join(' '), { size: 19 }),
      }));
    }
    children.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [] }));
    continue;
  }

  const li = line.match(/^(\s*)(- |\d+\. )(.*)$/);
  if (li) {
    numInstance += 1;
    while (i < lines.length) {
      const m = lines[i].match(/^(\s*)(- |\d+\. )(.*)$/);
      if (!m) break;
      const level = m[1].length >= 5 ? 2 : m[1].length >= 2 ? 1 : 0;
      const numbered = m[2] !== '- ';
      children.push(new Paragraph({
        numbering: numbered ? { reference: 'num', level, instance: numInstance } : { reference: 'bullets', level },
        spacing: { before: 0, after: 60, line: 264 },
        children: runs(m[3]),
      }));
      i++;
    }
    i--;
    children.push(new Paragraph({ spacing: { before: 0, after: 60 }, children: [] }));
    continue;
  }

  children.push(new Paragraph({ spacing: { before: 0, after: 120, line: 276 }, children: runs(t) }));
}
closeSection(false);

const levels = (fmt, texts) => texts.map((text, level) => ({
  level, format: fmt, text, alignment: AlignmentType.LEFT,
  style: { paragraph: { indent: { left: 360 + level * 360, hanging: 300 } } },
}));

const doc = new Document({
  creator: 'Greenbasket',
  title: 'Greenbasket PRD and System Design Specification v2.0',
  description: 'Product requirements, system design, state machines and workflows for Greenbasket.',
  styles: {
    default: { document: { run: { font: FONT, size: 20, color: C.text } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 30, bold: true, color: C.green }, paragraph: { spacing: { before: 360, after: 140 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 24, bold: true, color: C.green2 }, paragraph: { spacing: { before: 260, after: 100 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 21, bold: true, color: C.green2 }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: levels(LevelFormat.BULLET, ['•', '–', '·']) },
      { reference: 'num', levels: levels(LevelFormat.DECIMAL, ['%1.', '%2.', '%3.']).map((l, idx) => idx ? { ...l, format: LevelFormat.LOWER_LETTER, text: `%${idx + 1}.` } : l) },
    ],
  },
  sections,
});

// docx-js gives every bookmark w:id="1"; Word requires unique ids, so renumber the
// (non-nested) bookmarkStart/bookmarkEnd pairs in order.
async function fixBookmarkIds(buf) {
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(buf);
  let xml = await zip.file('word/document.xml').async('string');
  let next = 0;
  xml = xml.replace(/<w:bookmark(Start|End)\b([^>]*?)w:id="\d+"/g, (m, kind, attrs) => {
    if (kind === 'Start') next += 1;
    return `<w:bookmark${kind}${attrs}w:id="${next}"`;
  });
  zip.file('word/document.xml', xml);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

Packer.toBuffer(doc).then(fixBookmarkIds).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log('Wrote', OUT, (buf.length / 1024).toFixed(0) + ' KB', '·', sections.length, 'sections ·', figureNo, 'figures');
});
