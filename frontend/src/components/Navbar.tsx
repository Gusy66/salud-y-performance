"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link href="/" className="logo">
          CleanLabz
        </Link>
        
        <nav className="nav__links">
          <Link href="#produtos">Produtos</Link>
          <Link href="#checkout">Carrinho</Link>
          <Link href="mailto:vortexpharma1@gmail.com">Contato</Link>
          <Link href="#checkout" className="nav__cta">
            Fazer Pedido
          </Link>
        </nav>

        <button 
          className={`nav__toggle ${isOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav__mobile ${isOpen ? 'open' : ''}`}>
          <Link href="#produtos" onClick={closeMenu}>Produtos</Link>
          <Link href="#checkout" onClick={closeMenu}>Carrinho</Link>
          <Link href="mailto:vortexpharma1@gmail.com" onClick={closeMenu}>Contato</Link>
          <Link href="#checkout" className="btn btn--primary btn--full" onClick={closeMenu}>
            Fazer Pedido
          </Link>
        </nav>
      </div>
    </header>
  );
}
