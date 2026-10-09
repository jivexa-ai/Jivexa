import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: (string | SelectOption)[];
  error?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  onChange,
  className = '',
  style,
  value,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{label}</label>}
      <select
        className={`select ${error ? 'select-error' : ''} ${className}`}
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          height: '44px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: error ? '1.5px solid var(--error)' : '1px solid var(--border)',
          fontSize: '0.92rem',
          fontFamily: 'var(--font-sans)',
          backgroundColor: 'var(--surface)',
          color: 'var(--text-main)',
          outline: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          ...style,
        }}
        {...props}
      >
        {options.map((opt, idx) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={idx} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--error)', fontWeight: 600 }}>{error}</span>}
    </div>
  );
};
