import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { ProductsAPI, CategoriesAPI } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import DataTable from "../components/DataTable.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import StatusStamp from "../components/StatusStamp.jsx";

const emptyForm = { name: "", category_id: "", price: "", stock: "", description: "" };

function stockLabel(stock) {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
}

export default function Products() {
  const toast = useToast();
  const { data: products, loading, error, reload } = useApi(ProductsAPI.list, []);
  const { data: categories } = useApi(CategoriesAPI.list, []);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    if (!products) return [];
    if (categoryFilter === "all") return products;
    return products.filter((p) => String(p.category_id) === categoryFilter);
  }, [products, categoryFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      category_id: String(product.category_id),
      price: product.price,
      stock: product.stock,
      description: product.description || "",
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.category_id || form.price === "" || form.stock === "") {
      toast.error("Please fill in name, category, price and stock.");
      return;
    }
    if (Number(form.price) < 0) {
      toast.error("Price can't be negative.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (editing) {
        await ProductsAPI.update(editing.id, payload);
        toast.success("Product updated.");
      } else {
        await ProductsAPI.create(payload);
        toast.success("Product added.");
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    try {
      await ProductsAPI.remove(product.id);
      toast.success(`Deleted "${product.name}".`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const columns = [
    { key: "name", header: "Product", render: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="font-mono text-xs text-slate-400">SKU-{String(r.id).padStart(5, "0")}</p>
        </div>
      ) },
    { key: "category", header: "Category", render: (r) => r.category_name || "—" },
    { key: "price", header: "Price", render: (r) => (
        <span className="font-mono font-tnum">${Number(r.price).toFixed(2)}</span>
      ) },
    { key: "stock", header: "Stock", render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-tnum">{r.stock}</span>
          <StatusStamp value={stockLabel(r.stock)} />
        </div>
      ) },
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
      <div className="flex justify-end">
        <Button variant="amber" onClick={openCreate}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        searchKeys={["name", "category_name"]}
        searchPlaceholder="Search products…"
        emptyMessage="Try a different search or category filter."
        filters={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded border border-slate-200 bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="all">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Product" : "Add Product"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="amber" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Product"}
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleSave}>
          <Field label="Product name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price ($)">
              <input type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Stock quantity">
              <input type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete product"
        message={`This permanently removes "${confirmDelete?.name}" from the catalog. This can't be undone.`}
        onConfirm={() => handleDelete(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-950">{label}</span>
      {children}
    </label>
  );
}
