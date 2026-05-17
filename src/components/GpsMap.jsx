import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function GpsMap({ lat, lon }) {
  if (!lat || !lon) return null;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  return (
    <div style={{ marginTop: 32, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
        <span style={{ fontSize: 10, color: '#4ADE80', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Interactive Geospatial Node</span>
      </div>

      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(74, 222, 128, 0.25)', background: '#000', height: 300, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        
        {/* FULLY INTERACTIVE MAP IFRAME (NO OVERLAYS) */}
        <iframe 
          title="GPS location" 
          src={embed} 
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'invert(0.92) hue-rotate(180deg) saturate(0.8) brightness(0.9)', display: 'block' }} 
        />

        {/* TACTICAL HUD INFO (Relocated to top-left per user request) */}
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ background: 'rgba(10, 20, 32, 0.9)', backdropFilter: 'blur(10px)', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(74, 222, 128, 0.3)', textAlign: 'left' }}>
                <p style={{ fontSize: 8, color: '#64748B', fontWeight: 900, marginBottom: 4, letterSpacing: '0.1em' }}>TARGET COORDINATES</p>
                <p style={{ fontSize: 11, color: '#fff', fontWeight: 900, fontFamily: 'monospace' }}>{lat.toFixed(5)} / {lon.toFixed(5)}</p>
            </div>
        </div>

        {/* EXPLICIT ACTION BUTTON (NO LONGER BLOCKING MAP) */}
        <button 
          onClick={() => window.open(googleMapsUrl, '_blank')}
          className="tactical-btn"
          style={{ 
            position: 'absolute', 
            bottom: 20, 
            right: 20, 
            zIndex: 10, 
            background: '#2563EB', 
            color: '#fff', 
            border: 'none', 
            padding: '12px 20px', 
            borderRadius: 14, 
            fontSize: 10, 
            fontWeight: 900, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}
        >
          <ExternalLink size={14} /> Open Satellite View
        </button>

        {/* SCAN LINE DECORATION */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(74, 222, 128, 0.2)', zIndex: 11 }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 14 }}>
        <p style={{ fontSize: 9, color: '#4B5563', letterSpacing: '0.05em' }}>DRAG TO PAN OBJECTIVE</p>
        <p style={{ fontSize: 9, color: '#4B5563', letterSpacing: '0.05em' }}>SCROLL TO SCALE VIEW</p>
      </div>
    </div>
  );
}
