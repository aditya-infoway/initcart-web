import React, { useState, useEffect } from "react";
import { publicAxios } from "../api/axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import MobileBecomeAgent from "./mobile/MobileAgentRegistration";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaBuilding,
  FaIdCard,
  FaFile,
  FaCamera,
  FaTag,
  FaSpinner,
  FaBriefcase,
  FaRegBuilding,
  FaExclamationTriangle
} from "react-icons/fa";

const BecomeAgent = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [referralError, setReferralError] = useState(null);
  const [validatingReferral, setValidatingReferral] = useState(false);

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

  // ==========================
  // GET REFERRAL CODE FROM URL
  // ==========================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      setFormData((prev) => ({
        ...prev,
        referral_code: ref
      }));
      
      // Validate referral code on load
      validateReferralCode(ref);
    }
  }, []);
  useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

  // ==========================
  // VALIDATE REFERRAL CODE
  // ==========================
  const validateReferralCode = async (code) => {
    if (!code) {
      setReferralError(null);
      return;
    }

    setValidatingReferral(true);
    setReferralError(null);

    try {
      // You can create an API endpoint to check referral code validity
      const response = await publicAxios.get(`/api/mlm/validate-referral/?code=${code}`);
      
      if (response.data.valid) {
        setReferralError(null);
      } else {
        setReferralError({
          type: 'error',
          message: response.data.message || 'Invalid referral code'
        });
      }
    } catch (error) {
      // If validation API doesn't exist yet, we'll handle during submission

    } finally {
      setValidatingReferral(false);
    }
  };

  // ==========================
  // VALIDATION FUNCTIONS
  // ==========================
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.length < 3) {
      newErrors.full_name = "Name must be at least 3 characters";
    }

    // Contact Number validation
    if (!formData.contact_number) {
      newErrors.contact_number = "Contact number is required";
    } else if (!validatePhone(formData.contact_number)) {
      newErrors.contact_number = "Please enter a valid 10-digit mobile number";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Address validation
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    // City validation
    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
    }

    // State validation
    if (!formData.state?.trim()) {
      newErrors.state = "State is required";
    }

    // COMMON DOCUMENTS - Required for ALL agent types
    if (!files.passport_photo) {
      newErrors.passport_photo = "Passport photo is required";
    } else {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(files.passport_photo.type)) {
        newErrors.passport_photo = "Please upload JPG, JPEG or PNG file";
      }
    }

    if (!files.id_proof) {
      newErrors.id_proof = "ID proof is required";
    } else {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(files.id_proof.type)) {
        newErrors.id_proof = "Please upload JPG, PNG or PDF file";
      }
    }

    // POS/SOCIETY SPECIFIC VALIDATIONS
    if (formData.agent_type === "pos" || formData.agent_type === "society") {
      if (!formData.society_or_business_name?.trim()) {
        newErrors.society_or_business_name = "Society/Business name is required";
      }

      if (!files.gst_certificate) {
        newErrors.gst_certificate = "GST certificate is required";
      } else {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(files.gst_certificate.type)) {
          newErrors.gst_certificate = "Please upload JPG, PNG or PDF file";
        }
      }

      if (!files.business_license) {
        newErrors.business_license = "Business license is required";
      } else {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(files.business_license.type)) {
          newErrors.business_license = "Please upload JPG, PNG or PDF file";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (isMobile) {
  return <MobileBecomeAgent />;
}

  // ==========================
  // INPUT CHANGE
  // ==========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    // Clear referral error when user changes referral code
    if (name === 'referral_code') {
      setReferralError(null);
    }
  };

  // ==========================
  // BLUR HANDLER
  // ==========================
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateForm();
  };

  // ==========================
  // FILE CHANGE
  // ==========================
  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;

    if (fileList && fileList[0]) {
      setFiles({
        ...files,
        [name]: fileList[0]
      });

      // Clear error for this field
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: undefined
        });
      }
    }
  };

  // ==========================
  // PARSE BACKEND ERRORS
  // ==========================
  const parseBackendErrors = (errorResponse) => {
    const errorMessages = [];
    
    if (errorResponse.data) {
      // Handle different error formats
      if (typeof errorResponse.data === 'object') {
        Object.keys(errorResponse.data).forEach(key => {
          const messages = errorResponse.data[key];
          if (Array.isArray(messages)) {
            messages.forEach(msg => {
              errorMessages.push(msg);
            });
          } else if (typeof messages === 'string') {
            errorMessages.push(messages);
          }
        });
      } else if (typeof errorResponse.data === 'string') {
        errorMessages.push(errorResponse.data);
      }
    }
    
    return errorMessages;
  };

  // ==========================
  // SUBMIT FORM
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    Object.keys(files).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      Object.keys(files).forEach((key) => {
        if (files[key]) {
          data.append(key, files[key]);
        }
      });

      await publicAxios.post("/api/mlm/register/", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Success alert
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        html: `
          <div class="text-left">
            <p class="mb-2">Your agent registration has been submitted successfully.</p>
            <p class="font-semibold text-blue-600">Next Steps:</p>
            <ul class="list-disc pl-5 mt-2 text-sm">
              <li>Your application is pending admin approval</li>
              <li>You will receive an email confirmation shortly</li>
              <li>Admin will review your documents and verify your details</li>
              <li>You will be notified once your account is approved</li>
            </ul>
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        // Reset form after success
        setFormData({
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
        setFiles({
          passport_photo: null,
          id_proof: null,
          gst_certificate: null,
          business_license: null
        });
        setErrors({});
        setTouched({});
        setReferralError(null);
      });

    } catch (error) {

      
      let errorMessage = "Something went wrong. Please try again.";
      let referralSpecificError = false;
      
      // Parse error response
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for specific referral-related errors
        if (errorData.referral_code || 
            (typeof errorData === 'object' && Object.values(errorData).some(
              val => typeof val === 'string' && 
              (val.includes('minimum sales') || val.includes('not active') || val.includes('referral'))
            ))) {
          referralSpecificError = true;
          
          // Extract referral error message
          if (errorData.referral_code) {
            if (Array.isArray(errorData.referral_code)) {
              errorMessage = errorData.referral_code[0];
            } else {
              errorMessage = errorData.referral_code;
            }
          } else if (errorData.non_field_errors) {
            if (Array.isArray(errorData.non_field_errors)) {
              errorMessage = errorData.non_field_errors[0];
            } else {
              errorMessage = errorData.non_field_errors;
            }
          } else {
            // Try to find any error message
            const errorMessages = parseBackendErrors(error.response);
            if (errorMessages.length > 0) {
              errorMessage = errorMessages[0];
            }
          }
          
          // Set referral error state
          setReferralError({
            type: 'error',
            message: errorMessage
          });
        } else {
          // Other validation errors
          const errorMessages = parseBackendErrors(error.response);
          if (errorMessages.length > 0) {
            errorMessage = errorMessages[0];
          }
          
          // Update form errors if they're field-specific
          if (error.response.data && typeof error.response.data === 'object') {
            const fieldErrors = {};
            Object.keys(error.response.data).forEach(key => {
              if (key !== 'non_field_errors') {
                const messages = error.response.data[key];
                if (Array.isArray(messages) && messages.length > 0) {
                  fieldErrors[key] = messages[0];
                }
              }
            });
            
            if (Object.keys(fieldErrors).length > 0) {
              setErrors(fieldErrors);
            }
          }
        }
      }
      
      // Show appropriate alert
      if (referralSpecificError) {
        Swal.fire({
          icon: 'error',
          title: 'Cannot Register Under This Referral',
          html: `
            <div class="text-left">
              <div class="flex items-start mb-3">
                <FaExclamationTriangle class="text-yellow-500 mr-2 mt-1" />
                <p class="text-gray-700">${errorMessage}</p>
              </div>
              <div class="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p class="text-sm text-yellow-800 font-semibold">What can you do?</p>
                <ul class="text-sm text-yellow-700 list-disc pl-5 mt-2">
                  <li>Use a different referral code from an eligible agent</li>
                  <li>Register without a referral code (as a normal agent)</li>
                  <li>Contact the referring agent to complete their minimum sales requirement</li>
                </ul>
              </div>
            </div>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: errorMessage,
          confirmButtonColor: '#ef4444'
        });
      }
    }

    setLoading(false);
  };

  // Count required documents based on agent type
  const getRequiredDocumentsCount = () => {
    if (formData.agent_type === "pos" || formData.agent_type === "society") {
      return 4;
    }
    return 2;
  };

  const getUploadedDocumentsCount = () => {
    let count = 0;
    if (files.passport_photo) count++;
    if (files.id_proof) count++;
    if (formData.agent_type === "pos" || formData.agent_type === "society") {
      if (files.gst_certificate) count++;
      if (files.business_license) count++;
    }
    return count;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center py-10 px-4"
    >
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-100">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
            Become an Agent
          </h2>
          <p className="text-gray-500 mt-2">Join our network and start earning today</p>
        </motion.div>

        {/* Referral Code Error Alert */}
        {referralError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-semibold mb-1">Referral Code Issue</h4>
                <p className="text-red-700 text-sm">{referralError.message}</p>
                <div className="mt-2 text-xs text-red-600">
                  <p>💡 Tip: You can still register without a referral code. The referral code is optional.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Document Upload Progress */}
        <div className="mb-6 bg-blue-50 p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700">
              Documents Uploaded: {getUploadedDocumentsCount()}/{getRequiredDocumentsCount()}
            </span>
            <span className="text-xs text-blue-500">
              {formData.agent_type === "pos" || formData.agent_type === "society" ? "4 documents required" : "2 documents required"}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getUploadedDocumentsCount() / getRequiredDocumentsCount()) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Type Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="agent_type"
                  value={formData.agent_type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="normal">Normal Agent (2 Documents Required)</option>
                  <option value="pos">POS Agent (4 Documents Required)</option>
                  <option value="society">Society Agent (4 Documents Required)</option>
                </select>
              </div>
            </div>

            {/* Personal Information Header */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaUser className="mr-2 text-blue-500" />
                Personal Information
              </h3>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.full_name && errors.full_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.full_name && errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  placeholder="10-digit mobile number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.contact_number && errors.contact_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.contact_number && errors.contact_number && (
                <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="your@email.com"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="Minimum 8 characters"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.password && errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  placeholder="Your city"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.city && errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.city && errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  placeholder="Your state"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.state && errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.state && errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  placeholder="Your complete address"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.address && errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* POS/SOCIETY FIELDS */}
            {(formData.agent_type === "pos" || formData.agent_type === "society") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="col-span-2 space-y-4"
              >
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FaRegBuilding className="mr-2 text-blue-500" />
                    Business Information
                  </h3>
                </div>

                {/* Society/Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Society/Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="society_or_business_name"
                      value={formData.society_or_business_name}
                      placeholder="Enter society or business name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.society_or_business_name && errors.society_or_business_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.society_or_business_name && errors.society_or_business_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.society_or_business_name}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* DOCUMENTS SECTION */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaFile className="mr-2 text-blue-500" />
                Required Documents
                {formData.agent_type === "pos" || formData.agent_type === "society" ? (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    4 Documents Required
                  </span>
                ) : (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    2 Documents Required
                  </span>
                )}
              </h3>
            </div>

            {/* Passport Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passport Photo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCamera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="file"
                  name="passport_photo"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${touched.passport_photo && errors.passport_photo ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.passport_photo && errors.passport_photo && (
                <p className="text-red-500 text-xs mt-1">{errors.passport_photo}</p>
              )}
            </div>

            {/* ID Proof */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Proof <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="file"
                  name="id_proof"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${touched.id_proof && errors.id_proof ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {touched.id_proof && errors.id_proof && (
                <p className="text-red-500 text-xs mt-1">{errors.id_proof}</p>
              )}
            </div>

            {/* GST Certificate - POS/SOCIETY */}
            {(formData.agent_type === "pos" || formData.agent_type === "society") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Certificate <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaFile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="file"
                    name="gst_certificate"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${touched.gst_certificate && errors.gst_certificate ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {touched.gst_certificate && errors.gst_certificate && (
                  <p className="text-red-500 text-xs mt-1">{errors.gst_certificate}</p>
                )}
              </motion.div>
            )}

            {/* Business License - POS/SOCIETY */}
            {(formData.agent_type === "pos" || formData.agent_type === "society") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business License <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaFile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="file"
                    name="business_license"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${touched.business_license && errors.business_license ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {touched.business_license && errors.business_license && (
                  <p className="text-red-500 text-xs mt-1">{errors.business_license}</p>
                )}
              </motion.div>
            )}

            {/* Referral Code */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="referral_code"
                  value={formData.referral_code}
                  placeholder="Enter referral code if you have one"
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${referralError ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {validatingReferral && (
                <p className="text-blue-500 text-xs mt-1 flex items-center">
                  <FaSpinner className="animate-spin mr-1" /> Validating referral code...
                </p>
              )}
              {referralError && (
                <p className="text-red-500 text-xs mt-1">{referralError.message}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                💡 Note: The agent you're referring under must have completed minimum sales requirement
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8"
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </motion.div>

          {/* Terms and Conditions */}
          <p className="text-center text-sm text-gray-500 mt-4">
            By submitting, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default BecomeAgent;