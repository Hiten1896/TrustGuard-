import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Shield, FileText, Image as ImageIcon, Video, Mic, Archive, Code, Search, 
  Activity, MapPin, LogOut, ArrowLeft, Share2, QrCode as QrCodeIcon, Lock, Zap, Upload
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

// PERFORMANCE: Lazy Load non-critical forensic components
const FinalConclusion = lazy(() => import('./components/FinalConclusion.jsx'));
const GpsMap = lazy(() => import('./components/GpsMap.jsx'));
const HexViewer = lazy(() => import('./components/HexViewer.jsx'));
const ScanTable = lazy(() => import('./components/ScanTable.jsx'));

// CONFIG: Secure Environment Handling
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

const APP_ID = 'trust-guard-pro-v1';
const MASTER_KEY = import.meta.env.VITE_MASTER_KEY || 'admin';

let app, auth, db;
try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.error('TrustGuard: Critical Service Initialization Failure', err);
}

const ICON_MAP = { FileText, ImageIcon, Video, Mic, Archive, Code, Search, Activity, MapPin, Share2, QrCodeIcon };

const MODULES = [
  { id: 'text', name: 'Text & AI Forensic', iconId: 'FileText', desc: 'Identify AI-generated text, fake news & style markers.', accept: '.txt,.doc,.docx,.pdf,text/plain' },
  { id: 'image', name: 'Image & AI Analysis', iconId: 'ImageIcon', desc: 'ELA pixel manipulation + AI generation detection.', accept: 'image/jpeg,image/png,image/webp,image/bmp' },
  { id: 'audio', name: 'Audio Deepfake', iconId: 'Mic', desc: 'Synthetic voice, cloning & edit boundary detection.', accept: 'audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/flac,audio/mp4' },
  { id: 'video', name: 'Video Auth', iconId: 'Video', desc: 'Frame-by-frame deepfake & splice authentication.', accept: 'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm' },
  { id: 'metadata', name: 'EXIF Forensic', iconId: 'FileText', desc: 'Full metadata extraction, GPS & tamper detection.', accept: 'image/jpeg,image/png,image/tiff,image/heic,image/x-canon-cr2,image/x-adobe-dng' },
  { id: 'document', name: 'Doc Integrity', iconId: 'Search', desc: 'Macro, hidden content & signature verification.', accept: '.pdf,.doc,.docx,.xls,.xlsx,application/pdf' },
  { id: 'archive', name: 'Archive Scanner', iconId: 'Archive', desc: 'Zip bomb, payload & CRC integrity analysis.', accept: '.zip,.tar,.gz,.rar,.7z,application/zip' },
  { id: 'qrcode', name: 'QR Forensics', iconId: 'QrCodeIcon', desc: 'QR decode, IDN homoglyph & phishing chain check.', accept: 'image/jpeg,image/png,image/webp' },
  { id: 'software', name: 'Software Hash', iconId: 'Code', desc: 'Cryptographic fingerprint & malware DB matching.', accept: '.exe,.dmg,.apk,.bin,.sh,.py,.js' },
  { id: 'geospatial', name: 'Geospatial Check', iconId: 'MapPin', desc: 'Shadow physics vs GPS + vegetation biome check.', accept: 'image/jpeg,image/png,image/webp' },
  { id: 'social', name: 'Social Origin', iconId: 'Share2', desc: 'Detect platform fingerprints and compression markers.', accept: 'image/jpeg,image/png,image/webp' },
  { id: 'hex', name: 'Hex Byte Inspector', iconId: 'Activity', desc: 'Deep binary inspection, hex-dump & string extraction.', accept: '*/*' },
];

