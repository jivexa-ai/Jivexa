import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Shield, BookOpen, Clock, Heart, Users, HelpCircle, Check, Mail, Phone, MapPin, 
  Sparkles, Database, Stethoscope, Pill, Activity, ArrowRight, Zap, ChevronDown, ChevronUp, Lock
} from 'lucide-react';

// --- ABOUT PAGE ---
export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', backgroundColor: 'var(--background)', overflowX: 'hidden' }}>
      
      {/* 1. Modern Hero Section */}
      <section style={{ 
        padding: '90px 0 70px 0', 
        background: 'radial-gradient(ellipse at 50% -20%, rgba(0, 112, 243, 0.12) 0%, var(--background) 70%)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '0 24px' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            backgroundColor: 'rgba(0, 112, 243, 0.08)',
            border: '1px solid rgba(0, 112, 243, 0.2)',
            borderRadius: '100px',
            color: '#0070f3',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            <Sparkles size={14} />
            <span>THE HUMAN HEALTH OPERATING SYSTEM</span>
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: '1.12' }}>
            Healthcare, <span style={{ background: 'linear-gradient(135deg, #0070f3 0%, #0f9d58 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connected & Intelligent</span>.
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.65', maxWidth: '680px', margin: '0 auto' }}>
            JIVEXA unifies Patients, Doctors, Pharmacies, Ambulance Fleets, and National Health Vaults into one seamless, zero-friction ecosystem.
          </p>

          {/* Key Metrics Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            width: '100%',
            maxWidth: '780px',
            marginTop: '24px',
            padding: '20px',
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0070f3' }}>24 / 7</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>AI Health Triage</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f9d58' }}>100%</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>ABHA Vault Sync</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ea4335' }}>&lt; 3 Min</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Emergency Radar</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f4b400' }}>5 Roles</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>1 Unified OS</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
            <Button size="lg" onClick={() => navigate('/signup')} style={{ gap: '8px', padding: '0 28px', height: '48px', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px' }}>
              Launch JIVEXA App <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/how-it-works')} style={{ padding: '0 24px', height: '48px', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px' }}>
              See How It Works
            </Button>
          </div>

        </div>
      </section>

      {/* 2. Core Capabilities & Human Design */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '50px' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: '#0070f3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Core Principles</span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>Engineered for Clarity & Speed</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              We stripped away complex medical jargon and fragmented apps to create a clean, human-first health experience.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="grid-3-mobile">
            
            {/* Card 1 */}
            <div style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 112, 243, 0.1)', color: '#0070f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>24/7 AI Neural Triage</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                Instant symptom risk scoring powered by deterministic, zero-hallucination multi-model AI trained on evidence-based medicine.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(15, 157, 88, 0.1)', color: '#0f9d58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>ABHA Digital Health Vault</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                100% interoperable 14-digit national health records. Carry your entire medical history securely in one encrypted place.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(234, 67, 53, 0.1)', color: '#ea4335', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Pre-Hospital ICU Telemetry</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                Emergency ambulance fleet dispatch streaming patient vitals directly to hospital ICUs before the ambulance arrives.
              </p>
            </div>

            {/* Card 4 */}
            <div style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(244, 180, 0, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Verified Doctor Consults</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                Direct access to top specialists with digital prescription issuance, consultation summaries, and follow-up tracking.
              </p>
            </div>

            {/* Card 5 */}
            <div style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Live Pharmacy Stock Sync</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                Check real-time medicine availability across local pharmacies and order verified prescriptions with 1-tap fulfillment.
              </p>
            </div>

            {/* Card 6 */}
            <div style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 112, 243, 0.1)', color: '#0070f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Bank-Grade Security</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                JWT token authorization, Bcrypt salted password security, and strict field-level Zod credential validations.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Call to Action Banner */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>JOIN THE MOVEMENT</span>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1.15, color: '#ffffff' }}>
            Experience the Future of Digital Health Today
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Get started in less than 30 seconds with 1,000 free AI health tokens.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} style={{ marginTop: '10px', height: '50px', padding: '0 32px', fontSize: '1rem', fontWeight: 700, backgroundColor: '#0070f3', color: '#ffffff', borderRadius: '10px' }}>
            Get Started Free <ArrowRight size={18} />
          </Button>
        </div>
      </section>

    </div>
  );
};

