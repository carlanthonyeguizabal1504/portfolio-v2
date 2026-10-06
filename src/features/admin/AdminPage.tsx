import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { snapshot, signIn, signOut, readSession, verifyAdmin, saveContent, currentRevision, validateContent, type AdminSession, type ContentSnapshot } from '@/lib/content-store'
import { editToolLogos, sharedToolLogos } from '@/lib/shared-tool-logos'
import './admin.css'

const groups: [string, string[]][] = [
  ['Profile & links', ['site','certification','socials','externalLinks']],
  ['Home & statement', ['homeHero','homeManifesto','homeSections','ctaBand']],
  ['Projects & galleries', ['workSection','workChapters']],
  ['About & school', ['aboutSection','capabilities','credentials']],
  ['Learning process', ['method','liveAutomation']],
  ['Skills & tools', ['servicesPage','servicesSection','services','tools','dailyTools']],
  ['Learning log & clips', ['proofPage','clientAccounts','videoTestimonials','communityQuotes']],
  ['Project spotlight', ['showcasePage','showcaseFilm','showcaseStats','productTabs','showcaseFaq']],
  ['Contact & FAQs', ['contactPage','contactForm','faqs','allFaqs']],
  ['Privacy & credits', ['privacyPolicy','termsOfService']],
]
const labels: Record<string, string> = { homeHero:'Hero',homeManifesto:'Scroll statement',homeSections:'Section headings',ctaBand:'Closing message',workSection:'Project heading',workChapters:'Project chapters',aboutSection:'About me',liveAutomation:'Animated project flow',clientAccounts:'Learning records',communityQuotes:'Feedback notes',videoTestimonials:'Project clips',showcaseFilm:'Film or image preview',productTabs:'Project previews',showcaseStats:'Spotlight statistics',contactForm:'Message form',dailyTools:'Tools in use',privacyPolicy:'Privacy',termsOfService:'Credits & terms' }
const technical = new Set(['avatarSmall','srcSet','width','height','x','y','w','h','step','plane','icon','mono'])
const cleanLabel = (text: string) => labels[text] || text.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]/g,' ').replace(/^./,c=>c.toUpperCase())
const imageField = (key: string) => ['src','logo','avatarSmall','poster','phone','wide','headerLight','headerDark','light','dark'].includes(key)

async function imageData(file: File) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose an image smaller than 12 MB.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width*scale); canvas.height = Math.round(bitmap.height*scale)
  canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close()
  const result = canvas.toDataURL('image/webp',.83)
  if (result.length > 1500000) throw new Error('This picture is too large. Choose a smaller version.')
  return result
}

function emptyLike(value: unknown): unknown {
  if (typeof value === 'string') return ''
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.map(emptyLike)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,k==='id' ? 'new-'+crypto.randomUUID().slice(0,8) : emptyLike(v)]))
  return ''
}
const examples: Record<string, unknown> = {
  videoTestimonials:{ id:'clip',src:'',poster:'',width:1280,height:720,duration:'0:30',label:'Project walkthrough',published:'2026-10-06' },
  communityQuotes:{ name:'',context:'',date:'Oct 6, 2026',text:'' },
  socials:{label:'GitHub',href:'',external:true,icon:'github'},
  gallery:{src:'',alt:'',width:1600,height:1000},
  items:{id:'item',name:'',kicker:'School project',summary:'',stack:'',href:'',image:{src:'',alt:'',width:1600,height:1000}},
}

