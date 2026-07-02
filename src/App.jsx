//src/app.jsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import ScrollToTop from './components/ScrollToTop.jsx';
import AndroidBackButton from './components/AndroidBackButton.jsx';
// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import EcomLayout from './EcomLayout.jsx';
import ServiceLayout from './ServiceLayout.jsx';

// Pages
import VendorList from './pages/VendorList.jsx';
import VendorStorePage from './pages/VendorStorePage.jsx';
import VendorRegistration from './pages/VendorRegistration.jsx';
import DealOfTheDay from './pages/DealOfTheDayList.jsx';
import CategoryList from './pages/CategoryList.jsx';
import FlashDealList from './pages/FlashDealList.jsx';
import BrandList from './pages/BrandList.jsx';
import ProductDetailPage from './pages/ProductDetail.jsx';
import ServiceHome from './Services/ServiceHome.jsx';
import ServiceListPage from './pages/ServiceListPage.jsx';
import RealEstate from './Services/RealEstate.jsx';
import Services from './Services/ServiceCommon.jsx';
import RealEstateHome from './Services/RealEstateHome.jsx';
import ServiceList from './Services/ServiceListCommon.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import GymHome from './Services/GymHome.jsx';
import HairSaloonHome from './Services/SaloonHome.jsx';
import TravelAgencyHome from './Services/TravelAgencyHome.jsx';
import FinanceHome from './Services/FinanceHome.jsx';
import TechIndustryHome from './Services/TechIndustryHome.jsx';
import HospitalityHome from './Services/HotelHome.jsx';
import HealthcareHome from './Services/HealthcareHome.jsx';
import EducationHome from './Services/EducationHome.jsx';
import ProfessionalHome from './Services/ProfessionalHome.jsx';
import WorkPlaceHome from './Services/WorkPlaceHome.jsx';
import MobileHome from './pages/MobileHome.jsx';
import Offer from './pages/Offer.jsx';
import ProductListPage from './pages/Productlist.jsx';
import SellerListPage from './pages/SellerList.jsx';
import ServiceListLayout from './Services/ServiceFlashdealList.jsx';
import UserLogin from './pages/UserLogin.jsx';
import UserRegistration from './pages/UserRegistration.jsx';
import CategoryProductsPage from './pages/CategoryProductsPage.jsx';
import CategoryPage from './pages/CategoryPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import ForgotPassword from './components/auth/Forgotpassword.jsx';
import ManualReset from './components/auth/ManualReset.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';
import ResetSuccess from './components/auth/ResetSuccess.jsx';
import BrandProductsPage from './pages/BrandProductsPage.jsx'
import VendorOffersPage from './pages/VendorOfferPage.jsx';
import SubCategoryListPage from './pages/SubCategoryListPage.js';
import UpcomingDealsSlider from './pages/UpcomingDealsSlider.js';
import HomeSliders from './pages/HomeSliders.jsx';
import Searchlist from './pages/Searchlist.jsx';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import DealOfDayListPage from './pages/DodListPage.jsx';
import FlashDealListPage from './pages/FdlistPage.jsx';
import FeaturedDealListPage from './pages/featuredDealListPage.jsx';
import OrdersPage from './pages/UserOrdors.jsx';
import OrderDetailsPage from './pages/OrderDetailPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import BecomeAgent from './pages/BecomeAgent.jsx';
import CustomerProfilePage from './pages/customerProfile.jsx';
import TravelAgencyDetail from './Services/TravelAgencyDetail.jsx';
import SalonDetail from './Services/SalonDetail.jsx';
import GymDetail from './Services/GymDetail.jsx';
import TechIndustryDetail from './Services/TechIndustryDetail.jsx';
import ProfessionalDetail from './Services/ProfessionalDetail.jsx';
import FinanceDetail from './Services/FinaceDetail.jsx';
import HealthcareDetail from './Services/HealthcareDetail.jsx';
import EducationDetail from './Services/EducationDetails.jsx';
import MobileAboutUsPage from './pages/mobile/MobileAboutUsPage.jsx';
import RestaurantHome from './Services/Restauranthome.jsx';
import RestaurantDetail from './Services/RestaurantDetail.jsx';
import HotelHome from './Services/Hotelhomes.jsx';
import HotelDetail from './Services/Hoteldetail.jsx';
import HotelHome2 from './Services/Hotelhomes.jsx';


