import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ShoppingBag, DollarSign, LogOut, RefreshCw, ChevronDown } from 'lucide-react';

const AdminDashboard = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [password, setPassword] = useState('');
    const [orders, setOrders] = useState([]);
    const [pricing, setPricing] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const res = await axios.get('/api/admin/me');
            if (res.data.isAdmin) {
                setIsAdmin(true);
                fetchData();
            }
        } catch (e) {
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const [ordersRes, pricingRes] = await Promise.all([
                axios.get('/api/admin/orders'),
                axios.get('/api/admin/pricing')
            ]);
            setOrders(ordersRes.data.orders);
            setPricing(pricingRes.data.pricing);
        } catch (e) {
            console.error('Failed to fetch admin data');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/login', { password });
            setIsAdmin(true);
            fetchData();
        } catch (e) {
            alert('Invalid Password');
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await axios.patch(`/api/admin/orders/${orderId}/status`, { status });
            fetchData();
        } catch (e) {
            alert('Update failed');
        }
    };

    const handleUpdatePrice = async (id, price) => {
        try {
            await axios.patch(`/api/admin/pricing/${id}`, { price: parseFloat(price) });
            fetchData();
        } catch (e) {
            alert('Price update failed');
        }
    };

    if (loading) return null;

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
                <div className="max-w-md w-full bg-white p-12 border border-luxury-border shadow-xl">
                    <h1 className="font-serif text-3xl mb-8 text-center">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-luxury-muted mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-b border-luxury-border py-3 outline-none focus:border-luxury-accent transition-colors"
                                required
                            />
                        </div>
                        <button className="w-full py-4 bg-luxury-accent text-white uppercase text-xs tracking-widest hover:bg-luxury-gold transition-colors">
                            Enter Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-luxury-accent text-white flex flex-col">
                <div className="p-8 border-b border-white/10">
                    <h2 className="font-serif text-xl tracking-widest">OWAIS ADMIN</h2>
                </div>
                <nav className="flex-1 py-8">
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center gap-4 px-8 py-4 text-xs uppercase tracking-widest transition-colors ${activeTab === 'orders' ? 'bg-white/10 text-luxury-gold' : 'hover:bg-white/5 text-white/60'}`}
                    >
                        <ShoppingBag size={18} /> Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('pricing')}
                        className={`w-full flex items-center gap-4 px-8 py-4 text-xs uppercase tracking-widest transition-colors ${activeTab === 'pricing' ? 'bg-white/10 text-luxury-gold' : 'hover:bg-white/5 text-white/60'}`}
                    >
                        <DollarSign size={18} /> Pricing
                    </button>
                </nav>
                <div className="p-8 border-t border-white/10">
                    <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <header className="flex justify-between items-end mb-12">
                        <div>
                            <h1 className="font-serif text-4xl mb-2 capitalize">{activeTab}</h1>
                            <p className="text-luxury-muted text-sm tracking-wide">Manage your store operations</p>
                        </div>
                        <button onClick={fetchData} className="p-3 hover:bg-white rounded-full transition-colors border border-luxury-border">
                            <RefreshCw size={20} className="text-luxury-muted" />
                        </button>
                    </header>

                    <AnimatePresence mode="wait">
                        {activeTab === 'orders' ? (
                            <motion.div 
                                key="orders"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white border border-luxury-border shadow-sm overflow-hidden"
                            >
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-luxury-border">
                                        <tr>
                                            <th className="px-8 py-4 text-[11px] uppercase tracking-widest text-luxury-muted font-medium">Order</th>
                                            <th className="px-8 py-4 text-[11px] uppercase tracking-widest text-luxury-muted font-medium">Customer</th>
                                            <th className="px-8 py-4 text-[11px] uppercase tracking-widest text-luxury-muted font-medium">Items</th>
                                            <th className="px-8 py-4 text-[11px] uppercase tracking-widest text-luxury-muted font-medium">Total</th>
                                            <th className="px-8 py-4 text-[11px] uppercase tracking-widest text-luxury-muted font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-luxury-border">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-6 font-medium">#{order.id}</td>
                                                <td className="px-8 py-6">
                                                    <div className="text-sm">{order.customer_name}</div>
                                                    <div className="text-xs text-luxury-muted">{order.customer_email}</div>
                                                </td>
                                                <td className="px-8 py-6 text-sm">
                                                    {order.frame_shape} ({order.frame_color}) + {order.lens_type}
                                                </td>
                                                <td className="px-8 py-6 text-sm font-semibold text-luxury-gold">Rs. {order.total_price}</td>
                                                <td className="px-8 py-6">
                                                    <select 
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                        className={`text-xs uppercase tracking-widest border border-luxury-border px-3 py-1 outline-none ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="ready">Ready</option>
                                                        <option value="delivered">Delivered</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="pricing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-12"
                            >
                                {['frame', 'lens'].map(cat => (
                                    <div key={cat} className="space-y-6">
                                        <h3 className="text-xs uppercase tracking-[0.2em] text-luxury-muted border-b border-luxury-border pb-4 font-bold">{cat} Prices</h3>
                                        <div className="bg-white border border-luxury-border divide-y divide-luxury-border">
                                            {pricing.filter(p => p.category === cat).map(item => (
                                                <div key={item.id} className="p-6 flex items-center justify-between">
                                                    <span className="font-serif text-lg">{item.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-luxury-muted">Rs.</span>
                                                        <input 
                                                            type="number" 
                                                            defaultValue={item.price}
                                                            onBlur={(e) => handleUpdatePrice(item.id, e.target.value)}
                                                            className="w-24 border-b border-luxury-border text-right py-1 outline-none focus:border-luxury-accent transition-colors font-medium"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
