import React, { useState, useEffect } from "react";
import { registerVendor } from "../service/VendorService";
import Swal from "sweetalert2";
import MobileVendorRegistration from "./mobile/MobileVendorRegisterationPage";

export default function VendorRegistration() {
  // ✅ FIX: Initialize with false, then check on mount
  const [isMobile, setIsMobile] = useState(false);
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

  const [loading, setLoading] = useState(false);

  // ✅ FIX: Check mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener("resize", checkMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ FIX: Move mobile check AFTER all hooks
  if (isMobile) {
    return <MobileVendorRegistration />;
  }

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const newValue = type === "checkbox" ? checked : files ? files[0] : value;
    
    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Clear file errors when file is selected
    if (files && (name === 'storeLogo' || name === 'idProof')) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle image upload via icon click
  const handleImageUpload = (name, file) => {
    if (file) {
      setFormData({
        ...formData,
        [name]: file,
      });
      
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));

      setFileInputKeys(prev => ({
        ...prev,
        [name]: Date.now()
      }));
    }
  };

  // Validate files before submission
  const validateFiles = () => {
    const errors = {
      storeLogo: "",
      idProof: "",
    };

    if (!formData.storeLogo) {
      errors.storeLogo = "Store logo is required";
    }

    if (!formData.idProof) {
      errors.idProof = "ID proof is required";
    }

    setFormErrors(errors);
    return !errors.storeLogo && !errors.idProof;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFiles()) {
      Swal.fire({
        icon: "error",
        title: "Missing Documents",
        text: "Please upload both Store Logo and ID Proof documents.",
      });
      return;
    }

    if (!formData.acceptTerms) {
      Swal.fire({
        icon: "warning",
        title: "Terms Required",
        text: "Please accept the terms and conditions before submitting.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Password and Confirm Password do not match.",
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
      
      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: response.message || "Vendor registration completed successfully!",
        confirmButtonText: "OK"
      });

      setFormData({
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

      setFormErrors({
        storeLogo: "",
        idProof: "",
      });

      setFileInputKeys({
        storeLogo: Date.now(),
        idProof: Date.now() + 1,
        licenceFile: Date.now() + 2,
        gstCertificate: Date.now() + 3,
      });

    } catch (error) {
      console.error("Registration Error:", error.response?.data || error);
      const err = error.response?.data?.errors || error.response?.data || {};
      
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.email || err.confirm_password || err.message || "Something went wrong. Please check all fields.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Universal File Upload Component
  const FileUploadIcon = ({ name, label, required = false, acceptedTypes = "*" }) => {
    const fileInputRef = React.useRef(null);

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        handleImageUpload(name, file);
      }
    };

    const handleIconClick = () => {
      fileInputRef.current?.click();
    };

    const getIcon = () => {
      switch(name) {
        case 'storeLogo':
          return (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          );
        case 'idProof':
          return (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          );
        case 'licenceFile':
          return (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          );
        case 'gstCertificate':
          return (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          );
        default:
          return (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          );
      }
    };

    const getFileTypeText = () => {
      if (name === 'storeLogo') {
        return "PNG, JPG, JPEG (Max 5MB)";
      } else {
        return "PDF, DOC, Image (Max 5MB)";
      }
    };

    return (
      <div className="flex flex-col items-center">
        <label className="block text-gray-600 mb-3 font-medium text-center">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        <input
          key={fileInputKeys[name]}
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept={name === 'storeLogo' ? "image/*" : "*"}
        />
        
        <div 
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          onClick={handleIconClick}
        >
          <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
            {getIcon()}
          </div>
        </div>

        <div className="text-center mt-3">
          <p className="text-sm text-gray-600 font-medium">
            Tap to upload
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getFileTypeText()}
          </p>
        </div>

        {formErrors[name] && (
          <div className="text-red-500 text-sm mt-2 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {formErrors[name]}
          </div>
        )}

        {formData[name] && (
          <div className="text-green-600 text-sm mt-2 text-center">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {formData[name].name}
          </div>
        )}
      </div>
    );
  };

  // Desktop View
  return (
    <div className="flex justify-center items-center py-6 bg-gray-100 px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 shadow-lg rounded-xl overflow-hidden">
        {/* Left Panel */}
        <div className="bg-blue-50 flex flex-col justify-center items-center text-center p-8">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3597/3597075.png"
            alt="Vendor Registration"
            className="w-48 h-48 mb-6"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Vendor Registration
          </h2>
          <p className="text-gray-600">
            Create your business account and start selling your services or products!
          </p>
          
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-700 mb-2">Required Documents:</h4>
            <ul className="text-sm text-gray-600 text-left space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Store Logo (Required)
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                ID Proof - Aadhar/PAN (Required)
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Business License (Optional)
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                GST Certificate (Optional)
              </li>
            </ul>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Business Type */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Business Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1">
                    Select Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData({
                        ...formData,
                        businessType: e.target.value,
                        vendorSubType: "",
                      });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="product">Product Vendor</option>
                    <option value="service">Service Vendor</option>
                  </select>
                </div>

                {formData.businessType && (
                  <div>
                    <label className="block text-gray-600 mb-1">
                      {formData.businessType === "product" ? "Product Vendor Type" : "Service Category"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="vendorSubType"
                      value={formData.vendorSubType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Type</option>
                      {formData.businessType === "product" ? (
                        <>
                          <option value="retailer">Retailer</option>
                          <option value="wholesaler">Wholesaler</option>
                        </>
                      ) : (
                        <>
                          <option value="salon">Salon</option>
                          <option value="gym">Gym</option>
                          <option value="real_estate">Real Estate</option>
                          <option value="travel_agency">Travel Agency</option>
                          <option value="finance">Finance</option>
                          <option value="tech">Tech Industry</option>
                          <option value="hotel">Hotel</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="professional">Professional</option>
                          <option value="restaurant">Restaurant</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Owner Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="ownerName"
                    placeholder="Owner Name *"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone *"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Business Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="businessName"
                  placeholder="Business / Shop Name *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="shopAddress"
                  placeholder="Address *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Upload Documents */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-6">
                Upload Documents
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <FileUploadIcon 
                  name="storeLogo" 
                  label="Store Logo" 
                  required={true}
                />
                <FileUploadIcon 
                  name="idProof" 
                  label="ID Proof (Aadhar/PAN Card)" 
                  required={true}
                />
                <FileUploadIcon 
                  name="licenceFile" 
                  label="Business License" 
                  required={false}
                />
                <FileUploadIcon 
                  name="gstCertificate" 
                  label="GST Certificate" 
                  required={false}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                required
              />
              <label className="text-gray-600">
                I accept the terms and conditions <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105"
                } text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 font-medium text-lg w-full md:w-auto`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Registration...
                  </div>
                ) : (
                  "Register as Vendor"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}