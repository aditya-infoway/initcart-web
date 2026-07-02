import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, ShoppingBag, CreditCard, Award,
  TrendingUp, Calendar, X, AlertCircle, CheckCircle, Briefcase,
  Target, Loader, FileText, Camera, IdCard, Building, Store,
  Copy, Share2, Lock, ChevronRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../api/customerApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import MobileCustomerProfile from './mobile/MobileCustomerProfile';

// ── Helpers ───────────────────────────────────────────────────────────────
const ProgressBar = ({ pct, color = 'indigo' }) => {
  const colors = {
    indigo: 'from-indigo-500 to-blue-500',
    blue: 'from-blue-400 to-blue-500',
    green: 'from-green-400 to-emerald-500',
  };
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`bg-gradient-to-r ${colors[color]} h-3 rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
};

const InfoRow = ({ label, value, valueClass = 'text-gray-900' }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
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
    <button onClick={handleCopy} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
      {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
    </button>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
    pending: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending Approval' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// ── Document row ──────────────────────────────────────────────────────────
const DocRow = ({ label, uploaded, url }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-600">{label}</span>
    <div className="flex items-center gap-2">
      {uploaded ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-600 font-medium">Uploaded</span>
          {url && (
            <a href={url} target="_blank" rel="noreferrer"
              className="text-xs text-blue-600 underline hover:text-blue-700">View</a>
          )}
        </>
      ) : (
        <>
          <X className="h-4 w-4 text-red-400" />
          <span className="text-xs text-red-500">Not Uploaded</span>
        </>
      )}
    </div>
  </div>
);

// ── Referral link card ────────────────────────────────────────────────────
const ReferralCard = ({ title, link, icon: Icon, color, description, locked, remaining }) => {
  if (locked) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-70">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-400">{title} (Locked)</span>
        </div>
        <p className="text-xs text-gray-400">Need ₹{remaining?.toLocaleString()} more in sales to unlock</p>
      </div>
    );
  }

  const shareOnWhatsApp = () => {
    const msg = encodeURIComponent(`${description}\n${link}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className={`border rounded-xl p-4 bg-white`} style={{ borderColor: color + '40' }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <div className="flex gap-2">
        <input
          value={link}
          readOnly
          className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none"
        />
        <CopyButton text={link} label={title} />
        <button
          onClick={shareOnWhatsApp}
          className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
          title="Share on WhatsApp"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const CustomerProfile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      reader.onloadend = () =>
        setPreviewImages(prev => ({ ...prev, [field]: reader.result }));
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
      if (agentForm.society_or_business_name)
        fd.append('society_or_business_name', agentForm.society_or_business_name);
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
    if (pwdForm.new_password !== pwdForm.confirm_password)
      return toast.error('Passwords do not match');
    if (pwdForm.new_password.length < 8)
      return toast.error('Minimum 8 characters required');
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

  if (isMobile) {
  return <MobileCustomerProfile />;
}

  // ── Loading / error ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading profile…</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Failed to load profile</p>
        <button onClick={fetchProfile} className="flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 text-white rounded-lg">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    </div>
  );

  // ── Destructure ─────────────────────────────────────────────────────────
  const userData = profile.user || {};
  const profileData = profile.profile || {};
  const agentEligibility = profile.agent_eligibility || {};
  const agentInfo = profile.agent_info || {};
  const agent = agentInfo.data;

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your account &amp; agent information</p>
          </div>
          <button onClick={fetchProfile} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow text-sm text-gray-600 hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: profile card ─────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Basic info */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{profileData.full_name || userData.username}</h2>
                    <p className="text-indigo-200 text-sm mt-1">@{userData.username}</p>
                    <p className="text-indigo-200 text-xs mt-1 capitalize">
                      {userData.user_type === 'both' ? 'Customer + Agent' : userData.user_type}
                    </p>
                  </div>
                  {agentInfo.exists && <StatusBadge status={agent?.status} />}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { icon: Mail, label: 'Email', val: profileData.email || userData.email },
                  { icon: Phone, label: 'Phone', val: profileData.phone || userData.phone || '—' },
                  { icon: MapPin, label: 'City', val: profileData.city || '—' },
                  { icon: Calendar, label: 'Joined', val: profileData.created_at ? format(new Date(profileData.created_at), 'dd MMM yyyy') : '—' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm text-gray-800">{val}</p>
                    </div>
                  </div>
                ))}

                {userData.referral_code && (
                  <div className="flex items-start gap-3">
                    <Award className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Referral Code</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-sm font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {userData.referral_code}
                        </code>
                        <CopyButton text={userData.referral_code} label="Referral code" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 p-4 space-y-2">
                <button onClick={() => setShowPwdModal(true)}
                  className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  Change Password
                </button>
                <button onClick={logout}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  Logout
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Orders', val: profileData.total_orders || 0, icon: ShoppingBag, color: 'text-indigo-500', onClick: () => navigate('/orders') },
                { label: 'Spent', val: `₹${(profileData.total_spent || 0).toLocaleString()}`, icon: CreditCard, color: 'text-green-500' },
                { label: 'Points', val: profileData.loyalty_points || 0, icon: Award, color: 'text-blue-500' },
              ].map(({ label, val, icon: Icon, color, onClick }) => (
                <div key={label}
                  onClick={onClick}
                  className={`bg-white rounded-xl shadow p-4 text-center ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
                  <Icon className={`h-5 w-5 ${color} mx-auto mb-1`} />
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── CASE A: Not an agent yet — show eligibility ─────────── */}
            {!agentInfo.exists && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <Target className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Become an Agent</h3>
                    <p className="text-sm text-gray-500">Complete minimum purchase to unlock</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      ₹{(agentEligibility.current_total_spent || 0).toLocaleString()} spent
                    </span>
                    <span className="font-medium text-indigo-600">
                      ₹{(agentEligibility.minimum_required_amount || 0).toLocaleString()} required
                    </span>
                  </div>
                  <ProgressBar pct={agentEligibility.progress_pct || 0} color="indigo" />
                  <p className="text-xs text-gray-400 mt-2">
                    {agentEligibility.progress_pct >= 100
                      ? ' You are eligible! Apply now.'
                      : `₹${(agentEligibility.remaining_to_eligible || 0).toLocaleString()} more needed`}
                  </p>
                </div>

                {agentEligibility.can_apply_now ? (
                  <button onClick={() => setShowAgentModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg">
                    Apply to Become an Agent →
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-xl p-3">
                    <Lock className="h-4 w-4" />
                    Complete minimum purchase to unlock agent application
                  </div>
                )}
              </div>
            )}

            {/* ── CASE B: Agent exists — full agent section ───────────── */}
            {agentInfo.exists && agent && (
              <>
                {/* Agent overview card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className={`p-6 text-white ${agent.status === 'approved' ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      : agent.status === 'pending' ? 'bg-gradient-to-r from-blue-500 to-blue-500'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-6 w-6" />
                        <div>
                          <h3 className="text-lg font-bold">Agent Profile</h3>
                          <p className="text-sm opacity-80">ID: AG-{agent.id} · {agent.agent_type_display}</p>
                        </div>
                      </div>
                      <StatusBadge status={agent.status} />
                    </div>
                  </div>

                  <div className="p-6">

                    {/* ── Pending notice ── */}
                    {agent.status === 'pending' && (
                      <div className="mb-5 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800">Pending Admin Approval</p>
                          <p className="text-xs text-blue-700 mt-0.5">
                            Your application is under review. You will receive an email once approved.
                            Sales made during this period will be counted after approval.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ── Rejected notice ── */}
                    {agent.status === 'rejected' && (
                      <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                        <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">Application Rejected</p>
                          <p className="text-xs text-red-700 mt-0.5">Please contact support for more information.</p>
                        </div>
                      </div>
                    )}

                    {/* ── Activation progress (approved but inactive) ── */}
                    {agent.status === 'approved' && !agent.is_active_agent && (
                      <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-800">
                            Complete minimum sales to activate your agent features
                          </p>
                        </div>
                        <div className="flex justify-between text-xs text-blue-700 mb-2">
                          <span>Sales: ₹{(agent.total_sales || 0).toLocaleString()}</span>
                          <span>Required: ₹{(agent.minimum_required || 0).toLocaleString()}</span>
                        </div>
                        <ProgressBar pct={agent.sales_progress_pct || 0} color="blue" />
                        <p className="text-xs text-blue-600 mt-2">
                          Need ₹{(agent.remaining_sales || 0).toLocaleString()} more · Referral links unlock automatically
                        </p>
                      </div>
                    )}

                    {/* ── Active badge ── */}
                    {agent.status === 'approved' && agent.is_active_agent && (
                      <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p className="text-sm font-semibold text-green-800">
                          Agent Active — All features unlocked
                        </p>
                      </div>
                    )}

                    {/* ── Info grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                      <div>
                        <InfoRow label="Full Name" value={agent.full_name} />
                        <InfoRow label="Contact" value={agent.contact_number} />
                        <InfoRow label="Email" value={agent.email} />
                        <InfoRow label="City / State" value={`${agent.city}, ${agent.state}`} />
                        {agent.society_or_business_name && (
                          <InfoRow label="Business" value={agent.society_or_business_name} />
                        )}
                      </div>
                      <div>
                        <InfoRow label="Total Sales"
                          value={`₹${(agent.total_sales || 0).toLocaleString()}`}
                          valueClass="text-indigo-700 font-bold" />
                        <InfoRow label="Active Status"
                          value={agent.is_active_agent ? 'Active' : 'Inactive'}
                          valueClass={agent.is_active_agent ? 'text-green-600' : 'text-red-500'} />
                        <InfoRow label="Joined" value={agent.created_at ? format(new Date(agent.created_at), 'dd MMM yyyy') : '—'} />
                        {agent.minimum_achieved_at && (
                          <InfoRow label="Activated On"
                            value={format(new Date(agent.minimum_achieved_at), 'dd MMM yyyy')} />
                        )}
                        {agent.sponsor && (
                          <InfoRow label="Sponsor"
                            value={agent.sponsor.full_name || agent.sponsor.username} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Documents card ── */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" /> Documents
                  </h4>
                  <div className="divide-y divide-gray-100">
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
                {/* ── Go to agent panel ── */}
                {agent.status === 'approved' && (
                  <button
                    onClick={() => window.location.href = "https://initcart.in/mlm/"}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all">
                    Go to Agent Panel <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          AGENT APPLICATION MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">Apply for Agent</h2>
              <button onClick={() => setShowAgentModal(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleAgentSubmit} className="p-6 space-y-5">
              {/* Agent type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Type *</label>
                <select
                  value={agentForm.agent_type}
                  onChange={e => setAgentForm(p => ({ ...p, agent_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="normal">Normal Agent</option>
                  <option value="pos">POS Agent</option>
                  <option value="society">Society Agent</option>
                </select>
              </div>

              {['pos', 'society'].includes(agentForm.agent_type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business / Society Name *</label>
                  <input type="text" value={agentForm.society_or_business_name}
                    onChange={e => setAgentForm(p => ({ ...p, society_or_business_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
              )}

              {/* Documents */}
              <div className="border-t pt-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Required Documents</p>
                <div className="space-y-4">
                  {[
                    { field: 'passport_photo', label: 'Passport Photo', accept: 'image/*', icon: Camera },
                    { field: 'id_proof', label: 'ID Proof (Aadhar / PAN)', accept: 'image/*,.pdf', icon: IdCard },
                    ...(['pos', 'society'].includes(agentForm.agent_type) ? [
                      { field: 'gst_certificate', label: 'GST Certificate', accept: '.pdf,image/*', icon: Building },
                      { field: 'business_license', label: 'Business License', accept: '.pdf,image/*', icon: Store },
                    ] : [])
                  ].map(({ field, label, accept, icon: Icon }) => (
                    <div key={field}>
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                        <Icon className="h-4 w-4 text-indigo-400" /> {label} *
                      </label>
                      <div className="flex items-center gap-3">
                        <input type="file" accept={accept}
                          onChange={e => handleFileChange(e, field)}
                          className="flex-1 text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs hover:file:bg-indigo-100"
                          required />
                        {previewImages[field] && (
                          <img src={previewImages[field]} alt="preview"
                            className="h-10 w-10 rounded object-cover border border-gray-200" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 flex gap-2">
                <FileText className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                Your existing profile info will be used automatically. You can login to the agent panel with your current credentials after approval.
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAgentModal(false)}
                  className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CHANGE PASSWORD MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              <button onClick={() => setShowPwdModal(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handlePwdChange} className="p-6 space-y-4">
              {[
                { key: 'old_password', label: 'Current Password' },
                { key: 'new_password', label: 'New Password' },
                { key: 'confirm_password', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                  <input type="password" value={pwdForm[key]}
                    onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required />
                </div>
              ))}
              <p className="text-xs text-gray-400">Minimum 8 characters</p>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPwdModal(false)}
                  className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={changingPwd}
                  className="flex-1 py-2 text-sm text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {changingPwd ? <><Loader className="h-4 w-4 animate-spin" /> Saving…</> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;