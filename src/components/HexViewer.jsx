import React from 'react';

export default function HexViewer({ data, secrets = [] }) {
  if (!data || !Array.isArray(data)) return null;
  
  const rows = [];
  for (let i = 0; i < data.length; i += 16) {
    rows.push(data.slice(i, i + 16));
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ background: '#050505', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, overflow: 'hidden', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: '#10B981' }}>
        <div style={{ background: 'rgba(16,185,129,0.05)', padding: '14px 20px', borderBottom: '1px solid rgba(16,185,129,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}>BINARY HEX INSPECTION</span>
          <span style={{ fontSize: 9, opacity: 0.6 }}>VIEWING 1024 BYTES</span>
        </div>
        <div style={{ padding: 20, maxHeight: 300, overflowY: 'auto', fontSize: 11, lineHeight: 1.6 }}>
          {rows.map((row, i) => {
            const offset = (i * 16).toString(16).padStart(8, '0').toUpperCase();
            const hex = row.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
            const ascii = row.map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
            
            return (
              <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 4, opacity: 0.9 }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>{offset}</span>
                <span style={{ color: '#F1F5F9', letterSpacing: '0.05em', flex: 1 }}>{hex.padEnd(47, ' ')}</span>
                <span style={{ color: '#64748B' }}>{ascii}</span>
              </div>
            );
          })}
        </div>
      </div>

      {secrets.length > 0 && (
        <div style={{ marginTop: 20, background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: '#FBBF24', letterSpacing: '0.15em', marginBottom: 14, textTransform: 'uppercase' }}>IDENTIFIED FORENSIC ARTEFACTS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {secrets.map((s, i) => (
              <div key={i} style={{ background: 'rgba(245,158,11,0.1)', color: '#FBBF24', padding: '6px 12px', borderRadius: 8, fontSize: 10, fontFamily: 'monospace', border: '1px solid rgba(245,158,11,0.2)' }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
