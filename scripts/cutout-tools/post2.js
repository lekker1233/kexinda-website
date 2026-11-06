const sharp=require('sharp'),fs=require('fs'),path=require('path');
(async()=>{const dir=process.argv[2];const cell=240,cols=9;const comps=[];const fl=fs.readdirSync(dir).filter(n=>n.endsWith('.png')).sort();let i=0;
for(const f of fl){const tr=await sharp(path.join(dir,f)).trim({threshold:10}).toBuffer();const fg=await sharp(tr).resize(cell-16,cell-40,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();const bg=['#f26a1b','#1f3d2b','#cfe3f7'][i%3];
const label=Buffer.from(`<svg width="${cell}" height="24"><rect width="100%" height="100%" fill="#111"/><text x="4" y="17" font-family="Arial" font-size="14" fill="#fff">${f.replace('.png','')}</text></svg>`);
const tile=await sharp({create:{width:cell,height:cell,channels:3,background:bg}}).composite([{input:fg,left:8,top:8},{input:label,left:0,top:cell-24}]).jpeg({quality:82}).toBuffer();comps.push({input:tile,left:(i%cols)*cell,top:Math.floor(i/cols)*cell});i++}
await sharp({create:{width:cols*cell,height:Math.ceil(i/cols)*cell,channels:3,background:'#fff'}}).composite(comps).jpeg({quality:82}).toFile(process.argv[3]);})();
