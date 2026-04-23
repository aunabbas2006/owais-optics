import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Catalog = () => {
    const [frames, setFrames] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const { pricing, setSelectedFrame, selectedFrame } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        fetchFrames();
    }, []);

    const fetchFrames = async () => {
        try {
            const res = await axios.get('/api/frames');
            setFrames(res.data.frames);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getPrice = (shape) => {
        const p = pricing.find(item => item.category === 'frame' && item.name === shape);
        return p ? `Rs. ${p.price}` : 'Rs. 1,500';
    };

    const shapes = ['all', ...new Set(frames.map(f => f.shape))];

    const filteredFrames = filter === 'all' ? frames : frames.filter(f => f.shape === filter);

    const handleSelect = (frame) => {
        const price = getPrice(frame.shape);
        setSelectedFrame({ ...frame, priceValue: parseFloat(price.replace('Rs. ', '').replace(',', '')), displayPrice: price });
    };

    return (
        <div className="page-enter container mx-auto px-10 pb-20">
            <div className="flex justify-center gap-10 mb-20 border-b border-luxury-border">
                {shapes.map(shape => (
                    <button 
                        key={shape}
                        onClick={() => setFilter(shape)}
                        className={`py-4 text-xs uppercase tracking-widest transition-all relative ${filter === shape ? 'text-luxury-accent' : 'text-luxury-muted hover:text-luxury-accent'}`}
                    >
                        {shape}
                        {filter === shape && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-luxury-accent" />}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-luxury-border border-t-luxury-accent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {filteredFrames.map(frame => (
                        <div 
                            key={frame.id}
                            onClick={() => handleSelect(frame)}
                            className={`group cursor-pointer p-6 border transition-all duration-500 ${selectedFrame?.id === frame.id ? 'border-luxury-accent bg-luxury-bg/50' : 'border-transparent hover:border-luxury-border'}`}
                        >
                            <div className="aspect-[4/3] bg-white mb-8 overflow-hidden flex items-center justify-center p-12">
                                <img 
                                    src={frame.thumbnailLink || `/api/frames/${frame.id}/image`} 
                                    alt={frame.name}
                                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="font-serif text-2xl mb-2">{frame.shape}</h3>
                                <p className="text-[11px] uppercase tracking-widest text-luxury-muted mb-4">{frame.color}</p>
                                <p className="text-sm font-medium text-luxury-gold">{getPrice(frame.shape)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedFrame && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40"
                >
                    <button 
                        onClick={() => navigate('/prescription')}
                        className="px-16 py-5 bg-luxury-accent text-white shadow-2xl uppercase text-[13px] tracking-[0.15em] hover:bg-luxury-gold transition-all duration-500"
                    >
                        Continue to Lenses
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default Catalog;
