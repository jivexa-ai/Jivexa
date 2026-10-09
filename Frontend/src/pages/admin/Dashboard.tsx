import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { Shield, Users, Calendar, Activity, Check, AlertOctagon, Heart, Terminal, Stethoscope } from 'lucide-react';

interface MockUserAdmin {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN';
  status: 'Active' | 'Suspended';
}

export const AdminDashboard: React.FC = () => {
  const [usersList, setUsersList] = useState<MockUserAdmin[]>([
    { id: 'usr_1', name: 'Mayank Gangwar', email: 'patient@jivexa.in', role: 'PATIENT', status: 'Active' },
    { id: 'usr_2', name: 'Dr. Anand Sen', email: 'doctor@jivexa.in', role: 'DOCTOR', status: 'Active' },
    { id: 'usr_3', name: 'Jivexa Pharmacy Hub', email: 'pharmacy@jivexa.in', role: 'PHARMACY', status: 'Active' },
    { id: 'usr_4', name: 'System Root Admin', email: 'admin@jivexa.in', role: 'ADMIN', status: 'Active' },
    { id: 'usr_5', name: 'Amit Gangwar', email: 'amit@gmail.com', role: 'PATIENT', status: 'Active' },
    { id: 'usr_6', name: 'Dr. Priya Sharma', email: 'priya@jivexa.in', role: 'DOCTOR', status: 'Active' }
  ]);

  const [toastMsg, setToastMsg] = useState('');

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' as const : 'Active' as const;
    const updated = usersList.map((u) => u.id === id ? { ...u, status: nextStatus } : u);
    setUsersList(updated);
    
    const targetUser = usersList.find((u) => u.id === id);
    setToastMsg(`User account for ${targetUser?.name} is now: ${nextStatus.toUpperCase()}`);
  };

  const securityLogs = [
    { time: '23:14:02', message: 'HIPAA Record encryption validation: PASSED', type: 'info' },
    { time: '22:45:10', message: 'Digital signature authenticated for prescription pres_1', type: 'success' },
    { time: '20:10:45', message: 'Backup synchronization completed successfully', type: 'info' },
    { time: '18:30:12', message: 'API validation test for /api/health-records: code 200', type: 'info' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Console</span>
          <h1 style={{ fontWeight: 800, marginTop: '2px' }}>Administrative Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Platform metrics, registered user audits, and compliance logs.
          </p>
        </div>
        <a 
          href="#/admin/doctors"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 24px',
            fontWeight: 800,
            fontSize: '0.9rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)'
          }}
        >
          <Stethoscope size={18} />
          Practo Doctor Verification Admin
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="grid-2-mobile">
        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>TOTAL USERS</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>{usersList.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', borderRadius: '8px' }}>
            <Calendar size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>CLINIC APPTS</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>24</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--info-light)', color: 'var(--info)', borderRadius: '8px' }}>
            <Shield size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>HIPAA STATUS</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px', color: 'var(--secondary)' }}>COMPLIANT</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--error-light)', color: 'var(--error)', borderRadius: '8px' }}>
            <Activity size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>SYS HEARTS</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px', color: 'var(--secondary)' }}>99.9%</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '32px' }} className="grid-2-mobile">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Platform Users Audit</h3>
          <div className="card" style={{ padding: 0, backgroundColor: 'white', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700 }}>User Name</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700 }}>Email Address</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700 }}>Account Role</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr key={usr.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 18px', fontWeight: 600 }}>{usr.name}</td>
                    <td style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>{usr.email}</td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{usr.role}</span>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: usr.status === 'Active' ? 'var(--secondary)' : 'var(--error)'
                      }}>
                        {usr.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      {usr.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(usr.id, usr.status)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: usr.status === 'Active' ? 'var(--error)' : 'var(--secondary)',
                            transition: 'all var(--transition-fast)'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {usr.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} />
            <span>Security logs terminal</span>
          </h3>
          <Card bodyStyle={{ backgroundColor: 'var(--text-main)', color: '#10b981', fontFamily: 'monospace', fontSize: '0.8rem', padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {securityLogs.map((log, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: '8px' }}>[{log.time}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      )}

    </div>
  );
};
