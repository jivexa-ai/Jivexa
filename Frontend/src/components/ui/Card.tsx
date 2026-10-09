import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  footer,
  className = '',
  style,
  bodyStyle,
  hoverable = false,
}) => {
  return (
    <div
      className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '24px',
        boxShadow: 'var(--shadow-md)',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      {(title || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: subtitle ? '4px' : '16px' }}>
          {title && <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {subtitle && <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px', marginTop: 0, lineHeight: '1.5' }}>{subtitle}</div>}
      <div style={bodyStyle}>{children}</div>
      {footer && <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>{footer}</div>}
    </div>
  );
};