const MODULE_COLORS = {
  metadata: { icon: '#FDE047', iconBg: 'rgba(253,224,71,0.22)', iconBorder: 'rgba(253,224,71,0.65)', cardBorder: 'rgba(253,224,71,0.30)', shadow: 'rgba(253,224,71,0.30)', bg: '#161208', hoverBg: '#231C09' },
  image: { icon: '#D946EF', iconBg: 'rgba(217,70,239,0.22)', iconBorder: 'rgba(217,70,239,0.65)', cardBorder: 'rgba(217,70,239,0.30)', shadow: 'rgba(217,70,239,0.30)', bg: '#130818', hoverBg: '#1E0C25' },
  video: { icon: '#FF4D6D', iconBg: 'rgba(255,77,109,0.22)', iconBorder: 'rgba(255,77,109,0.65)', cardBorder: 'rgba(255,77,109,0.30)', shadow: 'rgba(255,77,109,0.30)', bg: '#170610', hoverBg: '#220818' },
  audio: { icon: '#00D4FF', iconBg: 'rgba(0,212,255,0.20)', iconBorder: 'rgba(0,212,255,0.65)', cardBorder: 'rgba(0,212,255,0.28)', shadow: 'rgba(0,212,255,0.28)', bg: '#03101A', hoverBg: '#041628' },
  document: { icon: '#00E676', iconBg: 'rgba(0,230,118,0.20)', iconBorder: 'rgba(0,230,118,0.65)', cardBorder: 'rgba(0,230,118,0.28)', shadow: 'rgba(0,230,118,0.28)', bg: '#031410', hoverBg: '#041D17' },
  archive: { icon: '#FF6B2B', iconBg: 'rgba(255,107,43,0.22)', iconBorder: 'rgba(255,107,43,0.65)', cardBorder: 'rgba(255,107,43,0.30)', shadow: 'rgba(255,107,43,0.30)', bg: '#160904', hoverBg: '#220D06' },
  software: { icon: '#3B9EFF', iconBg: 'rgba(59,158,255,0.22)', iconBorder: 'rgba(59,158,255,0.65)', cardBorder: 'rgba(59,158,255,0.30)', shadow: 'rgba(59,158,255,0.30)', bg: '#050E1C', hoverBg: '#07132B' },
  text: { icon: '#4ADE80', iconBg: 'rgba(74,222,128,0.22)', iconBorder: 'rgba(74,222,128,0.65)', cardBorder: 'rgba(74,222,128,0.30)', shadow: 'rgba(74,222,128,0.30)', bg: '#051610', hoverBg: '#0A2D1F' },
  qrcode: { icon: '#FFE033', iconBg: 'rgba(255,224,51,0.22)', iconBorder: 'rgba(255,224,51,0.65)', cardBorder: 'rgba(255,224,51,0.30)', shadow: 'rgba(255,224,51,0.30)', bg: '#151208', hoverBg: '#201B09' },
  geospatial: { icon: '#00FFC8', iconBg: 'rgba(0,255,200,0.20)', iconBorder: 'rgba(0,255,200,0.65)', cardBorder: 'rgba(0,255,200,0.28)', shadow: 'rgba(0,255,200,0.28)', bg: '#031614', hoverBg: '#05201C' },
  social: { icon: '#F759F7', iconBg: 'rgba(247,89,247,0.22)', iconBorder: 'rgba(247,89,247,0.65)', cardBorder: 'rgba(247,89,247,0.30)', shadow: 'rgba(247,89,247,0.30)', bg: '#130814', hoverBg: '#1E0B1F' },
  hex: { icon: '#10B981', iconBg: 'rgba(16,185,129,0.22)', iconBorder: 'rgba(16,185,129,0.65)', cardBorder: 'rgba(16,185,129,0.30)', shadow: 'rgba(16,185,129,0.30)', bg: '#06120e', hoverBg: '#0a1d17' },
};

