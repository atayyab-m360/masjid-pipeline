import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { ACTIVITY_TYPES, today, inputStyle, labelStyle } from "../lib/constants";

const emptyActivity = {
  activity_date: today(), activity_type: "Phone Call", contact_id: "",
  summary: "", outcome: "", next_step: "", follow_up_date: "",
};

export default function ActivitiesTab({ organizationId }) {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyActivity);

  const load = useCallback(async () => {
    const [{ data: acts }, { data: cts }] = await Promise.all([
      supabase.from("activities").select("*").eq("organization_id", organizationId).order("activity_date", { ascending: false }),
      supabase.from("contacts").select("id, full_name").eq("organization_id", organizationId),
    ]);
    setActivities(acts || []);
    setContacts(cts || []);
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    await supabase.from("activities").insert({
      ...form,
      contact_id: form.contact_id || null,
      organization_id: organizationId,
    });
    // Keep org's date_last_contact in sync
    await supabase.from("masjid_pipeline").update({ date_last_contact: form.activity_date }).eq("id", organizationId);
    setForm(emptyActivity);
    setAdding(false);
    load();
  };

  const remove = async (id) => {
    await supabase.from("activities").delete().eq("id", id);
    load();
  };

  const contactName = (id) => contacts.find(c => c.id === id)?.full_name || "—";

  return (
    <div>
      {!adding ? (
        <button onClick={() => setAdding(true)} style={{
          padding: "8px 14px", borderRadius: 8, border: "none", background: "#0f766e",
          color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 14,
        }}>+ Log Activity</button>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={form.activity_date} onChange={e => set("activity_date", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Activity Type</label>
              <select style={inputStyle} value={form.activity_type} onChange={e => set("activity_type", e.target.value)}>
                {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Contact Person</label>
            <select style={inputStyle} value={form.contact_id} onChange={e => set("contact_id", e.target.value)}>
              <option value="">—</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Summary</label>
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              value={form.summary} onChange={e => set("summary", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Outcome</label>
              <input style={inputStyle} value={form.outcome} onChange={e => set("outcome", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Next Step</label>
              <input style={inputStyle} value={form.next_step} onChange={e => set("next_step", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Follow-Up Date</label>
            <input type="date" style={inputStyle} value={form.follow_up_date} onChange={e => set("follow_up_date", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setAdding(false); setForm(emptyActivity); }} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #e5e7eb",
              background: "#fff", cursor: "pointer", fontWeight: 600, color: "#555",
            }}>Cancel</button>
            <button onClick={save} style={{
              flex: 2, padding: "9px 0", borderRadius: 8, border: "none",
              background: "#0f766e", color: "#fff", cursor: "pointer", fontWeight: 700,
            }}>Save Activity</button>
          </div>
        </div>
      )}

      {activities.length === 0 && <div style={{ color: "#aaa", fontSize: 13 }}>No activity logged yet.</div>}

      {activities.map(a => (
        <div key={a.id} style={{ borderLeft: "2px solid #0f766e30", paddingLeft: 12, marginBottom: 14, position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{a.activity_type} · {a.activity_date}</div>
            <button onClick={() => remove(a.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 13 }}>🗑️</button>
          </div>
          {a.contact_id && <div style={{ fontSize: 12, color: "#888" }}>with {contactName(a.contact_id)}</div>}
          {a.summary && <div style={{ fontSize: 13, color: "#444", marginTop: 3 }}>{a.summary}</div>}
          {a.outcome && <div style={{ fontSize: 12, color: "#0f766e", marginTop: 2 }}>Outcome: {a.outcome}</div>}
          {a.next_step && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Next: {a.next_step} {a.follow_up_date ? `(by ${a.follow_up_date})` : ""}</div>}
        </div>
      ))}
    </div>
  );
}
