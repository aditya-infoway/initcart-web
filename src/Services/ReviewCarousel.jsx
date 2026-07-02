// src/components/reviews/ReviewCarousel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared infinite auto-sliding carousel for reviews.
// - Shows exactly 2 review cards per "page"
// - Auto-advances every few seconds
// - Pauses on hover / touch / manual interaction (drag, arrow click, dot click)
// - Resumes automatically a few seconds after the user stops interacting
// - True infinite loop in both directions via the clone-trick (no jump/flash)
// - Fixed card height; only grows a "Show more" link if content actually overflows
// All text in English
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FaStar } from "react-icons/fa";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

const AUTO_PLAY_MS = 4500;
const RESUME_AFTER_MS = 5000;
const TRANSITION_MS = 550;

// ── Static stars ─────────────────────────────────────────────────────────────
function StarRow({ value, size = 12, accent }) {
  const filled = { orange: "#f97316", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", red: "#ef4444" };
  const color = filled[accent] || filled.blue;
  return (
    <div className="flex gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar key={s} size={size} color={value >= s ? color : "#e5e7eb"} />
      ))}
    </div>
  );
}

function formatDate(dateStr, withDay = false) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return withDay
    ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

const ACCENTS = {
  blue:   { badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-600",   avatar: "bg-gradient-to-br from-blue-400 to-blue-600",   btn: "text-blue-600 hover:text-blue-800",   ring: "focus-visible:ring-blue-400",   arrowBg: "hover:bg-blue-50 hover:text-blue-600" },
  orange: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500", avatar: "bg-gradient-to-br from-orange-400 to-orange-600", btn: "text-orange-600 hover:text-orange-800", ring: "focus-visible:ring-orange-400", arrowBg: "hover:bg-orange-50 hover:text-orange-600" },
  green:  { badge: "bg-green-100 text-green-700", dot: "bg-green-600", avatar: "bg-gradient-to-br from-green-400 to-green-600", btn: "text-green-600 hover:text-green-800", ring: "focus-visible:ring-green-400", arrowBg: "hover:bg-green-50 hover:text-green-600" },
  purple: { badge: "bg-purple-100 text-purple-700", dot: "bg-purple-600", avatar: "bg-gradient-to-br from-purple-400 to-purple-600", btn: "text-purple-600 hover:text-purple-800", ring: "focus-visible:ring-purple-400", arrowBg: "hover:bg-purple-50 hover:text-purple-600" },
};

function getAccent(accentColor) {
  return ACCENTS[accentColor] || ACCENTS.blue;
}

// ── Single review card (fixed height, "Show more" only if it actually overflows) ──
function ReviewCard({ review, accentColor, ac, showServiceBadge, onNavigate, displayName }) {
  const textRef = useRef(null);
  const [canExpand, setCanExpand] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    // Compare collapsed scrollHeight vs clamped clientHeight to know if truncation actually happened
    setCanExpand(el.scrollHeight - el.clientHeight > 2);
  }, [review.review]);

  const initial = (displayName || "U").charAt(0).toUpperCase();
  const canNavigate = !!onNavigate;

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5"
      style={{ minHeight: 0 }}
    >
      {/* Top: avatar + name + date + rating */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${ac.avatar}`}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">{displayName}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiCalendar className="h-3 w-3 shrink-0" />
              {formatDate(review.created_at, true)}
            </div>
          </div>
        </div>
        <StarRow value={review.rating} size={12} accent={accentColor} />
      </div>

      {/* Review text — clamped to a fixed number of lines so every card matches height */}
      {review.review && (
        <p
          ref={textRef}
          className={`text-sm leading-relaxed text-gray-600 ${expanded ? "" : "line-clamp-3"}`}
        >
          {review.review}
        </p>
      )}

      {/* Show more / less — only rendered if content genuinely overflows */}
      {canExpand && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className={`mt-1 self-start text-xs font-semibold ${ac.btn} focus:outline-none`}
        >
          {expanded ? "Show less" : "More"}
        </button>
      )}

      {/* Footer pushed down, only if there's room / always at bottom of card */}
      {(showServiceBadge && review._service_name) || canNavigate ? (
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
          {showServiceBadge && review._service_name ? (
            <span className={`truncate text-xs font-medium px-2.5 py-1 rounded-full ${ac.badge}`}>
              {review._service_name}
            </span>
          ) : (
            <span />
          )}
          {canNavigate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
              className={`flex shrink-0 items-center gap-1 text-xs font-medium ${ac.btn}`}
            >
              View <FiArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main carousel: exactly 2 cards visible per page, infinite, auto-playing,
// pauses on interaction and resumes automatically after RESUME_AFTER_MS.
// ══════════════════════════════════════════════════════════════════════════════
export default function ReviewCarousel({
  reviews = [],
  accentColor = "blue",
  showServiceBadge = false,
  getDisplayName,
  onNavigateItem, // (review) => void | undefined
  emptyMessage = "No reviews yet",
  emptySubMessage = "Be the first to review!",
}) {
  const ac = getAccent(accentColor);
  const perPage = 2;
  const count = reviews.length;

  // How many "pages" do we have (rounded up so a lone leftover review still gets a page)
  const pageCount = Math.max(1, Math.ceil(count / perPage));

  // Build the slide list as PAGES (each page = array of up to 2 reviews),
  // then clone the first page at the end and the last page at the start
  // so we can loop infinitely without ever showing an empty/jump frame.
  const pages = useMemo(() => {
    const base = [];
    for (let i = 0; i < count; i += perPage) {
      base.push(reviews.slice(i, i + perPage));
    }
    return base;
  }, [reviews, count]);

  const needsClones = pages.length > 1;
  const slides = useMemo(() => {
    if (!needsClones) return pages;
    return [pages[pages.length - 1], ...pages, pages[0]];
  }, [pages, needsClones]);

  // Index 0 is the cloned-last page when clones exist, so real start is index 1
  const startIndex = needsClones ? 1 : 0;
  const [index, setIndex] = useState(startIndex);
  const [animate, setAnimate] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const trackRef = useRef(null);
  const autoTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isTransitioningRef = useRef(false); // guards against rapid clicks racing past slide bounds

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Reset position if the underlying review set changes size/shape
  useEffect(() => {
    isTransitioningRef.current = false;
    setAnimate(false);
    setIndex(startIndex);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length]);

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const goNext = useCallback(() => {
    if (pages.length <= 1 || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setAnimate(true);
    setIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [pages.length, slides.length]);

  const goPrev = useCallback(() => {
    if (pages.length <= 1 || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setAnimate(true);
    setIndex((i) => Math.max(i - 1, 0));
  }, [pages.length, slides.length]);

  // ── Auto-play loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    clearAutoTimer();
    if (isPaused || pages.length <= 1) return;
    autoTimerRef.current = setInterval(() => {
      goNext();
    }, AUTO_PLAY_MS);
    return clearAutoTimer;
  }, [isPaused, pages.length, goNext, clearAutoTimer]);

  // ── Seamless infinite teleport: when we land on a cloned page, silently
  //    snap (no transition) to the matching real page on the other end ──────
  const handleTransitionEnd = useCallback(() => {
    if (needsClones && index === slides.length - 1) {
      setAnimate(false);
      setIndex(startIndex);
    } else if (needsClones && index === 0) {
      setAnimate(false);
      setIndex(slides.length - 2);
    } else {
      // Normal slide settled — safe to accept the next nav request
      isTransitioningRef.current = false;
    }
  }, [index, slides.length, needsClones, startIndex]);

  // Re-enable transition on the next frame after a silent snap, and release
  // the nav lock now that we've landed on the real (non-clone) slide.
  useEffect(() => {
    if (!animate) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isMountedRef.current) {
            setAnimate(true);
            isTransitioningRef.current = false;
          }
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [animate]);

  // ── Pause on interaction, auto-resume after idle ───────────────────────────
  const pauseAndScheduleResume = useCallback(() => {
    setIsPaused(true);
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setIsPaused(false);
    }, RESUME_AFTER_MS);
  }, [clearResumeTimer]);

  useEffect(() => () => {
    clearAutoTimer();
    clearResumeTimer();
  }, [clearAutoTimer, clearResumeTimer]);

  // Manual nav (arrows / dots) counts as interaction too
  const handleManualNav = (fn) => {
    fn();
    pauseAndScheduleResume();
  };

  // ── Touch / drag support (mobile-friendly swipe) ───────────────────────────
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
    clearResumeTimer();
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > 40) goPrev();
    else if (dx < -40) goNext();
    pauseAndScheduleResume();
  };

  // Real (non-clone) page for the dot indicator
  const realPageIndex = needsClones
    ? (((index - startIndex) % pages.length) + pages.length) % pages.length
    : index;

  if (count === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center">
        <FaStar size={28} color="#e5e7eb" className="mx-auto mb-3" />
        <p className="font-medium text-gray-500">{emptyMessage}</p>
        <p className="mt-1 text-sm text-gray-400">{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { clearResumeTimer(); setIsPaused(false); }}
    >
      {/* Viewport: fixed compact height, clips the sliding track */}
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animate ? `transform ${TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)` : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((pageReviews, pIdx) => (
            <div key={pIdx} className="grid w-full shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {pageReviews.map((r, cardIdx) => (
                <ReviewCard
                  key={r.id ?? `${pIdx}-${cardIdx}`}
                  review={r}
                  accentColor={accentColor}
                  ac={ac}
                  showServiceBadge={showServiceBadge}
                  displayName={getDisplayName ? getDisplayName(r) : r.user_name || "Anonymous"}
                  onNavigate={onNavigateItem ? () => onNavigateItem(r) : undefined}
                />
              ))}
              {/* If an odd leftover page has only 1 review, keep grid height consistent */}
              {pageReviews.length === 1 && <div className="hidden sm:block" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {pages.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous reviews"
            onClick={() => handleManualNav(goPrev)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-400 shadow-md ring-1 ring-gray-100 transition-colors focus:outline-none focus-visible:ring-2 ${ac.ring} ${ac.arrowBg}`}
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next reviews"
            onClick={() => handleManualNav(goNext)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-400 shadow-md ring-1 ring-gray-100 transition-colors focus:outline-none focus-visible:ring-2 ${ac.ring} ${ac.arrowBg}`}
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {pages.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              onClick={() => handleManualNav(() => { setAnimate(true); setIndex(startIndex + i); })}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                i === realPageIndex ? `w-6 ${ac.dot}` : "w-1.5 bg-gray-200 hover:bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}