import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { LoaderProvider, useLoader } from './components/GlobalLoader.jsx';
import { registerLoaderCallbacks } from './services/api.js';

const AppWithLoader = () => {
    const { show, hide } = useLoader();
    useEffect(() => {
        registerLoaderCallbacks(show, hide);
    }, [show, hide]);
    return (
        <>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { borderRadius: '0.75rem', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
                    success: { iconTheme: { primary: '#10B981', secondary: '#fff' }, style: { background: '#fff', color: '#0F172A', borderLeft: '4px solid #10B981' } },
                    error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' }, style: { background: '#fff', color: '#0F172A', borderLeft: '4px solid #EF4444' } },
                }}
            />
        </>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <LoaderProvider>
                <AppWithLoader />
            </LoaderProvider>
        </AuthProvider>
    </React.StrictMode>,
);
