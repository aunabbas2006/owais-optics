import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Prescription from './pages/Prescription';
import OrderSummary from './pages/OrderSummary';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
    const { customer, loading } = useApp();
    if (loading) return null;
    if (!customer) return <Navigate to="/login" />;
    return children;
};

function AppRoutes() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="pt-20">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
                    <Route path="/prescription" element={<ProtectedRoute><Prescription /></ProtectedRoute>} />
                    <Route path="/summary" element={<ProtectedRoute><OrderSummary /></ProtectedRoute>} />
                    <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AppProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AppProvider>
    );
}

export default App;
