import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  type = 'text',
  className = '',
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  const computedType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && <span style={{ position: 'absolute', left: '14px', color: 'var(--text-light)', display: 'flex', pointerEvents: 'none', zIndex: 1 }}>{icon}</span>}
        
        <input
          type={computedType}
          className={`input ${error ? 'input-error' : ''} ${className}`}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: icon ? '42px' : '14px',
            paddingRight: isPasswordField ? '42px' : '14px',
            paddingTop: '10px',
            paddingBottom: '10px',
            borderRadius: 'var(--radius-md)',
            border: error ? '1.5px solid var(--error)' : '1px solid var(--border)',
            fontSize: '0.92rem',
            fontFamily: 'var(--font-sans)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-main)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
            boxShadow: 'var(--shadow-sm)',
            ...style,
          }}
          {...props}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showPassword ? 'var(--primary)' : 'var(--text-light)',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.18s ease',
              zIndex: 2
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--error)', fontWeight: 600 }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{helperText}</span>}
    </div>
  );
};
