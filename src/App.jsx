import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import { ORG_TYPES, STAGES, PRIORITIES, TEAM_MEMBERS, today } from "./lib/constants";
import { exportCSV, followUpBuckets } from "./lib/utils";
import { Toast } from "./components/Shared";
import Dashboard from "./components/Dashboard";
import FollowUpsPanel from "./components/FollowUpsPanel";
import OrganizationModal from "./components/OrganizationModal";
import { OrgRow, BoardColumn } from "./components/OrganizationCard";

export default function App() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [assignedFilter, setAssignedFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [view, setView] = useState("table");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  const fetchOrgs = useCallback(async () => {
    const { data, error } = await supabase
      .from("masjid_pipeline")
      .select("*, contacts(id, full_name)")
      .order("created_at", { ascending: false });
    if (!error) setOrgs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrgs();
    const channel = supabase
      .channel("pipeline-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "masjid_pipeline" }, fetchOrgs)
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, fetchOrgs)
      .on("postgres_changes", { event: "*", schema: "public", table: "activities" }, fetchOrgs)
      .on("postgres_changes", { event: "*", schema: "public", table: "followups" }, fetchOrgs)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchOrgs]);

  const saveOrg = async (data) => {
    const { contacts, ...payload } = data;
    if (payload.id) {
      const { error } = await supabase.from("masjid_pipeline").update(payload).eq("id", payload.id);
      if (!error) showToast("✅ Organization updated");
    } else {
      const { error } = await supabase.from("masjid_pipeline").insert(payload);
      if (!error) showToast("✅ Organization added");
    }
    setModal(null);
  };

  const deleteOrg = async (id) => {
    await supabase.from("masjid_pipeline").delete().eq("id", id);
    setModal(null);
    showToast("🗑️ Organization removed");
  };

  const quickStage = async (id, stage) => {
    await supabase.from("masjid_pipeline").update({ stage, date_last_contact: today() }).eq("id", id);
    showToast(`↪️ Moved to ${stage}`);
  };

  const regions = useMemo(() => {
    const set = new Set(orgs.map(o => o.region).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [orgs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgs.filter(o => {
      if (stageFilter !== "All" && o.stage !== stageFilter) return false;
      if (typeFilter !== "All" && o.organization_type !== typeFilter) return false;
      if (priorityFilter !== "All" && o.priority !== priorityFilter) return false;
      if (regionFilter !== "All" && o.region !== regionFilter) return false;
      if (assignedFilter !== "All" && (o.assigned_to || "Unassigned") !== assignedFilter) return false;
      if (!q) return true;
      const contactMatch = (o.contacts || []).some(c => c.full_name?.toLowerCase().includes(q));
      return o.name?.toLowerCase().includes(q) || o.city?.toLowerCase().includes(q) ||
        o.state?.toLowerCase().includes(q) || contactMatch;
    });
  }, [orgs, search, stageFilter, typeFilter, priorityFilter, regionFilter, assignedFilter]);

  const followUps = useMemo(() => followUpBuckets(orgs), [orgs]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", padding: "16px 20px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>🕌</span>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Minar360 — Relationship Pipeline</h1>
                {!loading && <span style={{ fontSize: 11, background: "#ecfdf5", color: "#10b981", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>● Live</span>}
              </div>
              <p style={{ margin: 0, color: "#99f6e4", fontSize: 13, marginTop: 2 }}>
                {orgs.length} organizations · {orgs.filter(o => o.stage === "Live / Onboarded").length} onboarded
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => exportCSV(orgs)} style={{
                padding: "8px 14px", borderRadius: 8, border: "1.5px solid #99f6e4",
                background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#fff",
              }}>⬇️ Export CSV</button>
              <button onClick={() => setView(v => v === "table" ? "board" : "table")} style={{
                padding: "8px 14px", borderRadius: 8, border: "1.5px solid #99f6e4",
                background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#fff",
              }}>{view === "table" ? "📊 Board" : "📋 Table"}</button>
              <button onClick={() => setModal("add")} style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: "#fff", color: "#0f766e", cursor: "pointer", fontWeight: 700, fontSize: 13,
              }}>+ Add Organization</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🕌</div>
            <div style={{ fontWeight: 600 }}>Loading pipeline...</div>
          </div>
        )}

        {!loading && <>
          <Dashboard orgs={orgs} followUps={followUps} />
          <FollowUpsPanel orgs={orgs} followUps={followUps} onSelect={setModal} />

          {/* Search + Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by organization, location, or contact..."
              style={{ flex: 1, minWidth: 220, padding: "9px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none" }} />
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Stages</option>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Types</option>
              {ORG_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Priorities</option>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={selectStyle}>
              {regions.map(r => <option key={r} value={r}>{r === "All" ? "All Regions" : r}</option>)}
            </select>
            <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)} style={selectStyle}>
              <option value="All">Everyone</option>
              {TEAM_MEMBERS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Table */}
          {view === "table" && (
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🕌</div>
                  <div style={{ fontWeight: 600 }}>No organizations yet</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Click "+ Add Organization" to get started</div>
                </div>
              ) : filtered.map(o => (
                <OrgRow key={o.id} org={o} onOpen={setModal} onQuickStage={quickStage} />
              ))}
            </div>
          )}

          {/* Board */}
          {view === "board" && (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
              {STAGES.map(stage => (
                <BoardColumn key={stage} stage={stage} orgs={filtered.filter(o => o.stage === stage)} onOpen={setModal} />
              ))}
            </div>
          )}

          <div style={{ marginTop: 20, background: "#f0fdfb", border: "1.5px solid #99f6e4", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🌐</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f766e" }}>Live Shared Database</div>
              <div style={{ fontSize: 12, color: "#0d9488" }}>All team members see the same data in real time. Any update shows instantly for everyone.</div>
            </div>
          </div>
        </>}
      </div>

      {modal && (
        <OrganizationModal
          org={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveOrg}
          onDelete={deleteOrg}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

const selectStyle = {
  padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
  fontSize: 13, outline: "none", background: "#fff", color: "#333",
};
