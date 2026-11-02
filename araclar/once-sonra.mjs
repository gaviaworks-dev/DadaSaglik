// Önce/sonra yan yana: rapor/tmp/teslim-h/{once,sonra}/<ad>.png → rapor/tmp/teslim-h/once-sonra/<ad>.png (üstten en fazla 2000px)
import { chromium } from 'playwright';
import { readdir, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const D = 'rapor/tmp/teslim-h'; await mkdir(`${D}/once-sonra`, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 800 } });
for (const f of (await readdir(`${D}/sonra`)).filter((x) => x.endsWith('.png'))) {
  const src = async (k) => (existsSync(`${D}/${k}/${f}`) ? `data:image/png;base64,${(await readFile(`${D}/${k}/${f}`)).toString('base64')}` : '');
  const [o, s] = [await src('once'), await src('sonra')];
  const kol = (u, et) => `<div style="flex:1;min-width:0"><div style="font:700 22px system-ui;padding:8px 0">${et}</div><div style="max-height:2000px;overflow:hidden;border:1px solid #ccc;background:#fff">${u ? `<img src="${u}" style="width:100%;display:block">` : '<p style="padding:20px">(yok)</p>'}</div></div>`;
  await p.setContent(`<body style="margin:0;padding:16px;background:#eee;display:flex;gap:24px;align-items:flex-start;width:1568px">${kol(o, 'ÖNCE')}${kol(s, 'SONRA')}</body>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: `${D}/once-sonra/${f}`, fullPage: true });
}
await b.close(); console.log('ok');
