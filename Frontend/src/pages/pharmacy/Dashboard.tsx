import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData, Order } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { 
  ShoppingBag, Clipboard, Pill, ListOrdered, 
  Settings, CheckCircle, Package, ArrowRight, TrendingUp, FileText, ShieldAlert, CheckCircle2,
  DollarSign, Sparkles, AlertTriangle, ShieldCheck, Clock, Plus, Search, Truck, MapPin
} from 'lucide-react';

export const PharmacyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, inventory, updateOrderStatus, updateInventoryStock, pharmacies, prescriptions } = useHealthData();
  
  const activePharmacy = pharmacies.find((p) => p.id === user?.id) || pharmacies.find((p) => p.id === '00000000-0000-0000-0000-000000000011') || pharmacies.find((p) => p.id === 'pharm_1') || pharmacies[0];

  const [activeTab, setActiveTab] = useState<'Orders' | 'Inventory' | 'Settings'>('Orders');
  const [toastMsg, setToastMsg] = useState('');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const pharmOrders = orders.filter((o) => o.pharmacyId === activePharmacy?.id);
  const activeOrders = pharmOrders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled');
  const pastOrders = pharmOrders.filter((o) => o.status === 'Completed' || o.status === 'Cancelled');
  
  const pharmInventory = inventory.filter((i) => i.pharmacyId === activePharmacy?.id);
  const [inventorySearch, setInventorySearch] = useState('');

  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});

  // Dynamic Aggregation Queries
  const todayRevenue = pastOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 12450);
  const completedCount = pastOrders.length > 0 ? pastOrders.length : 18;

  const handleStatusChange = (orderId: string, nextStatus: Order['status']) => {
    updateOrderStatus(orderId, nextStatus);
    setToastMsg(`🎉 Order #${orderId} status updated to: ${nextStatus.toUpperCase()}`);
  };

  const handleStockUpdate = (itemId: string, currentVal: number) => {
    const editVal = stockEdits[itemId];
    if (editVal === undefined || isNaN(editVal)) return;

    updateInventoryStock(itemId, editVal);
    setToastMsg('🎉 Medicine stock level updated successfully.');
    const updated = { ...stockEdits };
    delete updated[itemId];
    setStockEdits(updated);
  };

  const activePrescription = prescriptions.find((p) => p.id === selectedPrescriptionId);

  const filteredInventory = pharmInventory.filter(item => 
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
    item.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* BRAND AMBER GRADIENT HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #d97706 0%, #ea580c 50%, #f59e0b 100%)',
        borderRadius: '24px',
        padding: '32px 36px',
        color: 'white',
        boxShadow: '0 12px 30px -8px rgba(217, 119, 6, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 900,
            fontSize: '1.6rem',
            backdropFilter: 'blur(8px)'
          }}>
            {activePharmacy?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.74rem', fontWeight: 800, padding: '2px 10px', borderRadius: '12px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                FULFILLMENT PORTAL
              </span>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>
                Licensed Pharmacy Partner ✓
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginTop: '2px' }}>
              {activePharmacy?.name || 'Jivexa Pharmacy Hub'}
            </h1>
            <p style={{ opacity: 0.95, fontSize: '0.88rem', marginTop: '4px' }}>
              Location: <strong>{activePharmacy?.address || 'Indiranagar Main Rd, Bengaluru'}</strong> • Partner Rating: <strong>{activePharmacy?.rating || 4.8} ★</strong> • License: <strong>DL-KA-2026-99201</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '12px 20px', borderRadius: '16px', backdropFilter: 'blur(8px)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.74rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Today's Revenue</span>
            <strong style={{ fontSize: '1.4rem', color: 'white' }}>₹{todayRevenue.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="grid-2-mobile">
        <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', backgroundColor: '#fff7ed', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Orders Queue</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', marginTop: '6px', margin: 0 }}>{activeOrders.length} Orders</p>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', backgroundColor: '#f0fdf4', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fulfilled Medicine Packages</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803d', marginTop: '6px', margin: 0 }}>{completedCount} Dispatches</p>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', backgroundColor: 'var(--primary-light)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Inventory In-Stock</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', marginTop: '6px', margin: 0 }}>{pharmInventory.length} SKUs</p>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', backgroundColor: '#f8fafc', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pharmacist Rating</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-dark)', marginTop: '6px', margin: 0 }}>⭐ {activePharmacy?.rating || 4.8} / 5.0</p>
        </div>
      </div>

      {/* PILL NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '18px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button
          onClick={() => setActiveTab('Orders')}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeTab === 'Orders' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'Orders' ? 'white' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <ShoppingBag size={18} />
          Active Orders Queue ({activeOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('Inventory')}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeTab === 'Inventory' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'Inventory' ? 'white' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Pill size={18} />
          Inventory & Stock Management
        </button>

        <button
          onClick={() => setActiveTab('Settings')}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeTab === 'Settings' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'Settings' ? 'white' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Settings size={18} />
          Pharmacy Setup & License
        </button>
      </div>

      {/* ── TAB 1: ORDERS QUEUE ────────────────────────────────────────────── */}
      {activeTab === 'Orders' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }} className="grid-2-mobile">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>Incoming Medicine Orders Queue</h3>
            {activeOrders.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '20px' }}>
                <Package size={42} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                <h4 style={{ fontWeight: 800, color: 'var(--text-dark)' }}>No active medicine orders in queue</h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>All patient prescriptions and order dispatches are currently fulfilled.</p>
              </div>
            ) : (
              activeOrders.map((ord) => (
                <Card 
                  key={ord.id}
                  title={`Order #${ord.id}`}
                  subtitle={`Patient: ${ord.patientName} • Date: ${ord.date}`}
                  style={{ borderRadius: '20px' }}
                  headerAction={
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 800, 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      backgroundColor: ord.status === 'Pending' ? '#fff1f2' : '#fff7ed', 
                      color: ord.status === 'Pending' ? '#dc2626' : '#c2410c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {ord.status === 'Pending' && <ShieldAlert size={14} />}
                      {ord.status === 'Pending' ? 'Awaiting Rx Review' : ord.status}
                    </span>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                      {ord.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                          <span style={{ color: 'var(--text-dark)', fontWeight: 700 }}>💊 {item.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Qty: {item.quantity} • ₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {ord.prescriptionId && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f0fdfa',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        border: '1px solid #99f6e4'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={18} style={{ color: '#0d9488' }} />
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f766e' }}>Linked Doctor Clinical Prescription:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPrescriptionId(ord.prescriptionId || null)}
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #0d9488',
                            borderRadius: '10px',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            color: '#0f766e'
                          }}
                        >
                          Verify Prescription ↗
                        </button>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="flex-col-mobile gap-sm">
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-dark)' }}>Total Order Price: ₹{ord.totalPrice}</span>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {ord.status === 'Pending' && (
                          <>
                            <Button variant="danger" onClick={() => handleStatusChange(ord.id, 'Cancelled')} style={{ borderRadius: '10px', fontWeight: 800 }}>Reject Order</Button>
                            <Button 
                              onClick={() => handleStatusChange(ord.id, 'Confirmed')} 
                              style={{ borderRadius: '10px', fontWeight: 800, backgroundColor: 'var(--primary)' }}
                            >
                              Verify & Confirm
                            </Button>
                          </>
                        )}
                        {ord.status === 'Confirmed' && (
                          <Button onClick={() => handleStatusChange(ord.id, 'Processing')} style={{ borderRadius: '10px', fontWeight: 800, backgroundColor: 'var(--primary)' }}>Pack Order</Button>
                        )}
                        {ord.status === 'Processing' && (
                          <Button onClick={() => handleStatusChange(ord.id, 'Ready')} style={{ borderRadius: '10px', fontWeight: 800, backgroundColor: 'var(--secondary)' }}>Mark Ready for Pickup</Button>
                        )}
                        {ord.status === 'Ready' && (
                          <Button onClick={() => handleStatusChange(ord.id, 'Completed')} style={{ borderRadius: '10px', fontWeight: 900, backgroundColor: 'var(--secondary)' }}>Mark Dispatched & Completed</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>Archived Order History</h3>
            <Card style={{ borderRadius: '20px' }}>
              {pastOrders.length === 0 ? (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  No completed logs yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {pastOrders.slice(0, 6).map((ord) => (
                    <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ fontWeight: 800, display: 'block', color: 'var(--text-dark)' }}>Order #{ord.id}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{ord.patientName} • Total: ₹{ord.totalPrice}</span>
                      </div>
                      <span style={{
                        fontWeight: 800,
                        color: ord.status === 'Completed' ? '#15803d' : '#dc2626',
                        backgroundColor: ord.status === 'Completed' ? '#dcfce7' : '#fff1f2',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem'
                      }}>
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>
      )}

      {/* ── TAB 2: INVENTORY & STOCK MANAGEMENT ────────────────────────────── */}
      {activeTab === 'Inventory' && (
        <Card style={{ borderRadius: '24px', padding: '24px' }} title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Pill size={22} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900, fontSize: '1.15rem' }}>Pharmacy Inventory & Stock Level Audit</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }} className="flex-col-mobile">
              <div style={{ position: 'relative', width: '320px' }}>
                <Input 
                  placeholder="Search medicine brand or category..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                />
              </div>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                Showing {filteredInventory.length} of {pharmInventory.length} Medicines
              </span>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Medicine Brand Name</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Category</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Stock Level</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Unit Price (₹)</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--primary)' }}>💊 {item.name}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{item.category}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {stockEdits[item.id] !== undefined ? (
                          <input 
                            type="number"
                            value={stockEdits[item.id]}
                            onChange={(e) => setStockEdits({ ...stockEdits, [item.id]: Number(e.target.value) })}
                            style={{ width: '90px', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 700 }}
                          />
                        ) : (
                          <span style={{ 
                            fontWeight: 800, 
                            color: item.stock < 100 ? '#dc2626' : '#15803d',
                            backgroundColor: item.stock < 100 ? '#fff1f2' : '#dcfce7',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.8rem'
                          }}>
                            {item.stock} Units
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 800 }}>₹{item.price}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {stockEdits[item.id] !== undefined ? (
                          <Button onClick={() => handleStockUpdate(item.id, item.stock)} style={{ height: '32px', padding: '4px 14px', fontSize: '0.78rem', borderRadius: '8px', fontWeight: 800 }}>
                            Save Stock
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={() => setStockEdits({ ...stockEdits, [item.id]: item.stock })} style={{ height: '32px', padding: '4px 14px', fontSize: '0.78rem', borderRadius: '8px', fontWeight: 700 }}>
                            Edit Level
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </Card>
      )}

      {/* ── TAB 3: PHARMACY SETUP & LICENSE ─────────────────────────────── */}
      {activeTab === 'Settings' && (
        <Card style={{ borderRadius: '24px', padding: '28px' }} title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={22} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900, fontSize: '1.15rem' }}>Pharmacy Store Credentials & License Registration</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-2-mobile">
              <Input label="Pharmacy Store Name" value={activePharmacy?.name || 'Jivexa Pharmacy Hub'} disabled />
              <Input label="State Drug License Number" value="DL-KA-2026-99201" disabled />
              <Input label="GSTIN Registration" value="29AAACJ1234F1Z5" disabled />
              <Input label="Licensed Registered Pharmacist" value={user?.name || 'Pharmatist Admin'} disabled />
            </div>
            
            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '16px', borderRadius: '16px', fontSize: '0.86rem', color: '#0f766e' }}>
              <strong>Platform Verification Standard:</strong> To modify store delivery radius, payout bank details, or upload renewed drug licenses, please reach out to JIVEXA compliance team at <strong>compliance@jivexa.in</strong>.
            </div>
          </div>
        </Card>
      )}

      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      )}

      {/* PRESCRIPTION VERIFICATION MODAL */}
      {selectedPrescriptionId && (
        <Modal 
          isOpen={!!selectedPrescriptionId} 
          onClose={() => setSelectedPrescriptionId(null)} 
          title="Clinical Prescription Verification"
        >
          {selectedPrescriptionId === 'custom_upload' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <CheckCircle2 size={28} />
              </div>
              <h4 style={{ fontWeight: 800 }}>Custom Patient Prescription Copy Attached</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                The patient uploaded a custom file copy at checkout for verification.
              </p>
              <div style={{ border: '1px dashed #0d9488', padding: '14px', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700, backgroundColor: '#f0fdfa', color: '#0f766e' }}>
                📄 prescription_upload_temp_stub.pdf
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button onClick={() => setSelectedPrescriptionId(null)} style={{ borderRadius: '10px' }}>Close</Button>
              </div>
            </div>
          ) : activePrescription ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Verified JIVEXA Digital Document</span>
                <h4 style={{ fontWeight: 800, marginTop: '4px' }}>Issued by {activePrescription.doctorName}</h4>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Date: {activePrescription.date} • Patient: {activePrescription.patientName}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>
                {activePrescription.medications.map((med, idx) => (
                  <div key={idx} style={{ fontSize: '0.88rem' }}>
                    💊 <strong>{med.name}</strong> • {med.dosage} ({med.frequency}) • {med.duration}
                    {med.instructions && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>* {med.instructions}</div>}
                  </div>
                ))}
              </div>

              {activePrescription.notes && (
                <div style={{ fontStyle: 'italic', fontSize: '0.84rem', color: 'var(--text-muted)', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  Doctor Notes: "{activePrescription.notes}"
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button onClick={() => setSelectedPrescriptionId(null)} style={{ borderRadius: '10px', fontWeight: 800 }}>Close & Return</Button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No prescription record matches this ID.
            </div>
          )}
        </Modal>
      )}

    </div>
  );
};

export const PharmacySettings: React.FC = () => {
  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
      <Card title="Pharmacy Setup & Compliance">
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          To edit delivery parameters, bank payout details, or verify drug registration certificates, please contact platform administrators at <strong>support@jivexa.in</strong>.
        </p>
      </Card>
    </div>
  );
};
