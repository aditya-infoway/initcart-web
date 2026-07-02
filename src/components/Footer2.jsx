import React from 'react'
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiLinkedin } from 'react-icons/fi'
import logo from '/logo.png'
import { Link } from 'react-router-dom'

export default function Footer2() {
  return (
    <footer className="mt-12 bg-[#143e56] text-white w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ✅ 5-column layout on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* --- 1. Brand Info --- */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
              <span className="font-semibold text-lg">InitCart</span>
            </Link>
            <div className="mt-6 space-y-3 text-white/90 text-sm">
              <div className="flex items-start gap-3">
                <FiPhone className="mt-0.5" /> <span>+00xxxxxxxxxx</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="mt-0.5" /> <span>initcart@gmailcom</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5" />
                <span>Ahemadabad</span>
              </div>
            </div>
          </div>

          {/* --- 2. Quick Links --- */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">
              Quick Links
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-white">Profile Info</a></li>
              <li><a href="#" className="hover:text-white">Flash Deal</a></li>
              <li><a href="#" className="hover:text-white">Featured Products</a></li>
              <li><a href="#" className="hover:text-white">Best Selling Product</a></li>
              <li><a href="#" className="hover:text-white">Latest Products</a></li>
              <li><a href="#" className="hover:text-white">Top Rated Product</a></li>
              <li><a href="#" className="hover:text-white">Track Order</a></li>
            </ul>
          </div>

          {/* --- 3. Our Products --- */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">
              Our Products
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-white">Profile Info</a></li>
              <li><a href="#" className="hover:text-white">Flash Deal</a></li>
              <li><a href="#" className="hover:text-white">Featured Products</a></li>
              <li><a href="#" className="hover:text-white">Best Selling Product</a></li>
              <li><a href="#" className="hover:text-white">Latest Products</a></li>
              <li><a href="#" className="hover:text-white">Top Rated Product</a></li>
              <li><a href="#" className="hover:text-white">Track Order</a></li>
            </ul>
          </div>

          {/* --- 4. Other --- */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">
              Other
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Refund Policy</a></li>
              <li><a href="#" className="hover:text-white">Return Policy</a></li>
              <li><a href="#" className="hover:text-white">Cancellation Policy</a></li>
            </ul>
          </div>

          {/* --- 5. Newsletter --- */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">
              Newsletter
            </div>
            <p className="mt-4 text-sm text-white/80">
              Subscribe to our channel to get latest updates
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <input
                placeholder="Your Email Address"
                className="flex-1 rounded-md bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/60"
              />
              <button className="rounded-md bg-white text-[#143e56] px-3 py-2 text-sm font-semibold hover:bg-gray-100 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* --- Bottom Section --- */}
        <div className="mt-10 border-t border-white/10 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/80">
          <div className="flex justify-center md:justify-start items-center gap-4">
            <a href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><FiFacebook /></a>
            <a href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><FiInstagram /></a>
            <a href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><FiTwitter /></a>
            <a href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><FiYoutube /></a>
            <a href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><FiLinkedin /></a>
          </div>
          <div className="text-center">Support Ticket</div>
          <div className="text-center md:text-right">© 2025 InitCart. All Rights Reserved.</div>
        </div>
      </div>
    </footer>
  )
}
