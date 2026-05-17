import React from 'react';

export default function FinalConclusion({ scan }) {
  const res = scan?.moduleResult || {};
  const isErr = res.verdict === 'warning' || res.verdict === 'error';
  
  const c = { 
    color: isErr ? '#EF4444' : '#10B981', 
    bg: isErr ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)', 
    border: isErr ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', 
    icon: isErr ? '!' : '✓', 
    title: res.verdictLabel || (isErr ? 'Alert Detected' : 'Analysis Complete'), 
    rating: isErr ? 'SUSPICIOUS' : 'VERIFIED', 
    lines: [res.summary || 'Forensic verification successful.'] 
  };

  return (
    <div style={{ marginBottom: 28, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 18, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${c.color}20`, border: `1px solid ${c.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: c.color, fontWeight: 900 }}>{c.icon}</div>
          <div>
            <p style={{ fontSize: 8, color: c.color, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4, opacity: 0.8 }}>FORENSIC CONCLUSION</p>
            <h4 style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{c.title}</h4>
          </div>
        </div>
        <div style={{ background: `${c.color}18`, border: `1px solid ${c.color}50`, borderRadius: 8, padding: '5px 12px', fontSize: 9, fontWeight: 900, color: c.color, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 16 }}>{c.rating}</div>
      </div>
      <div style={{ height: 1, background: `${c.color}20`, marginBottom: 20 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {c.lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: `${c.color}15`, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: c.color, marginTop: 1 }}>{i + 1}</div>
            <p style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.7, fontWeight: 500 }}>{line}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
