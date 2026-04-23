import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const Prescription = () => {
    const { pricing, selectedFrame, setPrescription, setLensType, lensType } = useApp();
    const navigate = useNavigate();
    const [rx, setRx] = useState({
        right: { sph: '', cyl: '', axis: '', add: '', pd: '' },
        left: { sph: '', cyl: '', axis: '', add: '', pd: '' }
    });

    const lensOptions = pricing.filter(p => p.category === 'lens');

    const handleRxChange = (eye, field, value) => {
        setRx(prev => ({
            ...prev,
            [eye]: { ...prev[eye], [field]: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setPrescription(rx);
        navigate('/summary');
    };

    if (!selectedFrame) {
        navigate('/catalog');
        return null;
    }

    return (
        <div className="page-enter container mx-auto px-10 pb-20 max-w-5xl">
            <header className="text-center mb-20">
                <h1 className="font-serif text-5xl mb-4">Prescription & Lenses</h1>
                <p className="text-luxury-muted uppercase tracking-widest text-xs">Enter your details for a perfect fit</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-20">
                {/* Prescription Table */}
                <div className="bg-white border border-luxury-border p-12 overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left">
                        <thead>
                            <tr className="border-b border-luxury-border">
                                <th className="pb-6 text-[11px] uppercase tracking-widest text-luxury-muted font-bold">Eye</th>
                                <th className="pb-6 text-[11px] uppercase tracking-widest text-luxury-muted font-bold">SPH</th>
                                <th className="pb-6 text-[11px] uppercase tracking-widest text-luxury-muted font-bold">CYL</th>
                                <th className="pb-6 text-[11px] uppercase tracking-widest text-luxury-muted font-bold">Axis</th>
                                <th className="pb-6 text-[11px] uppercase tracking-widest text-luxury-muted font-bold">ADD</th>
                                <th className="pb-6 text-[11px] uppercase tracking-widest text-luxury-muted font-bold">PD</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-luxury-border">
                            {['right', 'left'].map(eye => (
                                <tr key={eye}>
                                    <td className="py-8 font-serif text-xl capitalize">{eye === 'right' ? 'OD (Right)' : 'OS (Left)'}</td>
                                    {['sph', 'cyl', 'axis', 'add', 'pd'].map(field => (
                                        <td key={field} className="py-8 px-2">
                                            <input 
                                                type="number" 
                                                step="0.25"
                                                placeholder="0.00"
                                                value={rx[eye][field]}
                                                onChange={(e) => handleRxChange(eye, field, e.target.value)}
                                                className="w-full border-b border-transparent focus:border-luxury-accent py-2 outline-none transition-colors text-center font-medium"
                                                required={field !== 'add'}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Lens Selection */}
                <section>
                    <h2 className="font-serif text-3xl mb-12 text-center">Select Lens Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {lensOptions.map(option => (
                            <div 
                                key={option.id}
                                onClick={() => setLensType(option.name)}
                                className={`cursor-pointer p-8 border transition-all duration-500 text-center ${lensType === option.name ? 'border-luxury-accent bg-luxury-bg' : 'border-luxury-border hover:border-luxury-muted'}`}
                            >
                                <h3 className="font-serif text-xl mb-2">{option.name}</h3>
                                <p className="text-sm font-semibold text-luxury-gold">Rs. {option.price}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-center">
                    <button type="submit" className="px-20 py-5 bg-luxury-accent text-white uppercase text-[13px] tracking-[0.2em] hover:bg-luxury-gold transition-all duration-500">
                        Review Order
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Prescription;