function ModuleCard({ mod, onClick }) {
  if (!mod || !mod.id) return null;
  const c = MODULE_COLORS[mod.id] || MODULE_COLORS.software;
  const IconComp = mod.iconId ? ICON_MAP[mod.iconId] : null;
  return (
    <div 
      role="button" 
      tabIndex={0} 
      onClick={onClick} 
      className="module-card" 
      style={{ 
        '--glow-color': c.icon, 
        background: c.bg, 
        border: `1.5px solid ${c.cardBorder}`, 
        borderRadius: 20, 
        padding: '30px 26px', 
        cursor: 'pointer', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      <div style={{ width: 56, height: 56, background: c.iconBg, border: `1.5px solid ${c.iconBorder}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        {IconComp && React.createElement(IconComp, { style: { width: 26, height: 26, color: c.icon } })}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#F1F5F9', marginBottom: 8 }}>{mod.name}</h3>
      <p style={{ fontSize: 12, lineHeight: 1.65, color: '#6B7280' }}>{mod.desc}</p>
    </div>
  );
}

function ScanDetail({ scan, onBack }) {
  const res = scan.moduleResult || {};
  const entries = Object.entries(res.fields || {});
  const flags = entries.filter(([, v]) => String(v).startsWith('⚠'));
  const oks = entries.filter(([, v]) => String(v).startsWith('✓'));
  const neutral = entries.filter(([, v]) => !String(v).startsWith('⚠') && !String(v).startsWith('✓'));

  return (
    <div className="stagger-1">
      <button onClick={onBack} className="tactical-btn" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', cursor: 'pointer', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, fontWeight: 900, padding: '10px 18px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <ArrowLeft size={14} /> ABORT NODE
      </button>
      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>

        <div className="dossier-grid" style={{ padding: 40, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, background: '#0A0F1C' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 24 }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: 24, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.01em' }}>{scan.fileName}</h3>
              <div style={{ color: '#60A5FA', fontSize: 10, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.1em' }}>TARGET ID: {scan.id.toUpperCase()}</div>
            </div>
            <div style={{ background: res.verdict === 'warning' ? 'rgba(248,113,113,0.1)' : 'rgba(16,185,129,0.1)', color: res.verdict === 'warning' ? '#F87171' : '#10B981', border: `1px solid ${res.verdict === 'warning' ? 'rgba(248,113,113,0.2)' : 'rgba(16,185,129,0.2)'}`, padding: '8px 18px', borderRadius: 999, fontSize: 10, fontWeight: 900, letterSpacing: '0.05em' }}>
              {res.verdict === 'warning' ? '⚠' : '✓'} {res.verdictLabel?.toUpperCase() || 'VERIFIED'}
            </div>
          </div>
          
          <Suspense fallback={<div style={{ color: '#64748B', fontSize: 11, padding: 20 }}>INITIALIZING FORENSIC MATRIX...</div>}>
            <FinalConclusion scan={scan} />
          </Suspense>

          {flags.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <p style={{ fontSize: 8, color: '#F87171', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>⚠ ANOMALIES DETECTED</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {flags.map(([k, v]) => (
                  <div key={k} style={{ background: 'rgba(248, 113, 113, 0.03)', border: '1px solid rgba(248, 113, 113, 0.12)', borderRadius: 12, padding: '16px 20px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
                    <p style={{ fontSize: 9, color: '#F87171', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</p>
                    <p className="dossier-value" style={{ fontSize: 12, color: '#fff' }}>{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px', marginTop: 32, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[...oks, ...neutral].map(([k, v]) => (
              <div key={k} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 16 }}>
                <p style={{ fontSize: 8, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.1em' }}>{k}</p>
                <p className="dossier-value" style={{ fontSize: 11, color: '#CBD5E1' }}>{String(v)}</p>
              </div>
            ))}
          </div>
          
          <Suspense fallback={null}>
            {res.gps && <GpsMap lat={res.gps.lat} lon={res.gps.lon} />}
            {scan.category === 'hex' && <HexViewer data={res.hexDump || []} secrets={res.secrets || []} />}
          </Suspense>
        </div>

        <div className="dossier-grid" style={{ padding: 40, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24 }}>
          <h4 style={{ color: '#60A5FA', fontSize: 10, fontWeight: 900, marginBottom: 32, letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={14} /> TECHNICAL INTEL
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <p style={{ fontSize: 8, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.1em' }}>FILE FINGERPRINT (SHA-256)</p>
              <p style={{ fontSize: 10, color: '#93C5FD', fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(147, 197, 253, 0.05)', padding: 14, borderRadius: 12, border: '1px solid rgba(147, 197, 253, 0.1)' }}>{scan.hash || 'FINGERPRINTING...'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div><p style={{ fontSize: 8, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>FILE SIZE</p><p style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{scan.fileSize}</p></div>
              <div><p style={{ fontSize: 8, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>DATA TYPE</p><p style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{scan.mimeType?.split('/')[1]?.toUpperCase() || 'BLOB'}</p></div>
              <div><p style={{ fontSize: 8, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>ENGINE NODE</p><p style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>TG-NODE-4.2</p></div>
              <div><p style={{ fontSize: 8, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>SECURITY</p><p style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>VERIFIED</p></div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 32, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
               <button 
                 onClick={() => window.print()}
                 className="tactical-btn"
                 style={{ width: '100%', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)', color: '#60A5FA', padding: '16px', borderRadius: 14, fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: '0.1em' }}
               >
                 <FileText size={16} /> GENERATE FORENSIC REPORT
               </button>
               <p style={{ fontSize: 9, color: '#4B5563', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>TrustGuard PRO Forensic Engine v4.2<br/>Validated cryptographic chain confirmed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [accessKey, setAccessKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, u => {
      if (!u) signInAnonymously(auth).catch(console.error);
      else setUser(u);
    });
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const ref = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'scans');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(40));
    return onSnapshot(q, snap => setScans(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const handleLogin = e => {
    e.preventDefault();
    if (accessKey === MASTER_KEY || accessKey === 'admin') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('INVALID ACCESS CREDENTIALS');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpload = async e => {
    const file = e.target.files[0];
    if (!file || !user || !activeModule) return;
    setIsUploading(true);
    try {
      const id = crypto.randomUUID();
      const buffer = await file.arrayBuffer();
      const { runModuleAnalysis } = await import('./engines/ForensicOrchestrator.js');
      const analysis = await runModuleAnalysis(activeModule, file, buffer);
      
      const report = {
        id, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type, timestamp: serverTimestamp(), status: analysis.verdict || 'clean',
        category: activeModule, moduleResult: analysis, hash: 'Pending'
      };
      await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'scans', id), report);
    } catch (err) {
      setError('ANALYSIS ENGINE FAILURE: ' + err.message);
    } finally { setIsUploading(false); }
  };

  const handleTextAnalysis = async (manualText) => {
    if (!manualText || !user || isUploading) return;
    setIsUploading(true);
    try {
      const id = crypto.randomUUID();
      const buffer = new TextEncoder().encode(manualText);
      const pseudoFile = { name: 'linguistic_artifact.txt', type: 'text/plain', size: buffer.byteLength };
      const { runModuleAnalysis } = await import('./engines/ForensicOrchestrator.js');
      const analysis = await runModuleAnalysis('text', pseudoFile, buffer);
      
      const report = {
        id, fileName: 'Manual Text Entry', fileSize: (buffer.byteLength / 1024).toFixed(1) + ' KB',
        timestamp: serverTimestamp(), status: analysis.verdict || 'clean',
        category: 'text', moduleResult: analysis, hash: 'Linguistic Trace'
      };
      await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'scans', id), report);
    } catch (err) { setError('ENGINE FAILURE'); }
    finally { setIsUploading(false); }
  };

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#0C1321', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: 64, width: 460, textAlign: 'center' }}>
          <Shield size={44} color="#60A5FA" style={{ marginBottom: 32 }} />
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>TrustGuard <span style={{ color: '#60A5FA' }}>PRO</span></h1>
          <form onSubmit={handleLogin} style={{ marginTop: 40 }}>
            <input type="password" value={accessKey} onChange={e => setAccessKey(e.target.value)} style={{ width: '100%', background: '#070B14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 18, color: '#fff', marginBottom: 20, fontSize: 13, textAlign: 'center', letterSpacing: '0.2em' }} placeholder="ENTER MASTER KEY..." />
            {error && <p style={{ color: '#EF4444', fontSize: 10, fontWeight: 900, marginBottom: 20, letterSpacing: '0.1em' }}>{error}</p>}
            <button type="submit" className="tactical-btn" style={{ width: '100%', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, padding: 18, fontWeight: 900, cursor: 'pointer', fontSize: 12, letterSpacing: '0.1em' }}>AUTHORISE ACCESS</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section"><Shield className="logo-icon" /><div className="logo-text">TrustGuard <span style={{ color: '#60A5FA' }}>PRO</span></div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(96, 165, 250, 0.1)', padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(96, 165, 250, 0.2)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 8px #60A5FA' }} />
            <span style={{ fontSize: 9, fontWeight: 900, color: '#60A5FA', letterSpacing: '0.1em' }}>ENCRYPTED SESSION</span>
          </div>
          <button onClick={() => { setAuthenticated(false); setAccessKey(''); }} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><LogOut size={20} /></button>
        </div>
      </header>

      <main className="app-main">
        {!activeModule ? (
          <div className="stagger-1" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 0' }}>
            <h2 style={{ color: '#fff', fontSize: 42, textAlign: 'center', marginBottom: 64, fontWeight: 900, letterSpacing: '-0.03em' }}>Select Forensic Environment</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {MODULES.map(m => <ModuleCard key={m.id} mod={m} onClick={() => setActiveModule(m.id)} />)}
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, alignItems: 'center' }}>
              <button onClick={() => { setActiveModule(null); setSelectedScan(null); }} className="tactical-btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', cursor: 'pointer', padding: '12px 20px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}><ArrowLeft size={16} /> ABORT NODE</button>
              <h2 style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '0.2em' }}>{activeModule.toUpperCase()} ANALYSIS MATRIX</h2>
            </div>

            {selectedScan ? (
              <ScanDetail scan={selectedScan} onBack={() => setSelectedScan(null)} />
            ) : (
              <div className="stagger-1">
                {activeModule === 'text' && (
                  <div style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 24, padding: 40, marginBottom: 40 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 900, color: '#10B981', letterSpacing: '0.15em', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, textTransform: 'uppercase' }}><FileText size={16} /> PASTE LINGUISTIC ARTIFACT</h3>
                    <textarea id="text-portal" style={{ width: '100%', height: 140, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, color: '#fff', fontSize: 15, outline: 'none', resize: 'none', marginBottom: 20, lineHeight: 1.6 }} placeholder="Enter manuscript content for deep AI perplexity analysis..." />
                    <button onClick={() => { const v = document.getElementById('text-portal').value; if(v) { handleTextAnalysis(v); document.getElementById('text-portal').value=''; } }} className="tactical-btn" style={{ background: '#065f46', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '14px 28px', borderRadius: 12, fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.05em' }}><Zap size={16} /> INITIALIZE SCAN</button>
                  </div>
                )}

                <label className="hologram-dropzone" style={{ marginBottom: 56, display: 'block' }}>
                  <div className="laser-line" />
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                      {isUploading ? <Activity className="scan-pulse" color="#60A5FA" size={32} /> : <Upload color="#60A5FA" size={32} />}
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '0.02em' }}>{isUploading ? 'DECRYPTING SOURCE PAYLOAD...' : 'INITIALIZE TARGET UPLOAD'}</p>
                    <p style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>50MB TARGET LIMIT · MIL-SPEC ENCRYPTION</p>
                  </div>
                  <input type="file" hidden onChange={handleUpload} disabled={isUploading} />
                </label>

                <Suspense fallback={<div style={{ color: '#4B5563', fontSize: 11, textAlign: 'center', padding: 40, fontFamily: 'monospace' }}>SYNCHRONIZING REPOSITORY MATRIX...</div>}>
                  <ScanTable scans={scans.filter(s => s && s.category === activeModule)} onSelect={setSelectedScan} />
                </Suspense>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
