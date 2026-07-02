import React, { useEffect, useState } from 'react'
import { FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail } from 'react-icons/fi'
import logo from '/logo.png'
import { FaWhatsapp } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { publicAxios } from '../api/axios'
import { RiTwitterXLine } from "react-icons/ri";
import MobileFooter from './MobileFooter';

export default function Footer() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [info, setInfo] = useState(null)

  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => {
    loadInfo()
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [])

  const loadInfo = async () => {
    try {
      const res = await publicAxios.get('api/banners/init-admin-footer/')
      setInfo(res.data)
    } catch (err) {
      console.error('Footer API error:', err)
    }
  }

    if (isMobile) {
    return <MobileFooter />;
  }

  return (
    <footer className="bg-[#143e56] text-white w-full overflow-hidden">
      {/* Removed mt-12 to eliminate extra top space */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Mobile: 2 columns (grid-cols-2), Desktop: 6 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">

          {/* --- 1. Company Info --- */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
              <span className="font-semibold text-lg">InitCart</span>
            </Link>
            <div className="mt-4 space-y-2 text-white/90 text-sm">
              <div className="flex items-start gap-3">
                <FiPhone className="mt-0.5 flex-shrink-0" /> 
                <span className="break-words">{info?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="mt-0.5 flex-shrink-0" /> 
                <span className="break-words">{info?.email || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 flex-shrink-0" />
                <span className="break-words">{info?.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* --- 2. Quick Links --- */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">
              Quick Links
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-white/80">
              <li><a href="#" className="hover:text-white transition">Profile Info</a></li>
              <li><a href="#" className="hover:text-white transition">Flash Deal</a></li>
              <li><a href="#" className="hover:text-white transition">Featured Products</a></li>
              <li><a href="#" className="hover:text-white transition">Best Selling Product</a></li>
              <li><a href="#" className="hover:text-white transition">Latest Products</a></li>
              <li><a href="#" className="hover:text-white transition">Top Rated Product</a></li>
              <li><a href="#" className="hover:text-white transition">Track Order</a></li>
            </ul>
          </div>

          {/* --- 3. Our Products --- */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">
              Our Products
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-white/80">
              <li><a href="/" className="hover:text-white transition">Profile Info</a></li>
              <li><a href="/" className="hover:text-white transition">Flash Deal</a></li>
              <li><a href="/" className="hover:text-white transition">Featured Products</a></li>
              <li><a href="/" className="hover:text-white transition">Best Selling Product</a></li>
              <li><a href="/" className="hover:text-white transition">Latest Products</a></li>
              <li><a href="/" className="hover:text-white transition">Top Rated Product</a></li>
              <li><a href="/" className="hover:text-white transition">Track Order</a></li>
            </ul>
          </div>

          {/* --- 4. Our Services --- */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <div className="text-sm font-semibold uppercase tracking-wide">
              Our Services
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-white/80">
              <li><Link to="/servicehome" className="hover:text-white transition">All Services</Link></li>
              <li><Link to="/realestate" className="hover:text-white transition">Real Estate</Link></li>
              <li><Link to="/gymhome" className="hover:text-white transition">Gym</Link></li>
              <li><Link to="/saloonhome" className="hover:text-white transition">Saloon</Link></li>
              <li><Link to="/travelhome" className="hover:text-white transition">Travel Agency</Link></li>
              <li><Link to="/financehome" className="hover:text-white transition">Finance</Link></li>
              <li><Link to="/techindustryhome" className="hover:text-white transition">Tech Industry</Link></li>
              <li><Link to="/hotelhome" className="hover:text-white transition">Hotel & Restaurant</Link></li>
              <li><Link to="/helthcarehome" className="hover:text-white transition">Healthcare</Link></li>
              <li><Link to="/educationhome" className="hover:text-white transition">Education</Link></li>
              <li><Link to="/professionalhome" className="hover:text-white transition">Professional</Link></li>
              <li><Link to="/workplacehome" className="hover:text-white transition">Work Place</Link></li>
            </ul>
          </div>

          {/* --- 5. Other --- */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">
              Other
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-white/80">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Terms And Conditions</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Return Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Cancellation Policy</a></li>
            </ul>
          </div>

          {/* --- 6. Newsletter --- */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <div className="text-sm font-semibold uppercase tracking-wide">
              Newsletter
            </div>
            <p className="mt-3 text-sm text-white/80">
              Subscribe to our channel to get latest updates
            </p>
            <div className="mt-3 flex gap-2 w-full">
              <input
                type="email"
                placeholder="Your Email Address"
                className="flex-1 rounded-md bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/60"
              />
              <button className="rounded-md bg-white text-[#143e56] px-3 py-2 text-sm font-semibold hover:bg-gray-100 transition flex-shrink-0 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* --- Bottom Section --- */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
          <div className="flex justify-center items-center gap-3">
            <a href={info?.facebook} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
              <FiFacebook className="w-4 h-4" />
            </a>
            <a href={info?.instagram} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
              <FiInstagram className="w-4 h-4" />
            </a>
            <a href={info?.twitter} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
              <RiTwitterXLine className="w-4 h-4" />
            </a>
            <a href={info?.youtube} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
              <FiYoutube className="w-4 h-4" />
            </a>
            <a href={info?.whatsapp} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
              <FaWhatsapp className="w-4 h-4" />
            </a>
          </div>
          <div className="text-center">
            <a href="#" className="hover:text-white transition">Support Ticket</a>
          </div>
          <div className="text-center">
            © 2025 InitCart. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}