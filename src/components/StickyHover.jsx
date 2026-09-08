import { useState, useEffect } from 'react';
import './StickyHover.css';

const StickyHover = ({ children, position = 'bottom-right' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const positionClasses = {
    'bottom-right': 'sticky-hover-bottom-right',
    'bottom-left': 'sticky-hover-bottom-left',
    'top-right': 'sticky-hover-top-right',
    'top-left': 'sticky-hover-top-left',
  };

  return (
    <div className={`sticky-hover-container ${positionClasses[position]}`}>
      <div className={`sticky-hover-content ${isMinimized ? 'minimized' : ''}`}>
        <div className="sticky-hover-header">
          <span className="sticky-hover-title">Quick Access</span>
          <button 
            className="sticky-hover-toggle"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button 
            className="sticky-hover-close"
            onClick={() => setIsVisible(false)}
          >
            ×
          </button>
        </div>
        {!isMinimized && (
          <div className="sticky-hover-body">
            {children}
          </div>
        )}
      </div>
      {!isVisible && (
        <button 
          className="sticky-hover-restore"
          onClick={() => setIsVisible(true)}
        >
          ◉
        </button>
      )}
    </div>
  );
};

export default StickyHover;
