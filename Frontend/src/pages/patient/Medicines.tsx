import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData, Prescription, OrderItem, Order } from '../../context/HealthDataContext';
import { useCart, CartItem } from '../../context/CartContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { 
  Pill, Calendar, FileText, CheckCircle2, ChevronRight, 
  ShoppingBag, ArrowRight, Search, Eye, ShoppingCart, Trash2, 
  Plus, Minus, MapPin, CheckCircle, Clock, Truck, ShieldAlert, Upload, Sparkles, AlertCircle, Info
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  requiresPrescription: boolean;
  description: string;
  sideEffects: string;
  usage: string;
  sku: string;
}

const PRODUCT_CATALOG: Product[] = [
  { 
    id: 'prod_para_500', 
    name: 'Paracetamol 500mg', 
    category: 'Analgesics', 
    price: 15, 
    requiresPrescription: false, 
    description: 'Rapid relief from pain and fever. Gentle on the stomach for daily wellness.', 
    sideEffects: 'Rare: skin rash, liver concerns if overdosed.', 
    usage: '1-2 tablets every 4-6 hours as needed (Max 4g per day).',
    sku: 'sku-para-500'
  },
  { 
    id: 'prod_amox_250', 
    name: 'Amoxicillin 250mg', 
    category: 'Antibiotics', 
    price: 65, 
    requiresPrescription: true, 
    description: 'Broad-spectrum penicillin antibiotic used to treat bacterial respiratory infections.', 
    sideEffects: 'Nausea, mild bloating, skin sensitivities.', 
    usage: 'Take exactly as prescribed by your doctor. Complete the full course.',
    sku: 'sku-amox-250'
  },
  { 
    id: 'prod_ceti_10', 
    name: 'Cetirizine 10mg', 
    category: 'Antihistamines', 
    price: 20, 
    requiresPrescription: false, 
    description: 'Non-drowsy 24-hour relief from seasonal allergies, sneezing, and hives.', 
    sideEffects: 'Mild fatigue, dry throat, headaches.', 
    usage: '1 tablet daily with or without food.',
    sku: 'sku-ceti-10'
  },
  { 
    id: 'prod_metf_500', 
    name: 'Metformin 500mg', 
    category: 'Anti-Diabetic', 
    price: 40, 
    requiresPrescription: true, 
    description: 'Oral diabetes medication that helps control blood sugar levels for Type 2 diabetes.', 
    sideEffects: 'Mild stomach discomfort, metallic taste, nausea.', 
    usage: 'Take with meals as directed by your physician.',
    sku: 'sku-metf-500'
  },
  { 
    id: 'prod_ator_10', 
    name: 'Atorvastatin 10mg', 
    category: 'Cardiovascular', 
    price: 80, 
    requiresPrescription: true, 
    description: 'Statin medication used to lower bad cholesterol and prevent cardiovascular risk.', 
    sideEffects: 'Muscle soreness, joint discomfort, fatigue.', 
    usage: 'Take once daily at night. Avoid excessive grapefruit juice.',
    sku: 'sku-ator-10'
  }
];

const CATEGORIES = ['All', 'Analgesics', 'Antibiotics', 'Antihistamines', 'Anti-Diabetic', 'Cardiovascular'];

export const PatientMedicines: React.FC = () => {
  const { user } = useAuth();
  const { prescriptions, pharmacies, placePharmacyOrder, orders } = useHealthData();
  const { 
    cartItems, addToCart, removeFromCart, updateQuantity, 
    clearCart, cartTotal, cartCount, hasPrescriptionRequiredItems 
  } = useCart();
  
  const [activeTab, setActiveTab] = useState<'Store' | 'Prescriptions' | 'ActiveMeds' | 'Orders'>('Store');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace, Sector 4, Indiranagar, Bengaluru');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('00000000-0000-0000-0000-000000000011');
  const [linkedPrescriptionId, setLinkedPrescriptionId] = useState('none');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const patientPres = prescriptions.filter((p) => p.patientId === user?.id || p.patientName === user?.name);
  const activeMeds = patientPres.flatMap((p) => p.medications);
  const patientOrders = orders.filter((o) => o.patientId === user?.id || !o.patientId);

  const filteredProducts = PRODUCT_CATALOG.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (prod: Product) => {
    addToCart({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      category: prod.category,
      requiresPrescription: prod.requiresPrescription,
      sku: prod.sku
    });
    setToastMsg(`"${prod.name}" added to cart!`);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress) {
      setToastMsg('Please enter a delivery address.');
      return;
    }

    if (hasPrescriptionRequiredItems && linkedPrescriptionId === 'none' && !uploadedFile) {
      setToastMsg('Prescription-required items in cart. Please link a prescription.');
      return;
    }

    setIsSubmitting(true);

    const orderItems: OrderItem[] = cartItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    try {
      const prescriptionRef = linkedPrescriptionId !== 'none' ? linkedPrescriptionId : (uploadedFile ? 'custom_upload' : undefined);
      const res = await placePharmacyOrder(selectedPharmacyId, orderItems, prescriptionRef);
      
      if (res.success) {
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setActiveTab('Orders');
        setToastMsg('Order submitted successfully! Awaiting pharmacist verification.');
      } else {
        setToastMsg('Failed to submit order.');
      }
    } catch (err) {
      setToastMsg('Checkout pipeline encountered an error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderFromPrescription = (pres: Prescription) => {
    pres.medications.forEach((med) => {
      const match = PRODUCT_CATALOG.find((p) => p.name.toLowerCase().includes(med.name.toLowerCase().split(' ')[0]));
      if (match) {
        addToCart({
          id: match.id,
          name: match.name,
          price: match.price,
          category: match.category,
          requiresPrescription: match.requiresPrescription,
          sku: match.sku
        });
      } else {
        addToCart({
          id: `custom_${med.name}`,
          name: med.name,
          price: 45,
          category: 'Analgesics',
          requiresPrescription: true,
          sku: 'sku-custom'
        });
      }
    });
    setLinkedPrescriptionId(pres.id);
    setIsCartOpen(true);
    setToastMsg('Medications from prescription loaded into cart.');
  };

  const renderTrackingTimeline = (status: Order['status']) => {
    const steps = [
      { key: 'Pending', label: 'Placed', icon: <Clock size={15} /> },
      { key: 'Verification', label: 'Rx Review', icon: <ShieldAlert size={15} /> },
      { key: 'Confirmed', label: 'Processing', icon: <Pill size={15} /> },
      { key: 'Ready', label: 'Dispatched', icon: <Truck size={15} /> },
      { key: 'Completed', label: 'Delivered', icon: <CheckCircle size={15} /> }
    ];

    let activeStepIdx = 0;
    if (status === 'Pending') activeStepIdx = 1;
    else if (status === 'Confirmed' || status === 'Processing') activeStepIdx = 2;
    else if (status === 'Ready') activeStepIdx = 3;
    else if (status === 'Completed') activeStepIdx = 4;
    else if (status === 'Cancelled') return <span style={{ color: 'var(--error)', fontWeight: 700 }}>Cancelled</span>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', height: '3px', backgroundColor: 'var(--border)', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: '16px', left: '16px', width: `${(activeStepIdx / 4) * 100}%`, height: '3px', backgroundColor: '#0f766e', zIndex: 2, transition: 'width 0.4s ease' }} />
          
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStepIdx;
            const isActive = idx === activeStepIdx;
            
            return (
              <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 3, width: '64px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted || isActive ? '#0f766e' : 'white',
                  color: isCompleted || isActive ? 'white' : 'var(--text-light)',
                  border: isCompleted || isActive ? 'none' : '2px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 0 0 4px rgba(15, 118, 110, 0.2)' : 'none'
                }}>
                  {step.icon}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: isActive ? 800 : 600, color: isActive ? '#0f766e' : 'var(--text-muted)' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

      {/* SIGNATURE TEAL-EMERALD GRADIENT HEADER BANNER */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #0284c7 0%, #0f766e 50%, #059669 100%)',
        borderRadius: '24px',
        padding: '32px 28px',
        color: 'white',
        boxShadow: '0 20px 40px -15px rgba(15, 118, 110, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Ambient Glow Graphic */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '640px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '12px',
              width: 'fit-content',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              💊 MEDICINE FULFILLMENT HUB
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
              My Medications & Prescriptions
            </h1>
            <p style={{ color: '#e0f2fe', fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
              Browse verified store medicines, review doctor e-prescriptions, manage daily dose schedules, and track home deliveries.
            </p>
          </div>

          <Button 
            onClick={() => setIsCartOpen(true)} 
            style={{ 
              backgroundColor: '#ffffff',
              color: '#0f766e',
              fontWeight: 900,
              fontSize: '0.95rem',
              padding: '12px 22px',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ShoppingCart size={20} style={{ color: '#0f766e' }} />
            <span>Cart ({cartCount})</span>
            {cartCount > 0 && (
              <span style={{
                backgroundColor: '#0f766e',
                color: '#ffffff',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                marginLeft: '4px'
              }}>
                ₹{cartTotal}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* MODERN TAB NAVIGATION PILLS */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', overflowX: 'auto' }}>
        {[
          { id: 'Store', label: 'Medicine Store', icon: <Pill size={16} /> },
          { id: 'Prescriptions', label: 'Clinical Prescriptions', icon: <FileText size={16} />, badge: patientPres.length },
          { id: 'ActiveMeds', label: 'Ongoing Medications', icon: <Calendar size={16} />, badge: activeMeds.length },
          { id: 'Orders', label: 'Pharmacy Orders', icon: <Truck size={16} />, badge: patientOrders.length }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: isActive ? '#0f766e' : 'var(--surface-raised)',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 6px 16px -4px rgba(15, 118, 110, 0.35)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--border)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MEDICINE STORE */}
      {activeTab === 'Store' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Input
                placeholder="Search medicines by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={18} style={{ color: 'var(--text-light)' }} />}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    backgroundColor: selectedCategory === cat ? '#0f766e' : 'var(--surface)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                    border: selectedCategory === cat ? 'none' : '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: selectedCategory === cat ? '0 4px 12px rgba(15, 118, 110, 0.25)' : 'none'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '20px' }}>
              <Pill size={40} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No products found</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Try matching a different search query or filter category.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filteredProducts.map((prod) => {
                const cartItem = cartItems.find((i) => i.id === prod.id);
                return (
                  <Card key={prod.id} style={{ borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '4px 10px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {prod.category}
                        </span>
                        {prod.requiresPrescription && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '4px 10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldAlert size={12} />
                            Rx Required
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px', lineHeight: '1.3' }}>{prod.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {prod.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: 'auto' }}>
                      <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{prod.price}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Inclusive of taxes</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => setDetailProduct(prod)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid var(--border)',
                            padding: '8px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)'
                          }}
                          title="View Info"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {cartItem ? (
                          <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #0f766e', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f0fdf4' }}>
                            <button onClick={() => updateQuantity(prod.id, cartItem.quantity - 1)} style={{ border: 'none', background: 'transparent', padding: '6px 10px', cursor: 'pointer', color: '#0f766e', fontWeight: 900 }}><Minus size={12} /></button>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, padding: '0 4px', color: '#0f766e' }}>{cartItem.quantity}</span>
                            <button onClick={() => updateQuantity(prod.id, cartItem.quantity + 1)} style={{ border: 'none', background: 'transparent', padding: '6px 10px', cursor: 'pointer', color: '#0f766e', fontWeight: 900 }}><Plus size={12} /></button>
                          </div>
                        ) : (
                          <Button onClick={() => handleAddToCart(prod)} style={{ height: '36px', padding: '6px 16px', fontSize: '0.86rem', fontWeight: 800, borderRadius: '10px', backgroundColor: '#0f766e' }}>
                            <ShoppingCart size={14} style={{ marginRight: '6px' }} />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINICAL PRESCRIPTIONS */}
      {activeTab === 'Prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {patientPres.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '20px' }}>
              <FileText size={40} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No prescriptions found</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Your doctors haven't issued any digital prescriptions yet.
              </p>
            </div>
          ) : (
            patientPres.map((pres) => (
              <Card key={pres.id} style={{ borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>VERIFIED E-PRESCRIPTION</span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0 0 0' }}>Prescription from {pres.doctorName}</h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Issued Date: {pres.date} • Rx ID: {pres.id}</span>
                    </div>

                    <Button onClick={() => handleOrderFromPrescription(pres)} style={{ backgroundColor: '#0f766e', fontWeight: 800, borderRadius: '12px' }}>
                      <ShoppingCart size={16} style={{ marginRight: '6px' }} />
                      Auto-Fill & Order Medications
                    </Button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    {pres.medications.map((med, idx) => (
                      <div key={idx} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          💊 <strong>{med.name}</strong> • {med.dosage} ({med.frequency}) • <span style={{ color: 'var(--text-muted)' }}>{med.duration}</span>
                          {med.instructions && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>* {med.instructions}</div>}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '6px' }}>Verified</span>
                      </div>
                    ))}
                  </div>
                  {pres.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Doctor Notes: "{pres.notes}"</p>}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ONGOING MEDICATIONS & PILL TRACKER */}
      {activeTab === 'ActiveMeds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeMeds.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '20px' }}>
              <Pill size={40} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No ongoing medications</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                You have no active dosage schedule logged in your health vault.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {activeMeds.map((med, idx) => (
                <Card key={idx} style={{ borderRadius: '20px', padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '8px' }}>DAILY DOSE PLAN</span>
                      <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{med.name}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                      <div>🩺 <strong>Dosage:</strong> {med.dosage}</div>
                      <div>🕒 <strong>Frequency:</strong> {med.frequency}</div>
                      <div>📅 <strong>Duration:</strong> {med.duration}</div>
                    </div>

                    {med.instructions && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                        Instructions: {med.instructions}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PHARMACY ORDERS & TRACKING */}
      {activeTab === 'Orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {patientOrders.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '20px' }}>
              <ShoppingBag size={40} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No orders found</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                You haven't placed any pharmacy orders yet.
              </p>
            </div>
          ) : (
            patientOrders.map((order) => (
              <Card key={order.id} style={{ borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ORDER #{order.id.slice(-8)}</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0 0' }}>Placed at {order.pharmacyName}</h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Order Date: {order.date}</span>
                    </div>

                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      padding: '6px 14px',
                      borderRadius: '12px',
                      backgroundColor: order.status === 'Completed' ? '#dcfce7' : '#e0f2fe',
                      color: order.status === 'Completed' ? '#15803d' : '#0369a1'
                    }}>
                      Status: {order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>💊 <strong>{it.name}</strong> <span style={{ color: 'var(--text-muted)' }}>x{it.quantity}</span></span>
                        <span style={{ fontWeight: 700 }}>₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', fontWeight: 800, fontSize: '1.05rem' }}>
                    <span>Total Amount:</span>
                    <span style={{ color: '#0f766e' }}>₹{order.totalPrice}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-dark)' }}>Live Order Fulfillment Status:</span>
                    {renderTrackingTimeline(order.status)}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* DETAIL PRODUCT MODAL */}
      {detailProduct && (
        <Modal isOpen={!!detailProduct} onClose={() => setDetailProduct(null)} title="Product Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '6px', textTransform: 'uppercase' }}>
                {detailProduct.category}
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f766e' }}>₹{detailProduct.price}</span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>{detailProduct.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {detailProduct.description}
              </p>
            </div>

            {detailProduct.requiresPrescription && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef2f2', padding: '12px 16px', borderRadius: '12px', color: '#dc2626', fontSize: '0.84rem', fontWeight: 700 }}>
                <ShieldAlert size={18} />
                <span>Notice: A valid doctor prescription is required to purchase this medicine.</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '0.88rem' }}>
              <div>📋 <strong>Active Usage instructions:</strong> {detailProduct.usage}</div>
              <div style={{ color: 'var(--text-muted)' }}>⚠️ <strong>Common Side Effects:</strong> {detailProduct.sideEffects}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button variant="outline" onClick={() => setDetailProduct(null)}>Close</Button>
              <Button onClick={() => { handleAddToCart(detailProduct); setDetailProduct(null); }} style={{ backgroundColor: '#0f766e', fontWeight: 800 }}>Add to Cart</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setIsCartOpen(false)}>
          
          <div style={{
            width: '420px',
            maxWidth: '100%',
            backgroundColor: 'white',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-xl)',
            padding: '28px'
          }} onClick={(e) => e.stopPropagation()}>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={20} style={{ color: '#0f766e' }} />
                  Shopping Cart ({cartCount})
                </h3>
                <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={48} style={{ color: 'var(--border)', marginBottom: '12px' }} />
                  <p style={{ fontWeight: 600 }}>Your cart is empty</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '55vh', overflowY: 'auto' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '14px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>{item.name}</h4>
                        <span style={{ fontSize: '0.82rem', color: '#0f766e', fontWeight: 700 }}>₹{item.price}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ border: 'none', background: 'transparent', padding: '4px 8px', cursor: 'pointer' }}><Minus size={10} /></button>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0 4px' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ border: 'none', background: 'transparent', padding: '4px 8px', cursor: 'pointer' }}><Plus size={10} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900 }}>
                  <span>Total Amount:</span>
                  <span style={{ color: '#0f766e' }}>₹{cartTotal}</span>
                </div>

                <Button onClick={() => setIsCheckoutOpen(true)} style={{ height: '48px', backgroundColor: '#0f766e', fontWeight: 800, fontSize: '1rem', borderRadius: '14px' }}>
                  Proceed to Checkout
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Order Checkout & Prescription Link">
          <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <Input
              label="Delivery Address *"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Full street address..."
              required
            />

            <Select
              label="Fulfilling Pharmacy Partner *"
              value={selectedPharmacyId}
              onChange={(val) => setSelectedPharmacyId(val)}
              options={pharmacies.map((p) => ({ value: p.id, label: `${p.name} (${p.address})` }))}
            />

            {hasPrescriptionRequiredItems && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fff7ed', padding: '16px', borderRadius: '14px', border: '1px solid #fed7aa' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={16} />
                  Prescription Link Required for Items in Cart
                </span>

                <Select
                  label="Select Clinical e-Prescription"
                  value={linkedPrescriptionId}
                  onChange={(val) => setLinkedPrescriptionId(val)}
                  options={[
                    { value: 'none', label: '-- Select Digital Prescription --' },
                    ...patientPres.map((p) => ({ value: p.id, label: `Rx from ${p.doctorName} (${p.date})` }))
                  ]}
                />

                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>OR</div>

                <Button type="button" variant="outline" size="sm" onClick={() => setUploadedFile('uploaded_rx.pdf')} style={{ borderRadius: '10px' }}>
                  <Upload size={14} style={{ marginRight: '6px' }} />
                  {uploadedFile ? 'Prescription Uploaded ✓' : 'Upload External Rx Document (PDF/JPG)'}
                </Button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '10px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Payable Amount: ₹{cartTotal}</span>
              <Button type="submit" isLoading={isSubmitting} style={{ backgroundColor: '#0f766e', fontWeight: 800, borderRadius: '12px' }}>
                Confirm & Place Order
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
