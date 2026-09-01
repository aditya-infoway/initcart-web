import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaWhatsapp,
  FaGoogle,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaGlobe,
  FaPhoneAlt,
  FaEnvelope,
  FaUser,
  FaStar,
  FaShoppingCart,
  FaStore,
} from "react-icons/fa";
import { MdQrCodeScanner } from "react-icons/md";
import axios from "axios";

const LINKS = [
  { 
    key: "map_link", 
    label: "Location", 
    icon: FaMapMarkerAlt, 
    gradient: "from-green-500 to-green-600",
    border: "border-green-400",
    shadow: "shadow-green-500/30"
  },
  { 
    key: "whatsapp_link", 
    label: "WhatsApp", 
    icon: FaWhatsapp, 
    gradient: "from-green-400 to-green-500",
    border: "border-green-300",
    shadow: "shadow-green-400/30"
  },
  { 
    key: "google_review_link", 
    label: "Google Review", 
    icon: FaGoogle, 
    gradient: "from-blue-500 to-blue-600",
    border: "border-blue-400",
    shadow: "shadow-blue-500/30"
  },
  { 
    key: "instagram_link", 
    label: "Instagram", 
    icon: FaInstagram, 
    gradient: "from-pink-500 via-purple-500 to-orange-400",
    border: "border-pink-400",
    shadow: "shadow-pink-500/30"
  },
  { 
    key: "facebook_link", 
    label: "Facebook", 
    icon: FaFacebook, 
    gradient: "from-blue-600 to-blue-700",
    border: "border-blue-500",
    shadow: "shadow-blue-600/30"
  },
  { 
    key: "youtube_link", 
    label: "YouTube", 
    icon: FaYoutube, 
    gradient: "from-red-500 to-red-600",
    border: "border-red-400",
    shadow: "shadow-red-500/30"
  },
  { 
    key: "website_link", 
    label: "Website", 
    icon: FaGlobe, 
    gradient: "from-blue-400 to-blue-500",
    border: "border-blue-300",
    shadow: "shadow-blue-400/30"
  },
  { 
    key: "products_link", 
    label: "Products", 
    icon: FaShoppingCart, 
    gradient: "from-orange-400 to-orange-500",
    border: "border-orange-400",
    shadow: "shadow-orange-400/30"
  },
  { 
    key: "store_link", 
    label: "Store", 
    icon: FaStore, 
    gradient: "from-yellow-400 to-yellow-500",
    border: "border-yellow-400",
    shadow: "shadow-yellow-400/30"
  },
  { 
    key: "phone_link", 
    label: "Call", 
    icon: FaPhoneAlt, 
    gradient: "from-orange-400 to-orange-600",
    border: "border-orange-400",
    shadow: "shadow-orange-400/30"
  },
];

const QRPublicPage = () => {
  const { slug } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/ecommerce/public/qrcards/${slug}/`); 
        setCard(res.data); 
      } catch (err) { 
        setError(true); 
      } finally { 
        setLoading(false); 
      } 
    }; 
    if (slug) fetchCard(); 
  }, [slug]); 

  if (loading) { 
    return ( 
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-50"> 
        <div className="relative"> 
          <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div> 
          <div className="absolute inset-0 flex items-center justify-center"> 
            <MdQrCodeScanner className="text-blue-600 text-3xl animate-pulse" /> 
          </div> 
        </div> 
        <p className="mt-6 text-gray-600 font-medium">Loading your card...</p> 
      </div> 
    ); 
  } 

  if (error || !card) { 
    return ( 
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-navy-50 px-4"> 
        <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm"> 
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-navy-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30"> 
            <FaMapMarkerAlt className="text-white text-4xl" /> 
          </div> 
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Card Not Found</h2> 
          <p className="text-gray-600">The QR card you're looking for doesn't exist or has been removed.</p> 
        </div> 
      </div> 
    ); 
  } 

  return ( 
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-50 flex flex-col items-center py-8 px-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-400 to-navy-600 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-full opacity-10 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400 to-navy-700 rounded-full opacity-5 blur-3xl"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-400 to-navy-600 opacity-20 animate-float"
            style={{
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 3}s`
            }}
          ></div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-sm">
        
        {/* Main Card Container with Single Outer Border */}
        <div className="relative bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border-4 border-navy-600">
          
          {/* Profile Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block mb-4">
              {/* Animated Ring */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-400 via-navy-500 to-indigo-600 rounded-full opacity-60 blur-xl animate-pulse"></div>
              
              <div className="relative w-28 h-28 mx-auto">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-navy-700 p-1.5 shadow-2xl shadow-blue-500/30">
                  <div className="w-full h-full rounded-full bg-white p-1">
                    {card.logo ? (
                      <img 
                        src={card.logo} 
                        alt={card.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <FaUser className="text-navy-600 text-4xl" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-navy-800 mb-2 tracking-tight shimmer-text">
              {card.name}
            </h1>
            
            {card.bio && (
              <p className="text-navy-600/70 text-sm mb-4 max-w-xs mx-auto">
                {card.bio}
              </p>
            )}
          </div>

          {/* Icons Grid - Square Boxes */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {LINKS.map(({ key, label, icon: Icon, gradient, border, shadow }) => {
              const url = card[key]; 
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative bg-gradient-to-br ${gradient} ${shadow} rounded-2xl aspect-square flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg`}
                >
                  {/* Bold Border */}
                  <div className={`absolute inset-0 rounded-2xl border-4 ${border} pointer-events-none`}></div>
                  
                  {/* Inner Glow */}
                  <div className="absolute inset-1 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Icon centered */}
                  <Icon size={32} className="text-white group-hover:scale-110 transition-transform duration-300 relative z-10" />
                </a>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <MdQrCodeScanner className="text-navy-600 text-lg" />
              <span className="text-xs font-medium text-navy-700/80">Scan to connect</span>
            </div>
          </div>
        </div>
      </div>
    </div> 
  ); 
}; 

export default QRPublicPage;