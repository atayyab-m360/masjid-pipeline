export const ORG_TYPES = [
  "Masjid",
  "Islamic Nonprofit",
  "Regional Organization",
  "National Organization",
  "Strategic Partner",
  "Other",
];

export const STAGE_CONFIG = {
  "New Prospect":         { color: "#6366f1", bg: "#eef2ff", emoji: "🌱" },
  "Initial Outreach":     { color: "#f59e0b", bg: "#fffbeb", emoji: "📞" },
  "Relationship Building":{ color: "#8b5cf6", bg: "#f5f3ff", emoji: "🤝" },
  "Discovery":            { color: "#a855f7", bg: "#faf5ff", emoji: "🎙️" },
  "Demo Scheduled":       { color: "#f97316", bg: "#fff7ed", emoji: "🗓️" },
  "Post-Demo Follow-Up":  { color: "#0ea5e9", bg: "#f0f9ff", emoji: "🖥️" },
  "Verbal Commitment":    { color: "#3b82f6", bg: "#eff6ff", emoji: "🗣️" },
  "Onboarding":           { color: "#f59e0b", bg: "#fffbeb", emoji: "⚙️" },
  "Live / Onboarded":     { color: "#10b981", bg: "#ecfdf5", emoji: "🎉" },
  "Stalled":              { color: "#94a3b8", bg: "#f8fafc", emoji: "⏸️" },
  "Declined":             { color: "#ef4444", bg: "#fef2f2", emoji: "❌" },
  "Re-Engagement Needed": { color: "#eab308", bg: "#fefce8", emoji: "🔁" },
};
export const STAGES = Object.keys(STAGE_CONFIG);

export const PRIORITIES = ["High", "Medium", "Low"];
export const PRIORITY_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#94a3b8" };

export const CONTACT_TYPES = [
  "Board President", "Board Member", "Executive Director", "Imam",
  "Operations Manager", "IT Contact", "Marketing Contact", "Youth Director",
  "Internal Champion", "Introducer", "Other",
];

export const RELATIONSHIP_STRENGTHS = ["Strong", "Warm", "New", "Cold"];
export const STRENGTH_COLOR = { Strong: "#10b981", Warm: "#f59e0b", New: "#6366f1", Cold: "#94a3b8" };

export const ACTIVITY_TYPES = [
  "Phone Call", "Text Message", "Email", "Meeting", "Demo", "Event",
  "Tabling", "Internal Update", "Follow-Up", "Onboarding Activity", "Other",
];

export const TEAM_MEMBERS = ["Unassigned", "Abdul", "Areeb", "Saba", "Omar"];

export const today = () => new Date().toISOString().slice(0, 10);

export const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
  fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff",
};
export const labelStyle = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 };
