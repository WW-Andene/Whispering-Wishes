// ═══════════════════════════════════════════════════════════════════════════════
// useTabNavigation — Tab switching, scroll memory, swipe gestures, nav sizing
// Manages: activeTab, scroll position save/restore, swipe detection, navPadding
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { TAB_ORDER } from '../data/constants.js';
import { haptic } from '../utils/haptics.js';
export function useTabNavigation(swipeEnabled) {
  const [activeTab, setActiveTabRaw] = useState('tracker');
  const tabNavRef = useRef(null);
  const [navPadding, setNavPadding] = useState(80);

  // Measure nav height for bottom padding
  useEffect(() => {
    const nav = tabNavRef.current;
    if (!nav) return;
    const update = () => setNavPadding(nav.offsetHeight + 12 + 12);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  // Tab scroll position memory
  const tabScrollPositions = useRef({});
  const activeTabRef = useRef(activeTab);

  const setActiveTab = useCallback((tab) => {
    tabScrollPositions.current[activeTabRef.current] = window.scrollY;
    setActiveTabRaw(tab);
  }, []);

  useEffect(() => {
    const saved = tabScrollPositions.current[activeTab];
    window.scrollTo(0, saved || 0);
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
        if (deltaX < 0 && currentIndex < TAB_ORDER.length - 1) {
          lastSwipeRef.current = Date.now();
          haptic.medium();
          setActiveTab(TAB_ORDER[currentIndex + 1]);
        } else if (deltaX > 0 && currentIndex > 0) {
          lastSwipeRef.current = Date.now();
          haptic.medium();
          setActiveTab(TAB_ORDER[currentIndex - 1]);
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