// --- HOW IT WORKS PAGE ---
export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', backgroundColor: 'var(--background)', overflowX: 'hidden' }}>
      
      {/* Hero */}
      <section style={{ 
        padding: '80px 0 60px 0', 
        background: 'radial-gradient(ellipse at 50% -20%, rgba(15, 157, 88, 0.12) 0%, var(--background) 70%)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '0 24px' }}>
          <span style={{ fontSize: '0.8rem', color: '#0f9d58', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Workflow Guide</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: '1.15' }}>
            How JIVEXA Connects <span style={{ color: '#0f9d58' }}>Your Entire Healthcare Journey</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.6' }}>
            From pre-hospital AI triage to pharmacy fulfillment and ABHA record sync—everything works in perfect harmony.
          </p>
        </div>
      </section>

      {/* Interactive Step-by-Step Flow */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Step 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#0070f3', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
              01
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>24/7 AI Triage & Lab PDF Analysis</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '1.02rem', margin: 0 }}>
                Ask any health question or upload a lab report PDF. Our multi-model Groq AI server extracts key clinical parameters and delivers instant, evidence-based guidance.
              </p>
            </div>
          </div>

          <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--border)', marginLeft: '31px' }} />

          {/* Step 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#0f9d58', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
              02
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Book Verified Doctor Consultations</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '1.02rem', margin: 0 }}>
                Connect with certified cardiologists, dermatologists, pediatricians, and general physicians for in-person or video consultations with digital prescription issuance.
              </p>
            </div>
          </div>

          <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--border)', marginLeft: '31px' }} />

          {/* Step 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#ea4335', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
              03
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Emergency Ambulance GPS Radar</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '1.02rem', margin: 0 }}>
                In critical emergencies, request instant dispatch. Live ambulance GPS radar streams your vitals to the receiving hospital ICU before arrival.
              </p>
            </div>
          </div>

          <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--border)', marginLeft: '31px' }} />

          {/* Step 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#f4b400', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
              04
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Pharmacy Fulfillment & ABHA Health Vault</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '1.02rem', margin: 0 }}>
                Fulfill digital prescriptions at partner pharmacies with live stock checks, and automatically sync your records to your 14-digit national ABHA Health Vault.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

// --- FOR DOCTORS PAGE ---
export const ForDoctors: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '40px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#0070f3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clinical Workspace</span>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)' }}>Empowering Doctors with Smart Triage & Digital Workflows</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '640px', margin: '0 auto' }}>
          Manage patient queues, view AI-summarized lab reports, issue digital prescriptions, and access ABHA longitudinal records in seconds.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Button size="lg" onClick={() => navigate('/signup')} style={{ height: '48px', padding: '0 28px', fontWeight: 700 }}>
            Register as Doctor
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/login')} style={{ height: '48px', padding: '0 28px', fontWeight: 700 }}>
            Doctor Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- FOR PHARMACIES PAGE ---
export const ForPharmacies: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '40px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#0f9d58', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pharmacy Portal</span>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)' }}>Streamline Prescription Orders & Medicine Inventory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '640px', margin: '0 auto' }}>
          Receive verified digital prescription orders, update live stock inventory, and fulfill patient medicine deliveries effortlessly.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Button size="lg" onClick={() => navigate('/signup')} style={{ height: '48px', padding: '0 28px', fontWeight: 700, backgroundColor: '#0f9d58' }}>
            Register Pharmacy
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/login')} style={{ height: '48px', padding: '0 28px', fontWeight: 700 }}>
            Pharmacy Login
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- FAQS PAGE ---
export const FAQs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      q: 'What is JIVEXA Health OS?',
      a: 'JIVEXA Health OS is an integrated digital health platform connecting Patients, Doctors, Pharmacies, Ambulance Partners, and Admins into 1 unified ecosystem with 24/7 AI health triage and ABHA Vault sync.'
    },
    {
      q: 'How does the 24/7 JIVEXA AI Health Bot work?',
      a: 'Our AI engine runs live Groq multi-model failover with deterministic temperature (0.0) safety guardrails. It answers medical queries, analyzes uploaded lab PDFs, and guides platform navigation for free.'
    },
    {
      q: 'Are my health records secure?',
      a: 'Yes. All data is encrypted and synced with National ABHA 14-digit Health Vault standards. You retain full control over doctor access permissions.'
    },
    {
      q: 'How does the Emergency Ambulance Radar work?',
      a: 'In emergencies, JIVEXA dispatches nearest available GPS ambulances and streams pre-arrival vitals directly to receiving hospital ICU dashboards.'
    }
  ];

  return (
    <div style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#0070f3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Help Center</span>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--text-main)' }}>Frequently Asked Questions</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqItems.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px 24px',
                backgroundColor: openIndex === idx ? 'var(--surface-raised)' : 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{item.q}</h3>
                {openIndex === idx ? <ChevronUp size={20} style={{ color: '#0070f3' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />}
              </div>
              {openIndex === idx && (
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.6', margin: '12px 0 0 0' }}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FAQ = FAQs;

// --- CONTACT PAGE ---
export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#0070f3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Get In Touch</span>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--text-main)' }}>We'd Love to Hear From You</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Have questions about JIVEXA Health OS? Our team is available 24/7.</p>
        </div>

        <Card style={{ padding: '36px', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(15, 157, 88, 0.1)', color: '#0f9d58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Message Received!</h3>
              <p style={{ color: 'var(--text-muted)' }}>Thank you for reaching out. A team member will respond shortly.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Full Name" placeholder="John Doe" required />
              <Input label="Email Address" type="email" placeholder="user@domain.com" required />
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Message</label>
                <textarea 
                  rows={4} 
                  placeholder="How can we help you?" 
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.95rem' }}
                />
              </div>
              <Button type="submit" size="lg" style={{ height: '48px', fontWeight: 700, marginTop: '8px' }}>
                Send Message
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export const Resources: React.FC = () => (
  <div style={{ padding: '80px 0', textAlign: 'center', backgroundColor: 'var(--background)' }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)' }}>JIVEXA Resources & Guides</h1>
    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '12px' }}>Explore healthcare articles, ABHA health ID integration docs, and clinical guides.</p>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <div style={{ padding: '80px 0', maxWidth: '800px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', backgroundColor: 'var(--background)', color: 'var(--text-main)' }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px' }}>Privacy Policy</h1>
    <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
      At JIVEXA Health OS, your health privacy and medical record security are fundamental. We encrypt all patient data and adhere strictly to national ABHA data protection standards.
    </p>
  </div>
);

export const Terms: React.FC = () => (
  <div style={{ padding: '80px 0', maxWidth: '800px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', backgroundColor: 'var(--background)', color: 'var(--text-main)' }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px' }}>Terms of Service</h1>
    <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
      By using JIVEXA Health OS, you agree to our platform terms. JIVEXA provides AI-assisted clinical triage and ecosystem connection, but does not replace direct clinical emergency diagnosis.
    </p>
  </div>
);

export const Disclaimer: React.FC = () => (
  <div style={{ padding: '80px 0', maxWidth: '800px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', backgroundColor: 'var(--background)', color: 'var(--text-main)' }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px' }}>Medical Disclaimer</h1>
    <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
      JIVEXA Health AI Bot and PDF Analyzer provide simulated evidence-based health guidance. In case of life-threatening emergencies, always dial local emergency response services immediately.
    </p>
  </div>
);

