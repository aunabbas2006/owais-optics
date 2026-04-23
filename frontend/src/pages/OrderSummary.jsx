import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Receipt } from 'lucide-react';

const OrderSummary = () => {
    const { selectedFrame, prescription, lensType, pricing, clearOrder } = useApp();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const navigate = useNavigate();

    if (!selectedFrame || !prescription) {
        navigate('/catalog');
        return null;
    }

    const framePrice = parseFloat(selectedFrame.priceValue || 0);
    const lensPrice = parseFloat(pricing.find(p => p.category === 'lens' && p.name === lensType)?.price || 0);
    const total = framePrice + lensPrice;

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/orders', {
                frame: selectedFrame,
                prescription,
                lensType,
                totalPrice: total,
                notes: ''
            });
            if (res.data.success) {
                setOrderId(res.data.orderId);
                setSuccess(true);
                // clearOrder(); // Implement this in context if needed
            }
        } catch (e) {
            alert('Order placement failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-enter flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                    <CheckCircle size={80} className="text-green-500 mb-8" />
                </motion.div>
                <h1 className="font-serif text-5xl mb-4">Order Placed!</h1>
                <p className="text-luxury-muted mb-12">Your order <span className="text-luxury-accent font-bold">#{orderId}</span> has been received successfully.</p>
                <div className="flex gap-6">
                    <button onClick={() => navigate('/my-orders')} className="px-10 py-4 bg-luxury-accent text-white uppercase text-xs tracking-widest hover:bg-luxury-gold transition-colors">
                        View My Orders
                    </button>
                    <button onClick={() => navigate('/')} className="px-10 py-4 border border-luxury-border uppercase text-xs tracking-widest hover:border-luxury-accent transition-colors">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter container mx-auto px-10 pb-20 max-w-6xl">
            <header className="text-center mb-16">
                <h1 className="font-serif text-5xl mb-4">Review Order</h1>
                <p className="text-luxury-muted uppercase tracking-widest text-xs">Confirm your selection before checkout</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Frame & Prescription */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-white border border-luxury-border p-10 flex gap-10 items-center">
                        <div className="w-48 h-32 bg-gray-50 flex items-center justify-center p-4">
                            <img src={selectedFrame.thumbnailLink || `/api/frames/${selectedFrame.id}/image`} alt="Frame" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="font-serif text-2xl mb-2">{selectedFrame.shape}</h2>
                            <p className="text-xs uppercase tracking-widest text-luxury-muted">{selectedFrame.color}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-luxury-border p-10">
                        <h3 className="font-serif text-xl mb-8 flex items-center gap-3">
                            <Receipt size={20} className="text-luxury-gold" /> Prescription Details
                        </h3>
                        <div className="grid grid-cols-2 gap-10">
                            {['right', 'left'].map(eye => (
                                <div key={eye} className="space-y-4">
                                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-luxury-accent border-b pb-2">{eye === 'right' ? 'OD (Right)' : 'OS (Left)'}</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div><span className="text-[10px] text-luxury-muted block">SPH</span><span className="font-medium">{prescription[eye].sph}</span></div>
                                        <div><span className="text-[10px] text-luxury-muted block">CYL</span><span className="font-medium">{prescription[eye].cyl}</span></div>
                                        <div><span className="text-[10px] text-luxury-muted block">Axis</span><span className="font-medium">{prescription[eye].axis}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Summary Bill */}
                <div className="space-y-8">
                    <div className="bg-white border border-luxury-border p-10 shadow-sm">
                        <h3 className="font-serif text-2xl mb-8 text-center uppercase tracking-tighter">Bill Summary</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-luxury-muted">Frame Cost ({selectedFrame.shape})</span>
                                <span>Rs. {framePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm pb-6 border-b border-luxury-border">
                                <span className="text-luxury-muted">Lens Cost ({lensType})</span>
                                <span>Rs. {lensPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xl font-serif pt-4">
                                <span>Total Amount</span>
                                <span className="text-luxury-gold">Rs. {total.toLocaleString()}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full mt-12 py-5 bg-luxury-accent text-white uppercase text-xs tracking-[0.2em] hover:bg-luxury-gold transition-all duration-500 disabled:bg-gray-300"
                        >
                            {loading ? 'Processing...' : 'Confirm & Place Order'}
                        </button>
                    </div>

                    <button onClick={() => navigate('/prescription')} className="flex items-center gap-2 text-xs uppercase tracking-widest text-luxury-muted hover:text-luxury-accent transition-colors">
                        <ArrowLeft size={14} /> Back to Prescription
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
