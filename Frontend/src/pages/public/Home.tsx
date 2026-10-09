import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Heart, MessageSquare, Clipboard, Calendar, Pill,
  Activity, Shield, ArrowRight, UserCheck, Stethoscope,
  CheckCircle, AlertCircle, Sparkles, Cpu, Lock, Eye,
  Database, RefreshCw, Star, Zap, Check, Users, FileText,
} from 'lucide-react';

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Section Reveal Wrapper ────────────────────────────────────────────────────
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className = ''
}) => {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export const Home: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // ── Auth routing ──────────────────────────────────────────────────────────
  const handleGetStarted = () => {
    if (isAuthenticated) {
      const routes = {
        PATIENT: '/patient/dashboard',
        DOCTOR: '/doctor/dashboard',
        PHARMACY: '/pharmacy/dashboard',
        ADMIN: '/admin/dashboard',
        AMBULANCE_PARTNER: '/ambulance/dashboard'
      };
      navigate(routes[role!] || '/patient/dashboard');
    } else {
      navigate('/signup');
    }
  };

  // ── Patient journey interactive state ────────────────────────────────────
  const journeySteps = [
    {
      id: 'profile',
      label: 'Health Profile',
      icon: <FileText size={20} />,
      desc: 'Securely store allergies, conditions, medications, and lab documents in your personal Health Vault.',
      preview: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Allergies on record</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>3 flags</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Uploaded documents</span>
            <span style={{ fontWeight: 700 }}>4 files</span>
          </div>
          <div style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: '80%', height: '100%', backgroundColor: 'var(--primary)' }} />
          </div>
        </div>
      ),
    },
    {
      id: 'ai',
      label: 'JIVEXA AI',
      icon: <Sparkles size={20} />,
      desc: 'AI analyzes your health context, flags risks, and helps you understand your health data more clearly.',
      preview: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--surface-raised)', padding: '7px 11px', borderRadius: '10px 10px 10px 0', fontSize: '0.78rem', color: 'var(--text-main)' }}>Is my HbA1c reading normal?</div>
          <div style={{ alignSelf: 'flex-end', backgroundColor: 'var(--primary-light)', padding: '7px 11px', borderRadius: '10px 10px 0 10px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>6.8% is in the diabetic range. Let me explain what this means for you...</div>
        </div>
      ),
    },
    {
      id: 'doctor',
      label: 'Doctor',
      icon: <Stethoscope size={20} />,
      desc: 'Find and connect with verified healthcare professionals. Share your health context securely before your consultation.',
      preview: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Stethoscope size={14} style={{ color: 'var(--secondary)' }} /></div>
            <div><div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Dr. Sharma</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cardiologist · Available Today</div></div>
          </div>
          <span style={{ fontSize: '0.72rem', padding: '3px 8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', width: 'max-content', fontWeight: 700 }}>Appointment Confirmed</span>
        </div>
      ),
    },
    {
      id: 'prescription',
      label: 'Digital Prescription',
      icon: <FileText size={20} />,
      desc: 'Your doctor issues a verified digital prescription directly to your JIVEXA dashboard.',
      preview: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700 }}>Amoxicillin 500mg</span>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 700 }}>Active</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>3x daily · 7 days · Dr. Sharma</div>
        </div>
      ),
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: <Pill size={20} />,
      desc: 'Share your prescription with a participating pharmacy. Track your order from confirmation to fulfillment.',
      preview: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Fulfillment Status</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['Confirmed', 'Preparing', 'Ready'].map((s, i) => (
              <span key={s} style={{ fontSize: '0.68rem', padding: '3px 7px', backgroundColor: i < 2 ? 'var(--primary-light)' : 'var(--border)', color: i < 2 ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '4px', fontWeight: 700 }}>{s}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'care',
      label: 'Connected Care',
      icon: <Heart size={20} />,
      desc: 'Your complete healthcare journey — from understanding your health to connected care — in one place.',
      preview: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {['Health Profile', 'AI Insights', 'Doctor', 'Prescription', 'Pharmacy'].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
              <Check size={12} style={{ color: 'var(--primary)' }} />
              <span style={{ color: 'var(--text-muted)' }}>{s}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];
  const [activeJourney, setActiveJourney] = useState(0);

  // ── Ecosystem hover state ─────────────────────────────────────────────────
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const ecoNodes: { id: string; label: string; desc: string; icon: React.ReactNode; x: string; y: string }[] = [
    { id: 'patient', label: 'Patient', desc: 'Manage your health profile, access AI insights, connect with doctors, and track prescriptions.', icon: <Heart size={20} />, x: '50%', y: '5%' },
    { id: 'ai', label: 'JIVEXA AI', desc: 'Intelligent hub connecting all stakeholders — analyzing health data, routing care, and providing insights.', icon: <Sparkles size={20} />, x: '50%', y: '42%' },
    { id: 'doctor', label: 'Doctor', desc: 'Build a digital practice, manage appointments, access patient context, and issue digital prescriptions.', icon: <Stethoscope size={20} />, x: '12%', y: '78%' },
    { id: 'pharmacy', label: 'Pharmacy', desc: 'Receive structured prescriptions, manage fulfillment orders, and stay connected with patients.', icon: <Pill size={20} />, x: '88%', y: '78%' },
  ];

  // ── AI chat simulator ─────────────────────────────────────────────────────
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const [simulatedMessages, setSimulatedMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am Jivexa AI. Select one of the parameters below to see how I analyze clinical parameters and guidelines.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    {
      title: 'Review Dosage Guidelines',
      prompt: 'What is the recommended pediatric dosage adjustment for Amoxicillin 250mg in cases of mild renal impairment?',
      response: 'Based on Clinical Guidelines (Section 4.2), pediatric patients with mild renal impairment (GFR 10-30 mL/min) should receive 15mg/kg every 12 hours, rather than the standard 8-hour dosing, to optimize clearance rates. Always verify with your consulting pediatrician.',
    },
    {
      title: 'Interpret Lab Markers',
      prompt: 'Can you explain a HbA1c result of 6.8% and suggest next diagnostic questions?',
      response: 'A HbA1c of 6.8% indicates average blood glucose levels in the diabetic range (pre-diabetes is 5.7%-6.4%). I suggest scheduling a fasting blood glucose test and consulting a dietitian. Recommended follow-up question for your doctor: \'Is metformin or lifestyle adjustment preferred at this baseline?\'',
    },
    {
      title: 'Check Drug Interactions',
      prompt: 'Are there any contraindications between Cetirizine 10mg and prescription bronchodilators?',
      response: 'No severe clinical contraindications exist between Cetirizine (second-generation antihistamine) and standard beta-2 bronchodilators (e.g., Albuterol). However, monitor for increased dry mouth or mild drowsiness. Please link your active Jivexa prescription history to confirm no overlaps.',
    },
  ];

  const handlePromptClick = (index: number) => {
    if (isTyping) return;
    setActivePrompt(index);
    const selected = samplePrompts[index];
    setSimulatedMessages((prev) => [...prev, { sender: 'user', text: selected.prompt }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setSimulatedMessages((prev) => [...prev, { sender: 'ai', text: selected.response }]);
    }, 1400);
  };

  const clearChat = () => {
    setActivePrompt(null);
    setSimulatedMessages([{ sender: 'ai', text: 'Hello! I am Jivexa AI. Select one of the parameters below to see how I analyze clinical parameters and guidelines.' }]);
  };

  // ── Doctor features ───────────────────────────────────────────────────────
  const doctorFeatures = [
    { icon: <Users size={22} />, title: 'Reach More Patients', desc: 'Build a professional digital presence and become discoverable to patients searching by specialty, location, and availability.' },
    { icon: <Clipboard size={22} />, title: 'Digital Practice', desc: 'Manage appointments, consultations, patient information, and digital prescriptions through one connected workspace.' },
    { icon: <Sparkles size={22} />, title: 'Intelligent Patient Context', desc: 'Review relevant patient information shared with consent, helping you understand health context more efficiently.' },
    { icon: <Zap size={22} />, title: 'Simplified Workflow', desc: 'Reduce administrative friction and spend more time focused on delivering quality patient care.' },
  ];

  // ── Pharmacy features ─────────────────────────────────────────────────────
  const pharmacyFeatures = [
    { icon: <FileText size={20} />, title: 'Digital Prescription Flow', desc: 'Receive structured prescriptions with clear medication information — no handwriting ambiguity.' },
    { icon: <Clipboard size={20} />, title: 'Order Management', desc: 'Manage prescription requests and order status from one organized pharmacy dashboard.' },
    { icon: <Database size={20} />, title: 'Inventory Visibility', desc: 'Track medicine availability and update stock information efficiently.' },
    { icon: <RefreshCw size={20} />, title: 'Connected Fulfillment', desc: 'Keep patients informed throughout the fulfillment journey with real-time status updates.' },
  ];
  const pharmacyFlow = ['Doctor', 'Digital Rx', 'JIVEXA', 'Pharmacy', 'Confirmed', 'Preparing', 'Ready', 'Dispatched'];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', overflowX: 'hidden' }}>

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="hero-section" style={{ position: 'relative', padding: '100px 0', overflow: 'hidden', background: 'radial-gradient(circle at 80% 20%, var(--primary-light) 0%, var(--background) 60%)' }}>
        <div className="container grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '60px', alignItems: 'center' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', zIndex: 10 }}>
            <div className="hero-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '6px 16px', width: 'max-content', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'inline-block' }} className="pulse-dot" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next-Gen AI HealthTech Platform</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: '3.6rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
              Healthcare Works Better <br />
              <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>When It's Connected</span>.
            </h1>

            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.65', maxWidth: '660px' }}>
              Jivexa Health brings patients, healthcare professionals, pharmacies, and intelligent technology together to create a simpler, more connected healthcare experience.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={handleGetStarted}
                className="btn-primary-hero"
                style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              >
                Get Started <ArrowRight size={18} />
              </button>
              <Link
                to="/how-it-works"
                className="btn-secondary-hero"
                style={{ border: '1px solid var(--border)', color: 'var(--text-main)', backgroundColor: 'var(--surface)', padding: '16px 32px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', transition: 'background-color 0.2s ease' }}
              >
                Join the Ecosystem
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '8px' }}>
              <AlertCircle size={14} className="color-secondary" />
              <span>AI assistance for informational support. Always consult a qualified healthcare professional.</span>
            </div>
          </div>

          {/* Hero visual */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '480px' }} className="hero-visual-container">
            <div style={{ position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: 1 }} className="pulse-slow" />

            <svg viewBox="0 0 200 200" style={{ width: '220px', height: '220px', zIndex: 3, position: 'absolute', left: '10%', bottom: '15%' }} className="doctor-breath">
              <path d="M40 180 C 40 140, 60 120, 100 120 C 140 120, 160 140, 160 180" fill="var(--primary)" opacity="0.15" />
              <path d="M60 180 L 140 180 L 120 135 L 80 135 Z" fill="white" stroke="var(--border)" strokeWidth="3" />
              <path d="M80 135 L 100 160 L 120 135" fill="none" stroke="var(--primary)" strokeWidth="2.5" />
              <path d="M100 160 L 100 180" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="3 2" />
              <path d="M85 125 C 85 145, 115 145, 115 125" fill="none" stroke="var(--secondary)" strokeWidth="3" />
              <path d="M100 145 L 100 155" fill="none" stroke="var(--secondary)" strokeWidth="3" />
              <circle cx="100" cy="157" r="5" fill="var(--secondary)" />
              <circle cx="100" cy="90" r="28" fill="#fcecdb" stroke="var(--border)" strokeWidth="2" />
              <path d="M75 90 C 75 75, 125 75, 125 90" fill="none" stroke="var(--primary)" strokeWidth="2" />
              <rect x="85" y="85" width="12" height="8" rx="2" fill="none" stroke="var(--text-main)" strokeWidth="2" />
              <rect x="103" y="85" width="12" height="8" rx="2" fill="none" stroke="var(--text-main)" strokeWidth="2" />
              <line x1="97" y1="89" x2="103" y2="89" stroke="var(--text-main)" strokeWidth="2" />
              <path d="M140 180 C 150 165, 165 155, 175 158" fill="none" stroke="var(--border)" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="175" cy="158" r="4" fill="var(--primary)" className="pulse-dot" />
            </svg>

            <div className="floating-card-1" style={{ position: 'absolute', right: '5%', top: '12%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 4, width: '180px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={16} style={{ color: 'var(--primary)' }} className="pulse-slow" /></div>
              <div><span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>AI Connected</span><h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Health Vault Active</h4></div>
            </div>

            <div className="floating-card-2" style={{ position: 'absolute', right: '15%', bottom: '10%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 4, width: '190px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={16} style={{ color: 'var(--secondary)' }} /></div>
              <div><span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Rx Issued</span><h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Pharmacy Notified</h4></div>
            </div>

            <div className="floating-card-3" style={{ position: 'absolute', left: '5%', top: '18%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-md)', zIndex: 4 }}>
              <Sparkles size={16} style={{ color: 'var(--secondary)' }} className="pulse-slow" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>JIVEXA AI Active</span>
            </div>

            <div style={{ position: 'absolute', right: '12%', top: '30%', width: '230px', height: '155px', border: '1.5px dashed var(--secondary)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface)', backdropFilter: 'blur(4px)', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '16px' }} className="holo-panel">
              <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connected Ecosystem</span>
              <div style={{ width: '100%', height: '60px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} className="pulse-dot" />
                <div style={{ position: 'absolute', left: '20%', top: '30%', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
                <div style={{ position: 'absolute', right: '20%', top: '70%', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
                <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                  <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3 2" />
                  <line x1="80%" y1="70%" x2="50%" y2="50%" stroke="var(--secondary)" strokeWidth="1" strokeDasharray="3 2" />
                </svg>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Patient · Doctor · Pharmacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PATIENT JOURNEY ──────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', maxWidth: '660px', margin: '0 auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>For Patients</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px', color: 'var(--text-main)' }}>Your Health, Connected.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '12px' }}>
                From your first health record to pharmacy fulfillment — Jivexa Health connects every step of your care journey.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '40px', alignItems: 'start' }} className="grid-2-mobile">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {journeySteps.map((step, i) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setActiveJourney(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                      borderRadius: 'var(--radius-md)', border: '1.5px solid',
                      borderColor: activeJourney === i ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: activeJourney === i ? 'var(--primary-light)' : 'var(--surface)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                      boxShadow: activeJourney === i ? '0 2px 12px rgba(13,148,136,0.12)' : 'none',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: activeJourney === i ? 'var(--primary)' : 'var(--primary-light)', color: activeJourney === i ? 'white' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease' }}>
                      {step.icon}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: activeJourney === i ? 'var(--primary)' : 'var(--text-main)' }}>{step.label}</span>
                  </button>
                  {i < journeySteps.length - 1 && (
                    <div style={{ width: '2px', height: '16px', backgroundColor: 'var(--border)', margin: '0 26px' }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-md)', minHeight: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {journeySteps[activeJourney].icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{journeySteps[activeJourney].label}</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.65' }}>{journeySteps[activeJourney].desc}</p>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>Preview</span>
                {journeySteps[activeJourney].preview}
              </div>
              <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Create Your Health Profile <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. DOCTOR SECTION ───────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>For Healthcare Professionals</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px', color: 'var(--text-main)' }}>Your Practice, Reimagined.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '12px' }}>
                Smarter tools to help healthcare professionals focus on patients, grow their digital presence, and simplify everyday workflows.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }} className="grid-2-mobile">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {doctorFeatures.map((f, i) => (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="eco-card" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', gap: '18px' }} className="doctor-breath">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Stethoscope size={22} style={{ color: 'var(--secondary)' }} /></div>
                  <div><h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Dr. Priya Agarwal</h4><span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Cardiologist · JIVEXA Verified</span></div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '3px 8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 700 }}>Active</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Patient Summary', value: 'Rahul M · HbA1c 6.8%', badge: 'Reviewed', color: 'var(--primary)' },
                    { label: 'Next Appointment', value: '10:30 AM — Today', badge: 'Confirmed', color: 'var(--success)' },
                    { label: 'Digital Prescription', value: 'Metformin 500mg · Issued', badge: 'Sent to Rx', color: 'var(--secondary)' },
                  ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="float-particle-1">
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700 }}>{row.label}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{row.value}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', padding: '3px 10px', backgroundColor: 'var(--primary-light)', color: row.color, borderRadius: '4px', fontWeight: 700 }}>{row.badge}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                  <Sparkles size={14} style={{ color: 'var(--primary)' }} className="pulse-slow" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)' }}>AI Clinical Assistant Active</span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div style={{ textAlign: 'center' }}>
              <Link to="/signup" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '14px 28px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 14px rgba(13,148,136,0.3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Join JIVEXA as a Healthcare Professional <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 4. AI CHAT SIMULATOR ────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <div className="container grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Reveal>
              <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Conversational AI Engine</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginTop: '8px' }}>Personalized Clinical Context On Demand</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginTop: '12px' }}>
                Jivexa AI interprets lab diagnostics, highlights severe allergen risks, and breaks down medication instructions into readable steps.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Symptom and medication analysis guidelines', 'Allergy checks cross-referenced with your history', 'Full control—your data is locked and private'].map((t) => (
                  <div key={t} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={14} /></div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{t}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div>
            <div className="card chat-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column', height: '420px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={16} /></div>
                  <div><h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Jivexa Clinical Assistant</h4><span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>AI Sandbox Mode</span></div>
                </div>
                <button onClick={clearChat} style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>Clear Thread</button>
              </div>
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }} className="chat-thread-container">
                {simulatedMessages.map((msg, index) => (
                  <div key={index} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--surface-raised)', color: msg.sender === 'user' ? 'white' : 'var(--text-main)', padding: '12px 16px', borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0', fontSize: '0.88rem', lineHeight: '1.5', boxShadow: 'var(--shadow-sm)', textAlign: 'left' }}>
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--surface-raised)', padding: '12px 20px', borderRadius: '12px 12px 12px 0', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} className="typing-dot-1" />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} className="typing-dot-2" />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} className="typing-dot-3" />
                  </div>
                )}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '16px', backgroundColor: 'var(--surface-raised)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose simulated query to run:</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {samplePrompts.map((p, idx) => (
                    <button key={idx} onClick={() => handlePromptClick(idx)} disabled={isTyping} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: activePrompt === idx ? 'var(--primary-light)' : 'var(--surface)', color: activePrompt === idx ? 'var(--primary)' : 'var(--text-main)', border: '1px solid var(--border)', fontSize: '0.78rem', fontWeight: 600, cursor: isTyping ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}>
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. PHARMACY SECTION ─────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>For Pharmacy Partners</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px', color: 'var(--text-main)' }}>The Smarter Way to Fulfill Healthcare.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '12px' }}>
                Connect with patients and healthcare professionals through a more structured, digital prescription and fulfillment experience.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }} className="grid-2-mobile">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {pharmacyFeatures.map((f, i) => (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="eco-card" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={100}>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fulfillment Flow</span>
                {pharmacyFlow.map((step, i) => (
                  <React.Fragment key={step}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: i < 4 ? 'var(--primary)' : 'var(--primary-light)', color: i < 4 ? 'white' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                        {i < 4 ? <Check size={12} /> : i - 3}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: i < 4 ? 700 : 600, color: i < 4 ? 'var(--text-main)' : 'var(--text-muted)' }}>{step}</span>
                      {i < 4 && <span style={{ marginLeft: 'auto', fontSize: '0.68rem', padding: '2px 8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 700 }}>Active</span>}
                    </div>
                    {i < pharmacyFlow.length - 1 && (
                      <div style={{ width: '2px', height: '10px', backgroundColor: i < 3 ? 'var(--primary)' : 'var(--border)', margin: '0 13px' }} className={i < 3 ? 'flow-line-active' : ''} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div style={{ textAlign: 'center' }}>
              <Link to="/signup?role=PHARMACY" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '14px 28px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 14px rgba(13,148,136,0.3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Become a JIVEXA Pharmacy Partner <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 6. JIVEXA AI ECOSYSTEM DIAGRAM ──────────────────────────────────── */}
      <section style={{ padding: '100px 0', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', maxWidth: '660px', margin: '0 auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>The Connected Ecosystem</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px', color: 'var(--text-main)' }}>One Platform. One Connected Healthcare Journey.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '12px' }}>
                Hover over each node to understand how JIVEXA connects every stakeholder in the healthcare journey.
              </p>
            </div>
          </Reveal>

          <div style={{ position: 'relative', width: '100%', maxWidth: '720px', margin: '0 auto', height: '420px' }}>
            <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
              <line x1="50%" y1="13%" x2="50%" y2="46%" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 4" className="eco-line" />
              <line x1="45%" y1="54%" x2="16%" y2="82%" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 4" className="eco-line" />
              <line x1="55%" y1="54%" x2="84%" y2="82%" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 4" className="eco-line" />
              <line x1="20%" y1="90%" x2="80%" y2="90%" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>

            {ecoNodes.map((node) => (
              <div
                key={node.id}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: node.id === 'ai' ? '110px' : '100px',
                  padding: '16px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: activeNode === node.id ? 'var(--primary)' : 'white',
                  border: `1.5px solid ${activeNode === node.id ? 'var(--primary)' : 'var(--border)'}`,
                  boxShadow: activeNode === node.id ? '0 0 24px rgba(13,148,136,0.35)' : 'var(--shadow-md)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: activeNode === node.id ? 'rgba(255,255,255,0.25)' : 'var(--primary-light)', color: activeNode === node.id ? 'white' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {node.id === 'ai' ? <span className="pulse-slow">{node.icon}</span> : node.icon}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: activeNode === node.id ? 'white' : 'var(--text-main)' }}>{node.label}</span>
                </div>
                {activeNode === node.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 10px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--text-main)',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    lineHeight: '1.5',
                    width: '200px',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 20,
                    pointerEvents: 'none',
                  }}>
                    {node.desc}
                    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid var(--text-main)` }} />
                  </div>
                )}
              </div>
            ))}

            <div style={{ position: 'absolute', bottom: '2%', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', padding: '5px 14px', backgroundColor: 'var(--primary-light)', borderRadius: '4px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
              Connected Care
            </div>

            <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-50%)', zIndex: 0 }}>
              <div className="hub-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FEATURES GRID ────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Platform Capabilities</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>Everything You Need in One Ecosystem</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '12px' }}>
                Comprehensive tools for every stakeholder in the connected healthcare journey.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }} className="grid-3-mobile">
            {[
              { icon: <Sparkles size={22} />, color: 'primary', title: 'JIVEXA Health AI Bot', desc: 'Interpret lab diagnostics, understand medications, and access health context powered by intelligent AI.' },
              { icon: <UserCheck size={22} />, color: 'primary', title: 'Patient Health Vault', desc: 'Securely store and manage your health documents, prescriptions, conditions, and medical history.' },
              { icon: <Stethoscope size={22} />, color: 'secondary', title: 'Doctor Tools', desc: 'Digital profiles, appointment management, patient context, and digital prescriptions in one place.' },
              { icon: <Pill size={22} />, color: 'warning', title: 'Pharmacy Management', desc: 'Structured prescription intake, order fulfillment tracking, and inventory management.' },
              { icon: <Activity size={22} />, color: 'primary', title: 'Smart Health Insights', desc: 'AI-powered analysis helping you understand your health data and track your health journey over time.' },
              { icon: <Shield size={22} />, color: 'primary', title: 'Privacy by Design', desc: 'End-to-end encryption, consent-based data sharing, and role-based access control for all health data.' },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 70}>
                <div className="feature-card-redesign" style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--surface)', padding: '28px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', transition: 'all 0.3s ease', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: `var(--${card.color}-light)`, color: `var(--${card.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{card.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. TRUST & SECURITY ─────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)' }}>
        <div className="container grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Privacy & Security</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.15' }}>Privacy First. Guaranteed Protection.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.65' }}>
                We implement comprehensive security standards to ensure patient medical data is fully secure and accessible only to those with proper authorization.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '12px' }} className="grid-2-mobile">
                {[
                  { icon: <Shield size={18} />, title: 'Security First', body: 'Strict data protection standards for personal health records.' },
                  { icon: <Lock size={18} />, title: 'Encrypted Sync', body: 'End-to-end encryption in transit and database structures.' },
                  { icon: <Eye size={18} />, title: 'Consent-Based', body: 'Patients control exactly what data is shared and with whom.' },
                  { icon: <CheckCircle size={18} />, title: 'Role-Based Access', body: 'Verified access controls for patients, doctors, and pharmacies.' },
                ].map((item) => (
                  <div key={item.title} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--primary)' }}>{item.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.title}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '360px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pulse-slow">
                  <Lock size={28} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>Jivexa Security Engine</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.6' }}>
                    Authentication flows processed securely via enterprise JWT claim tokens and MongoDB persistence, verifying identities before loading any health data.
                  </p>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', textTransform: 'uppercase' }}>Secure SSL Handshake</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 9. FINAL CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: 'radial-gradient(circle at center, var(--primary-light) 0%, var(--background) 100%)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '720px', margin: '0 auto', padding: '0 var(--space-md)' }}>
          <Reveal>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>The Future of Connected Care</span>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-main)', marginTop: '8px' }}>
              Healthcare Works Better<br />
              <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>When It's Connected</span>.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.65', marginTop: '8px' }}>
              JIVEXA brings patients, healthcare professionals, pharmacies, and intelligent technology together to create a simpler, more connected healthcare experience.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
              <button
                onClick={handleGetStarted}
                style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer', fontSize: '1.05rem', boxShadow: '0 4px 14px rgba(13,148,136,0.3)', transition: 'transform 0.2s ease' }}
              >
                Get Started
              </button>
              <Link
                to="/how-it-works"
                style={{ border: '1px solid var(--border)', color: 'var(--text-main)', backgroundColor: 'var(--surface)', padding: '16px 32px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1.05rem', boxShadow: 'var(--shadow-sm)', transition: 'background-color 0.2s ease', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              >
                Join the JIVEXA Ecosystem
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STYLES ──────────────────────────────────────────────────────────── */}
      <style>{`
        .pulse-dot { animation: pulse 1.8s infinite ease-in-out; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.6; } }
        .pulse-slow { animation: pulse 3s infinite ease-in-out; }

        .hero-visual-container { animation: float 5s infinite ease-in-out; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .feature-card-redesign:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--primary) !important; }
        .eco-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md) !important; }

        .hub-pulse {
          position: absolute; width: 130px; height: 130px; border-radius: 50%;
          border: 2px solid var(--primary-light); left: 50%; top: 50%;
          transform: translate(-50%, -50%) scale(1); animation: hubPulse 2.5s infinite ease-out; opacity: 0.8; z-index: 1;
        }
        @keyframes hubPulse { to { transform: translate(-50%, -50%) scale(1.8); opacity: 0; } }

        .eco-line { animation: dashMove 2s linear infinite; }
        @keyframes dashMove { to { stroke-dashoffset: -20; } }

        .flow-line-active { background: linear-gradient(to bottom, var(--primary), var(--secondary)); animation: flowPulse 1.5s ease-in-out infinite; }
        @keyframes flowPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        @keyframes dots { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .typing-dot-1 { animation: dots 1.2s infinite ease-in-out; }
        .typing-dot-2 { animation: dots 1.2s infinite ease-in-out 0.2s; }
        .typing-dot-3 { animation: dots 1.2s infinite ease-in-out 0.4s; }

        .doctor-breath { animation: breath 5s ease-in-out infinite; }
        @keyframes breath { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

        .floating-card-1 { animation: float-c1 6s ease-in-out infinite; }
        @keyframes float-c1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .floating-card-2 { animation: float-c2 5s ease-in-out infinite 0.7s; }
        @keyframes float-c2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        .floating-card-3 { animation: float-c3 7s ease-in-out infinite 0.3s; }
        @keyframes float-c3 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-4px,4px); } }

        .holo-panel { animation: holo-flicker 9s ease-in-out infinite; }
        @keyframes holo-flicker { 0%, 100% { opacity: 0.92; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }

        .float-particle-1 { animation: fp1 4s ease-in-out infinite; }
        @keyframes fp1 { 0%, 100% { transform: translate(0,0) scale(1); opacity: 0.5; } 50% { transform: translate(4px,-4px) scale(1.04); opacity: 0.85; } }

        .btn-primary-hero:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13,148,136,0.4) !important; }
        .btn-secondary-hero:hover { background-color: var(--primary-light) !important; }

        @media (prefers-reduced-motion: reduce) {
          .doctor-breath, .floating-card-1, .floating-card-2, .floating-card-3, .holo-panel,
          .float-particle-1, .hero-visual-container, .pulse-slow, .pulse-dot, .hub-pulse,
          .eco-line, .flow-line-active { animation: none !important; transform: none !important; transition: none !important; }
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem !important; }
          .hero-section { padding: 60px 0 !important; }
        }
      `}</style>
    </div>
  );
};
