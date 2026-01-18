type CartItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  wholesaleApplied: boolean;
  wholesaleMinQty: number;
};

type FormState = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
};

type Props = {
  items: CartItem[];
  form: FormState;
  onChangeForm: (partial: Partial<FormState>) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  total: number;
  message?: string;
  error?: string;
};

export function CartSummary({
  items,
  form,
  onChangeForm,
  onUpdateQty,
  onRemove,
  onSubmit,
  loading,
  total,
  message,
  error,
}: Props) {
  return (
    <section id="checkout" className="section checkout-section">
      <div className="container">
        <div className="section__header">
          <h2>Finalizar Pedido</h2>
          <p>Revise seu carrinho e preencha seus dados para enviar o pedido.</p>
        </div>
        
        <div className="checkout-grid">
          {/* Cart Section */}
          <div className="checkout-cart">
            <div className="checkout-cart__header">
              <h3 className="checkout-cart__title">Seu Carrinho</h3>
              {items.length > 0 && (
                <span className="checkout-cart__count">{items.length}</span>
              )}
            </div>
            
            {items.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty__icon">🛒</div>
                <p>Seu carrinho está vazio</p>
                <p className="small muted" style={{ marginTop: '0.5rem' }}>
                  Adicione produtos para continuar
                </p>
              </div>
            ) : (
              <>
                <div className="stack">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item__info">
                        <div className="cart-item__name">{item.name}</div>
                        <div className={`cart-item__price-type ${item.wholesaleApplied ? 'cart-item__price-type--wholesale' : ''}`}>
                          R$ {item.unitPrice.toFixed(2)} / un
                          {item.wholesaleApplied 
                            ? ` (atacado ≥${item.wholesaleMinQty})` 
                            : ' (varejo)'}
                        </div>
                      </div>
                      
                      <div className="cart-item__controls">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => onUpdateQty(item.id, Number(e.target.value))}
                          className="cart-item__qty"
                          aria-label="Quantidade"
                        />
                        <button
                          className="cart-item__remove"
                          onClick={() => onRemove(item.id)}
                          type="button"
                          aria-label="Remover item"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="cart-item__total">
                        R$ {item.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-total">
                  <span className="cart-total__label">Total</span>
                  <span className="cart-total__value">R$ {total.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Form Section */}
          <div className="checkout-form">
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <div className="form__header">
                <h3>Dados para Contato</h3>
                <p>Preencha seus dados para receber o pedido por e-mail.</p>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="customerName">
                  Nome completo
                </label>
                <input
                  id="customerName"
                  required
                  className="form-input"
                  placeholder="Seu nome completo"
                  value={form.customerName}
                  onChange={(e) => onChangeForm({ customerName: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => onChangeForm({ email: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Telefone / WhatsApp
                </label>
                <input
                  id="phone"
                  className="form-input"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={(e) => onChangeForm({ phone: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  Endereço de entrega
                </label>
                <textarea
                  id="address"
                  className="form-input"
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                  value={form.address}
                  onChange={(e) => onChangeForm({ address: e.target.value })}
                />
              </div>
              
              {error && (
                <div className="alert alert--error">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              
              {message && (
                <div className="alert alert--success">
                  <span>✓</span>
                  <span>{message}</span>
                </div>
              )}
              
              <button 
                className="btn btn--primary btn--full btn--lg" 
                disabled={loading || items.length === 0}
              >
                {loading ? (
                  <span className="loading-pulse">Enviando pedido...</span>
                ) : (
                  "Enviar pedido por e-mail"
                )}
              </button>
              
              <p className="muted small text-center">
                Após o envio, entraremos em contato com as formas de pagamento e instruções de envio.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
