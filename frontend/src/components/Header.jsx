import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { currentUser, logout } from '../auth';

export default function Header({ cartCount = 0 }) {
  const navigate = useNavigate();
  const user = currentUser();
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Add scroll listener for header shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav>
        {/* Logo and Location */}
        <div className="nav-left">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🍕</span>
            <span className="logo-text">FoodHub</span>
          </Link>
          <div className="location-selector">
            <span className="location-icon">📍</span>
            <div className="location-text">
              <span className="location-label">Deliver to</span>
              <span className="location-value">Bangalore, India ▾</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="nav-right">
          <Link to="/" className="nav-link">
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Search</span>
          </Link>
          
          <Link to="/" className="nav-link">
            <span className="nav-icon">🏷️</span>
            <span className="nav-text">Offers</span>
          </Link>
          
          <Link to="/" className="nav-link">
            <span className="nav-icon">❓</span>
            <span className="nav-text">Help</span>
          </Link>
          
          {user ? (
            <>
              <div 
                className="nav-link user-menu"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-text">{user.name}</span>
                
                {showDropdown && (
                  <div className="user-dropdown">
                    <Link to="/" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span>📦</span> Orders
                    </Link>
                    <Link to="/" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span>⭐</span> Favorites
                    </Link>
                    <Link to="/" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span>💳</span> Payments
                    </Link>
                    <Link to="/" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span>📍</span> Addresses
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
              
              <Link to="/" className="nav-link cart-link">
                <span className="nav-icon">🛒</span>
                <span className="nav-text">Cart</span>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <span className="nav-icon">🔐</span>
                <span className="nav-text">Sign In</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
