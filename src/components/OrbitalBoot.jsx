import React from 'react';
import { Shield } from 'lucide-react';

const OrbitalBoot = ({ progress = 100 }) => {
  const stages = [
    { t: 0, l: 'Establishing secure handshake' },
    { t: 20, l: 'Validating cryptographic identity' },
    { t: 40, l: 'Loading neural forensic engine' },
    { t: 60, l: 'Synchronising distributed ledger' },
    { t: 80, l: 'Activating threat intelligence' }
  ];
  const stage = [...stages].reverse().find(s => progress >= s.t) || stages[0];
  const R = 80, r2 = 58, r3 = 38, cx = 160, cy = 160, circ = 2 * Math.PI * R, dash = circ * (1 - progress / 100);
  const polar = (r, a) => ({ x: cx + r * Math.cos((a - 90) * Math.PI / 180), y: cy + r * Math.sin((a - 90) * Math.PI / 180) });
  const dots = [0, 72, 144, 216, 288].map((a, i) => ({ ...polar(R + 14, a), i }));

  return (
    <div className="orbital-loader" style={{ minHeight: '100vh', background: '#070B14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', userSelect: 'none' }}>
      <style>{`
        @keyframes orbitSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes orbitSpinRev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes orbPulse{0%,100%{opacity:0.2;transform:scale(0.7)}50%{opacity:1;transform:scale(1)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <svg width="320" height="320" viewBox="0 0 320 320" style={{ overflow: 'visible' }}>
        <circle cx={cx} cy={cy} r={R + 30} fill="none" stroke="rgba(59,130,246,0.04)" strokeWidth="60" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx={cx} cy={cy} r={r2} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="3 8" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash} transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dashoffset 0.15s linear', filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }} />
        {(() => { const a = (progress / 100) * 360, p = polar(R, a); return <><circle cx={p.x} cy={p.y} r="5" fill="#3B82F6" style={{ filter: 'blur(3px)', opacity: 0.8 }} /><circle cx={p.x} cy={p.y} r="3" fill="#93C5FD" /></>; })()}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'orbitSpin 4s linear infinite' }}><circle cx={cx} cy={cy} r={r2} fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1" strokeDasharray="12 20" /></g>
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'orbitSpinRev 3s linear infinite' }}><circle cx={cx} cy={cy} r={r3} fill="none" stroke="rgba(96,165,250,0.15)" strokeWidth="1" strokeDasharray="8 14" /></g>
        {dots.map(({ x, y, i }) => <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" style={{ animation: `orbPulse 1.4s ease-in-out ${i * 0.28}s infinite` }} />)}
        <circle cx={cx} cy={cy} r="24" fill="rgba(37,99,235,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="14" fill="rgba(37,99,235,0.25)" stroke="rgba(96,165,250,0.4)" strokeWidth="1.5" />
        <Shield x={cx - 8} y={cy - 8} width="16" height="16" color="#93C5FD" />
        <text x={cx} y={cy + 50} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11" fontWeight="800" letterSpacing="0.2em" fontFamily="-apple-system,sans-serif">TRUSTGUARD PRO</text>
        <text x={cx} y={cy + 68} textAnchor="middle" fill="rgba(96,165,250,0.6)" fontSize="8" fontWeight="700" letterSpacing="0.1em" fontFamily="monospace">{progress.toFixed(0)}%</text>
      </svg>
      <div className="antigravity-float" style={{ marginTop: 32, width: 320, animation: 'fadeSlide 0.3s ease' }}>
        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 10, padding: '10px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 6px rgba(59,130,246,0.8)', flexShrink: 0 }} />
          <span style={{ fontSize: 9, color: '#93C5FD', fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase' }}>{stage.l}...</span>
        </div>
        {stages.map(s => (
          <div key={s.t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', opacity: progress >= s.t ? 1 : 0.2, transition: 'opacity 0.3s' }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: progress >= s.t ? '#10B981' : '#1F2937', transition: 'background 0.3s' }} />
            <span style={{ fontSize: 8, color: progress >= s.t ? '#6EE7B7' : '#374151', fontWeight: progress >= s.t ? 700 : 400, letterSpacing: '0.1em', transition: 'color 0.3s' }}>{s.l}</span>
            {progress >= s.t && <span style={{ marginLeft: 'auto', fontSize: 8, color: '#1F2937', fontFamily: 'monospace' }}>OK</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrbitalBoot;
