import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { UsersAPI } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function Users() {
  const toast = useToast();
  const { data: users, loading, error, reload } = useApi(UsersAPI.list, []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  function openEdit(user) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, phone: user.phone || "" });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      await UsersAPI.update(editing.id, form);
      toast.success("Customer details updated.");
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    try {
      await UsersAPI.remove(user.id);
      toast.success(`Removed ${user.name}.`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const columns = [
    { key: "name", header: "Customer", render: (r) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 font-display text-xs font-semibold text-ink">
            {r.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-slate-400">{r.email}</p>
          </div>
        </div>
      ) },
    { key: "phone", header: "Phone", render: (r) => <span className="font-mono text-xs">{r.phone || "—"}</span> },
    { key: "ordersCount", header: "Orders", render: (r) => <span className="font-mono font-tnum">{r.ordersCount ?? 0}</span> },
    { key: "joined", header: "Joined", render: (r) => <span className="font-mono text-xs text-slate-500">{r.joined}</span> },
    { key: "actions", header: "", render: (r) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openEdit(r)} aria-label={`Edit ${r.name}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-200/60 hover:text-slate-950">
            <Pencil size={15} />
          </button>
          <button onClick={() => setConfirmDelete(r)} aria-label={`Delete ${r.name}`} className="rounded p-1.5 text-slate-500 hover:bg-rust-100 hover:text-rust">
            <Trash2 size={15} />
          </button>
        </div>
      ) },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={users}
        loading={loading}
        error={error}
        onRetry={reload}
        searchKeys={["name", "email"]}
        searchPlaceholder="Search customers by name or email…"
      />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Customer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="amber" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleSave}>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-950">Full name</span>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-950">Email</span>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-950">Phone</span>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove customer"
        message={`This deletes ${confirmDelete?.name}'s account. Their past orders remain on record.`}
        onConfirm={() => handleDelete(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
