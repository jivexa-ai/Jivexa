import React from 'react';
import { Link } from 'react-router-dom';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  showText?: boolean;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showText = true,
  href = '/',
  className = '',
  style,
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { logoHeight: '34px', fontSize: '1.05rem', gap: '8px' };
      case 'lg':
        return { logoHeight: '44px', fontSize: '1.3rem', gap: '12px' };
      case 'xl':
        return { logoHeight: '48px', fontSize: '1.45rem', gap: '14px' };
      case 'md':
      default:
        return { logoHeight: '38px', fontSize: '1.2rem', gap: '10px' };
    }
  };

  const config = getSizeConfig();

  const logoContent = (
    <div
      className={`brand-logo-lockup ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: config.gap,
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <img
        src="/assets/logo.jpg"
        alt="Jivexa Health Logo"
        style={{
          height: config.logoHeight,
          width: 'auto',
          maxHeight: config.logoHeight,
          objectFit: 'contain',
          borderRadius: '8px',
          flexShrink: 0,
          transition: 'transform 0.18s ease',
        }}
      />
      {showText && (
        <span
          style={{
            fontSize: config.fontSize,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: variant === 'light' ? '#ffffff' : 'var(--text-main)',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Jivexa{' '}
          <span
            style={{
              color: variant === 'light' ? '#38bdf8' : 'var(--primary)',
              fontWeight: 600,
            }}
          >
            Health
          </span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link to={href} style={{ textDecoration: 'none', display: 'inline-flex' }}>{logoContent}</Link>;
  }

  return logoContent;
};
