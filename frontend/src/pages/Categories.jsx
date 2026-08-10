import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { CategoriesAPI } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/States.jsx";

export default function Categories() {
  const toast = useToast();
  const { data: categories, loading, error, reload } = useApi(CategoriesAPI.list, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setName("");
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setName(cat.name);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name can't be empty.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await CategoriesAPI.update(editing.id, { name });
        toast.success("Category updated.");
      } else {
        await CategoriesAPI.create({ name });
        toast.success("Category added.");
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat) {
    try {
      await CategoriesAPI.remove(cat.id);
      toast.success(`Deleted "${cat.name}".`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="amber" onClick={openCreate}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : categories?.length === 0 ? (
        <EmptyState title="No categories yet" message="Add your first product category to start organizing the catalog." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded border border-slate-200 bg-panel p-4 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded bg-amber-100 text-amber-600">
                  <Tag size={16} />
                </span>
                <div>
                  <p className="font-medium text-slate-950">{cat.name}</p>
                  <p className="font-mono text-xs text-slate-400">{cat.productCount ?? 0} products</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} aria-label={`Edit ${cat.name}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-200/60 hover:text-slate-950">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setConfirmDelete(cat)} aria-label={`Delete ${cat.name}`} className="rounded p-1.5 text-slate-500 hover:bg-rust-100 hover:text-rust">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="amber" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-950">Category name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete category"
        message={`Products in "${confirmDelete?.name}" will need to be reassigned. Continue?`}
        onConfirm={() => handleDelete(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
