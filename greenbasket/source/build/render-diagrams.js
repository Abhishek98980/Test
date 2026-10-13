// Renders every diagrams/*.mmd file to diagrams/png/*.png with Mermaid in headless Chromium.
// Usage: node render-diagrams.js   (needs mermaid@11 and playwright; set MERMAID_JS to mermaid.min.js if not resolvable)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const diagramsDir = path.join(__dirname, '..', 'diagrams');
const outDir = path.join(diagramsDir, 'png');
const mermaidJs = process.env.MERMAID_JS || require.resolve('mermaid/dist/mermaid.min.js');

const config = {
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'strict',
  fontFamily: 'Arial, Helvetica, sans-serif',
  themeVariables: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '15px',
    primaryColor: '#E8F3EA',
    primaryBorderColor: '#2E6B3A',
    primaryTextColor: '#14261A',
    secondaryColor: '#F4F7F5',
    tertiaryColor: '#FFFFFF',
    lineColor: '#4A5A50',
    clusterBkg: '#F6FAF7',
    clusterBorder: '#9DB8A4',
    edgeLabelBackground: '#FFFFFF',
    noteBkgColor: '#FFF6DD',
    noteBorderColor: '#C9A43A',
    actorBkg: '#E8F3EA',
    actorBorder: '#2E6B3A',
    signalColor: '#2B3A31',
    labelBoxBkgColor: '#F4F7F5',
  },
  flowchart: { curve: 'basis', htmlLabels: true, padding: 10, nodeSpacing: 30, rankSpacing: 34, wrappingWidth: 230 },
  state: { padding: 10 },
  sequence: { mirrorActors: false, wrap: true },
};

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 1000 } });
  await page.setContent('<!doctype html><html><body style="margin:0;background:#fff"><div id="c"></div></body></html>');
  await page.addScriptTag({ path: mermaidJs });
  await page.evaluate((cfg) => window.mermaid.initialize(cfg), config);
  const files = fs.readdirSync(diagramsDir).filter((f) => f.endsWith('.mmd')).sort();
  const sizes = {};
  for (const f of files) {
    const src = fs.readFileSync(path.join(diagramsDir, f), 'utf8');
    const id = 'd' + f.replace(/[^a-z0-9]/gi, '');
    const ok = await page.evaluate(async ({ id, src }) => {
      const el = document.getElementById('c');
      el.innerHTML = '';
      try {
        const { svg } = await window.mermaid.render(id, src);
        el.innerHTML = '<div id="wrap" style="display:inline-block;padding:16px;background:#fff">' + svg + '</div>';
        // Mermaid emits width="100%" + max-width; pin the SVG to its natural viewBox size instead.
        const s = el.querySelector('svg');
        const vb = s.viewBox.baseVal;
        s.setAttribute('width', vb.width);
        s.setAttribute('height', vb.height);
        s.style.maxWidth = 'none';
        return 'ok';
      } catch (e) { return 'ERR ' + e.message; }
    }, { id, src });
    if (ok !== 'ok') { console.error(f, ok); process.exitCode = 1; continue; }
    const wrap = await page.$('#wrap');
    const box = await wrap.boundingBox();
    const out = path.join(outDir, f.replace(/\.mmd$/, '.png'));
    await wrap.screenshot({ path: out });
    sizes[path.basename(out)] = { width: Math.round(box.width), height: Math.round(box.height) };
    console.log(f, '->', Math.round(box.width) + 'x' + Math.round(box.height));
  }
  fs.writeFileSync(path.join(outDir, 'sizes.json'), JSON.stringify(sizes, null, 2));
  await browser.close();
})();
