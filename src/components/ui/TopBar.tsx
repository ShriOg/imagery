"use client";

import { useCanvasStore } from "@/lib/store/canvas-store";

export default function TopBar() {
  const undo = useCanvasStore(s => s.undo);
  const redo = useCanvasStore(s => s.redo);
  const past = useCanvasStore(s => s.past);
  const future = useCanvasStore(s => s.future);
  const requestExport = useCanvasStore(s => s.requestExport);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "56px",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
      backgroundColor: "var(--bg-panel)",
      color: "var(--text-primary)"
    }}>
      {/* Left: Branding */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "300px" }}>
        <div style={{
          width: "24px", height: "24px", 
          backgroundColor: "var(--bg-hover)", 
          borderRadius: "4px",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ width: "12px", height: "12px", border: "2px solid var(--accent)", borderRadius: "50%" }}></div>
        </div>
        <span style={{ fontWeight: 600, fontSize: "16px", letterSpacing: "-0.01em" }}>
          Imagery <span style={{ color: "var(--accent)", fontSize: "14px" }}>✨</span>
        </span>
      </div>
      
      {/* Center: Document Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button style={{ 
          display: "flex", alignItems: "center", gap: "6px", 
          fontWeight: 400, fontSize: "14px", color: "var(--text-primary)" 
        }}>
          Untitled Design
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{ 
          display: "flex", alignItems: "center", gap: "6px", 
          fontSize: "12px", color: "var(--text-muted)",
          padding: "4px 8px", borderRadius: "100px", border: "1px solid var(--border)"
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Saved
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "300px", justifyContent: "flex-end" }}>
        <button 
          className="icon-btn" 
          onClick={undo} 
          disabled={past.length === 0}
          title="Undo (Ctrl+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
        </button>
        <button 
          className="icon-btn" 
          onClick={redo} 
          disabled={future.length === 0}
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
        </button>
        
        <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border)", margin: "0 4px" }}></div>

        <button style={{ 
          display: "flex", alignItems: "center", gap: "6px", 
          fontSize: "13px", padding: "6px 10px", 
          border: "1px solid var(--border)", borderRadius: "6px",
          color: "var(--text-primary)", backgroundColor: "var(--bg-main)"
        }}>
          67%
          <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button className="primary-btn" onClick={requestExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
          <div style={{ width: "1px", height: "16px", backgroundColor: "rgba(0,0,0,0.1)", margin: "0 2px" }}></div>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}
