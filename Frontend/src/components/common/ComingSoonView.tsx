import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, Pill, Siren, Search, Shield, ArrowRight, 
  Sparkles, MessageSquare, FileText, CheckCircle2, Clock
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface ComingSoonViewProps {
  moduleName: string;
  category?: 'doctor' | 'pharmacy' | 'ambulance' | 'directory' | 'admin';
  customDescription?: string;
  releaseVersion?: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  moduleName,
  category = 'doctor',
  customDescription,
  releaseVersion = 'Version 2'
}) => {
  const navigate = useNavigate();

  const getModuleDetails = () => {
    switch (category) {
      case 'doctor':
        return {
          icon: <Stethoscope size={36} style={{ color: '#0f766e' }} />,
          badge: 'Doctor Consultations & Care',
          title: moduleName || 'Doctor Care',
          desc: customDescription || 'Coming soon. Jivexa is currently available for Patient AI Health testing.',
          timeline: 'Planned for Version 2 (Practitioner Onboarding & Tele-Consults)',
          color: '#0f766e',
          bg: '#f0fdfa',
          borderColor: '#ccfbf1'
        };
      case 'pharmacy':
        return {
          icon: <Pill size={36} style={{ color: '#0284c7' }} />,
          badge: 'Pharmacy & Medication Orders',
          title: moduleName || 'Pharmacy',
          desc: customDescription || 'Coming soon. Jivexa is currently available for Patient AI Health testing.',
          timeline: 'Planned for Version 3 (Licensed Pharmacy Network & E-Prescriptions)',
          color: '#0284c7',
          bg: '#f0f9ff',
          borderColor: '#e0f2fe'
        };
      case 'ambulance':
        return {
          icon: <Siren size={36} style={{ color: '#e11d48' }} />,
          badge: 'Emergency Services',
          title: moduleName || 'Emergency Assistance',
          desc: customDescription || 'Coming soon. Jivexa is currently available for Patient AI Health testing.',
          timeline: 'Planned for Version 4 (Emergency Fleet Dispatch & Live GPS Tracking)',
          color: '#e11d48',
          bg: '#fff1f2',
          borderColor: '#ffe4e6'
        };
      case 'directory':
        return {
          icon: <Search size={36} style={{ color: '#7c3aed' }} />,
          badge: 'Healthcare Directory',
          title: moduleName || 'Healthcare Directory',
          desc: customDescription || 'Coming soon. Jivexa is currently available for Patient AI Health testing.',
          timeline: 'Planned for Version 2+ (Verified Clinic & Specialist Registry)',
          color: '#7c3aed',
          bg: '#faf5ff',
          borderColor: '#f3e8ff'
        };
      case 'admin':
        return {
          icon: <Shield size={36} style={{ color: '#475569' }} />,
          badge: 'Internal Management',
          title: moduleName || 'Clinical Administration',
          desc: customDescription || 'Restricted to authorized system administrators. Public access is currently limited to Patient MVP features.',
          timeline: 'Internal Administrative Tools',
          color: '#475569',
          bg: '#f8fafc',
          borderColor: '#e2e8f0'
        };
      default:
        return {
          icon: <Clock size={36} style={{ color: '#0f766e' }} />,
          badge: 'Module Restricted',
          title: moduleName,
          desc: customDescription || 'Coming soon. Jivexa is currently available for Patient AI Health testing.',
          timeline: releaseVersion,
          color: '#0f766e',
          bg: '#f0fdfa',
          borderColor: '#ccfbf1'
        };
    }
  };

  const details = getModuleDetails();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 220px)',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: 'var(--surface-raised, #ffffff)',
        border: `1px solid ${details.borderColor}`,
        borderRadius: '24px',
        padding: '44px 32px',
        boxShadow: 'var(--shadow-xl, 0 20px 40px -15px rgba(0,0,0,0.07))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Module Icon Container */}
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: details.bg,
          border: `2px solid ${details.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {details.icon}
        </div>

        {/* Status Chip */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: details.bg,
          color: details.color,
          fontSize: '0.8rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <Clock size={14} />
          <span>{details.badge} • Coming Soon</span>
        </div>

        {/* Title & Description */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 900,
          color: 'var(--text-main, #0f172a)',
          margin: 0,
          letterSpacing: '-0.02em'
        }}>
          {details.title}
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-muted, #64748b)',
          maxWidth: '520px',
          margin: 0,
          lineHeight: '1.6'
        }}>
          {details.desc}
        </p>

        {/* Roadmap Indicator Box */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '16px',
          padding: '16px 20px',
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark, #1e293b)', fontWeight: 800, fontSize: '0.88rem' }}>
            <Sparkles size={16} style={{ color: 'var(--primary, #0f766e)' }} />
            <span>Active in Current MVP Launch:</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted, #475569)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
              <span>AI Health Report Analyzer</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
              <span>AI Clinical Chatbot</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
              <span>Health ID & Profile</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
              <span>Digital Health Records</span>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light, #94a3b8)', marginTop: '4px', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
            Roadmap Notice: {details.timeline}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          marginTop: '6px'
        }}>
          <Button
            onClick={() => navigate('/patient/dashboard')}
            style={{
              padding: '12px 24px',
              fontWeight: 800,
              fontSize: '0.92rem',
              borderRadius: '12px'
            }}
          >
            Go to Patient Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/patient/ai-report-analyzer')}
            style={{
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} /> Analyze Report
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/patient/ai-assistant')}
            style={{
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={16} /> Ask AI Bot
          </Button>
        </div>
      </div>
    </div>
  );
};
