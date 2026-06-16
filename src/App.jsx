import { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rmsqpddfclqxtymmluzn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc3FwZGRmY2xxeHR5bW1sdXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTUzNjksImV4cCI6MjA5Njg3MTM2OX0.sQZ39At5pEGM2oWzDqwM9T0mUtlOkIKAFlKSZkGbU_8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STATUS_CONFIG = {
  "Identified":          { color: "#6366f1", bg: "#eef2ff", emoji: "🌱" },
  "Outreached":          { color: "#f59e0b", bg: "#fffbeb", emoji: "📞" },
  "Discovery Interview": { color: "#8b5cf6", bg: "#f5f3ff", emoji: "🎙️" },
  "Demo Scheduled":      { color: "#f97316", bg: "#fff7ed", emoji: "🗓️" },
  "Demo Done":           { color: "#0ea5e9", bg: "#f0f9ff", emoji: "🖥️" },
  "Interested":          { color: "#10b981", bg: "#ecfdf5", emoji: "✅" },
  "Proposal Sent":       { color: "#3b82f6", bg: "#eff6ff", emoji: "📋" },
  "Onboarded":           { color: "#14b8a6", bg: "#f0fdfa", emoji: "🎉" },
  "Not Interested":      { color: "#ef4444", bg: "#fef2f2", emoji: "❌" },
  "Follow Up Later":     { color: "#94a3b8", bg: "#f8fafc", emoji: "⏸️" },
};
const STATUSES = Object.keys(STATUS_CONFIG);
const TEAM_MEMBERS = ["Unassigned", "Abdul", "Areeb", "Saba", "Omar"];

const today = () => new Date().toISOString().slice(0, 10);

function exportCSV(masjids) {
  const cols = ["name","location","communitySize","contactName","contactTitle","contactPhone","contactEmail","assignedTo","status","notes","lastUpdated"];
  const headers = ["Organization","Location","Community Size","Contact Name","Contact Title","Phone","Email","Assigned To","Status","Notes","Last Updated"];
  const rows = masjids.map(m => cols.map(k => `"${(m[k] || "").toString().replace(/"/g, '""')}"`).join(","));
  const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "masjid_pipeline.csv"; a.click();
  URL.revokeObjectURL(url);
}

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {};
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`,
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {cfg.emoji} {status}
    </span>
  );
};

const Toast = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      background:"#111", color:"#fff", padding:"10px 20px", borderRadius:10, fontSize:14,
      fontWeight:600, zIndex:999, boxShadow:"0 4px 20px #0004", whiteSpace:"nowrap" }}>
      {msg}
    </div>
  );
};

const Modal = ({ masjid, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState(masjid || {
    name:"", location:"", communitySize:"", contactName:"", contactTitle:"",
    contactPhone:"", contactEmail:"", assignedTo:"Unassigned", status:"Identified", notes:""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!masjid?.id;

  return (
    <div style={{ position:"fixed", inset:0, background:"#00000066", zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:520,
        boxShadow:"0 20px 60px #0003", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:"#111" }}>
            {isEdit ? "Edit Organization" : "Add Organization"}
          </h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#888" }}>✕</button>
        </div>

        <div style={{ background:"#f0fdfb", borderRadius:10, padding:"12px 16px", marginBottom:18, border:"1px solid #ccede9" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0f766e", marginBottom:8 }}>🕌 ORGANIZATION INFO</div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Masjid / Organization Name</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. MAPS - Muslim Association of Puget Sound"
              style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Location (City, State)</label>
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Seattle, WA"
                style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Community Size</label>
              <input value={form.communitySize} onChange={e => set("communitySize", e.target.value)} placeholder="e.g. 500 families"
                style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
          </div>
        </div>

        <div style={{ background:"#f8f9fc", borderRadius:10, padding:"12px 16px", marginBottom:18, border:"1px solid #e5e7f5" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#6366f1", marginBottom:8 }}>👤 MAIN CONTACT</div>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Contact Name</label>
              <input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="e.g. Br. Ahmad Hassan"
                style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Title / Role</label>
              <input value={form.contactTitle} onChange={e => set("contactTitle", e.target.value)} placeholder="e.g. Executive Director"
                style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Phone</label>
              <input value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="e.g. 206-555-0000"
                style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Email</label>
              <input value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="e.g. ahmad@maps.org"
                style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Pipeline Status</label>
          <select value={form.status} onChange={e => set("status", e.target.value)}
            style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fff" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Assigned To</label>
          <select value={form.assignedTo || "Unassigned"} onChange={e => set("assignedTo", e.target.value)}
            style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fff" }}>
            {TEAM_MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:4 }}>Notes</label>
          <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)}
            placeholder="Key conversations, pain points, next steps, follow up dates..." rows={3}
            style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb",
              fontSize:14, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"inherit" }} />
        </div>

        <div style={{ display:"flex", gap:8 }}>
          {isEdit && (
            <button onClick={() => onDelete(masjid.id)} style={{ padding:"10px 14px", borderRadius:8,
              border:"1.5px solid #fca5a5", background:"#fef2f2", cursor:"pointer", color:"#ef4444", fontWeight:600 }}>
              Delete
            </button>
          )}
          <button onClick={onClose} style={{ flex:1, padding:"10px 0", borderRadius:8,
            border:"1.5px solid #e5e7eb", background:"#fff", cursor:"pointer", fontWeight:600, color:"#555" }}>
            Cancel
          </button>
          <button onClick={() => onSave({ ...form, lastUpdated: today() })} style={{ flex:2, padding:"10px 0",
            borderRadius:8, border:"none", background:"#0f766e", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:14 }}>
            {isEdit ? "Save Changes" : "Add Organization"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [masjids, setMasjids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [view, setView] = useState("table");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  const fetchMasjids = useCallback(async () => {
    const { data, error } = await supabase
      .from("masjid_pipeline")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setMasjids(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMasjids();
    const channel = supabase
      .channel("masjid-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "masjid_pipeline" }, () => {
        fetchMasjids();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchMasjids]);

  const saveMasjid = async (data) => {
    if (data.id) {
      const { error } = await supabase.from("masjid_pipeline").update({
        name: data.name, location: data.location, communitySize: data.communitySize,
        contactName: data.contactName, contactTitle: data.contactTitle,
        contactPhone: data.contactPhone, contactEmail: data.contactEmail,
        assignedTo: data.assignedTo, status: data.status,
        notes: data.notes, lastUpdated: data.lastUpdated,
      }).eq("id", data.id);
      if (!error) showToast("✅ Organization updated");
    } else {
      const { error } = await supabase.from("masjid_pipeline").insert({
        name: data.name, location: data.location, communitySize: data.communitySize,
        contactName: data.contactName, contactTitle: data.contactTitle,
        contactPhone: data.contactPhone, contactEmail: data.contactEmail,
        assignedTo: data.assignedTo, status: data.status,
        notes: data.notes, lastUpdated: data.lastUpdated,
      });
      if (!error) showToast("✅ Organization added");
    }
    setModal(null);
  };

  const deleteMasjid = async (id) => {
    await supabase.from("masjid_pipeline").delete().eq("id", id);
    setModal(null);
    showToast("🗑️ Organization removed");
  };

  const quickStatus = async (id, status) => {
    await supabase.from("masjid_pipeline").update({ status, lastUpdated: today() }).eq("id", id);
    showToast(`↪️ Moved to ${status}`);
  };

  const filtered = useMemo(() => {
    return masjids.filter(m => {
      const matchStatus = filter === "All" || m.status === filter;
      const q = search.toLowerCase();
      return matchStatus && (!q || m.name?.toLowerCase().includes(q) || m.location?.toLowerCase().includes(q) || m.contactName?.toLowerCase().includes(q));
    });
  }, [masjids, filter, search]);

  const counts = useMemo(() => {
    const r = { All: masjids.length };
    STATUSES.forEach(s => r[s] = masjids.filter(m => m.status === s).length);
    return r;
  }, [masjids]);

  const totalCommunitySize = useMemo(() => {
    return masjids.reduce((sum, m) => {
      const num = parseInt((m.communitySize || "0").replace(/\D/g, ""));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [masjids]);

  return (
    <div style={{ minHeight:"100vh", background:"#f8f9fc", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", padding:"16px 20px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:26 }}>🕌</span>
                <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#fff" }}>Minar360 — Masjid Pipeline</h1>
                {!loading && <span style={{ fontSize:11, background:"#ecfdf5", color:"#10b981", borderRadius:20, padding:"2px 8px", fontWeight:700 }}>● Live</span>}
              </div>
              <p style={{ margin:0, color:"#99f6e4", fontSize:13, marginTop:2 }}>
                {masjids.length} organizations · {counts["Onboarded"] || 0} onboarded
                {totalCommunitySize > 0 && ` · ~${totalCommunitySize.toLocaleString()} community members reached`}
              </p>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button onClick={() => exportCSV(masjids)} style={{ padding:"8px 14px", borderRadius:8,
                border:"1.5px solid #99f6e4", background:"transparent", cursor:"pointer", fontWeight:600, fontSize:13, color:"#fff" }}>
                ⬇️ Export CSV
              </button>
              <button onClick={() => setView(v => v === "table" ? "board" : "table")} style={{ padding:"8px 14px",
                borderRadius:8, border:"1.5px solid #99f6e4", background:"transparent", cursor:"pointer", fontWeight:600, fontSize:13, color:"#fff" }}>
                {view === "table" ? "📊 Board" : "📋 Table"}
              </button>
              <button onClick={() => setModal("add")} style={{ padding:"8px 16px", borderRadius:8,
                border:"none", background:"#fff", color:"#0f766e", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                + Add Organization
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"20px 16px" }}>

        {loading && (
          <div style={{ textAlign:"center", padding:60, color:"#aaa" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🕌</div>
            <div style={{ fontWeight:600 }}>Loading pipeline...</div>
          </div>
        )}

        {!loading && <>
          {/* Stats */}
          <div style={{ display:"flex", gap:10, overflowX:"auto", marginBottom:20, paddingBottom:4 }}>
            {STATUSES.map(s => {
              const cfg = STATUS_CONFIG[s];
              const active = filter === s;
              return (
                <div key={s} onClick={() => setFilter(f => f === s ? "All" : s)} style={{
                  background: active ? cfg.bg : "#fff",
                  border: `1.5px solid ${active ? cfg.color : "#e5e7eb"}`,
                  borderRadius:12, padding:"10px 14px", cursor:"pointer", minWidth:120, flexShrink:0, transition:"all .15s",
                }}>
                  <div style={{ fontSize:18 }}>{cfg.emoji}</div>
                  <div style={{ fontSize:20, fontWeight:800, color: cfg.color }}>{counts[s] || 0}</div>
                  <div style={{ fontSize:11, color:"#888", fontWeight:500, marginTop:2 }}>{s}</div>
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by organization, location, or contact..."
              style={{ flex:1, minWidth:200, padding:"9px 14px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none" }} />
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fff", color:"#333" }}>
              <option value="All">All ({counts.All})</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].emoji} {s} ({counts[s] || 0})</option>)}
            </select>
          </div>

          {/* Table */}
          {view === "table" && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", overflow:"hidden" }}>
              {filtered.length === 0 ? (
                <div style={{ padding:40, textAlign:"center", color:"#aaa" }}>
                  <div style={{ fontSize:40, marginBottom:8 }}>🕌</div>
                  <div style={{ fontWeight:600 }}>No organizations yet</div>
                  <div style={{ fontSize:13, marginTop:4 }}>Click "+ Add Organization" to get started</div>
                </div>
              ) : filtered.map((m, i) => (
                <div key={m.id} style={{
                  padding:"14px 18px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
                  display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap",
                }}>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"#111" }}>{m.name}</div>
                    <div style={{ color:"#888", fontSize:13 }}>📍 {m.location}</div>
                    {m.communitySize && <div style={{ color:"#0f766e", fontSize:12, fontWeight:600 }}>👥 {m.communitySize}</div>}
                  </div>
                  <div style={{ flex:1, minWidth:160 }}>
                    {m.contactName && <div style={{ fontWeight:600, fontSize:13, color:"#111" }}>{m.contactName}</div>}
                    {m.contactTitle && <div style={{ color:"#888", fontSize:12 }}>{m.contactTitle}</div>}
                    {m.contactPhone && <div style={{ color:"#aaa", fontSize:12 }}>{m.contactPhone}</div>}
                    {m.contactEmail && <div style={{ color:"#aaa", fontSize:12 }}>{m.contactEmail}</div>}
                  </div>
                  <div style={{ flex:1, minWidth:140 }}>
                    <Badge status={m.status} />
                    {m.notes && <div style={{ color:"#666", fontSize:12, marginTop:4, fontStyle:"italic" }}>{m.notes}</div>}
                  </div>
                  <div style={{ minWidth:90, flexShrink:0 }}>
                    <div style={{ fontSize:11, color:"#aaa", fontWeight:500, marginBottom:3 }}>ASSIGNED TO</div>
                    <div style={{ fontSize:13, fontWeight:700, color: m.assignedTo && m.assignedTo !== "Unassigned" ? "#0f766e" : "#ccc" }}>
                      {m.assignedTo && m.assignedTo !== "Unassigned" ? "👤 " + m.assignedTo : "—"}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    <select value={m.status} onChange={e => quickStatus(m.id, e.target.value)}
                      style={{ padding:"5px 8px", borderRadius:6, border:"1px solid #e5e7eb", fontSize:12, background:"#f9fafb", cursor:"pointer" }}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setModal(m)} style={{ background:"#f3f4f6", border:"none", borderRadius:6, padding:"5px 9px", cursor:"pointer", fontSize:14 }}>✏️</button>
                  </div>
                  <div style={{ color:"#ddd", fontSize:11, alignSelf:"center", flexShrink:0 }}>{m.lastUpdated}</div>
                </div>
              ))}
            </div>
          )}

          {/* Board */}
          {view === "board" && (
            <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:12 }}>
              {STATUSES.map(status => {
                const cfg = STATUS_CONFIG[status];
                const cols = masjids.filter(m => m.status === status);
                return (
                  <div key={status} style={{ minWidth:200, flex:"0 0 200px", background:cfg.bg,
                    borderRadius:12, padding:12, border:`1.5px solid ${cfg.color}30` }}>
                    <div style={{ fontWeight:700, fontSize:13, color:cfg.color, marginBottom:10 }}>
                      {cfg.emoji} {status} <span style={{ fontWeight:400, opacity:.7 }}>({cols.length})</span>
                    </div>
                    {cols.map(m => (
                      <div key={m.id} onClick={() => setModal(m)} style={{ background:"#fff", borderRadius:8,
                        padding:10, marginBottom:8, boxShadow:"0 1px 4px #0001", cursor:"pointer" }}>
                        <div style={{ fontWeight:600, fontSize:13, color:"#111" }}>{m.name}</div>
                        <div style={{ color:"#888", fontSize:12 }}>📍 {m.location}</div>
                        {m.communitySize && <div style={{ color:"#0f766e", fontSize:11, fontWeight:600 }}>👥 {m.communitySize}</div>}
                        {m.assignedTo && m.assignedTo !== "Unassigned" && (
                          <div style={{ fontSize:11, color:"#0f766e", fontWeight:600, marginTop:3 }}>👤 {m.assignedTo}</div>
                        )}
                      </div>
                    ))}
                    {cols.length === 0 && <div style={{ color:"#bbb", fontSize:12, textAlign:"center", padding:"12px 0" }}>Empty</div>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop:20, background:"#f0fdfb", border:"1.5px solid #99f6e4", borderRadius:12, padding:"12px 16px",
            display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>🌐</span>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:"#0f766e" }}>Live Shared Database</div>
              <div style={{ fontSize:12, color:"#0d9488" }}>
                All team members see the same data in real time. Any update shows instantly for everyone.
              </div>
            </div>
          </div>
        </>}
      </div>

      {modal && (
        <Modal
          masjid={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveMasjid}
          onDelete={deleteMasjid}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
