import React, { useEffect, useState, useRef } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback if browser requires user interaction for video play
      });
    }

    // Keep splash screen active for 7 seconds as requested (5 to 10 seconds range)
    const displayTimer = setTimeout(() => {
      handleFinish();
    }, 7000);

    return () => clearTimeout(displayTimer);
  }, []);

  return (
    <div
      className={`splash-screen-overlay ${isFadingOut ? 'fade-out' : ''}`}
      onClick={handleFinish}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        background: 'var(--background)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'auto',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {/* Soft Ambient Glow Effect */}
      <div
        style={{
          position: 'absolute',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
          filter: 'blur(35px)',
          pointerEvents: 'none'
        }}
      />

      {/* Perfect Circular HD Logo Frame */}
      <div
        style={{
          position: 'relative',
          width: 'min(65vw, 210px)',
          height: 'min(65vw, 210px)',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-xl)',
          border: '4px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        <video
          ref={videoRef}
          src="/assets/animations/jivexa-intro.mp4"
          autoPlay
          muted
          playsInline
          loop
          controls={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.3)',
            filter: 'contrast(1.08) brightness(1.03)',
            borderRadius: '50%'
          }}
        />
      </div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
          Jivexa <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Health</span>
        </h1>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Intelligent Healthcare Operating System
        </span>
      </div>

    </div>
  );
};
