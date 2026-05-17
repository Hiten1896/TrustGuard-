import React from 'react';
import { Activity } from 'lucide-react';

export default function ScanTable({ scans, onSelect, onDelete }) {
  return (
    <div className="dossier-grid">
      <div className="dossier-header">
        <Activity size={14} /> FORENSIC REPOSITORY MATRIX
      </div>
      {scans.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#4B5563', fontSize: 12, fontFamily: 'monospace' }}>NO INTELLIGENCE INDEXED.</div>}
      {scans.map(scan => (
        <div key={scan.id} onClick={() => onSelect(scan)} className="dossier-row tactical-btn" style={{ cursor: 'pointer' }}>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 4 }}>{scan.fileName}</div>
            <div className="dossier-value">{scan.fileSize} • ID: {scan.id.substring(0,8).toUpperCase()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className={scan.status === 'warning' || scan.status === 'flagged' ? 'badge-flagged' : 'badge-clean'}>
              {scan.status?.toUpperCase() || 'CLEAN'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
