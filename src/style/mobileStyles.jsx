import { useNavigate } from "react-router-dom";

// ✅ FIXED FONT SIZES - Sab mobile pages me yahi use hoga
export const FONTS = {
  // Headers
  pageTitle: "text-[16px] font-bold",
  pageSubtitle: "text-[11px] font-normal",
  
  // Search
  searchInput: "text-[13px] font-normal",
  
  // Cards
  cardTitle: "text-[13px] font-semibold",
  cardSub: "text-[10px] font-normal",
  
  // Badges & Tags
  badge: "text-[10px] font-semibold",
  pill: "text-[11px] font-semibold",
  
  // Stats
  statNum: "text-[13px] font-bold",
  statLabel: "text-[9px] font-semibold uppercase",
  
  // Empty States
  emptyTitle: "text-[15px] font-bold",
  emptySubtitle: "text-[12px] font-normal",
};

// ✅ Common Header Component - Sab pages me same
export const MobileHeader = ({ title, subtitle, showBack = true, onBack }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div className="px-3 py-2">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center active:bg-gray-100"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className={`${FONTS.pageTitle} text-gray-900`}>{title}</h1>
            {subtitle && (
              <p className={`${FONTS.pageSubtitle} text-gray-400`}>{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};