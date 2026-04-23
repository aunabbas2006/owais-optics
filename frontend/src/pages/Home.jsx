import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const Home = () => {
    const { customer } = useApp();

    return (
        <div className="page-enter container mx-auto px-10">
            <section className="min-h-[80vh] flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-serif text-[clamp(48px,8vw,96px)] leading-[1.05] font-light mb-8"
                >
                    The Art of <br /> Vision.
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg text-luxury-muted mb-12 max-w-xl font-light"
                >
                    Meticulously crafted frames for the modern aesthete. Experience clarity and style with our exclusive collection.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex gap-6"
                >
                    <Link to="/catalog" className="px-12 py-5 bg-luxury-accent text-white uppercase text-[13px] tracking-[0.15em] hover:bg-luxury-gold transition-all duration-500">
                        Explore Collection
                    </Link>
                    {!customer && (
                        <Link to="/login" className="px-12 py-5 border border-luxury-border uppercase text-[13px] tracking-[0.15em] hover:border-luxury-accent transition-all duration-500">
                            Sign In
                        </Link>
                    )}
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