function App() {
  useEffect(() => {
    // Force auth check on every page load


    const token = localStorage.getItem('customer_token');
    const userStr = localStorage.getItem('customer_user');


    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    
    if (ref) {
      const cleanRef = ref.trim().toUpperCase();
      localStorage.setItem("referral_code", cleanRef);

      
      // Optional: URL se ?ref= hatane ke liye (clean URL)
      const url = new URL(window.location);
      url.searchParams.delete("ref");
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  }, []);


  return (
      <>
   <AndroidBackButton />
    <ScrollToTop />


    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* E-commerce pages */}
          <Route element={<EcomLayout />}>
            <Route path="/" element={<MobileHome />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/category-products" element={<CategoryProductsPage />} />
            <Route path="/brand-products" element={<BrandProductsPage />} />
            <Route path="/vendor/:id" element={<VendorStorePage />} />
            <Route path="/vendorlist" element={<VendorList />} />
            <Route path="/subcategorieslist" element={<SubCategoryListPage />} />
            <Route path="/dealoftheday-list" element={<DealOfTheDay />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/categorylist" element={<CategoryList />} />
            <Route path="/flashdeallist" element={<FlashDealList />} />
            <Route path="/productlist" element={<ProductListPage />} />
            <Route path="/sellerlist" element={<SellerListPage />} />
            <Route path="/brandlist" element={<BrandList />} />
            <Route path="/vendor-registration" element={<VendorRegistration />} />
            <Route path="/servicelistpage" element={<ServiceListPage />} />
            <Route path="/upcomingdeal" element={<UpcomingDealsSlider/>}/>
            <Route path="/homesliders" element={<HomeSliders/>}/>
            <Route path="/dealOfTheDayListPage" element={<DealOfDayListPage/>}/>
            <Route path="/FlashDealListPage" element={<FlashDealListPage/>}/>
            <Route path="/FeaturedDealList" element={<FeaturedDealListPage/>}/>
            <Route path="/orders" element={<OrdersPage/>}/>
            <Route path="/order/:orderNumber" element={<OrderDetailsPage />} />
            <Route path="/searchlist" element={<Searchlist/>}/>
            <Route path="/becomeAgent" element={<BecomeAgent />} /> 
            <Route path="/aboutUs" element={<MobileAboutUsPage/>}/>


            {/* Protected Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route path="/vendor-offers/:id" element={<VendorOffersPage />} />
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
            <Route path="/trackOrder/:orderNumber" element={<OrderTrackingPage />} />
            <Route path="/offer" element={<Offer />} />
            <Route path="/customer/login" element={<UserLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/manual-reset" element={<ManualReset />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/reset-success" element={<ResetSuccess />} />
            <Route path="/customer/registration" element={<UserRegistration />} />
            <Route path="/customerProfile" element={<CustomerProfilePage/>}/>

          </Route>

          {/* Service pages */}
          <Route element={<ServiceLayout />}>
            <Route path="/servicehome" element={<ServiceHome />} />
            <Route path="/serviceflashdeal" element={<ServiceListLayout />} />
            <Route path="/servicelist" element={<ServiceList />} />
            <Route path="/searchservice" element={<ServiceList />} />  
            <Route path="/servicedetail" element={<Services />} />
            <Route path="/realestate/:id" element={<RealEstate />} />
            <Route path="/realestatehome" element={<RealEstateHome />} />
            <Route path="/gymhome" element={<GymHome />} />
            <Route path="/gymdetail/:id" element={<GymDetail />} />
            <Route path="/saloonhome" element={<HairSaloonHome />} />
            <Route path="/salondetail/:id" element={<SalonDetail />} />
            <Route path="/travelhome" element={<TravelAgencyHome />} />
            <Route path="/travelagencydetail/:id" element={<TravelAgencyDetail />} />
            <Route path="/financehome" element={<FinanceHome />} />
            <Route path='/financedetail/:id' element={<FinanceDetail/>}/>
            <Route path="/techindustryhome" element={<TechIndustryHome />} />
            <Route path="/techdetail/:id" element={<TechIndustryDetail />} />
            {/* <Route path="/hotelhome" element={<HospitalityHome />} /> */}
            <Route path="/helthcarehome" element={<HealthcareHome />} />
            <Route path="/healthcaredetail/:id" element={<HealthcareDetail/>} />
            <Route path="/educationhome" element={<EducationHome />} />
            <Route path="/educationdetail/:id" element={<EducationDetail />} />
            <Route path="/professionalhome" element={<ProfessionalHome />} />
            <Route path="/professionaldetail/:id" element={<ProfessionalDetail />} />
            <Route path="/workplacehome" element={<WorkPlaceHome />} />
            <Route path="/restauranthome" element={<RestaurantHome/>}/>
            <Route path="/restaurantdetail/:id" element={<RestaurantDetail/>}/>
            <Route path="/hotelhome" element={<HotelHome2/>} />
            <Route path="/hoteldetail/:id" element={<HotelDetail />} />
          </Route>
        </Routes>

      </ToastProvider>
    </AuthProvider>
      </>
  );
}

export default App;