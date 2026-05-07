import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { STATIC_DEMO_BANNER } from '../services/app-mode/AppMode';
import { providerRegistry } from '../services/app-mode/providerRegistry';
import { storage } from '../services/storage/BrowserDemoStorage';

type Note = { id: string; text: string; reviewed: boolean };

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => storage.get('notes', [] as Note[]));
  const [live, setLive] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const persist=(n:Note[])=>{setNotes(n);storage.set('notes',n);};
  const startInbound = async () => { const id=providerRegistry.call.simulateInbound(); setLive(await providerRegistry.transcription.transcribe(id)); };
  const startOutbound = async () => { const id=providerRegistry.call.simulateOutbound(); setLive(await providerRegistry.transcription.transcribe(id)); };
  const generate = async () => { const text=await providerRegistry.notes.generate(live); setCurrent(text); const n=[...notes,{id:String(Date.now()),text,reviewed:false}]; persist(n); };
  const review=(id:string)=>persist(notes.map(n=>n.id===id?{...n,reviewed:true}:n));
  const exportJson=()=>navigator.clipboard.writeText(JSON.stringify(notes,null,2));
  const exportMd=()=>navigator.clipboard.writeText(notes.map(n=>`## ${n.id}\n${n.text}`).join('\n\n'));

  return <div style={{fontFamily:'sans-serif',padding:16}}>
    <div style={{background:'#ffefc2',padding:10,marginBottom:12}}>{STATIC_DEMO_BANNER}</div>
    <nav style={{display:'flex',gap:8,marginBottom:12}}>{['/','/live','/review','/history','/settings','/admin'].map(p=><Link key={p} to={p}>{p==='/'?'Dashboard':p.slice(1)}</Link>)}</nav>
    <Routes>
      <Route path='/' element={<div><h2>Dashboard</h2><button onClick={startInbound}>Simulate inbound call</button> <button onClick={startOutbound}>Simulate outbound call</button> <button onClick={generate}>Generate mock notes</button></div>} />
      <Route path='/live' element={<div><h2>Live Call</h2><button>Answer inbound call</button> <button>End call</button><pre>{live.join('\n')}</pre></div>} />
      <Route path='/review' element={<div><h2>Review/Edit Notes</h2><textarea value={current} onChange={e=>setCurrent(e.target.value)} rows={10} cols={70}/></div>} />
      <Route path='/history' element={<div><h2>Notes History</h2>{notes.map(n=><div key={n.id}><b>{n.id}</b> [{n.reviewed?'reviewed':'draft'}] <button onClick={()=>review(n.id)}>Mark reviewed</button> <button onClick={()=>providerRegistry.crm.export(n.id)}>Mock CRM export</button></div>)}</div>} />
      <Route path='/settings' element={<div><h2>Admin settings UI</h2><p>Outbound behavior: Off / Ask before starting / Auto-start when connected</p><p>Manual note session available in dashboard actions.</p></div>} />
      <Route path='/admin' element={<div><h2>Audit log UI</h2><button onClick={exportJson}>Export to JSON</button> <button onClick={exportMd}>Export to Markdown</button> <button onClick={exportJson}>Copy to clipboard</button><p>Static mode disables Zultys detection, Windows APIs, WASAPI, tray, native SQLite, credential manager, real CRM, and real AI providers.</p></div>} />
    </Routes>
  </div>;
}
