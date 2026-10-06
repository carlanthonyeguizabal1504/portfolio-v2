import { cpSync, readFileSync, existsSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
const root=resolve(new URL('..',import.meta.url).pathname)
const dist=join(root,'dist')
if(!existsSync(join(dist,'index.html'))) throw new Error('Run npm run build first.')
if(!readFileSync(join(dist,'index.html'),'utf8').includes('/portfolio-v2/assets/')) throw new Error('The build must use the /portfolio-v2/ base path.')
for(const entry of readdirSync(dist)) {
  if(entry==='source-index.html') continue
  if(entry==='assets') rmSync(join(root,'assets'),{recursive:true,force:true})
  cpSync(join(dist,entry),join(root,entry),{recursive:true})
}
writeFileSync(join(root,'.nojekyll'),'')
console.log('Published files updated for GitHub Pages.')
