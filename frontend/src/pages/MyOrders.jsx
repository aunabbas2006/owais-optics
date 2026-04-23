import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, ChevronRight } from 'lucide-react';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            setOrders(res.data.orders);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
            case 'processing': return <Clock size={16} className="text-luxury-gold" />;
            default: return <Package size={16} className="text-luxury-muted" />;
        }
    };

    return (
        <div className="page-enter container mx-auto px-10 pb-20 max-w-4xl">
            <header className="mb-20">
                <h1 className="font-serif text-5xl mb-4">Order History</h1>
                <p className="text-luxury-muted uppercase tracking-widest text-xs">Track your premium vision journey</p>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-luxury-border border-t-luxury-accent rounded-full animate-spin"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-32 bg-gray-50 border border-luxury-border border-dashed">
                    <p className="text-luxury-muted uppercase tracking-widest text-[11px] mb-8">No orders found yet</p>
                    <button onClick={() => window.location.href = '/catalog'} className="px-12 py-4 bg-luxury-accent text-white uppercase text-xs tracking-widest hover:bg-luxury-gold transition-colors">
                        Browse Collection
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white border border-luxury-border p-8 hover:shadow-xl transition-all duration-500 flex items-center justify-between group">
                            <div className="flex items-center gap-10">
                                <div className="text-center border-r border-luxury-border pr-10">
                                    <p className="text-[10px] text-luxury-muted uppercase font-bold mb-1">Order</p>
                                    <p className="font-serif text-2xl font-bold">#{order.id}</p>
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl mb-1">{order.frame_shape} — {order.frame_color}</h3>
                                    <p className="text-[10px] text-luxury-muted uppercase tracking-[0.2em]">
                                        Placed on {new Date(order.created_at).toLocaleDateString()} • {order.lens_type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-luxury-accent mb-1">Rs. {order.total_price}</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        {getStatusIcon(order.status)}
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-luxury-muted">{order.status}</span>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-luxury-border group-hover:text-luxury-accent transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
