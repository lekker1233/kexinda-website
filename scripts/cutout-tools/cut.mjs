import fs from 'node:fs'; import path from 'node:path';
import { removeBackground } from '@imgly/background-removal-node';
const [,,inDir,outDir,model='medium']=process.argv;
for(const f of fs.readdirSync(inDir).filter(n=>n.endsWith('.png'))){
 const t=Date.now();
 const blob=new Blob([fs.readFileSync(path.join(inDir,f))],{type:'image/png'});
 const res=await removeBackground(blob,{model,output:{format:'image/png'}});
 fs.writeFileSync(path.join(outDir,f),Buffer.from(await res.arrayBuffer()));
 console.log(f,Date.now()-t,'ms');
}
