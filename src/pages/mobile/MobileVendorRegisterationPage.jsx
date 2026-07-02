// ecommerce/frontend/src/pages/mobile/MobileVendorRegistration.jsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerVendor } from "../../service/VendorService";
import Swal from "sweetalert2";
import { 
  FiArrowLeft, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiBriefcase,
  FiShoppingBag,
  FiUpload,
  FiFileText,
  FiImage,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiAward,
  FiChevronDown,
  FiCheck,
  FiPackage,
  FiTool,
  FiScissors,
  FiActivity,
  FiHome,
  FiDollarSign,
  FiCpu,
  FiCoffee,
  FiHeart,
  FiBookOpen,
  FiBriefcase as FiProfessional,
  FiGrid
} from "react-icons/fi";
import { FaPlane } from "react-icons/fa";

// ─── Font Tokens ──────────────────────────────────────────────────────────────
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

// ─── Custom Styled Dropdown Component ────────────────────────────────────────
const StyledSelect = ({ value, onChange, options, placeholder, required, icon: Icon, label }) => {
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
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
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
                onChange({ target: { name: 'businessType', value: opt.value } });
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-[13px] hover:bg-blue-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {opt.icon && <opt.icon className="w-4 h-4 text-gray-500" />}
                <span className={value === opt.value ? "text-blue-600 font-medium" : "text-gray-700"}>
                  {opt.label}
                </span>
              </div>
              {value === opt.value && <FiCheck className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Custom Styled Dropdown for Vendor Sub Type ───────────────────────────────
const StyledVendorSelect = ({ value, onChange, options, placeholder, required, disabled, label }) => {
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-left flex items-center justify-between transition-all ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'focus:outline-none focus:ring-2 focus:ring-blue-300'}`}
      >
        <div className="flex items-center gap-2">
          <FiBriefcase className="w-4 h-4 text-gray-400" />
          <span className={value ? "text-gray-800" : "text-gray-400"}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        {!disabled && <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-slideDown">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange({ target: { name: 'vendorSubType', value: opt.value } });
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-[13px] hover:bg-blue-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {opt.icon && <opt.icon className="w-4 h-4 text-gray-500" />}
                <span className={value === opt.value ? "text-blue-600 font-medium" : "text-gray-700"}>
                  {opt.label}
                </span>
              </div>
              {value === opt.value && <FiCheck className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MobileVendorRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessType: "",
    vendorSubType: "",
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    shopAddress: "",
    city: "",
    state: "",
    pincode: "",
    licenceFile: null,
    gstCertificate: null,
    storeLogo: null,
    idProof: null,
    acceptTerms: false,
  });

  const [formErrors, setFormErrors] = useState({
    storeLogo: "",
    idProof: "",
  });

  const [fileInputKeys, setFileInputKeys] = useState({
    storeLogo: Date.now(),
    idProof: Date.now() + 1,
    licenceFile: Date.now() + 2,
    gstCertificate: Date.now() + 3,
  });

  // Business type options - NO EMOJIS, ONLY REACT ICONS
  const businessTypeOptions = [
    { value: "", label: "Select Type", icon: null },
    { value: "product", label: "Product Vendor", icon: FiPackage },
    { value: "service", label: "Service Vendor", icon: FiTool },
  ];

  // Product vendor options - NO EMOJIS
  const productOptions = [
    { value: "", label: "Select Type", icon: null },
    { value: "retailer", label: "Retailer", icon: FiShoppingBag },
    { value: "wholesaler", label: "Wholesaler", icon: FiPackage },
  ];

  // Service vendor options - NO EMOJIS, ONLY REACT ICONS
  const serviceOptions = [
    { value: "", label: "Select Category", icon: null },
    { value: "salon", label: "Salon", icon: FiScissors },
    { value: "gym", label: "Gym", icon: FiActivity },
    { value: "real_estate", label: "Real Estate", icon: FiHome },
    { value: "travel_agency", label: "Travel Agency", icon: FaPlane },
    { value: "finance", label: "Finance", icon: FiDollarSign },
    { value: "tech", label: "Tech Industry", icon: FiCpu },
    { value: "hotel", label: "Hotel", icon: FiCoffee },
    { value: "healthcare", label: "Healthcare", icon: FiHeart },
    { value: "education", label: "Education", icon: FiBookOpen },
    { value: "professional", label: "Professional", icon: FiProfessional },
    { value: "restaurant", label: "Restaurant", icon: FiGrid },
  ];

  const getVendorOptions = () => {
    if (formData.businessType === "product") return productOptions;
    if (formData.businessType === "service") return serviceOptions;
    return [];
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const newValue = type === "checkbox" ? checked : files ? files[0] : value;
    
    if (name === 'businessType') {
      setFormData({ ...formData, businessType: value, vendorSubType: "" });
    } else {
      setFormData({ ...formData, [name]: newValue });
    }
    
    if (files && (name === 'storeLogo' || name === 'idProof')) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (name, file) => {
    if (file) {
      setFormData({ ...formData, [name]: file });
      setFormErrors(prev => ({ ...prev, [name]: "" }));
      setFileInputKeys(prev => ({ ...prev, [name]: Date.now() }));
    }
  };

  const validateFiles = () => {
    const errors = { storeLogo: "", idProof: "" };
    if (!formData.storeLogo) errors.storeLogo = "Store logo is required";
    if (!formData.idProof) errors.idProof = "ID proof is required";
    setFormErrors(errors);
    return !errors.storeLogo && !errors.idProof;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFiles()) {
      await Swal.fire({
        icon: "error",
        title: "Missing Documents",
        text: "Please upload both Store Logo and ID Proof documents.",
        confirmButtonText: "OK",
        customClass: {
          popup: 'text-[13px] rounded-2xl',
          title: 'text-[16px] font-bold',
          confirmButton: 'text-[13px] px-4 py-2 bg-blue-600 text-white rounded-lg'
        }
      });
      return;
    }
    if (!formData.acceptTerms) {
      await Swal.fire({
        icon: "warning",
        title: "Terms Required",
        text: "Please accept the terms and conditions.",
        confirmButtonText: "OK",
        customClass: {
          popup: 'text-[13px] rounded-2xl',
          title: 'text-[16px] font-bold',
          confirmButton: 'text-[13px] px-4 py-2 bg-blue-600 text-white rounded-lg'
        }
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      await Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Password and Confirm Password do not match.",
        confirmButtonText: "OK",
        customClass: {
          popup: 'text-[13px] rounded-2xl',
          title: 'text-[16px] font-bold',
          confirmButton: 'text-[13px] px-4 py-2 bg-blue-600 text-white rounded-lg'
        }
      });
      return;
    }

    const data = new FormData();
    data.append("vendor_type", formData.businessType.toLowerCase());
    data.append("vendor_subtype", formData.vendorSubType);
    data.append("business_name", formData.businessName);
    data.append("owner_name", formData.ownerName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("password", formData.password);
    data.append("confirm_password", formData.confirmPassword);
    data.append("address", formData.shopAddress);
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("pincode", formData.pincode);
    if (formData.licenceFile) data.append("licence_file", formData.licenceFile);
    if (formData.gstCertificate) data.append("gst_certificate", formData.gstCertificate);
    if (formData.storeLogo) data.append("store_logo", formData.storeLogo);
    if (formData.idProof) data.append("id_proof", formData.idProof);

    try {
      setLoading(true);
      const response = await registerVendor(data);
      
      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: response.message || "Your vendor registration has been completed successfully!",
        confirmButtonText: "Go to Home",
        customClass: {
          popup: 'text-[13px] rounded-2xl',
          title: 'text-[16px] font-bold text-gray-800',
          htmlContainer: 'text-[13px] text-gray-600',
          confirmButton: 'text-[13px] px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium'
        }
      });
      
      navigate("/");
      
    } catch (error) {
      const err = error.response?.data?.errors || error.response?.data || {};
      await Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.email || err.confirm_password || err.message || "Something went wrong. Please check all fields.",
        confirmButtonText: "Try Again",
        customClass: {
          popup: 'text-[13px] rounded-2xl',
          title: 'text-[16px] font-bold',
          confirmButton: 'text-[13px] px-4 py-2 bg-blue-600 text-white rounded-lg'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const FileUploadIcon = ({ name, label, required = false }) => {
    const fileInputRef = useRef(null);
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) handleImageUpload(name, file);
    };

    const getIcon = () => {
      switch(name) {
        case 'storeLogo': return <FiImage className="w-8 h-8 text-white" />;
        case 'idProof': return <FiShield className="w-8 h-8 text-white" />;
        case 'licenceFile': return <FiFileText className="w-8 h-8 text-white" />;
        case 'gstCertificate': return <FiFileText className="w-8 h-8 text-white" />;
        default: return <FiUpload className="w-8 h-8 text-white" />;
      }
    };

    return (
      <div className="flex flex-col items-center">
        <div className="text-center mb-2">
          <span className="text-[11px] font-medium text-gray-600">{label} {required && <span className="text-red-500">*</span>}</span>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept={name === 'storeLogo' ? "image/*" : "*"} />
        <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            {getIcon()}
          </div>
        </div>
        {formErrors[name] && <p className="text-red-500 text-[9px] mt-1 text-center">{formErrors[name]}</p>}
        {formData[name] && <p className="text-green-600 text-[9px] mt-1 text-center truncate max-w-[100px]">{formData[name].name}</p>}
      </div>
    );
  };

  // Hide bottom navigation
  useEffect(() => {
    document.body.classList.add('vendor-reg-page');
    const style = document.createElement('style');
    style.id = 'vendor-reg-hide-nav';
    style.textContent = `
      .fixed.bottom-0.left-0.right-0.z-\\[100\\], .md\\:hidden.fixed.bottom-0 { display: none !important; }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slideDown { animation: slideDown 0.2s ease; }
    `;
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove('vendor-reg-page');
      const styleEl = document.getElementById('vendor-reg-hide-nav');
      if (styleEl) styleEl.remove();
    };
  }, []);

  const vendorOptions = getVendorOptions();

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200">
            <FiArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold text-gray-900">Vendor Registration</h1>
            <p className="text-[11px] text-gray-500">Step {currentStep} of 3</p>
          </div>
        </div>
        {/* Progress Bar */}
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
          {/* STEP 1: Business Type & Owner Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiBriefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Business Type</h2>
                </div>
                <div className="space-y-4">
                  <StyledSelect
                    value={formData.businessType}
                    onChange={handleChange}
                    options={businessTypeOptions}
                    placeholder="Select Business Type"
                    required={true}
                    icon={FiBriefcase}
                    label="Select Business Type"
                  />
                  
                  {formData.businessType && (
                    <StyledVendorSelect
                      value={formData.vendorSubType}
                      onChange={handleChange}
                      options={vendorOptions}
                      placeholder={formData.businessType === "product" ? "Select Product Vendor Type" : "Select Service Category"}
                      required={true}
                      label={formData.businessType === "product" ? "Product Vendor Type" : "Service Category"}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Owner Information</h2>
                </div>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    name="ownerName" 
                    placeholder="Owner Name *" 
                    value={formData.ownerName} 
                    onChange={handleChange} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-400" 
                    required 
                  />
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Phone Number *" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-400" 
                    required 
                  />
                </div>
              </div>

              <button type="button" onClick={nextStep} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-[14px] active:scale-95 transition-transform">
                Continue →
              </button>
            </div>
          )}

          {/* STEP 2: Account & Business Info */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiLock className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Account Information</h2>
                </div>
                <div className="space-y-3">
                  <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-400" required />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Password *" value={formData.password} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10 transition-all placeholder:text-gray-400" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? <FiEyeOff size={16} className="text-gray-400" /> : <FiEye size={16} className="text-gray-400" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password *" value={formData.confirmPassword} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10 transition-all placeholder:text-gray-400" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showConfirmPassword ? <FiEyeOff size={16} className="text-gray-400" /> : <FiEye size={16} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiShoppingBag className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Business Information</h2>
                </div>
                <div className="space-y-3">
                  <input type="text" name="businessName" placeholder="Business / Shop Name *" value={formData.businessName} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-400" required />
                  <input type="text" name="shopAddress" placeholder="Address *" value={formData.shopAddress} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-400" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-400" required />
                    <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-400" required />
                  </div>
                  <input type="text" name="pincode" placeholder="Pincode *" value={formData.pincode} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-400" required />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={prevStep} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-[14px] active:scale-95 transition-transform">Back</button>
                <button type="button" onClick={nextStep} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-[14px] active:scale-95 transition-transform">Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Documents & Terms */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiUpload className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-gray-800">Upload Documents</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FileUploadIcon name="storeLogo" label="Store Logo" required={true} />
                  <FileUploadIcon name="idProof" label="ID Proof" required={true} />
                  <FileUploadIcon name="licenceFile" label="Business License" required={false} />
                  <FileUploadIcon name="gstCertificate" label="GST Certificate" required={false} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" required />
                  <span className="text-[12px] text-gray-600">I accept the <span className="text-blue-600">Terms & Conditions</span> <span className="text-red-500">*</span></span>
                </label>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl font-semibold text-[14px] transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white active:scale-95'}`}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : "Register as Vendor"}
              </button>
            </div>
          )}
        </form>

        {/* Benefits Section */}
        <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[12px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiAward className="w-4 h-4 text-yellow-500" /> Why become a vendor?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2"><FiTrendingUp className="w-3 h-3 text-green-500" /><span className="text-[10px] text-gray-600">Grow your business</span></div>
            <div className="flex items-center gap-2"><FiShoppingBag className="w-3 h-3 text-blue-500" /><span className="text-[10px] text-gray-600">Reach more customers</span></div>
            <div className="flex items-center gap-2"><FiStar className="w-3 h-3 text-yellow-500" /><span className="text-[10px] text-gray-600">Build your brand</span></div>
            <div className="flex items-center gap-2"><FiShield className="w-3 h-3 text-green-500" /><span className="text-[10px] text-gray-600">Secure payments</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileVendorRegistration;