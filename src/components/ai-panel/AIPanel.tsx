"use client";

import { useState, useRef, useEffect } from "react";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { useAIEdit } from "@/hooks/use-ai-edit";

const SUGGESTIONS = [
  { text: "Create a minimalist poster for a jazz concert", icon: "🎸" },
  { text: "Make it look like a retro 1980s synthwave flyer", icon: "🤖" },
  { text: "Center align everything and make the title massive", icon: "📐" }
];

export default function AIPanel() {
  const [prompt, setPrompt] = useState("");
  const aiStatus = useCanvasStore(s => s.aiStatus);
  const aiErrorMessage = useCanvasStore(s => s.aiErrorMessage);
  const messages = useCanvasStore(s => s.messages);
  const { submitPrompt } = useAIEdit();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const showSuggestions = messages.length === 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || aiStatus === 'thinking') return;
    
    const p = prompt;
    setPrompt("");
    await submitPrompt(p);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "340px",
      borderLeft: "1px solid var(--border)",
      backgroundColor: "var(--bg-main)", // main bg for the panel structure
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--accent)" }}>✨</span>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>AI Assistant</h2>
        </div>
        <button className="icon-btn" style={{ width: "24px", height: "24px", color: "var(--text-muted)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
        </button>
      </div>

      {/* Body Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column" }}>
        
        {showSuggestions ? (
          // Empty State Area
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ 
              width: "48px", height: "48px", 
              backgroundColor: "rgba(255,255,255,0.03)", 
              borderRadius: "50%", 
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "16px",
              color: "var(--text-primary)"
            }}>
              ✨
            </div>
            
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>
              Describe your design
            </h3>
            
            <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5, marginBottom: "32px", maxWidth: "240px" }}>
              Create, transform, and arrange your design with natural language.
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => { setPrompt(s.text); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    backgroundColor: "var(--bg-panel)",
                    border: "1px solid transparent",
                    borderRadius: "8px",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-panel)";
                  }}
                >
                  <div style={{ 
                    width: "32px", height: "32px", 
                    backgroundColor: "rgba(255,255,255,0.05)", 
                    borderRadius: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", color: "var(--text-primary)"
                  }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4 }}>
                    {s.text}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ width: "100%", marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Conversation</div>
              <div style={{ 
                height: "120px", 
                border: "1px dashed var(--border)", 
                borderRadius: "8px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", gap: "12px"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span style={{ fontSize: "12px", maxWidth: "160px", textAlign: "center", lineHeight: 1.4 }}>
                  Your AI conversation will appear here.
                </span>
              </div>
            </div>

          </div>
        ) : (
          // Conversation View
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--bg-hover)' : 'var(--bg-panel)',
                padding: "12px 16px",
                borderRadius: "8px",
                maxWidth: "85%",
                fontSize: "13px",
                lineHeight: 1.5,
                color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: msg.role === 'user' ? '1px solid var(--border)' : 'none'
              }}>
                {msg.role === 'assistant' && <span style={{ color: "var(--accent)", marginRight: "8px" }}>✨</span>}
                {msg.content}
              </div>
            ))}
            
            {aiStatus === 'thinking' && (
              <div style={{ alignSelf: 'flex-start', fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--accent)" }}>✨</span> AI is thinking...
              </div>
            )}
            {aiStatus === 'error' && (
              <div style={{ alignSelf: 'flex-start', fontSize: "13px", color: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "12px 16px", borderRadius: "8px" }}>
                {aiErrorMessage || "An error occurred"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Input Area */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-main)" }}>
        <form onSubmit={handleSubmit} style={{ 
          display: "flex", flexDirection: "column", 
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "12px"
        }}>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Describe what you want to create..."
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontFamily: "inherit",
              fontSize: "13px",
              resize: "none",
              outline: "none",
              minHeight: "40px",
              marginBottom: "8px"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button type="button" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "4px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </button>
            <button 
              type="submit"
              disabled={!prompt.trim() || aiStatus === 'thinking'}
              style={{
                backgroundColor: (prompt.trim() && aiStatus !== 'thinking') ? "var(--accent)" : "var(--bg-hover)",
                color: (prompt.trim() && aiStatus !== 'thinking') ? "var(--accent-text)" : "var(--text-muted)",
                width: "32px", height: "32px",
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
