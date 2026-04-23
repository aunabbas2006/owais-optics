import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, LogOut, ShoppingBag } from 'lucide-react';

const Navbar = () => {
    const { customer, logout } = useApp();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-luxury-border px-10 py-6 flex items-center justify-between">
            <Link to="/" className="font-serif text-2xl font-bold tracking-widest uppercase hover:text-luxury-gold transition-colors">
                Owais Optics
            </Link>

            <div className="flex items-center gap-8">
                <Link to="/catalog" className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}>Collection</Link>
                {customer && (
                    <>
                        <Link to="/my-orders" className={`nav-link ${isActive('/my-orders') ? 'active' : ''}`}>My Orders</Link>
                        <div className="flex items-center gap-3 pl-4 border-l border-luxury-border">
                            <div className="w-8 h-8 rounded-full bg-luxury-accent text-white flex items-center justify-center text-xs font-bold uppercase">
                                {customer.name.charAt(0)}
                            </div>
                            <span className="text-[13px] font-medium tracking-wider uppercase">{customer.name}</span>
                            <button onClick={logout} className="p-2 hover:bg-luxury-bg rounded-full transition-colors text-luxury-muted hover:text-luxury-accent">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </>
                )}
                {!customer && (
                    <Link to="/login" className="btn btn-primary px-8 py-3 text-xs tracking-widest uppercase bg-luxury-accent text-white hover:bg-luxury-gold transition-all">
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