function Fields({ value, name, change, path = name }: { value: unknown; name: string; change: (value: unknown) => void; path?: string }) {
  const [error,setError] = useState('')
  if (Array.isArray(value)) {
    const fixed = ['parts','steps','bullets','brandParts','nodes','links'].includes(name) || name==='showcaseStats'
    return <div className="ed-array">
      {value.map((item,i) => <div className="ed-item" key={i}>
        <div className="ed-item-head"><span>{typeof item === 'object' && item ? String((item as Record<string,unknown>).title || (item as Record<string,unknown>).name || (item as Record<string,unknown>).label || `${cleanLabel(name)} ${i+1}`) : `${cleanLabel(name)} ${i+1}`}</span>
          {!fixed && <div><button type="button" disabled={i===0} aria-label="Move item up" onClick={()=>{ const next=[...value];[next[i-1],next[i]]=[next[i],next[i-1]];change(next) }}>Move up</button><button type="button" className="ed-danger" onClick={()=>change(value.filter((_,n)=>n!==i))}>Remove</button></div>}
        </div>
        <Fields value={item} name={String(i+1)} path={path+'.'+i} change={v=>change(value.map((old,n)=>n===i?v:old))} />
      </div>)}
      {!fixed && <button type="button" className="ed-add" onClick={()=>change([...value,emptyLike(value[0] || examples[name] || '')])}>+ Add {cleanLabel(name).toLowerCase()}</button>}
    </div>
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([k])=>!technical.has(k))
    return <div className="ed-grid">{entries.map(([k,v]) => {
      const object = v && typeof v === 'object'
      return <div className={object ? 'ed-wide' : undefined} key={k}>
        {object ? <details className="ed-details" open={['avatar','cta','picture','note'].includes(k)}><summary>{name==='tools' && !Array.isArray(value) && v && typeof v==='object' && 'name' in v ? String(v.name) : cleanLabel(k)}</summary><Fields value={v} name={k} path={path+'.'+k} change={next=>{
          const updated={...value,[k]:next}; change(updated)
        }}/></details> : <Fields value={v} name={k} path={path+'.'+k} change={next=>{
          const updated={...value,[k]:next} as Record<string,unknown>
          if(k==='src') delete updated.srcSet
          change(updated)
        }}/>}
      </div>
    })}</div>
  }
  if (typeof value === 'boolean') return <label className="ed-check"><input aria-label={cleanLabel(name)} type="checkbox" checked={value} onChange={e=>change(e.target.checked)}/>{cleanLabel(name)}</label>
  if (typeof value === 'number') return <label className="ed-field">{cleanLabel(name)}<input aria-label={cleanLabel(name)} type="number" value={value} onChange={e=>change(Number(e.target.value))}/></label>
  const text=String(value ?? '')
  const media=imageField(name) && !path.includes('showcaseFilm.src') && !path.includes('videoTestimonials') || name==='poster'
  const long = /body|text|lead|summary|description|answer|intro|subhead|about|paragraph/i.test(name) || text.length>110 && !media && !/^https?:|^data:/.test(text)
  return <label className={'ed-field'+(media?' ed-media':'')}>
    {cleanLabel(name)}
    {long ? <textarea aria-label={cleanLabel(name)} value={text} rows={3} onChange={e=>change(e.target.value)}/> : <input aria-label={cleanLabel(name)} value={text} readOnly={name==='id'} type={name==='email'?'email':'text'} onChange={e=>change(e.target.value)} placeholder={media?'Image URL or upload below':undefined}/>}
    {media && <><img className="ed-preview" src={text || undefined} alt="Image preview" onError={e=>{e.currentTarget.style.visibility='hidden'}} onLoad={e=>{e.currentTarget.style.visibility='visible'}}/><span className="ed-upload">Upload image<input aria-label={"Upload " + cleanLabel(name) + " image"} type="file" accept="image/png,image/jpeg,image/webp" onChange={async e=>{ const file=e.target.files?.[0]; if(!file)return;try{change(await imageData(file));setError('')}catch(error){setError((error as Error).message)} e.target.value='' }}/></span><small>JPG, PNG, or WebP. Saved with your portfolio.</small></>}
    {path.includes('showcaseFilm.src') && <small>Use a direct MP4 URL. Leave blank to show the preview image.</small>}
    {name==='id' && <small>This keeps the page links stable.</small>}
    {error && <small role="alert">{error}</small>}
  </label>
}

