import { useMemo, useState } from 'react';
import type { CaptureMode } from '../services/audio/AudioCaptureProvider';
import { Link, Route, Routes } from 'react-router-dom';
import { STATIC_DEMO_BANNER } from '../services/app-mode/AppMode';
import { providerRegistry } from '../services/app-mode/providerRegistry';
import { storage } from '../services/storage/BrowserDemoStorage';

type ReviewStatus = 'draft' | 'reviewed';
type OutboundMode = 'off' | 'ask' | 'auto';

type Note = {
  id: string;
  callId: string;
  text: string;
  reviewed: ReviewStatus;
  createdAt: string;
};

type AuditEvent = {
  id: string;
  at: string;
  action: string;
  detail: string;
};

function nowIso() {
  return new Date().toISOString();
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => storage.get('notes', [] as Note[]));
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(() => storage.get('audit-log', [] as AuditEvent[]));
  const [live, setLive] = useState<string[]>([]);
  const [currentCallId, setCurrentCallId] = useState('');
  const [inboundRingingId, setInboundRingingId] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [manualSession, setManualSession] = useState(false);
  const [realCaptureMode, setRealCaptureMode] = useState<CaptureMode>('microphone-only');
  const [audioInputId, setAudioInputId] = useState('');
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [isRealCallRunning, setIsRealCallRunning] = useState(false);
  const [realGeneratedNotes, setRealGeneratedNotes] = useState('');
  const [realReviewed, setRealReviewed] = useState(false);
  const [outboundMode, setOutboundMode] = useState<OutboundMode>(() => storage.get('outbound-mode', 'ask'));

  const addAudit = (action: string, detail: string) => {
    const event: AuditEvent = { id: String(Date.now()), at: nowIso(), action, detail };
    const updated = [event, ...auditLog];
    setAuditLog(updated);
    storage.set('audit-log', updated);
  };

  const persistNotes = (next: Note[]) => {
    setNotes(next);
    storage.set('notes', next);
  };

  const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId), [notes, selectedNoteId]);

  const simulateInboundCall = () => {
    const inboundId = providerRegistry.call.simulateInbound();
    setInboundRingingId(inboundId);
    addAudit('call.inbound.simulated', inboundId);
  };

  const answerInboundCall = async () => {
    if (!inboundRingingId) return;
    setCurrentCallId(inboundRingingId);
    setInboundRingingId('');
    addAudit('call.answered', inboundRingingId);
    const lines = await providerRegistry.transcription.transcribe(inboundRingingId);
    setLive(lines);
    addAudit('transcription.started', `Auto-started mock transcription for ${inboundRingingId}`);
  };

  const simulateOutboundCall = async () => {
    if (outboundMode === 'off') {
      addAudit('call.outbound.blocked', 'Outbound start prevented because mode is Off');
      return;
    }

    const outboundId = providerRegistry.call.simulateOutbound();
    setCurrentCallId(outboundId);
    addAudit('call.outbound.simulated', outboundId);

    let shouldStart = outboundMode === 'auto';
    if (outboundMode === 'ask') {
      shouldStart = window.confirm('Start mock transcription for outbound call?');
      addAudit('transcription.prompted', `${outboundId} -> ${shouldStart ? 'accepted' : 'declined'}`);
    }

    if (shouldStart) {
      const lines = await providerRegistry.transcription.transcribe(outboundId);
      setLive(lines);
      addAudit('transcription.started', `Outbound transcription started for ${outboundId}`);
    } else {
      setLive([]);
    }
  };

  const endCall = () => {
    if (!currentCallId) return;
    addAudit('call.ended', currentCallId);
    setCurrentCallId('');
  };

  const generateNotes = async () => {
    const sourceLines = manualSession && noteDraft.trim() ? noteDraft.split('\n') : live;
    const generated = await providerRegistry.notes.generate(sourceLines);
    const note: Note = {
      id: String(Date.now()),
      callId: currentCallId || 'manual-session',
      text: generated,
      reviewed: 'draft',
      createdAt: nowIso()
    };
    persistNotes([note, ...notes]);
    setSelectedNoteId(note.id);
    setNoteDraft(generated);
    addAudit('note.generated', `Note ${note.id} generated`);
  };

  const saveEditedNote = () => {
    if (!selectedNote) return;
    persistNotes(notes.map(note => (note.id === selectedNote.id ? { ...note, text: noteDraft } : note)));
    addAudit('note.edited', selectedNote.id);
  };

  const markReviewed = (id: string) => {
    persistNotes(notes.map(note => (note.id === id ? { ...note, reviewed: 'reviewed' } : note)));
    addAudit('note.reviewed', id);
  };

  const exportToMockCRM = async (id: string) => {
    const result = await providerRegistry.crm.export(id);
    addAudit('crm.exported', `${id} -> ${result.crmId}`);
  };


  const loadAudioInputs = async () => {
    const devices = await providerRegistry.audio.getInputDevices();
    setAudioInputs(devices);
    if (!audioInputId && devices[0]?.deviceId) setAudioInputId(devices[0].deviceId);
  };

  const startRealCallNotes = async () => {
    setLive([]);
    setRealGeneratedNotes('');
    setRealReviewed(false);
    const callId = `real-call-${Date.now()}`;
    setCurrentCallId(callId);
    await providerRegistry.transcription.startRealtimeSession(callId, (line) => setLive(prev => [...prev, line]));
    await providerRegistry.audio.start({ mode: realCaptureMode, deviceId: audioInputId || undefined, onChunk: async (chunk) => {
      await providerRegistry.transcription.pushAudioChunk(chunk);
      setLive(prev => [...prev, `[${new Date().toISOString()}] Audio chunk sent`]);
    } });
    setIsRealCallRunning(true);
    addAudit('realcall.started', `${callId} (${realCaptureMode})`);
  };

  const stopRealCallNotes = async () => {
    await providerRegistry.audio.stop();
    const lines = await providerRegistry.transcription.stopRealtimeSession();
    setLive(lines);
    const generated = await providerRegistry.notes.generate(lines);
    setRealGeneratedNotes(generated);
    setIsRealCallRunning(false);
    addAudit('realcall.stopped', currentCallId);
  };

  const updateOutboundMode = (mode: OutboundMode) => {
    setOutboundMode(mode);
    storage.set('outbound-mode', mode);
    addAudit('settings.outboundMode.updated', mode);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ background: '#ffefc2', padding: 12, marginBottom: 12, border: '1px solid #d2aa35' }}>{STATIC_DEMO_BANNER}</div>

      <nav style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {['/', '/live', '/real-call-test', '/review', '/history', '/settings', '/admin'].map(p => (
          <Link key={p} to={p}>{p === '/' ? 'Dashboard' : p.slice(1)}</Link>
        ))}
      </nav>

      <Routes>
        <Route path='/' element={<div>
          <h2>Dashboard</h2>
          <p>Current call: <b>{currentCallId || 'None'}</b> {inboundRingingId ? `(ringing inbound: ${inboundRingingId})` : ''}</p>
          <button onClick={simulateInboundCall}>Simulate inbound call</button>{' '}
          <button onClick={answerInboundCall} disabled={!inboundRingingId}>Answer inbound call</button>{' '}
          <button onClick={simulateOutboundCall}>Simulate outbound call</button>{' '}
          <button onClick={endCall} disabled={!currentCallId}>End call</button>{' '}
          <button onClick={generateNotes}>Generate mock notes</button>
          <h3 style={{ marginTop: 16 }}>Manual note session</h3>
          <label><input type='checkbox' checked={manualSession} onChange={e => setManualSession(e.target.checked)} /> Enable manual note session</label>
          <textarea rows={7} style={{ width: '100%', marginTop: 8 }} placeholder='Type manual notes/transcript lines here...' value={noteDraft} onChange={e => setNoteDraft(e.target.value)} />
        </div>} />

        <Route path='/live' element={<div>
          <h2>Live Call</h2>
          <p>Auto-start mock live transcription begins when inbound is answered.</p>
          <pre style={{ background: '#f6f8fa', padding: 12, border: '1px solid #ddd' }}>{live.length ? live.join('\n') : 'No active mock transcription yet.'}</pre>
        </div>} />


        <Route path='/real-call-test' element={<div>
          <h2>Real Call Test</h2>
          <p style={{ background: '#fff4e5', border: '1px solid #d9a441', padding: 10 }}>Real Call Mode may record or transcribe call audio. Use only with proper consent and company authorization.</p>
          <button onClick={loadAudioInputs}>Refresh audio inputs</button>
          <div style={{ marginTop: 8 }}>
            <label>Audio input selector: </label>
            <select value={audioInputId} onChange={e => setAudioInputId(e.target.value)}>
              <option value=''>Default</option>
              {audioInputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>)}
            </select>
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Capture mode selector: </label>
            <select value={realCaptureMode} onChange={e => setRealCaptureMode(e.target.value as CaptureMode)}>
              <option value='microphone-only'>microphone only</option>
              <option value='system-audio'>system audio</option>
              <option value='dual-capture'>dual capture</option>
            </select>
          </div>
          <div style={{ marginTop: 10 }}>
            <button onClick={startRealCallNotes} disabled={isRealCallRunning}>Start real call notes</button>{' '}
            <button onClick={stopRealCallNotes} disabled={!isRealCallRunning}>Stop real call notes</button>
          </div>
          <h3>Live transcript panel</h3>
          <pre style={{ background: '#f6f8fa', padding: 12, border: '1px solid #ddd', minHeight: 120 }}>{live.join('\n') || 'No transcript yet.'}</pre>
          <h3>Generated notes panel</h3>
          <textarea rows={10} style={{ width: '100%' }} value={realGeneratedNotes} onChange={e => setRealGeneratedNotes(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setRealReviewed(true)}>Review</button>{' '}
            <button disabled={!realReviewed}>Export</button>
          </div>
        </div>} />

        <Route path='/review' element={<div>
          <h2>Review/edit notes</h2>
          <select value={selectedNoteId} onChange={e => { const id = e.target.value; setSelectedNoteId(id); setNoteDraft(notes.find(n => n.id === id)?.text ?? ''); }}>
            <option value=''>Select a note</option>
            {notes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.reviewed})</option>)}
          </select>
          <textarea rows={14} style={{ width: '100%', marginTop: 8 }} value={noteDraft} onChange={e => setNoteDraft(e.target.value)} />
          <div><button onClick={saveEditedNote} disabled={!selectedNoteId}>Save edits</button></div>
        </div>} />

        <Route path='/history' element={<div>
          <h2>Notes history</h2>
          {notes.map(note => <div key={note.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 10 }}>
            <div><b>{note.id}</b> — {note.createdAt}</div>
            <div>Status: {note.reviewed}</div>
            <div>Call: {note.callId}</div>
            <button onClick={() => markReviewed(note.id)}>Mark reviewed</button>{' '}
            <button onClick={() => exportToMockCRM(note.id)}>Mock CRM export</button>
          </div>)}
        </div>} />

        <Route path='/settings' element={<div>
          <h2>Admin settings UI</h2>
          <p>Outbound setting:</p>
          <label><input type='radio' checked={outboundMode === 'off'} onChange={() => updateOutboundMode('off')} /> Off</label><br />
          <label><input type='radio' checked={outboundMode === 'ask'} onChange={() => updateOutboundMode('ask')} /> Ask before starting</label><br />
          <label><input type='radio' checked={outboundMode === 'auto'} onChange={() => updateOutboundMode('auto')} /> Auto-start when connected</label>
          <p style={{ marginTop: 12 }}>Web mode mock-only components: MockCallProviderAdapter, MockAudioCaptureProvider, MockTranscriptionProvider, MockNoteGenerationProvider, MockCRMExportProvider, and browser localStorage.</p>
          <p>Disabled in web mode: Zultys detection, desktop detection, electron tray, Windows capture, SQLite/SQLCipher native storage, credential manager, and real external APIs/keys.</p>
        </div>} />

        <Route path='/admin' element={<div>
          <h2>Audit log UI</h2>
          {auditLog.length === 0 ? <p>No audit events yet.</p> : auditLog.map(ev => <div key={ev.id}><code>{ev.at}</code> <b>{ev.action}</b> — {ev.detail}</div>)}
        </div>} />
      </Routes>
    </div>
  );
}
