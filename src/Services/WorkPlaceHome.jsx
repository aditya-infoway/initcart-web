import React from "react";
import Slider from "react-slick";
// 🚨 REQUIRED: Import useNavigate for actual routing
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  FaQuoteLeft,
  FaStar,
  FaBuilding, // Office/Commercial (formerly FaFileInvoiceDollar)
  FaUserFriends, // Co-working/Shared Space (formerly FaBalanceScale)
  FaWarehouse, // Industrial/Specialty (formerly FaHardHat)
} from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Function name: WorkPlaceHome
export default function WorkPlaceHome() {
  // Initialize the navigation hook
  const navigate = useNavigate();

  // 🎯 Single Redirection Function for all clicks
  // Assuming the target route for all clicks is a generic service/listing page
  const navigateToServiceList = () => {
    navigate("/servicelist"); // This mirrors the Saloon component's path
  };

  const categorySlider = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const reviewSlider = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [{ breakpoint: 1024, settings: { slidesToShow: 1 } }],
  };

  // 🏢 UPDATED Image content for Work Place Platform
  const privateOfficeImages = [
    // 1. Modern Private Office Interior
    "https://images.pexels.com/photos/313691/pexels-photo-313691.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 2. Executive Office View
    "https://images.pexels.com/photos/5668792/pexels-photo-5668792.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 3. Conference Room
    "https://images.pexels.com/photos/2443653/pexels-photo-2443653.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 4. Office Building Exterior
    "https://images.pexels.com/photos/209224/pexels-photo-209224.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 5. Open-plan Office
    "https://images.pexels.com/photos/3288102/pexels-photo-3288102.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 6. Office Desk Setup
    "https://images.pexels.com/photos/373473/pexels-photo-373473.jpeg?auto=compress&cs=tinysrgb&w=400",
  ];

  const coWorkingImages = [
    // 1. Vibrant Co-working Space
    "https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 2. Shared Hot Desks
    "https://images.pexels.com/photos/5712378/pexels-photo-5712378.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 3. Casual Meeting Area
    "https://images.pexels.com/photos/392018/pexels-photo-392018.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 4. Cafe/Lounge Area in Co-working
    "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 5. Phone Booth/Private Pod
    "https://images.pexels.com/photos/4050285/pexels-photo-4050285.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 6. Rooftop/Outdoor Co-working
    "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400",
  ];

  const commercialSpacesImages = [
    // 1. Retail Storefront
    "https://images.pexels.com/photos/6684617/pexels-photo-6684617.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 2. Large Warehouse Interior
    "https://images.pexels.com/photos/6347900/pexels-photo-6347900.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 3. Empty Commercial Building
    "https://images.pexels.com/photos/4904128/pexels-photo-4904128.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 4. Industrial Park Exterior
    "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 5. Restaurant Space
    "https://images.pexels.com/photos/9417861/pexels-photo-9417861.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 6. Data Center/Server Room
    "https://images.pexels.com/photos/4482869/pexels-photo-4482869.jpeg?auto=compress&cs=tinysrgb&w=400",
  ];

  // 📝 Category text for the Hero Banner
  const searchCategories = [
    { label: "Office (Private)" },
    { label: "Co-working (Shared)" },
    { label: "Commercial (Retail/Industrial)" },
  ];

  const [selectedCity, setSelectedCity] = React.useState("Ahmedabad");
  const [showCities, setShowCities] = React.useState(false);
  return (
    <div className="bg-gray-50">
      {/* 🎯 Hero Banner */}
      <section className="relative w-full h-[540px]">
        <img
          // ⭐ UPDATED MAIN BANNER IMAGE (Focus on modern office)
          src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="workplace-banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/60"></div>

        {/* Search Box with Categories above it */}
       <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
  {/* Title */}
  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-snug">
    Find the Best Workspaces and Offices Near You
  </h2>
  <p className="text-blue-100 text-xs sm:text-sm md:text-base mb-6 max-w-[90%] sm:max-w-[80%]">
    <span className="font-semibold">200+</span> verified workspaces and{" "}
    <span className="font-semibold">150+</span> office solutions to help your business thrive!
  </p>

  {/* Tabs */}
  <div className="bg-[#00000080] text-white rounded-2xl flex items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 py-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] overflow-x-auto scrollbar-hide">
    {["Type", "Private Office", "Retail Space", "Warehouse"].map((tab, idx) => (
      <button
        key={idx}
        className={`flex-shrink-0 pb-1 text-xs sm:text-sm md:text-base font-semibold border-b-2 ${
          idx === 0
            ? "border-white text-white"
            : "border-transparent text-gray-300 hover:text-white hover:border-white"
        } transition`}
        onClick={navigateToServiceList}
      >
        {tab}
      </button>
    ))}
  </div>

  {/* Search Bar */}
  <div
    className="relative bg-white shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] p-2 mt-[-1px]
  rounded-b-sm sm:rounded-full"
  >
    {/* City Dropdown */}
    <div className="relative sm:w-40 w-full sm:border-r border-b sm:border-b-0">
      <button
        onClick={() => setShowCities((prev) => !prev)}
        className="flex items-center justify-between w-full px-4 py-2 text-gray-800 font-medium"
      >
        {selectedCity}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-500 transform transition ${
            showCities ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showCities && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-lg z-30">
          {["Ahmedabad", "Mumbai", "Delhi", "Bangalore", "Pune"].map((city) => (
            <div
              key={city}
              className="px-4 py-2 text-left hover:bg-gray-100 cursor-pointer text-gray-700"
              onClick={() => {
                setSelectedCity(city);
                setShowCities(false);
              }}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Search Input */}
    <div className="flex-1 w-full">
      <input
        type="text"
        placeholder="Search for workspace or office type"
        className="w-full px-4 py-2 text-gray-700 outline-none border border-gray-200 rounded-md sm:border-none sm:rounded-none"
      />
    </div>

    {/* Search Button */}
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md sm:rounded-full font-semibold flex items-center justify-center transition w-full sm:w-auto"
      onClick={navigateToServiceList}
    >
      Search
    </button>
  </div>
</div>

      </section>

      {/* 🗝️ Core Work Place Features (Features) */}
      <section className="relative z-20 -mt-16">
        <div className="relative bg-blue-100 rounded-tl-[80px] rounded-tr-[80px] py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <FaBuilding className="text-4xl text-blue-600" />,
                  title: "Private Office Solutions",
                  text: "Secure, fully-equipped private offices for established teams and growing companies.",
                  bg: "bg-white",
                },
                {
                  icon: <FaUserFriends className="text-4xl text-green-600" />,
                  title: "Flexible Co-working",
                  text: "Shared spaces, hot desks, and flexible memberships for freelancers and startups.",
                  bg: "bg-white",
                },
                {
                  icon: <FaWarehouse className="text-4xl text-pink-600" />,
                  title: "Commercial & Industrial",
                  text: "Retail storefronts, warehouses, and specialized commercial property listings.",
                  bg: "bg-white",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                  className={`${item.bg} rounded-xl shadow-lg p-8 text-center hover:scale-105 transition cursor-pointer`}
                >
                  <div className="mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-16"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z"
              fill="#bfdbfe"
            ></path>
          </svg>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* 🏢 Private Office Listings */}
        <section className="py-10">
          <h2 className="text-2xl font-semibold mb-4">Prime Private Offices Available</h2>
          <Slider {...categorySlider}>
            {privateOfficeImages.map((img, id) => (
              <div key={id} className="p-2">
                <div
                  className="bg-white shadow rounded-lg hover:shadow-lg transition cursor-pointer"
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                >
                  <img
                    src={img}
                    alt={`Private office ${id + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold">City Tower Suite A{id + 1}</p>
                    <p className="text-sm text-gray-500">
                      Capacity 15 | $5,500/mo
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* 🤝 Co-working Space Listings */}
        <section className="py-10">
          <h2 className="text-2xl font-semibold mb-4">Top Co-working and Shared Spaces</h2>
          <Slider {...categorySlider}>
            {coWorkingImages.map((img, id) => (
              <div key={id} className="p-2">
                <div
                  className="bg-white shadow rounded-lg hover:shadow-lg transition cursor-pointer"
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                >
                  <img
                    src={img}
                    alt={`Co-working space ${id + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold">The Hub Downtown {id + 1}</p>
                    <p className="text-sm text-gray-500">
                      Flexible Memberships Available
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* 📢 Two Marketing Banners */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-[280px] rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.pexels.com/photos/5668846/pexels-photo-5668846.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="banner1"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center p-6">
                <div className="text-white max-w-sm">
                  <h2 className="text-2xl font-bold mb-3">
                    Need a Meeting Room for the Day?
                  </h2>
                  <button
                    className="bg-blue-600 px-5 py-2 rounded-lg cursor-pointer"
                    // 🎯 Redirection applied
                    onClick={navigateToServiceList}
                  >
                    Book Hourly
                  </button>
                </div>
              </div>
            </div>

            <div className="relative h-[280px] rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.pexels.com/photos/4050285/pexels-photo-4050285.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="banner2"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-end p-6">
                <div className="text-right text-white max-w-sm">
                  <h2 className="text-2xl font-bold mb-3">
                    View Virtual Office Solutions
                  </h2>
                  <button
                    className="bg-blue-600 px-5 py-2 rounded-lg cursor-pointer"
                    // 🎯 Redirection applied
                    onClick={navigateToServiceList}
                  >
                    Explore Mail Forwarding
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🏭 Commercial & Specialty Spaces */}
        <section className="py-10">
          <h2 className="text-2xl font-semibold mb-4">Retail, Industrial, and Specialty Spaces</h2>
          <Slider {...categorySlider}>
            {commercialSpacesImages.map((img, id) => (
              <div key={id} className="p-2">
                <div
                  className="bg-white shadow rounded-lg hover:shadow-lg transition cursor-pointer"
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                >
                  <img
                    src={img}
                    alt={`Commercial space ${id + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold">Retail Space on Main St. {id + 1}</p>
                    <p className="text-sm text-gray-500">
                      1,200 Sq Ft | Lease Available
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* 📢 Fullwidth Marketing Banner */}
        <section className="py-12">
          <div className="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://images.pexels.com/photos/4904118/pexels-photo-4904118.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="big-banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-start p-10">
              <div className="text-left text-white max-w-md">
                <h2 className="text-3xl font-bold mb-4">
                  Seamlessly Manage Your Entire Portfolio
                </h2>
                <p className="mb-4">
                  Use our platform to manage leases, maintenance requests, and space bookings across all your locations.
                </p>
                <button
                  className="bg-blue-600 px-6 py-2 rounded-lg cursor-pointer"
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                >
                  Access Management Tools
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ⭐ Reviews Section */}
        <section className="py-12">
          <h2 className="text-2xl font-semibold mb-6">Client Testimonials</h2>
          <Slider {...reviewSlider}>
            {[
              "Moving into our new private office was smooth and hassle-free. The building management is excellent.",
              "The co-working space provides the flexibility and community I need as a freelancer. Great amenities!",
              "We quickly found the perfect warehouse for our logistics needs thanks to the highly specific search filters.",
            ].map((review, id) => (
              <div key={id} className="p-4">
                <div
                  className="bg-purple-100 p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                >
                  <FaQuoteLeft className="text-blue-600 text-3xl mb-3" />
                  <p className="text-gray-700 mb-4">"{review}"</p>
                  <div className="flex items-center gap-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <FaStar key={i} className="text-yellow-500" />
                      ))}
                  </div>
                  <p className="mt-2 font-semibold">Client {id + 1}</p>
                </div>
              </div>
            ))}
          </Slider>
        </section>
      </div>
    </div>
  );
}