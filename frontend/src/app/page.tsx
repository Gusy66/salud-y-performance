"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductGrid } from "@/components/ProductGrid";
import { CartSummary } from "@/components/CartSummary";
import { Product } from "@/lib/types";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";

type CartItem = { product: Product; quantity: number };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetch(`${apiBase}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const cartView = useMemo(() => {
    return cart.map((item) => {
      const useWholesale = item.quantity >= item.product.wholesaleMinQty;
      const unitPrice = useWholesale
        ? item.product.wholesalePrice
        : item.product.retailPrice;
      const total = unitPrice * item.quantity;
      return {
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice,
        total,
        wholesaleApplied: useWholesale,
        wholesaleMinQty: item.product.wholesaleMinQty,
      };
    });
  }, [cart]);

  const total = cartView.reduce((acc, item) => acc + item.total, 0);

  function handleAdd(product: Product) {
    setCart((prev) => {
      const existing = prev.find((p) => p.product.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function handleUpdateQty(id: string, qty: number) {
    if (qty <= 0) return;
    setCart((prev) => prev.map((p) => (p.product.id === id ? { ...p, quantity: qty } : p)));
  }

  function handleRemove(id: string) {
    setCart((prev) => prev.filter((p) => p.product.id !== id));
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage(undefined);
    setError(undefined);
    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      const res = await fetch(`${apiBase}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          items,
        }),
      });
      if (!res.ok) throw new Error("Não foi possível enviar o pedido.");
      setMessage("Pedido enviado com sucesso! Você receberá instruções por e-mail.");
      setCart([]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const heroImages = [
    { src: "/carrossel/Gemini_Generated_Image_dj1l4udj1l4udj1l.png", alt: "Peptídeos de alta qualidade" },
    { src: "/carrossel/Gemini_Generated_Image_oif6u6oif6u6oif6.png", alt: "Performance e saúde" },
    { src: "/carrossel/Gemini_Generated_Image_yi00vsyi00vsyi00.png", alt: "Qualidade garantida" },
  ];

  return (
    <div>
      <Navbar />
      
      {/* Hero Carousel */}
      <div className="hero">
        <HeroCarousel images={heroImages} />
      </div>
      
      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h1>Peptídeos de Alta Qualidade</h1>
            <p>
              Varejo e atacado com os melhores preços do mercado. 
              Checkout rápido via e-mail para finalizar pagamento com nossa equipe.
            </p>
          </div>
          
          <div className="features">
            <div className="feature-card">
              <div className="feature-card__icon">📦</div>
              <div>
                <h3>Catálogo Completo</h3>
                <p>GLP-1, combos exclusivos e linhas de performance em um só lugar.</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-card__icon">💰</div>
              <div>
                <h3>Preços Especiais</h3>
                <p>Descontos automáticos de atacado a partir de 10 unidades por produto.</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-card__icon">⚡</div>
              <div>
                <h3>Checkout Rápido</h3>
                <p>Pedido enviado por e-mail para combinar pagamento e envio seguro.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Products Grid */}
      <ProductGrid products={products} onAdd={handleAdd} />
      
      {/* Checkout Section */}
      <CartSummary
        items={cartView}
        form={form}
        onChangeForm={(partial) => setForm((prev) => ({ ...prev, ...partial }))}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
        onSubmit={handleSubmit}
        loading={loading}
        total={total}
        message={message}
        error={error}
      />
      
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <div className="footer__logo">CleanLabz</div>
              <p className="footer__description">
                Especialistas em peptídeos de alta qualidade para profissionais de saúde 
                e pesquisadores. Comprometidos com a excelência e segurança.
              </p>
            </div>
            
            <div>
              <h4 className="footer__title">Navegação</h4>
              <ul className="footer__links">
                <li><a href="#produtos">Produtos</a></li>
                <li><a href="#checkout">Carrinho</a></li>
                <li><a href="mailto:vendas.cleanlabz@gmail.com">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="footer__title">Categorias</h4>
              <ul className="footer__links">
                <li><a href="#produtos">GLP-1</a></li>
                <li><a href="#produtos">Performance</a></li>
                <li><a href="#produtos">Combos</a></li>
                <li><a href="#produtos">Acessórios</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="footer__title">Contato</h4>
              <ul className="footer__links">
                <li>
                  <a href="mailto:vendas.cleanlabz@gmail.com">
                    vendas.cleanlabz@gmail.com
                  </a>
                </li>
              </ul>
              <div className="footer__social" style={{ marginTop: '1rem' }}>
                <a href="mailto:vendas.cleanlabz@gmail.com" aria-label="Email">
                  ✉️
                </a>
              </div>
            </div>
          </div>
          
          <div className="footer__bottom">
            <span>&copy; {new Date().getFullYear()} CleanLabz. Todos os direitos reservados.</span>
            <span>Feito com dedicação para você</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
