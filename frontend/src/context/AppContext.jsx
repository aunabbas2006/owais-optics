import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [pricing, setPricing] = useState([]);
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [prescription, setPrescription] = useState(null);
    const [lensType, setLensType] = useState('Single Vision');
    const [loading, setLoading] = useState(true);

    const API_BASE = '/api';

    useEffect(() => {
        checkAuth();
        fetchPricing();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${API_BASE}/auth/me`);
            setCustomer(res.data.customer);
        } catch (e) {
            setCustomer(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchPricing = async () => {
        try {
            const res = await axios.get(`${API_BASE}/pricing`);
            setPricing(res.data.pricing);
        } catch (e) {
            console.error('Failed to fetch pricing');
        }
    };

    const logout = async () => {
        await axios.post(`${API_BASE}/auth/logout`);
        setCustomer(null);
        setSelectedFrame(null);
        setPrescription(null);
    };

    const value = {
        customer,
        setCustomer,
        pricing,
        fetchPricing,
        selectedFrame,
        setSelectedFrame,
        prescription,
        setPrescription,
        lensType,
        setLensType,
        logout,
        loading
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
