import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { today, inputStyle, labelStyle } from "../lib/constants";

export default function FollowUpsTab({ organizationId }) {
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ due_date: today(), action: "" });
  const [nextActionFor, setNextActionFor] = useState(null); // followup being completed
  const [nextActionForm, setNextActionForm] = useState({ due_date: "", action: "" });

  const load = useCallback(async () => {
    const { data } = await supabase.from("followups").select("*")
      .eq("organization_id", organizationId).order("due_date", { ascending: true });
    setItems(data || []);
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  const addFollowUp = async () => {
    await supabase.from("followups").insert({ ...form, organization_id: organizationId });
    await supabase.from("masjid_pipeline").update({ next_followup_date: form.due_date, next_action: form.action }).eq("id", organizationId);
    setForm({ due_date: today(), action: "" });
    setAdding(false);
    load();
  };

  const complete = async (id) => {
    await supabase.from("followups").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", id);
    setNextActionFor(id);
    setNextActionForm({ due_date: "", action: "" });
    load();
  };

  const createNext = async () => {
    if (nextActionForm.due_date && nextActionForm.action) {
      await supabase.from("followups").insert({
        organization_id: organizationId, due_date: nextActionForm.due_date, action: nextActionForm.action,
      });
      await supabase.from("masjid_pipeline").update({
        next_followup_date: nextActionForm.due_date, next_action: nextActionForm.action,
      }).eq("id", organizationId);
    }
    setNextActionFor(null);
    load();
  };

  const remove = async (id) => {
    await supabase.from("followups").delete().eq("id", id);
    load();
  };

  const pending = items.filter(i => !i.completed);
  const completed = items.filter(i => i.completed);

  return (
    <div>
      {!adding ? (
        <button onClick={() => setAdding(true)} style={{
          padding: "8px 14px", borderRadius: 8, border: "none", background: "#0f766e",
          color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 14,
        }}>+ Schedule Follow-Up</button>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Due Date</label>
            <input type="date" style={inputStyle} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Action</label>
            <input style={inputStyle} placeholder="e.g. Call Br. Ahmad to confirm demo" value={form.action}
              onChange={e => setForm(f => ({ ...f, action: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #e5e7eb",
              background: "#fff", cursor: "pointer", fontWeight: 600, color: "#555",
            }}>Cancel</button>
            <button onClick={addFollowUp} style={{
              flex: 2, padding: "9px 0", borderRadius: 8, border: "none",
              background: "#0f766e", color: "#fff", cursor: "pointer", fontWeight: 700,
            }}>Save</button>
          </div>
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: 12, color: "#888", marginBottom: 8 }}>PENDING ({pending.length})</div>
      {pending.length === 0 && <div style={{ color: "#aaa", fontSize: 13, marginBottom: 16 }}>Nothing scheduled.</div>}
      {pending.map(f => (
        <div key={f.id} style={{
          border: "1px solid #eee", borderRadius: 10, padding: "10px 14px", marginBottom: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{f.action}</div>
            <div style={{ fontSize: 12, color: "#888" }}>Due {f.due_date}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => complete(f.id)} style={{
              background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 6, padding: "5px 10px",
              cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#10b981",
            }}>✓ Complete</button>
            <button onClick={() => remove(f.id)} style={{ background: "#fef2f2", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>🗑️</button>
          </div>
        </div>
      ))}

      {nextActionFor && (
        <div style={{ border: "1.5px solid #0f766e", borderRadius: 10, padding: 14, marginBottom: 16, background: "#f0fdfb" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f766e", marginBottom: 10 }}>✅ Marked complete — create the next action?</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Next Due Date</label>
              <input type="date" style={inputStyle} value={nextActionForm.due_date}
                onChange={e => setNextActionForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Next Action</label>
            <input style={inputStyle} value={nextActionForm.action}
              onChange={e => setNextActionForm(f => ({ ...f, action: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setNextActionFor(null)} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #e5e7eb",
              background: "#fff", cursor: "pointer", fontWeight: 600, color: "#555",
            }}>Skip</button>
            <button onClick={createNext} style={{
              flex: 2, padding: "9px 0", borderRadius: 8, border: "none",
              background: "#0f766e", color: "#fff", cursor: "pointer", fontWeight: 700,
            }}>Create Next Action</button>
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#888", marginBottom: 8 }}>COMPLETED ({completed.length})</div>
          {completed.map(f => (
            <div key={f.id} style={{ padding: "6px 4px", fontSize: 12, color: "#aaa", textDecoration: "line-through" }}>
              {f.action} — {f.due_date}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
