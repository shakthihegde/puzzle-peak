const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=path.join(__dirname,'..','src');const ctx={console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of require(SRC+'/order.json').filter(f=>!f.startsWith('app')))vm.runInContext(fs.readFileSync(path.join(SRC,f),'utf8'),ctx);
const PP=ctx.PP;const strip=s=>s.replace(/<svg[\s\S]*?<\/svg>/g,'[svg]').replace(/<sup>(\d+)<\/sup>&frasl;<sub>(\d+)<\/sub>/g,'$1/$2').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const ids=process.argv[2].split(',');const n=+(process.argv[3]||2);
for(const id of ids)for(const lvl of [1,2,3])for(let k=0;k<n;k++){const q=PP.make(id,555+k*31+lvl*7,lvl);
console.log(`[${id} L${lvl}] ${strip(q.prompt)} ${strip(q.stem)}\n   opts: ${q.opts.map((o,i)=>(i===q.ans?'*':'')+strip(o)).join(' | ')}\n   expl: ${strip(q.explain)}\n   why[0]: ${strip(q.why.find((w,i)=>i!==q.ans&&w)||'')}`);}
