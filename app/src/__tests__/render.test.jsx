import './setup.js';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';

import { CURRENT_BANNERS } from '../data/banners.js';
import { initialState } from '../core/reducer.js';
import { ImageFramingProvider } from '../providers/ImageFramingProvider.jsx';
import { CloudStorageProvider } from '../providers/CloudStorageProvider.jsx';
import { ToastProvider } from '../providers/ToastProvider.jsx';
import { ConfirmProvider } from '../providers/ConfirmProvider.jsx';

// Shared mock props
const noop = () => {};
const noopAsync = async () => false;
const mockToast = { addToast: noop };
const mockVS = {
  animationsEnabled: 'on', swipeNavigation: false,
  collectionFadePosition: 50, collectionFadeIntensity: 50,
  collectionFadeDirection: 'down', collectionOpacity: 100,
};
const mockCD = {
  chars5Counts: {}, chars4Counts: {},
  weaps5Counts: {}, weaps4Counts: {}, weaps3Counts: {}, weaps2Counts: {}, weaps1Counts: {},
  sortItems: (i) => i,
};

// Helper: wrap component with required providers for context consumers
function withProviders(element) {
  return React.createElement(ToastProvider, null,
    React.createElement(ConfirmProvider, null,
      React.createElement(ImageFramingProvider, null,
        React.createElement(CloudStorageProvider, { getBackupPayload: () => ({}), onRestoreData: noop },
          element
        )
      )
    )
  );
}

function renderComponent(Component, props) {
  const html = renderToString(React.createElement(Component, props));
  expect(html).toBeTruthy();
  expect(html.length).toBeGreaterThan(50);
  return html;
}

function renderWithProviders(Component, props) {
  const el = React.createElement(Component, props);
  const html = renderToString(withProviders(el));
  expect(html).toBeTruthy();
  expect(html.length).toBeGreaterThan(50);
  return html;
}

describe('Module imports', () => {
  it('loads data modules', async () => {
    const chars = await import('../data/characters.js');
    expect(chars.CHARACTER_DATA).toBeDefined();
    const banners = await import('../data/banners.js');
    expect(banners.CURRENT_BANNERS).toBeDefined();
    const weapons = await import('../data/weapons.js');
    expect(weapons.WEAPON_DATA).toBeDefined();
  });

  it('loads core modules', async () => {
    const { initialState, reducer } = await import('../core/reducer.js');
    expect(initialState).toBeDefined();
    expect(reducer).toBeDefined();
  });

  it('loads provider modules', async () => {
    const { FocusTrapModal } = await import('../shared/components/FocusTrapModal.jsx');
    expect(FocusTrapModal).toBeDefined();
    const { ToastProvider } = await import('../providers/ToastProvider.jsx');
    expect(ToastProvider).toBeDefined();
  });

  it('loads shared components', async () => {
    const { Card } = await import('../shared/components/Card.jsx');
    expect(Card).toBeDefined();
    const { BannerCard } = await import('../shared/components/BannerCard.jsx');
    expect(BannerCard).toBeDefined();
  });
});

describe('Tab SSR rendering', () => {
  it('renders TrackerTab', async () => {
    const { default: C } = await import('../features/tracker/TrackerTab.jsx');
    renderWithProviders(C, {
      state: initialState, dispatch: noop, activeBanners: CURRENT_BANNERS,
      visualSettings: mockVS, themeAccent: '#edaf18', collectionImages: {},
      bannerEndDate: new Date().toISOString(), toast: mockToast, confirm: noopAsync,
    });
  });

  it('renders EventsTab', async () => {
    const { default: C } = await import('../features/events/EventsTab.jsx');
    renderComponent(C, {
      state: initialState, dispatch: noop, activeBanners: CURRENT_BANNERS,
      setActiveBanners: noop, visualSettings: mockVS, toast: mockToast,
    });
  });

  it('renders CalculatorTab', async () => {
    const { default: C } = await import('../features/calculator/CalculatorTab.jsx');
    renderComponent(C, { state: initialState, dispatch: noop });
  });

  it('renders PlannerTab', async () => {
    const { default: C } = await import('../features/planner/PlannerTab.jsx');
    renderComponent(C, {
      state: initialState, dispatch: noop, activeBanners: CURRENT_BANNERS,
      bannerEndDate: new Date().toISOString(), toast: mockToast, confirm: noopAsync,
    });
  });

  it('renders AnalyticsTab', async () => {
    const { default: C } = await import('../features/analytics/AnalyticsTab.jsx');
    renderWithProviders(C, {
      state: initialState, dispatch: noop, setActiveTab: noop,
      overallStats: null, luckRating: null, trophies: null,
      collectionImages: {}, toast: mockToast,
      hashUidForStorage: noopAsync, checkFirebaseRateLimit: () => true,
    });
  });

  it('renders CollectionTab', async () => {
    const { default: C } = await import('../features/collection/CollectionTab.jsx');
    renderWithProviders(C, {
      state: initialState, collectionData: mockCD, collectionImages: {},
      visualSettings: mockVS, setActiveTab: noop, setDetailModal: noop,
      activeBanners: CURRENT_BANNERS, withCacheBuster: (u) => u,
      refreshImages: noop, handleSetProfilePic: noop,
      ownedChars: [], setOwnedChars: noop,
      manualCounts: {}, setManualCounts: noop,
    });
  });

  it('renders TeamsTab', async () => {
    const { default: C } = await import('../features/teams/TeamsTab.jsx');
    renderWithProviders(C, {
      state: initialState, dispatch: noop, collectionImages: {},
      collectionData: mockCD, toast: mockToast,
    });
  });

  it('renders ProfileTab', async () => {
    const { default: C } = await import('../features/profile/ProfileTab.jsx');
    renderWithProviders(C, {
      state: initialState, dispatch: noop, visualSettings: mockVS, saveVisualSettings: noop,
      toast: mockToast, confirm: noopAsync, pwa: {},
      collectionImages: {}, customCollectionImages: {}, saveCollectionImages: noop,
      detailModal: { show: false }, handleExport: noop, processImportData: noop,
      activeBanners: CURRENT_BANNERS, setActiveBanners: noop,
      overallStats: null, luckRating: null, ownedCharNames: new Set(),
      trophies: null, trophyOverrides: {}, setTrophyOverrides: noop,
      DEFAULT_VISUAL_SETTINGS: mockVS,
      setActiveTab: noop, withCacheBuster: (u) => u,
    });
  });
});

describe('Full App', () => {
  it('renders the complete app', async () => {
    const { default: App } = await import('../App.jsx');
    const html = renderToString(React.createElement(App));
    expect(html.length).toBeGreaterThan(10000);
  });
});
