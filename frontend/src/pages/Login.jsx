import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { setCustomer } = useApp();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { name, email });
            if (res.data.success) {
                setCustomer(res.data.customer);
                navigate('/catalog');
            }
        } catch (err) {
            alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-enter min-h-[80vh] flex items-center justify-center px-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white p-12 border border-luxury-border shadow-2xl"
            >
                <header className="text-center mb-12">
                    <h1 className="font-serif text-4xl mb-3">Welcome</h1>
                    <p className="text-[11px] uppercase tracking-widest text-luxury-muted">Join the world of premium vision</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-luxury-muted font-bold">Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-b border-luxury-border py-3 outline-none focus:border-luxury-accent transition-colors font-light"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-luxury-muted font-bold">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-b border-luxury-border py-3 outline-none focus:border-luxury-accent transition-colors font-light"
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-luxury-accent text-white uppercase text-xs tracking-[0.2em] hover:bg-luxury-gold transition-all duration-500 disabled:bg-gray-300"
                    >
                        {loading ? 'Entering...' : 'Get Started'}
                    </button>
                </form>

                <p className="mt-12 text-[10px] text-center text-luxury-muted leading-relaxed uppercase tracking-widest">
                    By entering, you agree to our <br /> terms of service & privacy policy.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