export function AdminPage() {
  const [session,setSession]=useState<AdminSession|null>(null)
  const [checking,setChecking]=useState(true)
  const [busy,setBusy]=useState(false)
  const [status,setStatus]=useState('')
  const [draft,setDraft]=useState<ContentSnapshot>(snapshot)
  const [revision,setRevision]=useState('')
  const [section,setSection]=useState(0)
  const [dirty,setDirty]=useState(false)
  const file=useRef<HTMLInputElement>(null)
  useEffect(()=>{ let alive=true;const saved=readSession();(async()=>{try{if(saved){const active=await verifyAdmin(saved);if(alive)setSession(active)}if(alive)setRevision(await currentRevision())}catch{if(saved)await signOut()}finally{if(alive)setChecking(false)}})();return()=>{alive=false} },[])
  useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty])
  async function login(e:FormEvent<HTMLFormElement>) { e.preventDefault();setBusy(true);setStatus('');const form=new FormData(e.currentTarget);try{setSession(await signIn(String(form.get('email')),String(form.get('password'))));setRevision(await currentRevision());setDraft(snapshot())}catch(err){setStatus((err as Error).message)}finally{setBusy(false)} }
  function update(key:string,value:unknown) { setDraft(old=>editToolLogos(old,key,value));setDirty(true);setStatus('') }
  function backup() { const blob=new Blob([JSON.stringify(draft,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='carl-portfolio-backup.json';a.click();URL.revokeObjectURL(url) }
  async function save() {setBusy(true);setStatus('Saving…');try{ const next=structuredClone(draft);const site=next.site as Record<string,unknown>;const avatar=site.avatar as Record<string,unknown>;site.avatarSmall=avatar.src;setRevision(await saveContent(next,session!,revision));setDraft(next);setDirty(false);setStatus('Saved online. Your portfolio now shows these changes.')}catch(err){setStatus((err as Error).message)}finally{setBusy(false)} }
  if(checking) return <main className="ed-login"><p>Opening your editor…</p></main>
  if(!session) return <main className="ed-login"><Link className="ed-back" to="/">Back to portfolio</Link><form onSubmit={login} className="ed-login-card"><span className="ed-eyebrow">Carl Anthony · Private editor</span><h1>Welcome back.</h1><p>Sign in with your existing portfolio admin account.</p><label className="ed-field">Email<input type="email" name="email" autoComplete="username" required/></label><label className="ed-field">Password<input type="password" name="password" autoComplete="current-password" required/></label><button className="ed-primary" disabled={busy}>{busy?'Signing in…':'Sign in'}</button><p role="alert" className="ed-status">{status}</p></form></main>
  return <main className="editor" data-lenis-prevent>
    <header className="ed-header"><div><span className="ed-eyebrow">Carl Anthony · Admin</span><h1>Your portfolio, your way.</h1></div><div className="ed-actions"><Link to="/" onClick={e=>{if(dirty&&!confirm('Leave the editor with unsaved changes?'))e.preventDefault()}}>View portfolio</Link><button onClick={()=>{if(!dirty||confirm('Log out and discard your unsaved edits?')){void signOut();setSession(null);setDirty(false)}}}>Log out</button></div></header>
    <div className="ed-layout"><nav className="ed-nav" aria-label="Editor sections">{groups.map(([label],i)=><button key={label} className={section===i?'active':''} onClick={()=>setSection(i)}>{String(i+1).padStart(2,'0')}<span>{label}</span></button>)}</nav>
    <div className="ed-content"><div className="ed-section-head"><h2>{groups[section]![0]}</h2><p>Edit the fields, add your pictures, then save when you’re ready.</p></div>
      {groups[section]![1].map(key=><section className="ed-card" key={key}><h3>{key==='tools'?'Skill logos':cleanLabel(key)}</h3>{key==='tools' && <p>Upload each skill logo here. It updates everywhere that skill appears after you save.</p>}<Fields value={draft[key]} name={key} change={value=>update(key,value)}/></section>)}
      <div className="ed-backup"><button onClick={backup}>Export backup</button><button onClick={()=>file.current?.click()}>Import backup</button><button onClick={()=>{if(confirm('Discard unsaved edits and return to the last saved portfolio?')){setDraft(snapshot());setDirty(false);setStatus('Draft reset.')}}}>Discard draft</button><input ref={file} hidden type="file" accept="application/json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>10*1024*1024)throw new Error('Choose a backup smaller than 10 MB.');const parsed=JSON.parse(await f.text());validateContent(parsed);setDraft(sharedToolLogos(parsed));setDirty(true);setStatus('Backup imported into your draft. Save to publish it.')}catch(err){setStatus((err as Error).message)}e.target.value=''}}/></div>
    </div></div>
    <footer className="ed-savebar"><div><b>{dirty?'Unsaved changes':'All changes saved'}</b><span role="status" className="ed-status">{status || 'Your edits appear for everyone after saving.'}</span></div><button className="ed-primary" disabled={busy||!dirty} onClick={()=>void save()}>{busy?'Saving…':'Save changes'}</button></footer>
  </main>
}
