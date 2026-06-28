import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">⚡</span>
        <span className="navbar-title">GitPulse</span>
      </div>
      <div className="navbar-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `navbar-link ${isActive ? 'navbar-link-active' : ''}`
          }
          end
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/compare"
          className={({ isActive }) =>
            `navbar-link ${isActive ? 'navbar-link-active' : ''}`
          }
        >
          Compare
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;