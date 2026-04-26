// ═══════════════════════════════════════════════════════════════════════════════
// useImageFraming - Custom hook for image framing/cropping state management
// ═══════════════════════════════════════════════════════════════════════════════
//
// Extracted from App.jsx - manages position/zoom for character images in
// collection, team cards, and info panels. Persists to localStorage.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { sanitizeStateObj } from '../core/storage.js';
import { IMAGE_FRAMING_KEY } from '../shared/constants/appConstants.js';

const MIN_ZOOM = 100;
const MAX_ZOOM = 300;

// Default framing values per character per context (collection-, team-, info-)
const DEFAULT_IMAGE_FRAMING = Object.freeze({
  // Collection framing
  'collection-Jiyan': { x: 8, y: -24, zoom: 250 },
  'collection-Calcharo': { x: -2, y: -26, zoom: 220 },
  'collection-Encore': { x: -2, y: -20, zoom: 150 },
  'collection-Jianxin': { x: 2, y: -24, zoom: 210 },
  'collection-Lingyang': { x: -2, y: -18, zoom: 150 },
  'collection-Verina': { x: 0, y: -14, zoom: 250 },
  'collection-Yinlin': { x: 2, y: -26, zoom: 210 },
  'collection-Changli': { x: 6, y: -26, zoom: 210 },
  'collection-Jinhsi': { x: 2, y: -28, zoom: 190 },
  'collection-Shorekeeper': { x: 12, y: -22, zoom: 210 },
  'collection-Camellya': { x: 0, y: -28, zoom: 190 },
  'collection-Xiangli Yao': { x: -4, y: -16, zoom: 300 },
  'collection-Zhezhi': { x: -2, y: -14, zoom: 230 },
  'collection-Carlotta': { x: 2, y: -28, zoom: 210 },
  'collection-Roccia': { x: 8, y: -4, zoom: 210 },
  'collection-Phoebe': { x: 10, y: -26, zoom: 190 },
  'collection-Brant': { x: -2, y: -26, zoom: 250 },
  'collection-Cantarella': { x: -2, y: -20, zoom: 230 },
  'collection-Zani': { x: 4, y: -26, zoom: 210 },
  'collection-Ciaccona': { x: 10, y: -24, zoom: 230 },
  'collection-Cartethyia': { x: -4, y: -26, zoom: 210 },
  'collection-Lupa': { x: 0, y: -12, zoom: 210 },
  'collection-Augusta': { x: 4, y: -30, zoom: 240 },
  'collection-Galbrena': { x: 14, y: -24, zoom: 230 },
  'collection-Iuno': { x: -2, y: -24, zoom: 190 },
  'collection-Luuk Herssen': { x: 2, y: 0, zoom: 120 },
  'collection-Aemeath': { x: -14, y: -22, zoom: 190 },
  'collection-Mornye': { x: 4, y: -20, zoom: 170 },
  'collection-Rover': { x: 24, y: -24, zoom: 230 },
  'collection-Chisa': { x: -6, y: -26, zoom: 220 },
  'collection-Phrolova': { x: 0, y: -28, zoom: 210 },
  'collection-Qiuyuan': { x: -8, y: -26, zoom: 220 },
  'collection-Lynae': { x: -12, y: -28, zoom: 190 },
  'collection-Sigrika': { x: 2, y: -26, zoom: 180 },
  'collection-Solsworn Ciphers': { x: 2, y: -2, zoom: 100 },
  'collection-Blazing Justice': { x: 0, y: 0, zoom: 100 },
  // 4-star Resonators
  'collection-Aalto': { x: 4, y: -24, zoom: 210 },
  'collection-Baizhi': { x: -2, y: -12, zoom: 250 },
  'collection-Chixia': { x: -4, y: -26, zoom: 190 },
  'collection-Danjin': { x: -4, y: -24, zoom: 190 },
  'collection-Yangyang': { x: -4, y: -16, zoom: 250 },
  'collection-Sanhua': { x: 12, y: -26, zoom: 190 },
  'collection-Taoqi': { x: 4, y: -26, zoom: 190 },
  'collection-Yuanwu': { x: 2, y: -24, zoom: 210 },
  'collection-Mortefi': { x: -2, y: -28, zoom: 210 },
  'collection-Youhu': { x: 0, y: -24, zoom: 160 },
  'collection-Lumi': { x: 0, y: -24, zoom: 170 },
  'collection-Buling': { x: 0, y: -22, zoom: 170 },
  // Team card framing
  'team-Jiyan': { x: 6, y: -18, zoom: 260 },
  'team-Calcharo': { x: 0, y: -20, zoom: 230 },
  'team-Rover': { x: 24, y: -16, zoom: 240 },
  'team-Encore': { x: 0, y: -14, zoom: 150 },
  'team-Jianxin': { x: 2, y: -18, zoom: 180 },
  'team-Lingyang': { x: -4, y: -12, zoom: 160 },
  'team-Sanhua': { x: 12, y: -22, zoom: 170 },
  'team-Verina': { x: 0, y: -8, zoom: 250 },
  'team-Jinhsi': { x: 0, y: -22, zoom: 160 },
  'team-Yinlin': { x: 2, y: -22, zoom: 170 },
  'team-Changli': { x: 8, y: -20, zoom: 160 },
  'team-Mortefi': { x: -2, y: -24, zoom: 180 },
  'team-Shorekeeper': { x: 12, y: -18, zoom: 180 },
  'team-Zhezhi': { x: -2, y: -10, zoom: 200 },
  'team-Xiangli Yao': { x: -4, y: -10, zoom: 300 },
  'team-Camellya': { x: 0, y: -22, zoom: 170 },
  'team-Carlotta': { x: 0, y: -20, zoom: 170 },
  'team-Roccia': { x: 8, y: 0, zoom: 180 },
  'team-Phoebe': { x: 12, y: -20, zoom: 170 },
  'team-Brant': { x: -2, y: -18, zoom: 190 },
  'team-Cantarella': { x: 0, y: -16, zoom: 220 },
  'team-Zani': { x: 6, y: -26, zoom: 200 },
  'team-Ciaccona': { x: 10, y: -20, zoom: 190 },
  'team-Cartethyia': { x: 0, y: -22, zoom: 170 },
  'team-Lupa': { x: 4, y: -8, zoom: 210 },
  'team-Phrolova': { x: 2, y: -24, zoom: 170 },
  'team-Augusta': { x: 4, y: -22, zoom: 180 },
  'team-Iuno': { x: 0, y: -16, zoom: 200 },
  'team-Galbrena': { x: 16, y: -20, zoom: 200 },
  'team-Qiuyuan': { x: -8, y: -26, zoom: 200 },
  'team-Chisa': { x: -4, y: -20, zoom: 230 },
  'team-Lynae': { x: -10, y: -22, zoom: 160 },
  'team-Luuk Herssen': { x: 2, y: 4, zoom: 130 },
  'team-Aemeath': { x: -12, y: -16, zoom: 170 },
  'team-Sigrika': { x: 4, y: -20, zoom: 160 },
  'team-Aalto': { x: 6, y: -20, zoom: 190 },
  'team-Baizhi': { x: -2, y: -6, zoom: 220 },
  'team-Chixia': { x: -6, y: -24, zoom: 180 },
  'team-Danjin': { x: 0, y: -22, zoom: 180 },
  'team-Yangyang': { x: -4, y: -12, zoom: 270 },
  'team-Taoqi': { x: 6, y: -20, zoom: 180 },
  'team-Yuanwu': { x: 2, y: -22, zoom: 190 },
  'team-Youhu': { x: 2, y: -14, zoom: 130 },
  'team-Lumi': { x: 0, y: -22, zoom: 170 },
  'team-Buling': { x: 0, y: -18, zoom: 150 },
  'team-Mornye': { x: 4, y: -20, zoom: 170 },
  'team-Solsworn Ciphers': { x: 2, y: -2, zoom: 100 },
  'team-Blazing Justice': { x: 0, y: 0, zoom: 100 },
  // Info panel framing
  'info-Encore': { x: -2, y: -50, zoom: 170 },
  'info-Lingyang': { x: -2, y: -50, zoom: 170 },
  'info-Calcharo': { x: -12, y: -68, zoom: 250 },
  'info-Aemeath': { x: -6, y: -60, zoom: 230 },
  'info-Lynae': { x: -6, y: -62, zoom: 210 },
  'info-Sigrika': { x: 0, y: -60, zoom: 210 },
  'info-Chisa': { x: -12, y: -66, zoom: 230 },
  'info-Iuno': { x: -6, y: -56, zoom: 190 },
  'info-Augusta': { x: -2, y: -66, zoom: 250 },
  'info-Ciaccona': { x: 0, y: -60, zoom: 250 },
  'info-Zani': { x: 0, y: -64, zoom: 250 },
  'info-Cantarella': { x: -8, y: -58, zoom: 270 },
  'info-Phoebe': { x: 8, y: -56, zoom: 210 },
  'info-Verina': { x: -10, y: -50, zoom: 230 },
  'info-Xiangli Yao': { x: -16, y: -58, zoom: 300 },
  'info-Jiyan': { x: -8, y: -68, zoom: 270 },
  'info-Yinlin': { x: 0, y: -60, zoom: 230 },
  'info-Jinhsi': { x: -2, y: -62, zoom: 210 },
  'info-Shorekeeper': { x: 4, y: -58, zoom: 250 },
  'info-Camellya': { x: 2, y: -64, zoom: 230 },
  'info-Changli': { x: -4, y: -62, zoom: 230 },
  'info-Zhezhi': { x: -6, y: -52, zoom: 270 },
  'info-Carlotta': { x: -4, y: -60, zoom: 210 },
  'info-Roccia': { x: -4, y: -42, zoom: 250 },
  'info-Brant': { x: -20, y: -64, zoom: 290 },
  'info-Cartethyia': { x: -2, y: -64, zoom: 230 },
  'info-Lupa': { x: -6, y: -52, zoom: 250 },
  'info-Phrolova': { x: -4, y: -66, zoom: 230 },
  'info-Galbrena': { x: 0, y: -62, zoom: 270 },
  'info-Qiuyuan': { x: -4, y: -64, zoom: 250 },
  'info-Mornye': { x: 0, y: -52, zoom: 190 },
  'info-Luuk Herssen': { x: 0, y: -24, zoom: 120 },
  'info-Jianxin': { x: -2, y: -58, zoom: 230 },
  'info-Taoqi': { x: -2, y: -60, zoom: 210 },
  'info-Baizhi': { x: -10, y: -48, zoom: 270 },
  'info-Aalto': { x: 2, y: -62, zoom: 250 },
  'info-Lumi': { x: 4, y: -60, zoom: 200 },
  'info-Mortefi': { x: -2, y: -66, zoom: 250 },
  'info-Yangyang': { x: -14, y: -56, zoom: 250 },
  'info-Chixia': { x: -8, y: -64, zoom: 230 },
  'info-Youhu': { x: 2, y: -58, zoom: 190 },
  'info-Yuanwu': { x: -4, y: -66, zoom: 270 },
  'info-Danjin': { x: -6, y: -64, zoom: 250 },
  'info-Sanhua': { x: 2, y: -68, zoom: 250 },
  'info-Buling': { x: 0, y: -64, zoom: 230 },
});

