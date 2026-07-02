// ecommerce/frontend/src/pages/mobile/MobileCustomerProfile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, ShoppingBag, CreditCard, Award,
  TrendingUp, Calendar, X, AlertCircle, CheckCircle, Briefcase,
  Target, Loader, FileText, Camera, IdCard, Building, Store,
  Copy, Share2, Lock, ChevronRight, RefreshCw, LogOut,
  Eye, EyeOff, Home, Star, Clock, Shield, Gift, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerAPI } from '../../api/customerApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiShield } from 'react-icons/fi';
import { FaInfo } from 'react-icons/fa';

// ─── Font Tokens (Same as other mobile pages) ──────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize:  9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLetter:{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

// ─── Colors - ONLY BLUE THEME ──────────────────────────────────────────────
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  background: '#F8FAFC',
  white: '#FFFFFF',
};

const ProgressBar = ({ pct }) => (
  <div style={{ width: '100%', background: '#E2E8F0', borderRadius: 999, height: 6, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, background: COLORS.primary, height: 6, borderRadius: 999, transition: 'width 0.7s ease' }} />
  </div>
);

const InfoRow = ({ label, value, valueColor = COLORS.text }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
    <span style={{ fontSize: 12, color: COLORS.textLight }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500, color: valueColor }}>{value || '—'}</span>
  </div>
);

const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={{ padding: 6, background: COLORS.primaryLight, borderRadius: 8, border: 'none', cursor: 'pointer' }}>
      {copied ? <CheckCircle size={14} color={COLORS.success} /> : <Copy size={14} color={COLORS.primary} />}
    </button>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    approved: { bg: '#ECFDF5', color: COLORS.success, label: 'Approved' },
    pending:  { bg: COLORS.primaryLight, color: COLORS.primary, label: 'Pending Approval' },
    rejected: { bg: '#FEF2F2', color: COLORS.error, label: 'Rejected' },
  }[status] || { bg: '#F1F5F9', color: COLORS.textLight, label: status };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: config.bg, color: config.color }}>
      {config.label}
    </span>
  );
};

const DocRow = ({ label, uploaded, url }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
    <span style={{ fontSize: 12, color: COLORS.textLight }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {uploaded ? (
        <>
          <CheckCircle size={14} color={COLORS.success} />
          <span style={{ fontSize: 10, color: COLORS.success, fontWeight: 500 }}>Uploaded</span>
          {url && <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: COLORS.primary, textDecoration: 'underline' }}>View</a>}
        </>
      ) : (
        <>
          <X size={14} color={COLORS.error} />
          <span style={{ fontSize: 10, color: COLORS.error }}>Not Uploaded</span>
        </>
      )}
    </div>
  </div>
);

const MobileCustomerProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [previewImages, setPreviewImages] = useState({ passport_photo: null, id_proof: null });

  const [agentForm, setAgentForm] = useState({
    agent_type: 'normal',
    society_or_business_name: '',
    passport_photo: null,
    id_proof: null,
    gst_certificate: null,
    business_license: null,
  });

  const [pwdForm, setPwdForm] = useState({
    old_password: '', new_password: '', confirm_password: ''
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getProfile();
      if (res.success) setProfile(res.data);
    } catch (e) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setAgentForm(prev => ({ ...prev, [field]: file }));
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImages(prev => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleAgentSubmit = async (e) => {
    e.preventDefault();
    if (!agentForm.passport_photo) return toast.error('Passport photo required');
    if (!agentForm.id_proof) return toast.error('ID proof required');
    if (['pos', 'society'].includes(agentForm.agent_type)) {
      if (!agentForm.society_or_business_name) return toast.error('Business name required');
      if (!agentForm.gst_certificate) return toast.error('GST certificate required');
      if (!agentForm.business_license) return toast.error('Business license required');
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('agent_type', agentForm.agent_type);
      if (agentForm.society_or_business_name) fd.append('society_or_business_name', agentForm.society_or_business_name);
      if (agentForm.passport_photo) fd.append('passport_photo', agentForm.passport_photo);
      if (agentForm.id_proof) fd.append('id_proof', agentForm.id_proof);
      if (agentForm.gst_certificate) fd.append('gst_certificate', agentForm.gst_certificate);
      if (agentForm.business_license) fd.append('business_license', agentForm.business_license);

      const res = await customerAPI.applyForAgent(fd);
      if (res.success) {
        toast.success(res.message || 'Application submitted!');
        setShowAgentModal(false);
        setAgentForm({ agent_type: 'normal', society_or_business_name: '', passport_photo: null, id_proof: null, gst_certificate: null, business_license: null });
        setPreviewImages({ passport_photo: null, id_proof: null });
        fetchProfile();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePwdChange = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) return toast.error('Passwords do not match');
    if (pwdForm.new_password.length < 8) return toast.error('Minimum 8 characters required');
    try {
      setChangingPwd(true);
      const res = await customerAPI.changePassword(pwdForm);
      if (res.success) {
        toast.success('Password changed');
        setShowPwdModal(false);
        setPwdForm({ old_password: '', new_password: '', confirm_password: '' });
      }
    } catch (e) {
      toast.error(e.response?.data?.errors?.old_password?.[0] || 'Failed');
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...F.cardSub, color: COLORS.textLight }}>Loading profile...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) return null;

  const userData = profile.user || {};
  const profileData = profile.profile || {};
  const agentEligibility = profile.agent_eligibility || {};
  const agentInfo = profile.agent_info || {};
  const agent = agentInfo.data;

  return (
    <div style={{ minHeight: '100dvh', background: COLORS.background, paddingBottom: 30 }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <ChevronRight size={18} color={COLORS.text} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0, color: COLORS.text }}>My Profile</h1>
          <p style={{ ...F.badge, color: COLORS.textLight, marginTop: 2 }}>@{userData.username}</p>
        </div>
        <button onClick={fetchProfile} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <RefreshCw size={18} color={COLORS.textLight} />
        </button>
      </div>

      <div style={{ padding: '12px' }}>

        {/* Profile Header Card - BLUE Gradient */}
        <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, borderRadius: 20, padding: '20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} color={COLORS.white} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.white, marginBottom: 2 }}>{profileData.full_name || userData.username}</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>{userData.email}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{userData.user_type === 'both' ? 'Customer + Agent' : userData.user_type}</p>
            </div>
            {agentInfo.exists && <StatusBadge status={agent?.status} />}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div onClick={() => navigate('/orders')} style={{ flex: 1, background: COLORS.white, borderRadius: 16, padding: '12px', textAlign: 'center', border: `1px solid ${COLORS.border}`, cursor: 'pointer' }}>
            <ShoppingBag size={20} color={COLORS.primary} style={{ margin: '0 auto 6px' }} />
            <p style={{ ...F.badge, color: COLORS.textLight }}>Orders</p>
            <p style={{ ...F.statNum, color: COLORS.text }}>{profileData.total_orders || 0}</p>
          </div>
          <div style={{ flex: 1, background: COLORS.white, borderRadius: 16, padding: '12px', textAlign: 'center', border: `1px solid ${COLORS.border}` }}>
            <CreditCard size={20} color={COLORS.primary} style={{ margin: '0 auto 6px' }} />
            <p style={{ ...F.badge, color: COLORS.textLight }}>Spent</p>
            <p style={{ ...F.statNum, color: COLORS.text }}>₹{(profileData.total_spent || 0).toLocaleString()}</p>
          </div>
          <div style={{ flex: 1, background: COLORS.white, borderRadius: 16, padding: '12px', textAlign: 'center', border: `1px solid ${COLORS.border}` }}>
            <Award size={20} color={COLORS.primary} style={{ margin: '0 auto 6px' }} />
            <p style={{ ...F.badge, color: COLORS.textLight }}>Points</p>
            <p style={{ ...F.statNum, color: COLORS.text }}>{profileData.loyalty_points || 0}</p>
          </div>
        </div>

        {/* Contact Info Card */}
        <div style={{ background: COLORS.white, borderRadius: 16, marginBottom: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} color={COLORS.primary} />
            <span style={{ ...F.cardTitle, color: COLORS.text }}>Contact Information</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: COLORS.primaryLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={14} color={COLORS.primary} />
              </div>
              <div>
                <p style={{ ...F.badge, color: COLORS.textLight }}>Email</p>
                <p style={{ ...F.cardSub, fontWeight: 500, color: COLORS.text }}>{profileData.email || userData.email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: COLORS.primaryLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={14} color={COLORS.primary} />
              </div>
              <div>
                <p style={{ ...F.badge, color: COLORS.textLight }}>Phone</p>
                <p style={{ ...F.cardSub, fontWeight: 500, color: COLORS.text }}>{profileData.phone || userData.phone || '—'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: COLORS.primaryLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={14} color={COLORS.primary} />
              </div>
              <div>
                <p style={{ ...F.badge, color: COLORS.textLight }}>City</p>
                <p style={{ ...F.cardSub, fontWeight: 500, color: COLORS.text }}>{profileData.city || '—'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, background: COLORS.primaryLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={14} color={COLORS.primary} />
              </div>
              <div>
                <p style={{ ...F.badge, color: COLORS.textLight }}>Joined</p>
                <p style={{ ...F.cardSub, fontWeight: 500, color: COLORS.text }}>{profileData.created_at ? format(new Date(profileData.created_at), 'dd MMM yyyy') : '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        {userData.referral_code && (
          <div style={{ background: COLORS.white, borderRadius: 16, marginBottom: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gift size={16} color={COLORS.primary} />
              <span style={{ ...F.cardTitle, color: COLORS.text }}>Referral Code</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <code style={{ background: '#F1F5F9', padding: '8px 12px', borderRadius: 10, fontSize: 13, fontFamily: 'monospace', color: COLORS.primary }}>{userData.referral_code}</code>
              <CopyButton text={userData.referral_code} label="Referral code" />
            </div>
          </div>
        )}

        {/* Agent Section - Eligibility */}
        {!agentInfo.exists && (
          <div style={{ background: COLORS.white, borderRadius: 16, marginBottom: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={16} color={COLORS.primary} />
              <span style={{ ...F.cardTitle, color: COLORS.text }}>Become an Agent</span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textLight }}>₹{(agentEligibility.current_total_spent || 0).toLocaleString()} spent</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.primary }}>₹{(agentEligibility.minimum_required_amount || 0).toLocaleString()} required</span>
                </div>
                <ProgressBar pct={agentEligibility.progress_pct || 0} />
                <p style={{ fontSize: 11, color: COLORS.textLight, marginTop: 8 }}>
                  {agentEligibility.progress_pct >= 100 ? '✅ You are eligible! Apply now.' : `Need ₹${(agentEligibility.remaining_to_eligible || 0).toLocaleString()} more`}
                </p>
              </div>
              {agentEligibility.can_apply_now ? (
                <button onClick={() => setShowAgentModal(true)} style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: COLORS.white, border: 'none', borderRadius: 14, ...F.cardTitle, cursor: 'pointer' }}>
                  Apply to Become an Agent →
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: '#F1F5F9', borderRadius: 12 }}>
                  <Lock size={14} color={COLORS.textLight} />
                  <span style={{ fontSize: 12, color: COLORS.textLight }}>Complete minimum purchase to unlock agent application</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agent Section - Full Details */}
        {agentInfo.exists && agent && (
          <>
            <div style={{ background: COLORS.white, borderRadius: 16, marginBottom: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
              <div style={{ background: agent.status === 'approved' ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` : agent.status === 'pending' ? COLORS.primary : COLORS.error, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase size={16} color={COLORS.white} />
                  <span style={{ ...F.cardTitle, color: COLORS.white }}>Agent Profile</span>
                </div>
                <StatusBadge status={agent.status} />
              </div>
              <div style={{ padding: '12px 16px' }}>
                {agent.status === 'pending' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: COLORS.primaryLight, borderRadius: 12, padding: '12px', marginBottom: 12 }}>
                    <AlertCircle size={16} color={COLORS.primary} />
                    <div>
                      <p style={{ ...F.cardSub, fontWeight: 600, color: COLORS.primaryDark }}>Pending Approval</p>
                      <p style={{ fontSize: 11, color: COLORS.primary }}>Your application is under review. You will receive an email once approved.</p>
                    </div>
                  </div>
                )}
                {agent.status === 'rejected' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', borderRadius: 12, padding: '12px', marginBottom: 12 }}>
                    <X size={16} color={COLORS.error} />
                    <div>
                      <p style={{ ...F.cardSub, fontWeight: 600, color: '#991B1B' }}>Application Rejected</p>
                      <p style={{ fontSize: 11, color: COLORS.error }}>Please contact support for more information.</p>
                    </div>
                  </div>
                )}
                {agent.status === 'approved' && !agent.is_active_agent && (
                  <div style={{ background: COLORS.primaryLight, borderRadius: 12, padding: '12px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <TrendingUp size={14} color={COLORS.primary} />
                      <p style={{ ...F.cardSub, fontWeight: 600, color: COLORS.primaryDark }}>Complete minimum sales to activate</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: COLORS.primary }}>Sales: ₹{(agent.total_sales || 0).toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: COLORS.primary }}>Required: ₹{(agent.minimum_required || 0).toLocaleString()}</span>
                    </div>
                    <ProgressBar pct={agent.sales_progress_pct || 0} />
                    <p style={{ fontSize: 11, color: COLORS.primary, marginTop: 8 }}>Need ₹{(agent.remaining_sales || 0).toLocaleString()} more</p>
                  </div>
                )}
                {agent.status === 'approved' && agent.is_active_agent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ECFDF5', borderRadius: 12, padding: '10px', marginBottom: 12 }}>
                    <CheckCircle size={16} color={COLORS.success} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>Agent Active — All features unlocked</span>
                  </div>
                )}
                <InfoRow label="Agent ID" value={`AG-${agent.id}`} />
                <InfoRow label="Agent Type" value={agent.agent_type_display} />
                <InfoRow label="Full Name" value={agent.full_name} />
                <InfoRow label="Contact" value={agent.contact_number} />
                <InfoRow label="Email" value={agent.email} />
                <InfoRow label="Location" value={`${agent.city}, ${agent.state}`} />
                {agent.society_or_business_name && <InfoRow label="Business Name" value={agent.society_or_business_name} />}
                <InfoRow label="Total Sales" value={`₹${(agent.total_sales || 0).toLocaleString()}`} valueColor={COLORS.primary} />
                <InfoRow label="Status" value={agent.is_active_agent ? 'Active' : 'Inactive'} valueColor={agent.is_active_agent ? COLORS.success : COLORS.error} />
                <InfoRow label="Joined" value={agent.created_at ? format(new Date(agent.created_at), 'dd MMM yyyy') : '—'} />
                {agent.minimum_achieved_at && <InfoRow label="Activated On" value={format(new Date(agent.minimum_achieved_at), 'dd MMM yyyy')} />}
              </div>
            </div>

            {/* Documents Card */}
            <div style={{ background: COLORS.white, borderRadius: 16, marginBottom: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color={COLORS.primary} />
                <span style={{ ...F.cardTitle, color: COLORS.text }}>Documents</span>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <DocRow label="Passport Photo" uploaded={agent.has_passport_photo} url={agent.passport_photo_url} />
                <DocRow label="ID Proof (Aadhar/PAN)" uploaded={agent.has_id_proof} url={agent.id_proof_url} />
                {agent.agent_type !== 'normal' && (
                  <>
                    <DocRow label="GST Certificate" uploaded={agent.has_gst_certificate} />
                    <DocRow label="Business License" uploaded={agent.has_business_license} />
                  </>
                )}
              </div>
            </div>

            {/* Agent Panel Button */}
            {agent.status === 'approved' && (
              <button onClick={() => window.location.href = "https://initcart.in/mlm/"} style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: COLORS.white, border: 'none', borderRadius: 14, ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                Go to Agent Panel <ChevronRight size={16} />
              </button>
            )}
          </>
        )}

        {/* Action Buttons */}
<div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
  <button onClick={() => setShowPwdModal(true)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 14, ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
    <Lock size={14} color={COLORS.textLight} /> Change Password
  </button>
  <button onClick={() => navigate('/aboutUs')} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 14, ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
    <FaInfo size={14} color={COLORS.primary} /> About Us
  </button>
</div>

<div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
  <button onClick={logout} style={{ flex: 1, padding: '12px', background: '#FEF2F2', border: 'none', borderRadius: 14, ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
    <LogOut size={14} color={COLORS.error} /> Logout
  </button>
  <button onClick={() => navigate('/support')} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 14, ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
    <FiShield size={14} color={COLORS.textLight} /> Support
  </button>
</div>
      </div>

      {/* Agent Application Modal */}
      {showAgentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <div style={{ background: COLORS.white, borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '85vh', overflowY: 'auto', animation: 'slideUp 0.3s ease' }}>
            <div style={{ position: 'sticky', top: 0, background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ ...F.cardTitle, fontSize: 16, color: COLORS.text }}>Apply for Agent</h3>
              <button onClick={() => setShowAgentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.textLight} /></button>
            </div>
            <form onSubmit={handleAgentSubmit} style={{ padding: '16px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>Agent Type *</label>
                <select value={agentForm.agent_type} onChange={e => setAgentForm(p => ({ ...p, agent_type: e.target.value }))} style={{ width: '100%', padding: '12px', border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 13 }}>
                  <option value="normal">Normal Agent</option>
                  <option value="pos">POS Agent</option>
                  <option value="society">Society Agent</option>
                </select>
              </div>
              {['pos', 'society'].includes(agentForm.agent_type) && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>Business / Society Name *</label>
                  <input type="text" value={agentForm.society_or_business_name} onChange={e => setAgentForm(p => ({ ...p, society_or_business_name: e.target.value }))} style={{ width: '100%', padding: '12px', border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 13 }} required />
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>Passport Photo *</label>
                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'passport_photo')} style={{ width: '100%' }} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>ID Proof (Aadhar/PAN) *</label>
                <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'id_proof')} style={{ width: '100%' }} required />
              </div>
              {['pos', 'society'].includes(agentForm.agent_type) && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>GST Certificate *</label>
                    <input type="file" accept=".pdf,image/*" onChange={e => handleFileChange(e, 'gst_certificate')} style={{ width: '100%' }} required />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>Business License *</label>
                    <input type="file" accept=".pdf,image/*" onChange={e => handleFileChange(e, 'business_license')} style={{ width: '100%' }} required />
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowAgentModal(false)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 12, ...F.cardTitle, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: COLORS.white, border: 'none', borderRadius: 12, ...F.cardTitle, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPwdModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <div style={{ background: COLORS.white, borderRadius: '24px 24px 0 0', width: '100%', animation: 'slideUp 0.3s ease' }}>
            <div style={{ padding: '16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ ...F.cardTitle, fontSize: 16, color: COLORS.text }}>Change Password</h3>
              <button onClick={() => setShowPwdModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.textLight} /></button>
            </div>
            <form onSubmit={handlePwdChange} style={{ padding: '16px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>Current Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showOldPwd ? "text" : "password"} value={pwdForm.old_password} onChange={e => setPwdForm(p => ({ ...p, old_password: e.target.value }))} style={{ width: '100%', padding: '12px', border: `1px solid ${COLORS.border}`, borderRadius: 12, paddingRight: 40 }} required />
                  <button type="button" onClick={() => setShowOldPwd(!showOldPwd)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none' }}>{showOldPwd ? <EyeOff size={16} color={COLORS.textLight} /> : <Eye size={16} color={COLORS.textLight} />}</button>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNewPwd ? "text" : "password"} value={pwdForm.new_password} onChange={e => setPwdForm(p => ({ ...p, new_password: e.target.value }))} style={{ width: '100%', padding: '12px', border: `1px solid ${COLORS.border}`, borderRadius: 12, paddingRight: 40 }} required />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none' }}>{showNewPwd ? <EyeOff size={16} color={COLORS.textLight} /> : <Eye size={16} color={COLORS.textLight} />}</button>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...F.cardSub, fontWeight: 600, marginBottom: 6, display: 'block', color: COLORS.text }}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPwd ? "text" : "password"} value={pwdForm.confirm_password} onChange={e => setPwdForm(p => ({ ...p, confirm_password: e.target.value }))} style={{ width: '100%', padding: '12px', border: `1px solid ${COLORS.border}`, borderRadius: 12, paddingRight: 40 }} required />
                  <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none' }}>{showConfirmPwd ? <EyeOff size={16} color={COLORS.textLight} /> : <Eye size={16} color={COLORS.textLight} />}</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowPwdModal(false)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 12, ...F.cardTitle, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={changingPwd} style={{ flex: 1, padding: '12px', background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 12, ...F.cardTitle, cursor: 'pointer', opacity: changingPwd ? 0.6 : 1 }}>
                  {changingPwd ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MobileCustomerProfile;