import React, { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categories = [
  "Pure Silk Sarees",
  "Festive Wear",
  "Women's Fashion",
  "Wedding Collection",
  "New Arrivals",
];

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("kr_admin_token") || ""
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const response = await fetch(`${API}/products`);
      const data = await response.json();

      if (!response.ok) throw new Error("Could not load products");

      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load products. Check the backend connection.");
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  async function login(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("kr_admin_token", data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addProduct(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("description", description);

      if (image) formData.append("image", image);

      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Product upload failed");
      }

      setName("");
      setCategory(categories[0]);
      setPrice("");
      setDescription("");
      setImage(null);

      const fileInput = document.getElementById("product-image");
      if (fileInput) fileInput.value = "";

      await load();
      setPage("products");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("kr_admin_token");
    setToken("");
    setProducts([]);
    setPage("dashboard");
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const totalValue = products.reduce(
    (total, product) => total + Number(product.price || 0),
    0
  );

  if (!token) {
    return (
      <main className="login-screen">
        <div className="login-decoration login-decoration-one" />
        <div className="login-decoration login-decoration-two" />

        <section className="login-card">
          <div className="brand-mark">KR</div>
          <p className="eyebrow">KR BOUTIQUE · PRIVATE ACCESS</p>
          <h1>Welcome back.</h1>
          <p className="login-description">
            Sign in to manage your boutique collection.
          </p>

          <form onSubmit={login}>
            <label>Email address</label>
            <input
              type="email"
              placeholder="admin@krboutique.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="primary-button login-button">
              Sign in securely <span>→</span>
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          <p className="login-footer">
            Protected administration · KR Boutique
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">KR</div>
          <div>
            <strong>KR BOUTIQUE</strong>
            <span>ADMIN STUDIO</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button
            className={page === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("dashboard")}
          >
            <span className="nav-icon">⌂</span>
            Dashboard
          </button>

          <button
            className={page === "products" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("products")}
          >
            <span className="nav-icon">▦</span>
            Products
            <span className="nav-count">{products.length}</span>
          </button>

          <button
            className={page === "add" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setError("");
              setPage("add");
            }}
          >
            <span className="nav-icon">＋</span>
            Add product
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">KR</div>
            <div>
              <strong>Store Admin</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            ↗ Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="topbar">
          <div>
            <span className="topbar-label">KR BOUTIQUE / ADMIN</span>
            <p>Elegance in Every Thread.</p>
          </div>

          <div className="topbar-right">
            <span className="status-dot" />
            <span>Store connected</span>
            <div className="topbar-avatar">KR</div>
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="global-error">
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}

          {page === "dashboard" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">OVERVIEW</p>
                  <h1>Dashboard</h1>
                  <p className="page-subtitle">
                    Welcome back. Here's what's happening with your boutique.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setPage("add")}
                >
                  + Add product
                </button>
              </div>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Total products</span>
                    <span className="stat-icon">▦</span>
                  </div>
                  <strong>{products.length}</strong>
                  <small>Products in your catalogue</small>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Catalogue value</span>
                    <span className="stat-icon">₹</span>
                  </div>
                  <strong>₹{totalValue.toLocaleString("en-IN")}</strong>
                  <small>Total listed product value</small>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Categories</span>
                    <span className="stat-icon">◇</span>
                  </div>
                  <strong>
                    {new Set(products.map((p) => p.category)).size}
                  </strong>
                  <small>Categories with products</small>
                </div>
              </section>

              <section className="content-card">
                <div className="card-heading">
                  <div>
                    <h2>Recently added products</h2>
                    <p>Your latest boutique additions</p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => setPage("products")}
                  >
                    View all →
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">▦</div>
                    <h3>No products yet</h3>
                    <p>Start building your boutique catalogue.</p>
                    <button
                      className="primary-button"
                      onClick={() => setPage("add")}
                    >
                      Add your first product
                    </button>
                  </div>
                ) : (
                  <div className="product-table">
                    {products.slice(0, 5).map((product) => (
                      <ProductRow
                        key={product._id}
                        product={product}
                        onDelete={removeProduct}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {page === "products" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">CATALOGUE</p>
                  <h1>Products</h1>
                  <p className="page-subtitle">
                    Manage the products displayed in your boutique.
                  </p>
                </div>

                <button className="primary-button" onClick={() => setPage("add")}>
                  + Add product
                </button>
              </div>

              <section className="content-card">
                <div className="products-toolbar">
                  <div>
                    <h2>All products ({products.length})</h2>
                    <p>Search and manage your collection.</p>
                  </div>

                  <button className="secondary-button" onClick={load}>
                    ↻ Refresh
                  </button>
                </div>

                <div className="filter-row">
                  <input
                    className="search-input"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="All">All categories</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="empty-state">
                    <h3>No matching products</h3>
                    <p>Try another search or category.</p>
                  </div>
                ) : (
                  <div className="product-table">
                    {filteredProducts.map((product) => (
                      <ProductRow
                        key={product._id}
                        product={product}
                        onDelete={removeProduct}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {page === "add" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">CATALOGUE / NEW ITEM</p>
                  <h1>Add a product</h1>
                  <p className="page-subtitle">
                    Introduce a new piece to your boutique collection.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => setPage("products")}
                >
                  ← Back to products
                </button>
              </div>

              <section className="form-card">
                <div className="form-intro">
                  <span className="form-step">01</span>
                  <div>
                    <h2>Product information</h2>
                    <p>Enter the details customers will see.</p>
                  </div>
                </div>

                <form onSubmit={addProduct} className="product-form">
                  <div className="form-grid">
                    <div className="field">
                      <label>Product name *</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Royal Purple Silk Saree"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter price"
                        required
                      />
                    </div>

                    <div className="field full-width">
                      <label>Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the fabric, design, colour and details..."
                        rows="5"
                      />
                    </div>

                    <div className="field full-width">
                      <label>Product image *</label>
                      <div className="upload-area">
                        <input
                          id="product-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setImage(e.target.files?.[0] || null)
                          }
                          required
                        />

                        <p>
                          {image
                            ? `Selected: ${image.name}`
                            : "Choose a product image from your computer"}
                        </p>

                        {image && (
                          <img
                            className="image-preview"
                            src={URL.createObjectURL(image)}
                            alt="Product preview"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setPage("products")}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={busy}
                    >
                      {busy ? "Publishing..." : "Publish product →"}
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function ProductRow({ product, onDelete }) {
  return (
    <article className="product-row">
      <img
        src={product.image || product.images?.[0] || "https://placehold.co/80x100?text=KR"}
        alt={product.name}
      />

      <div className="product-row-info">
        <strong>{product.name}</strong>
        <span>{product.category}</span>
      </div>

      <div className="product-price">
        ₹{Number(product.price || 0).toLocaleString("en-IN")}
      </div>

      <span className="product-status">
        <span /> Published
      </span>

      <button
        className="delete-button"
        onClick={() => onDelete(product._id)}
      >
        Delete
      </button>
    </article>
  );
}