const defaultFramingBase = Object.freeze({ x: 0, y: 0, zoom: 100 });

/**
 * Custom hook for managing image framing state (position/zoom per image key).
 * Handles persistence to localStorage.
 *
 * @param {boolean} storageAvailable - Whether localStorage is available
 * @returns {object} Framing state and handlers
 */
export function useImageFraming(storageAvailable) {
  const [imageFraming, setImageFraming] = useState({});
  const [editingImage, setEditingImage] = useState(null);
  const [framingMode, setFramingMode] = useState(false);
  const [miniPanelPosition, setMiniPanelPosition] = useState('bottom-right');

  // Load from localStorage on mount
  useEffect(() => {
    if (!storageAvailable) return;
    try {
      const saved = localStorage.getItem(IMAGE_FRAMING_KEY);
      if (saved) setImageFraming(sanitizeStateObj(JSON.parse(saved)));
      const pos = localStorage.getItem('ww-mini-panel-pos');
      if (pos) setMiniPanelPosition(pos);
    } catch {}
  }, []);

  // Save framing for a specific image key
  const saveImageFraming = useCallback((key, settings) => {
    setImageFraming(prev => {
      const newFraming = { ...prev, [key]: settings };
      if (storageAvailable) {
        try { localStorage.setItem(IMAGE_FRAMING_KEY, JSON.stringify(newFraming)); } catch {}
      }
      return newFraming;
    });
  }, [storageAvailable]);

  // Get framing for an image (user override -> hardcoded default -> base default)
  const getImageFraming = useCallback((key) => {
    return imageFraming[key] || DEFAULT_IMAGE_FRAMING[key] || defaultFramingBase;
  }, [imageFraming]);

  // Update framing for currently editing image
  const updateEditingFraming = useCallback((changes) => {
    if (!editingImage) return;
    const current = imageFraming[editingImage] || DEFAULT_IMAGE_FRAMING[editingImage] || defaultFramingBase;
    const newFraming = { ...current, ...changes };
    newFraming.x = Math.max(-100, Math.min(100, newFraming.x));
    newFraming.y = Math.max(-100, Math.min(100, newFraming.y));
    newFraming.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newFraming.zoom));
    saveImageFraming(editingImage, newFraming);
  }, [editingImage, imageFraming, saveImageFraming]);

  const resetEditingFraming = useCallback(() => {
    if (!editingImage) return;
    saveImageFraming(editingImage, { x: 0, y: 0, zoom: 100 });
  }, [editingImage, saveImageFraming]);

  const saveMiniPanelPosition = useCallback((pos) => {
    setMiniPanelPosition(pos);
    if (storageAvailable) {
      try { localStorage.setItem('ww-mini-panel-pos', pos); } catch {}
    }
  }, [storageAvailable]);

  const getMiniPanelPositionClasses = useCallback(() => {
    switch (miniPanelPosition) {
      case 'top-left': return 'top-16 left-2';
      case 'top-right': return 'top-16 right-2';
      case 'bottom-left': return 'bottom-20 left-2';
      default: return 'bottom-20 right-2';
    }
  }, [miniPanelPosition]);

  return {
    imageFraming,
    setImageFraming,
    editingImage,
    setEditingImage,
    framingMode,
    setFramingMode,
    miniPanelPosition,
    saveMiniPanelPosition,
    getMiniPanelPositionClasses,
    saveImageFraming,
    getImageFraming,
    updateEditingFraming,
    resetEditingFraming,
  };
}
