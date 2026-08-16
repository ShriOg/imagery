"use client";

import { useEffect, useState } from "react";
import FabricCanvas from "./FabricCanvas";
import { useCanvasStore } from "@/lib/store/canvas-store";

export default function CanvasWorkspace() {
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canvasState = useCanvasStore((s) => s.canvas);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const isEmpty = canvasState.elements.length === 0;

  return (
    <div className="dot-grid-bg" style={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      position: "relative",
      overflow: "hidden" 
    }}>
      
      {/* Floating Canvas Header (Top pill) */}
      <div style={{
        marginTop: "24px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--bg-main)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "6px 12px",
        gap: "16px",
        color: "var(--text-muted)",
        fontSize: "12px",
        zIndex: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      }}>
        <button style={{ display: "flex", alignItems: "center", justifyContent: "center" }} title="Lock Canvas">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </button>
        <div style={{ height: "14px", width: "1px", backgroundColor: "var(--border)" }}></div>
        <span style={{ fontFamily: "Space Mono, monospace" }}>
          {canvasState.width} × {canvasState.height}
        </span>
        <div style={{ height: "14px", width: "1px", backgroundColor: "var(--border)" }}></div>
        <button style={{ display: "flex", alignItems: "center", justifyContent: "center" }} title="Fullscreen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
        </button>
      </div>

      {/* Canvas Container with subtle shadow and border to separate from grid */}
      <div style={{ 
        position: "relative",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.5)",
        borderRadius: "2px",
        overflow: "hidden", // ensures empty state overlay clips to canvas
      }}>
        
        {/* The actual FabricCanvas */}
        <FabricCanvas />

        {/* Empty State Overlay */}
        {mounted && isEmpty && (
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            backgroundColor: "rgba(26, 26, 46, 0.5)", // slight tint over the canvas bg
            backdropFilter: "blur(2px)",
          }}>
            <div style={{
              width: "48px", height: "48px",
              border: "1px dashed var(--text-muted)",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "24px",
              color: "var(--accent)"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            
            <h3 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "12px" }}>
              Describe your design
            </h3>
            
            <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "260px", textAlign: "center", lineHeight: 1.5 }}>
              Use the AI Assistant to create, transform, and arrange your design.
            </p>
            
            {/* Arrow pointing right towards AI panel */}
            <div style={{ position: "absolute", right: "60px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.5 }}>
              <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10C20 10 40 10 58 10M58 10C53 5 48 2 48 2M58 10C53 15 48 18 48 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
