import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', style }) => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`theme-toggle-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface-raised)',
        color: 'var(--text-main)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        outline: 'none',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isDark ? (
        <Sun size={18} style={{ color: '#f59e0b', transition: 'transform 0.2s ease' }} />
      ) : (
        <Moon size={18} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s ease' }} />
      )}
    </button>
  );
};
