import { Product } from "@/lib/types";

type Props = {
  products: Product[];
  onAdd: (product: Product) => void;
};

export function ProductGrid({ products, onAdd }: Props) {
  const list = Array.isArray(products) ? products : [];

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
        
        <div className="products-grid">
          {list.map((product) => {
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
        </div>
      </div>
    </section>
  );
}
