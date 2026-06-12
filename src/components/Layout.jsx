import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Layout = ({ title }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarHovered, setSidebarHovered] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const isSidebarExpanded = sidebarOpen || sidebarHovered;

    return (
        <div className="app-container">
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            <div
                onMouseEnter={() => setSidebarHovered(true)}
                onMouseLeave={() => setSidebarHovered(false)}
                style={{ flexShrink: 0, display: 'flex' }}
            >
                <Sidebar isOpen={isSidebarExpanded} closeSidebar={() => { setSidebarOpen(false); setSidebarHovered(false); }} />
            </div>
            <div className="main-content">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <Navbar title={title} />
                    </div>
                </div>
                <div className="content-area">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
