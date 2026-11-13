import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ArrowRight,
  Instagram,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

import "./style.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const WA = import.meta.env.VITE_WHATSAPP_NUMBER || "919384129263";

const categories = [
  "All",
  "Pure Silk Sarees",
  "Festive Wear",
  "Women's Fashion",
  "Wedding Collection",
  "New Arrivals",
];

const money = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const imageOf = (product) =>
  product.image || product.images?.[0] || "";

/* ---------------- Shared Layout ---------------- */

function Layout({ cart, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <div className="announcement">
        A little elegance, delivered with love · Tirunelveli
      </div>

      <header className="site-header">
        <Link to="/" className="brand">
          KR <span>BOUTIQUE</span>
          <small>Elegance in Every Thread</small>
        </Link>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "navigation open" : "navigation"}>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/story">Our Story</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <Link to="/cart" className="header-cart">
          <ShoppingBag />
          <span>{cartCount}</span>
        </Link>
      </header>

      {children}

      <footer className="site-footer">
        <Link to="/" className="brand footer-brand">
          KR <span>BOUTIQUE</span>
          <small>Elegance in Every Thread</small>
        </Link>

        <div className="footer-links">
          <Link to="/shop">Shop</Link>
          <Link to="/story">Our Story</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <p>© {new Date().getFullYear()} KR Boutique. All rights reserved.</p>
      </footer>
    </>
  );
}

/* ---------------- Product Card ---------------- */

function ProductCard({ product, addToCart, wishlist, setWishlist }) {
  const isWishlisted = wishlist.includes(product._id);

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-image">
        <img src={imageOf(product)} alt={product.name} loading="lazy" />
        <span className="product-view">View details</span>
      </Link>

      <button
        className="wishlist-button"
        onClick={() =>
          setWishlist((old) =>
            isWishlisted
              ? old.filter((id) => id !== product._id)
              : [...old, product._id]
          )
        }
        aria-label="Add to wishlist"
      >
        <Heart fill={isWishlisted ? "#741e35" : "none"} />
      </button>

      <p className="product-category">{product.category}</p>

      <Link to={`/product/${product._id}`} className="product-title">
        {product.name}
      </Link>

      <div className="product-bottom">
        <strong>{money(product.price)}</strong>

        <button onClick={() => addToCart(product)}>
          Add to bag <ShoppingBag size={15} />
        </button>
      </div>
    </article>
  );
}

/* ---------------- Home Page ---------------- */


