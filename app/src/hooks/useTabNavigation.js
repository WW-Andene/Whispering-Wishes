// ═══════════════════════════════════════════════════════════════════════════════
// useTabNavigation — Tab switching, scroll memory, swipe gestures, nav sizing
// Manages: activeTab, scroll position save/restore, swipe detection, navPadding
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { TAB_ORDER } from '../data/constants.js';
import { haptic } from '../utils/haptics.js';
import { getScrollContainer, getPortalRoot, toCanvasLength } from '../shared/scaling/canvasScale.js';
export function useTabNavigation(swipeEnabled) {
  const [activeTab, setActiveTabRaw] = useState('tracker');
  const tabNavRef = useRef(null);
  const [navPadding, setNavPadding] = useState(80);

  // Measure nav height for bottom padding. Used to be nav.offsetHeight + 12
  // + 12 — offsetHeight excludes the element's own CSS margin, so this
  // silently ignored nav's marginBottom (the safe-area-bottom clearance,
  // see App.jsx's own --safe-area-bottom-canvas comment) entirely, unlike
  // App.jsx's headerPadding (which correctly measures the header's real
  // rendered position via getBoundingClientRect(), margin included). That
  // mismatch is why the gap above the nav never matched the gap below the
  // header: this flat "+24" guess had no relationship to the actual
  // safe-area value. Now measures nav's real position the same way header
  // does — real-space distance from the canvas's own bottom edge up to
  // nav's top edge, converted to canvas-local length — plus the same +12
  // gap constant headerPadding adds on the other side.
  useEffect(() => {
    const nav = tabNavRef.current;
    if (!nav) return;
    const update = () => {
      const canvasBottom = getPortalRoot().getBoundingClientRect().bottom;
      const navTop = nav.getBoundingClientRect().top;
      setNavPadding(toCanvasLength(canvasBottom - navTop) + 12);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    // ResizeObserver only fires on nav's own size changing, not on a
    // margin-driven position shift — cover that (native's WindowInsets
    // bridge lands asynchronously, a frame or more after first mount) with
    // a short-lived poll, plus orientation/resize changes afterward. Same
    // guard as App.jsx's own headerPadding effect, mirrored here.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(update);
      return () => cancelAnimationFrame(raf2);
    });
    const timer = setTimeout(update, 500);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf1);
      clearTimeout(timer);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Tab scroll position memory
  const tabScrollPositions = useRef({});
  const activeTabRef = useRef(activeTab);

  const setActiveTab = useCallback((tab) => {
    // ScaledCanvas.jsx's inner div is the app's scroll container now, not
    // window — see canvasScale.js's own comment on getScrollContainer().
    tabScrollPositions.current[activeTabRef.current] = getScrollContainer().scrollTop;
    setActiveTabRaw(tab);
  }, []);

  useEffect(() => {
    const saved = tabScrollPositions.current[activeTab];
    getScrollContainer().scrollTo(0, saved || 0);
  }, [activeTab]);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // Swipe navigation between tabs
  const swipeRef = useRef({ startX: 0, startY: 0, startTime: 0 });
  const lastSwipeRef = useRef(0);

  useEffect(() => {
    if (!swipeEnabled) return;

    const EDGE_EXCLUSION = 20;
    const MIN_DISTANCE = 50;
    const MAX_TIME = 300;
    const MIN_RATIO = 1.5;
    const SWIPE_COOLDOWN = 400;
    const MIN_VELOCITY = 0.5;
    const MIN_VELOCITY_DIST = 30;

    const handleTouchStart = (e) => {
      let el = e.target;
      while (el && el !== document.body) {
        // Ignore swipe on: horizontally scrollable containers, elements with data-no-swipe (e.g., calendar)
        if (el.dataset?.noSwipe || (el.scrollWidth > el.clientWidth && (getComputedStyle(el).overflowX === 'auto' || getComputedStyle(el).overflowX === 'scroll'))) {
          swipeRef.current = { startX: 0, startY: 0, startTime: 0, ignore: true };
          return;
        }
        el = el.parentElement;
      }
      const touchX = e.touches[0].clientX;
      if (touchX < EDGE_EXCLUSION || touchX > window.innerWidth - EDGE_EXCLUSION) {
        swipeRef.current = { startX: 0, startY: 0, startTime: 0, ignore: true };
        return;
      }
      swipeRef.current = {
        startX: touchX,
        startY: e.touches[0].clientY,
        startTime: Date.now(),
        ignore: false,
      };
    };

    const handleTouchEnd = (e) => {
      if (swipeRef.current.ignore) return;
      if (Date.now() - lastSwipeRef.current < SWIPE_COOLDOWN) return;

      const { startX, startY, startTime } = swipeRef.current;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * MIN_RATIO;
      const isFastEnough = deltaTime < MAX_TIME;
      const isLongEnough = Math.abs(deltaX) > MIN_DISTANCE;
      const velocity = deltaTime > 0 ? Math.abs(deltaX) / deltaTime : 0;
      const isHighVelocity = velocity > MIN_VELOCITY && Math.abs(deltaX) > MIN_VELOCITY_DIST;

      if (isHorizontalSwipe && ((isFastEnough && isLongEnough) || isHighVelocity)) {
        const currentIndex = TAB_ORDER.indexOf(activeTabRef.current);
        // Wraps at both ends — swiping "next" from the last tab (Collection)
        // rolls back to the first (Tracker), and swiping "prev" from the
        // first rolls back to the last, so the two ends of TAB_ORDER are
        // directly reachable from each other by a single swipe instead of
        // needing to pass through every tab in between.
        if (deltaX < 0) {
          lastSwipeRef.current = Date.now();
          haptic.medium();
          setActiveTab(TAB_ORDER[(currentIndex + 1) % TAB_ORDER.length]);
        } else if (deltaX > 0) {
          lastSwipeRef.current = Date.now();
          haptic.medium();
          setActiveTab(TAB_ORDER[(currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length]);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [swipeEnabled, setActiveTab]);

  return { activeTab, setActiveTab, tabNavRef, navPadding };
}
