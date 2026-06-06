import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Orders from './pages/Orders.jsx';
import Furnace from './pages/Furnace.jsx';
import Materials from './pages/Materials.jsx';
import Products from './pages/Products.jsx';
import Stats from './pages/Stats.jsx';

const App = () => {
  const navItems = [
    { path: '/orders', label: '订单排程', icon: '📋' },
    { path: '/furnace', label: '炉温记录', icon: '🔥' },
    { path: '/materials', label: '用料台账', icon: '⚒️' },
    { path: '/products', label: '成品档案', icon: '🗡️' },
    { path: '/stats', label: '数据统计', icon: '📊' }
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-title">⚒️ 铁匠铺管理</div>
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {item.icon} {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/furnace" element={<Furnace />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/products" element={<Products />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