function HomePage({ products, addToCart, wishlist, setWishlist }) {
  useEffect(() => {
    document.title = "Saree Shop in Tirunelveli | KR Boutique";

    let description = document.querySelector(
      'meta[name="description"]'
    );

    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }

    description.content =
      "Looking for a saree shop in Tirunelveli? Explore elegant silk sarees, festive wear, wedding collections and women's fashion at KR Boutique.";

  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">THE NEW SEASON EDIT</p>

          <h1>
            Saree Shop in
            <br />
            <em>Tirunelveli.</em>
          </h1>

          <p className="hero-description">
            Discover elegant silk sarees, festive favourites,
            wedding collections and beautiful women's fashion
            at KR Boutique, Tirunelveli.
          </p>

          <Link to="/shop" className="primary-button">
            Explore Collection <ArrowRight size={17} />
          </Link>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200"
            alt="Traditional Indian saree collection at KR Boutique"
          />
          <span className="hero-image-label">
            Timeless Indian elegance
          </span>
        </div>
      </section>

      {/* Local SEO content */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WELCOME TO KR BOUTIQUE</p>
            <h2>Discover Beautiful Sarees in Tirunelveli</h2>
          </div>
        </div>

        <p>
          Welcome to KR Boutique, your destination for elegant
          sarees and women's fashion in Tirunelveli, Tamil Nadu.
          Explore our collections of pure silk sarees, festive
          wear, wedding collections and stylish outfits for
          special occasions.
        </p>

        <p>
          Whether you are looking for a beautiful saree for a
          wedding, festival or family celebration, discover
          fashion that combines traditional elegance with
          contemporary style.
        </p>

        <p>
          Visit KR Boutique at Thilak Nagar, Tirunelveli Town,
          and explore our latest collections.
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED FOR YOU</p>
            <h2>Featured Collection</h2>
          </div>

          <Link to="/shop" className="text-link">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                addToCart={addToCart}
                wishlist={wishlist}
                setWishlist={setWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>New collections coming soon</h2>
            <p>Please check back soon for the latest styles from KR Boutique.</p>
          </div>
        )}
      </section>

      <section className="home-story">
        <div>
          <p className="eyebrow">OUR PROMISE</p>
          <h2>Tradition, with a touch of today.</h2>

          <p>
            At KR Boutique, we celebrate the beauty of Indian
            fashion—from the richness of pure silk sarees to
            the charm of festive and everyday styles.
          </p>

          <Link to="/story" className="text-link">
            Discover our story <ArrowRight size={16} />
          </Link>
        </div>

        <img
          src="https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=1000"
          alt="Traditional Indian women's festive fashion"
          loading="lazy"
        />
      </section>

      <section className="newsletter">
        <p className="eyebrow">A LITTLE SOMETHING BEAUTIFUL</p>
        <h2>Find something that feels like you.</h2>
        <Link to="/shop" className="primary-button">
          Shop the collection <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}


/* ---------------- Shop Page ---------------- */

function ShopPage({ products, addToCart, wishlist, setWishlist }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;

    const matchesSearch = `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="page">
      <section className="page-banner">
        <p className="eyebrow">THE KR BOUTIQUE COLLECTION</p>
        <h1>Shop the Collection</h1>
        <p>Discover pieces made for your beautiful moments.</p>
      </section>

      <section className="section shop-section">
        <div className="shop-toolbar">
          <div className="filters">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />
          </div>
        </div>

        <p className="results-count">{filtered.length} styles found</p>

        <div className="products-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              addToCart={addToCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
            />
          ))}
        </div>

        {!filtered.length && (
          <div className="empty-state">
            <h2>No styles found</h2>
            <p>Try a different category or search.</p>
          </div>
        )}
      </section>
    </main>
  );
}

/* ---------------- Product Details ---------------- */

function ProductDetails({ products, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((item) => item._id === id);

  if (!product) {
    return (
      <main className="empty-state page">
        <h1>Product not found</h1>
        <Link to="/shop" className="primary-button">
          Return to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="page product-details">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-image">
          <img src={imageOf(product)} alt={product.name} />
        </div>

        <div className="detail-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <h2>{money(product.price)}</h2>

          <div className="detail-divider" />

          <p className="detail-description">
            {product.description ||
              "A beautiful addition to your wardrobe, carefully selected by KR Boutique."}
          </p>

          <p className="availability">● Available for enquiry</p>

          <button
            className="primary-button full-button"
            onClick={() => {
              addToCart(product);
              navigate("/cart");
            }}
          >
            Add to shopping bag <ShoppingBag size={17} />
          </button>

          <p className="detail-note">
            <MessageCircle size={16} />
            Order confirmation and availability will be confirmed on WhatsApp.
          </p>

          <Link to="/contact" className="text-link">
            Need help? Contact us <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Our Story Page ---------------- */

function StoryPage() {
  return (
    <main className="page">
      <section className="page-banner">
        <p className="eyebrow">THE HEART OF KR BOUTIQUE</p>
        <h1>Our Story</h1>
        <p>Tradition. Grace. A little touch of today.</p>
      </section>

      <section className="story-page">
        <div className="story-page-image">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200"
            alt="Traditional saree"
          />
        </div>

        <div className="story-page-content">
          <p className="eyebrow">ELEGANCE IN EVERY THREAD</p>
          <h2>Celebrating the beauty of Indian fashion.</h2>

          <p>
            KR Boutique was created with a love for timeless Indian clothing and
            the beauty of dressing for meaningful moments.
          </p>

          <p>
            From pure silk sarees to festive favourites and everyday fashion,
            every collection is selected to bring confidence, comfort and
            elegance into your wardrobe.
          </p>

          <p>
            We believe every outfit tells a story—and we would love to be part
            of yours.
          </p>

          <Link to="/shop" className="primary-button">
            Explore our collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Contact Page ---------------- */

function ContactPage() {
  return (
    <main className="page">
      <section className="page-banner">
        <p className="eyebrow">WE WOULD LOVE TO MEET YOU</p>
        <h1>Contact KR Boutique</h1>
        <p>Come say hello or get in touch with us.</p>
      </section>

      <section className="contact-page">
        <div className="contact-info">
          <p className="eyebrow">VISIT OUR BOUTIQUE</p>
          <h2>Let's connect.</h2>

          <div className="contact-card">
            <MapPin />
            <div>
              <strong>Our Address</strong>
              <p>
                9L, Thilak Nagar, Tirunelveli Town, Madurai Road,
                Tirunelveli – 627001
              </p>
            </div>
          </div>

          <div className="contact-card">
            <Phone />
            <div>
              <strong>Call Us</strong>
              <p>+91 93841 29263</p>
              <a href="tel:+919384129263">Call boutique</a>
            </div>
          </div>

          <div className="contact-card">
            <Instagram />
            <div>
              <strong>Instagram</strong>
              <p>@krboutique2283</p>
              <a
                href="https://www.instagram.com/krboutique2283/"
                target="_blank"
                rel="noreferrer"
              >
                Follow us
              </a>
            </div>
          </div>
        </div>

        <div className="contact-message">
          <p className="eyebrow">PERSONAL SHOPPING</p>
          <h2>Looking for something special?</h2>
          <p>
            Message us about a product, collection, or availability. We will
            help you find the right style.
          </p>

          <a
            className="primary-button"
            href={`https://wa.me/${WA}?text=${encodeURIComponent(
              "Hello KR Boutique, I would like to enquire about your collection."
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp <MessageCircle size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Cart Page ---------------- */

function CartPage({ cart, setCart }) {
  const total = cart.reduce(
    (sum, product) => sum + Number(product.price || 0) * product.qty,
    0
  );

  const order = () => {
    if (!cart.length) return;

    const lines = cart
      .map(
        (product) =>
          `${product.name} x ${product.qty} — ${money(
            product.price * product.qty
          )}`
      )
      .join("\n");

    const message = `Hello KR Boutique, I would like to enquire about this order:\n${lines}\nTotal: ${money(
      total
    )}\nPlease confirm availability and delivery details.`;

    window.open(
      `https://wa.me/${WA}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="page cart-page">
      <section className="page-banner">
        <p className="eyebrow">YOUR SELECTION</p>
        <h1>Your Shopping Bag</h1>
      </section>

      {cart.length ? (
        <section className="cart-container">
          {cart.map((product) => (
            <article className="cart-row" key={product._id}>
              <img src={imageOf(product)} alt={product.name} />

              <div>
                <h3>{product.name}</h3>
                <p>{money(product.price)} · Quantity {product.qty}</p>
                <button
                  className="remove-button"
                  onClick={() =>
                    setCart((items) =>
                      items.filter((item) => item._id !== product._id)
                    )
                  }
                >
                  Remove
                </button>
              </div>

              <strong>{money(product.price * product.qty)}</strong>
            </article>
          ))}

          <div className="cart-total">
            <h2>Total: {money(total)}</h2>
            <button className="primary-button" onClick={order}>
              Continue on WhatsApp <MessageCircle size={17} />
            </button>
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <ShoppingBag size={35} />
          <h2>Your bag is waiting for something beautiful.</h2>
          <Link to="/shop" className="primary-button">
            Discover the collection
          </Link>
        </div>
      )}
    </main>
  );
}

/* ---------------- Main App ---------------- */

function AppContent() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    let isMounted = true;

    fetch(`${API}/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load products");
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((error) => {
        console.error("Unable to load products from the store:", error);
        if (isMounted) setProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const addToCart = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item._id === product._id);

      if (existing) {
        return items.map((item) =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...items, { ...product, qty: 1 }];
    });
  };

  return (
    <Layout cart={cart}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              addToCart={addToCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <ShopPage
              products={products}
              addToCart={addToCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetails products={products} addToCart={addToCart} />
          }
        />

        <Route path="/story" element={<StoryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />

        <Route
          path="*"
          element={
            <main className="empty-state page">
              <h1>Page not found</h1>
              <Link to="/" className="primary-button">
                Return Home
              </Link>
            </main>
          }
        />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}