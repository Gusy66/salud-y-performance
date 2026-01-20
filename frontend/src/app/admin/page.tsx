"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  dosage?: string;
  volume?: string;
  retailPrice: number;
  wholesalePrice: number;
  wholesaleMinQty: number;
  status: "active" | "soon" | "archived";
  imageUrl?: string;
  createdAt: string;
}

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  category: "",
  dosage: "",
  volume: "",
  retailPrice: 0,
  wholesalePrice: 0,
  wholesaleMinQty: 10,
  status: "active" as const,
  imageUrl: "",
};

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";

  const getToken = () => localStorage.getItem("adminToken");

  const fetchProducts = async () => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/admin/products`, {
        headers: { "x-admin-token": token },
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminEmail");
        router.push("/admin/login");
        return;
      }

      if (!res.ok) throw new Error("Erro ao carregar produtos");

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : generateSlug(name),
    }));
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category: product.category || "",
      dosage: product.dosage || "",
      volume: product.volume || "",
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      wholesaleMinQty: product.wholesaleMinQty,
      status: product.status,
      imageUrl: product.imageUrl || "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const url = editingProduct
        ? `${apiBase}/admin/products/${editingProduct.id}`
        : `${apiBase}/admin/products`;

      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          ...formData,
          retailPrice: Number(formData.retailPrice),
          wholesalePrice: Number(formData.wholesalePrice),
          wholesaleMinQty: Number(formData.wholesaleMinQty),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Erro ao salvar produto"
        );
      }

      setSuccess(editingProduct ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
      closeForm();
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/admin/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao deletar produto");
      }

      setSuccess("Produto deletado com sucesso!");
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar produto");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "soon":
        return "Em breve";
      case "archived":
        return "Arquivado";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return styles.statusActive;
      case "soon":
        return styles.statusSoon;
      case "archived":
        return styles.statusArchived;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>CleanLabz</h1>
          <span className={styles.badge}>Admin</span>
        </div>
        <div className={styles.headerRight}>
          <a href="/" className={styles.viewSite}>Ver loja</a>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Produtos ({products.length})</h2>
          <button onClick={openCreateForm} className={styles.addBtn}>
            + Novo Produto
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {showForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
                <button onClick={closeForm} className={styles.closeBtn}>×</button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Categoria</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Dosagem</label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Volume</label>
                    <input
                      type="text"
                      value={formData.volume}
                      onChange={(e) =>
                        setFormData({ ...formData, volume: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "active" | "soon" | "archived",
                        })
                      }
                    >
                      <option value="active">Ativo</option>
                      <option value="soon">Em breve</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Preço Varejo (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.retailPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          retailPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Preço Atacado (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.wholesalePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          wholesalePrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Qtd Mín. Atacado *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.wholesaleMinQty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          wholesaleMinQty: parseInt(e.target.value) || 10,
                        })
                      }
                      required
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <label>URL da Imagem</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <label>Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" onClick={closeForm} className={styles.cancelBtn}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving ? "Salvando..." : editingProduct ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className={styles.modal}>
            <div className={styles.confirmDialog}>
              <h3>Confirmar exclusão</h3>
              <p>Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.</p>
              <div className={styles.confirmActions}>
                <button onClick={() => setDeleteConfirm(null)} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className={styles.deleteConfirmBtn}>
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productName}>
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={styles.productThumb}
                        />
                      )}
                      <div>
                        <strong>{product.name}</strong>
                        {product.dosage && (
                          <span className={styles.productMeta}>{product.dosage}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{product.category || "-"}</td>
                  <td>{formatPrice(product.retailPrice)}</td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => openEditForm(product)}
                        className={styles.editBtn}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className={styles.deleteBtn}
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    Nenhum produto cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
