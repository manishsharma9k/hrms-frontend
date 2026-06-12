import React, { createContext, useContext, useState, useCallback } from 'react';

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
    const [count, setCount] = useState(0);

    const show = useCallback(() => setCount(c => c + 1), []);
    const hide = useCallback(() => setCount(c => Math.max(0, c - 1)), []);
    const loading = count > 0;

    return (
        <LoaderContext.Provider value={{ show, hide, loading }}>
            {children}
            {loading && (
                <>
                    {/* Top progress bar */}
                    <div style={{
                        position: 'fixed', top: 0, left: 0, height: '3px', zIndex: 99999,
                        background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899, #4F46E5)',
                        backgroundSize: '200% 100%',
                        animation: 'loaderBar 1.2s linear infinite',
                        width: '100%',
                        boxShadow: '0 0 10px rgba(79,70,229,0.7)',
                    }} />

                    {/* Center spinner card */}
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 99998,
                        background: 'rgba(241,245,249,0.6)',
                        backdropFilter: 'blur(2px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'all',
                    }}>
                        <div style={{
                            background: 'white', borderRadius: '1.25rem',
                            padding: '1.75rem 2.5rem',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.13)',
                            border: '1px solid #E2E8F0',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '0.875rem',
                        }}>
                            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    border: '3px solid #EDE9FE',
                                    borderTop: '3px solid #4F46E5',
                                    animation: 'spin 0.7s linear infinite',
                                    position: 'absolute', inset: 0,
                                }} />
                                <div style={{
                                    position: 'absolute', inset: '9px',
                                    borderRadius: '50%',
                                    border: '2px solid #FCE7F3',
                                    borderTop: '2px solid #EC4899',
                                    animation: 'spin 1.1s linear infinite reverse',
                                }} />
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#4F46E5' }}>Loading...</p>
                        </div>
                    </div>

                    <style>{`
                        @keyframes loaderBar {
                            0%   { background-position: 200% 0; }
                            100% { background-position: -200% 0; }
                        }
                    `}</style>
                </>
            )}
        </LoaderContext.Provider>
    );
};
