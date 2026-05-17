import React from 'react';
import { MapPin } from 'lucide-react';

export default function GpsMap({ lat, lon }) {
  if (!lat || !lon) return null;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  return (
    <div 
      onClick={() => window.open(googleMapsUrl, '_blank')}
      style={{ marginTop: 28, position: 'relative', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(74, 222, 128, 0.2)', background: 'rgba(74, 222, 128, 0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(10, 20, 32, 0.85)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(74, 222, 128, 0.3)' }}>
        <MapPin size={12} color="#4ADE80" />
        <span style={{ fontSize: 10, color: '#fff', fontWeight: 900, letterSpacing: '0.05em' }}>GEOSPATIAL POSITION: {lat.toFixed(4)}, {lon.toFixed(4)}</span>
      </div>
      
      <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10, background: 'rgba(37, 99, 235, 0.9)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em' }}>
        CLICK TO OPEN GOOGLE MAPS
      </div>

      <iframe 
        title="GPS location" 
        src={embed} 
        width="100%" 
        height="240" 
        style={{ border: 0, filter: 'invert(0.92) hue-rotate(180deg) saturate(0.8) brightness(0.9)', display: 'block', pointerEvents: 'none' }} 
      />
    </div>
  );
}
