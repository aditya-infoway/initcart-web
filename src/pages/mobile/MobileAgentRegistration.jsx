// ecommerce/frontend/src/pages/mobile/MobileBecomeAgent.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import Swal from "sweetalert2";
import { 
  FiArrowLeft, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiLock, 
  FiMapPin, 
  FiHome, 
  FiGlobe,
  FiBriefcase,
  FiFileText,
  FiImage,
  FiShield,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiTrendingUp,
  FiAward
} from "react-icons/fi";

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

// ─── Custom Styled Select Component ────────────────────────────────────────
const StyledSelect = ({ value, onChange, options, placeholder, required, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
      >
        <div className="flex items-center gap-2">
          <FiBriefcase className="w-4 h-4 text-gray-400" />
          <span className={value ? "text-gray-800" : "text-gray-400"}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-slideDown">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-[13px] hover:bg-blue-50 transition-colors flex items-center justify-between"
            >
              <span className={value === opt.value ? "text-blue-600 font-medium" : "text-gray-700"}>
                {opt.label}
              </span>
              {value === opt.value && <FiCheckCircle className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── File Upload Component ─────────────────────────────────────────────────
const FileUploadField = ({ label, name, required, onFileChange, error, touched, fileName }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileChange(name, file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const getIcon = () => {
    switch(name) {
      case 'passport_photo': return <FiImage className="w-6 h-6 text-white" />;
      case 'id_proof': return <FiShield className="w-6 h-6 text-white" />;
      case 'gst_certificate': return <FiFileText className="w-6 h-6 text-white" />;
      case 'business_license': return <FiFileText className="w-6 h-6 text-white" />;
      default: return <FiUpload className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-2">
        <span className="text-[11px] font-medium text-gray-600">{label} {required && <span className="text-red-500">*</span>}</span>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf" />
      <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer transition-transform hover:scale-105 active:scale-95">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full rounded-xl object-cover" />
          ) : (
            getIcon()
          )}
        </div>
      </div>
      {fileName && <p className="text-green-600 text-[9px] mt-1 text-center truncate max-w-[100px]">{fileName}</p>}
      {error && touched && <p className="text-red-500 text-[9px] mt-1 text-center">{error}</p>}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const MobileBecomeAgent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    agent_type: "normal",
    full_name: "",
    contact_number: "",
    email: "",
    password: "",
    address: "",
    city: "",
    state: "",
    society_or_business_name: "",
    referral_code: ""
  });

  const [files, setFiles] = useState({
    passport_photo: null,
    id_proof: null,
    gst_certificate: null,
    business_license: null
  });

  const [fileNames, setFileNames] = useState({
    passport_photo: "",
    id_proof: "",
    gst_certificate: "",
    business_license: ""
  });

  // Get referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setFormData(prev => ({ ...prev, referral_code: ref }));
    }
  }, []);

  // Hide bottom navigation
  useEffect(() => {
    document.body.classList.add('agent-page');
    const style = document.createElement('style');
    style.id = 'agent-page-hide-nav';
    style.textContent = `
      .fixed.bottom-0.left-0.right-0.z-\\[100\\], .md\\:hidden.fixed.bottom-0 { display: none !important; }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-slideDown { animation: slideDown 0.2s ease; }
    `;
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove('agent-page');
      const styleEl = document.getElementById('agent-page-hide-nav');
      if (styleEl) styleEl.remove();
    };
  }, []);

  const agentTypeOptions = [
    { value: "normal", label: "Normal Agent" },
    { value: "pos", label: "POS Agent" },
    { value: "society", label: "Society Agent" },
  ];

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
  const validatePassword = (password) => password.length >= 8;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name?.trim()) newErrors.full_name = "Full name is required";
    else if (formData.full_name.length < 3) newErrors.full_name = "Name must be at least 3 characters";

    if (!formData.contact_number) newErrors.contact_number = "Contact number is required";
    else if (!validatePhone(formData.contact_number)) newErrors.contact_number = "Enter valid 10-digit number";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Enter valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password)) newErrors.password = "Password must be at least 8 characters";

    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.state?.trim()) newErrors.state = "State is required";

    if (!files.passport_photo) newErrors.passport_photo = "Passport photo is required";
    if (!files.id_proof) newErrors.id_proof = "ID proof is required";

    if (formData.agent_type === "pos" || formData.agent_type === "society") {
      if (!formData.society_or_business_name?.trim()) newErrors.society_or_business_name = "Business name is required";
      if (!files.gst_certificate) newErrors.gst_certificate = "GST certificate is required";
      if (!files.business_license) newErrors.business_license = "Business license is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    if (name === 'referral_code') setReferralError(null);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateForm();
  };

  const handleFileChange = (name, file) => {
    setFiles(prev => ({ ...prev, [name]: file }));
    setFileNames(prev => ({ ...prev, [name]: file?.name || "" }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    Object.keys(files).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    if (!validateForm()) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please fill all required fields correctly', confirmButtonColor: '#2563EB' });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => { if (formData[key]) data.append(key, formData[key]); });
      Object.keys(files).forEach(key => { if (files[key]) data.append(key, files[key]); });

      await publicAxios.post("/api/mlm/register/", data, { headers: { "Content-Type": "multipart/form-data" } });

      Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        html: `
          <div class="text-center">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiCheckCircle class="w-6 h-6 text-green-600" />
            </div>
            <p class="text-[13px] text-gray-600 mb-3">Your agent registration has been submitted successfully.</p>
            <div class="bg-blue-50 rounded-xl p-3 text-left">
              <p class="text-[11px] font-semibold text-blue-800 mb-2">Next Steps:</p>
              <ul class="text-[10px] text-blue-700 space-y-1">
                <li>✓ Application pending admin approval</li>
                <li>✓ You will receive email confirmation</li>
                <li>✓ Admin will verify your documents</li>
              </ul>
            </div>
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563EB'
      }).then(() => navigate("/"));
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Registration Failed', text: error.response?.data?.message || "Something went wrong", confirmButtonColor: '#EF4444' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const getRequiredDocs = () => (formData.agent_type === "pos" || formData.agent_type === "society") ? 4 : 2;
  const getUploadedDocs = () => {
    let count = 0;
    if (files.passport_photo) count++;
    if (files.id_proof) count++;
    if (formData.agent_type !== "normal") {
      if (files.gst_certificate) count++;
      if (files.business_license) count++;
    }
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200">
            <FiArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold text-gray-900">Become an Agent</h1>
            <p className="text-[11px] text-gray-500">Step {currentStep} of 3</p>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex gap-1">
            {[1, 2, 3].map(step => (
              <div key={step} className={`flex-1 h-1 rounded-full transition-all ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} noValidate>
          {/* STEP 1: Agent Type & Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiBriefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Agent Type</h2>
                </div>
                <StyledSelect
                  value={formData.agent_type}
                  onChange={(val) => setFormData(prev => ({ ...prev, agent_type: val }))}
                  options={agentTypeOptions}
                  placeholder="Select Agent Type"
                  required={true}
                  label="Select Agent Type"
                />
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Personal Information</h2>
                </div>
                <div className="space-y-3">
                  <input type="text" name="full_name" placeholder="Full Name *" value={formData.full_name} onChange={handleChange} onBlur={handleBlur} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400" required />
                  {touched.full_name && errors.full_name && <p className="text-red-500 text-[10px] -mt-2">{errors.full_name}</p>}
                  
                  <input type="tel" name="contact_number" placeholder="Phone Number (10 digits) *" value={formData.contact_number} onChange={handleChange} onBlur={handleBlur} maxLength={10} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400" required />
                  {touched.contact_number && errors.contact_number && <p className="text-red-500 text-[10px] -mt-2">{errors.contact_number}</p>}
                  
                  <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} onBlur={handleBlur} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400" required />
                  {touched.email && errors.email && <p className="text-red-500 text-[10px] -mt-2">{errors.email}</p>}
                  
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Password (min 8 chars) *" value={formData.password} onChange={handleChange} onBlur={handleBlur} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10 placeholder:text-gray-400" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? <FiEyeOff size={16} className="text-gray-400" /> : <FiEye size={16} className="text-gray-400" />}
                    </button>
                  </div>
                  {touched.password && errors.password && <p className="text-red-500 text-[10px] -mt-2">{errors.password}</p>}
                </div>
              </div>

              <button type="button" onClick={nextStep} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-[14px] active:scale-95 transition-transform">
                Continue →
              </button>
            </div>
          )}

          {/* STEP 2: Address & Business Info */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiMapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Address Information</h2>
                </div>
                <div className="space-y-3">
                  <textarea name="address" placeholder="Complete Address *" value={formData.address} onChange={handleChange} onBlur={handleBlur} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400" required />
                  {touched.address && errors.address && <p className="text-red-500 text-[10px] -mt-2">{errors.address}</p>}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleChange} onBlur={handleBlur} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400" required />
                    {touched.city && errors.city && <p className="text-red-500 text-[10px] -mt-2">{errors.city}</p>}
                    
                    <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleChange} onBlur={handleBlur} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400" required />
                    {touched.state && errors.state && <p className="text-red-500 text-[10px] -mt-2">{errors.state}</p>}
                  </div>
                </div>
              </div>

              {(formData.agent_type === "pos" || formData.agent_type === "society") && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FiHome className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-[14px] font-semibold text-gray-800">Business Information</h2>
                  </div>
                  <input type="text" name="society_or_business_name" placeholder="Business / Society Name *" value={formData.society_or_business_name} onChange={handleChange} onBlur={handleBlur} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400" required />
                  {touched.society_or_business_name && errors.society_or_business_name && <p className="text-red-500 text-[10px] -mt-2">{errors.society_or_business_name}</p>}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={prevStep} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-[14px] active:scale-95 transition-transform">Back</button>
                <button type="button" onClick={nextStep} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-[14px] active:scale-95 transition-transform">Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Documents & Referral */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Document Progress */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-medium text-blue-700">Documents Uploaded</span>
                  <span className="text-[10px] text-blue-600">{getUploadedDocs()}/{getRequiredDocs()}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(getUploadedDocs() / getRequiredDocs()) * 100}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiUpload className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Upload Documents</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FileUploadField 
                    name="passport_photo" 
                    label="Passport Photo" 
                    required={true} 
                    onFileChange={handleFileChange} 
                    error={errors.passport_photo} 
                    touched={touched.passport_photo} 
                    fileName={fileNames.passport_photo} 
                  />
                  <FileUploadField 
                    name="id_proof" 
                    label="ID Proof" 
                    required={true} 
                    onFileChange={handleFileChange} 
                    error={errors.id_proof} 
                    touched={touched.id_proof} 
                    fileName={fileNames.id_proof} 
                  />
                </div>

                {(formData.agent_type === "pos" || formData.agent_type === "society") && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FileUploadField 
                      name="gst_certificate" 
                      label="GST Certificate" 
                      required={true} 
                      onFileChange={handleFileChange} 
                      error={errors.gst_certificate} 
                      touched={touched.gst_certificate} 
                      fileName={fileNames.gst_certificate} 
                    />
                    <FileUploadField 
                      name="business_license" 
                      label="Business License" 
                      required={true} 
                      onFileChange={handleFileChange} 
                      error={errors.business_license} 
                      touched={touched.business_license} 
                      fileName={fileNames.business_license} 
                    />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiTag className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Referral Code (Optional)</h2>
                </div>
                <input type="text" name="referral_code" placeholder="Enter referral code if you have one" value={formData.referral_code} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400" />
                {validatingReferral && <p className="text-blue-500 text-[10px] mt-1">Validating...</p>}
                {referralError && <p className="text-red-500 text-[10px] mt-1">{referralError}</p>}
              </div>

              <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl font-semibold text-[14px] transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white active:scale-95'}`}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : "Submit Application"}
              </button>
            </div>
          )}
        </form>

        {/* Benefits Section */}
        <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[12px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiAward className="w-4 h-4 text-yellow-500" /> Why become an agent?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2"><FiTrendingUp className="w-3 h-3 text-green-500" /><span className="text-[10px] text-gray-600">Earn commissions</span></div>
            <div className="flex items-center gap-2"><FiStar className="w-3 h-3 text-yellow-500" /><span className="text-[10px] text-gray-600">Build your network</span></div>
            <div className="flex items-center gap-2"><FiShield className="w-3 h-3 text-blue-500" /><span className="text-[10px] text-gray-600">Secure payments</span></div>
            <div className="flex items-center gap-2"><FiBriefcase className="w-3 h-3 text-purple-500" /><span className="text-[10px] text-gray-600">Grow your business</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBecomeAgent;