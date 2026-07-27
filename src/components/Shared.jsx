import { useEffect } from "react";
import { STAGE_CONFIG, PRIORITY_COLOR } from "../lib/constants";

export const StageBadge = ({ stage }) => {
  const cfg = STAGE_CONFIG[stage] || {};
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`,
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {cfg.emoji} {stage}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  if (!priority) return null;
  const color = PRIORITY_COLOR[priority] || "#94a3b8";
  return (
    <span style={{
      color, fontSize: 11, fontWeight: 700, border: `1px solid ${color}50`,
      borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap",
    }}>
      ● {priority}
    </span>
  );
};

export const Toast = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "#111", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 14,
      fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px #0004", whiteSpace: "nowrap",
    }}>
      {msg}
    </div>
  );
};

export const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => (
  <div style={{
    position: "fixed", inset: 0, background: "#00000066", zIndex: 200,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  }} onClick={onCancel}>
    <div style={{
      background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 380,
      boxShadow: "0 20px 60px #0003",
    }} onClick={e => e.stopPropagation()}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#111" }}>{title}</div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>{message}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #e5e7eb",
          background: "#fff", cursor: "pointer", fontWeight: 600, color: "#555",
        }}>Cancel</button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
          background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 700,
        }}>Delete</button>
      </div>
    </div>
  </div>
);
