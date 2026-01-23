import { useMemo, useState } from "react";
import { Product } from "@/lib/types";

type Props = {
  products: Product[];
  onAdd: (product: Product) => void;
};

export function ProductGrid({ products, onAdd }: Props) {
  const list = Array.isArray(products) ? products : [];
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.category,
        product.dosage,
        product.volume,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [list, search]);

  return (
    <section id="produtos" className="section products-section">
      <div className="container">
        <div className="section__header">
          <h2>Nossos Produtos</h2>
          <p>
            Peptídeos de alta qualidade para varejo e atacado. 
            Preços especiais a partir de 10 unidades.
          </p>
        </div>
        
        <div className="products-search">
          <div className="products-search__input">
            <span className="products-search__icon">🔎</span>
            <input
              type="search"
              placeholder="Buscar por nome, categoria ou dosagem..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar produtos"
            />
            {search && (
              <button
                type="button"
                className="products-search__clear"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="products-search__meta">
            {filtered.length} produto{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="products-grid">
          {filtered.map((product) => {
            const isSoon = product.status === "soon";
            const imageSrc =
              product.imageUrl ?? "/carrossel/Gemini_Generated_Image_dj1l4udj1l4udj1l.png";
            
            return (
              <article key={product.id} className="product-card">
                <div className="product-card__image">
                  <img src={imageSrc} alt={product.name} loading="lazy" />
                  {isSoon && (
                    <div className="product-card__badge">
                      <span className="pill pill--muted">Em breve</span>
                    </div>
                  )}
                  {product.category && !isSoon && (
                    <div className="product-card__badge">
                      <span className="pill">{product.category}</span>
                    </div>
                  )}
                </div>
                
                <div className="product-card__content">
                  <div className="product-card__header">
                    <h3 className="product-card__title">{product.name}</h3>
                  </div>
                  
                  {(product.dosage || product.volume) && (
                    <p className="product-card__meta">
                      {product.dosage}
                      {product.dosage && product.volume && " • "}
                      {product.volume}
                    </p>
                  )}
                  
                  {product.description && (
                    <p className="product-card__description">{product.description}</p>
                  )}
                  
                  <div className="product-card__prices">
                    <div className="price-box">
                      <div className="price-box__label">Varejo</div>
                      <div className="price-box__value">
                        R$ {product.retailPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="price-box price-box--highlight">
                      <div className="price-box__label">Atacado (≥{product.wholesaleMinQty})</div>
                      <div className="price-box__value">
                        R$ {product.wholesalePrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="product-card__action">
                    <button
                      className={`btn btn--full ${isSoon ? '' : 'btn--primary'}`}
                      onClick={() => onAdd(product)}
                      disabled={isSoon}
                    >
                      {isSoon ? "Em breve" : "Adicionar ao carrinho"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="products-empty">
              <strong>Nenhum produto encontrado</strong>
              <span>
                Tente buscar por outro termo ou limpe o filtro para ver tudo.
              </span>
              {search && (
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setSearch("")}
                >
                  Ver todos os produtos
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
