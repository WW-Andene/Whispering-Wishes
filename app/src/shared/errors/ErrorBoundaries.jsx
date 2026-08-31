// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/errors/ErrorBoundaries.jsx
// AppErrorBoundary, TabErrorBoundary, TabLoadingSkeleton
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { AlertCircle } from 'lucide-react';
// P12-05 audit fix: forward caught crashes to the optional external tracker.
// No-op when no adapter is installed (see core/errorTracker.js).
import { captureError } from '../../core/errorTracker.js';
import { t } from '../../utils/i18n.js';

// Error Boundary — catches crashes per tab so one broken tab doesn't kill the app
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, prevTabName: props.tabName };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    // Reset error when tab changes (tabName prop changes)
    if (prevState.prevTabName !== undefined && prevState.prevTabName !== nextProps.tabName) {
      return { hasError: false, error: null, prevTabName: nextProps.tabName };
    }
    return { prevTabName: nextProps.tabName };
  }
  componentDidCatch(error, info) {
    console.error(`[${this.props.tabName || 'Tab'}] Crash:`, error, info?.componentStack);
    captureError(error, { boundary: 'tab', tab: this.props.tabName, componentStack: info?.componentStack });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="kuro-calc space-y-3 tab-content">
          <div className="kuro-card">
            <div className="kuro-card-inner">
              <div className="kuro-body text-center py-8">
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <div className="text-white font-bold text-xl mb-1">{t('errors.tabCrash.title')}</div>
                <p className="text-gray-400 text-base mb-4">{t('errors.tabCrash.message', { tab: this.props.tabName || 'tab' })}</p>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="kuro-btn active-cyan text-base px-4 py-2"
                  aria-label={t('errors.tabCrash.reloadAria', { tab: this.props.tabName || 'tab' })}
                >
                  {t('errors.tabCrash.reload')}
                </button>
                {this.state.error && (
                  <details className="mt-3 text-left" open>
                    <summary className="text-gray-400 text-sm cursor-pointer">{t('errors.tabCrash.details')}</summary>
                    <pre className="mt-1 p-2 bg-black/50 rounded text-red-400 text-sm overflow-x-auto whitespace-pre-wrap">{this.state.error.message}{'\n'}{this.state.error.stack?.split('\n').slice(0, 5).join('\n')}</pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Issue #147: Skeleton loading placeholder for tab transitions
const TabLoadingSkeleton = () => (
  <div className="kuro-calc space-y-3 tab-content animate-pulse" aria-label={t('errors.loading')} role="status">
    <div className="kuro-card">
      <div className="kuro-card-inner">
        <div className="kuro-body space-y-3 py-6">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      </div>
    </div>
    <div className="kuro-card">
      <div className="kuro-card-inner">
        <div className="kuro-body space-y-3 py-6">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="flex gap-2">
            <div className="h-24 bg-white/5 rounded flex-1" />
            <div className="h-24 bg-white/5 rounded flex-1" />
            <div className="h-24 bg-white/5 rounded flex-1" />
          </div>
        </div>
      </div>
    </div>
    <span className="sr-only">{t('errors.loading')}</span>
  </div>
);

// P6-FIX: Root-level error boundary — catches crashes outside individual tabs (MED)
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[App] Fatal crash:', error, info?.componentStack);
    captureError(error, { boundary: 'app', componentStack: info?.componentStack });
  }
  render() {
    if (this.state.hasError) {
      return (
        // var(--canvas-height-px), not 100dvh — this boundary renders inside
        // App.jsx, inside ScaledCanvas.jsx's transformed canvas, so it needs
        // the canvas's own (elastic) height, not the real physical viewport
        // height, to actually fill the screen on any non-reference device.
        <div style={{ minHeight: 'var(--canvas-height-px, 100dvh)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c12', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
          {/* §E10-ER-F3: Red border accent to distinguish app-level crash from tab-level */}
          <div style={{ textAlign: 'center', maxWidth: '420px', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-xl)', padding: '2rem', background: 'rgba(239,68,68,0.05)' }}>
            <div style={{ fontSize: 48, marginBottom: 'var(--space-lg)', color: '#ef4444' }}>!</div>
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>{t('errors.appCrash.title')}</h1>
            <p style={{ color: '#9ca3af', fontSize: 'var(--font-md)', marginBottom: 'var(--space-xl)' }}>{t('errors.appCrash.message')}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: 'var(--space-sm) var(--space-xl)', background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)', color: '#22d3ee', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-md)', marginRight: 8, outline: 'none' }}
              onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.5)'; }}
              onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
            >
              {t('errors.appCrash.tryAgain')}
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: 'var(--space-sm) var(--space-xl)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#d1d5db', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-md)', outline: 'none' }}
              onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.3)'; }}
              onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
            >
              {t('errors.appCrash.reloadPage')}
            </button>
            {this.state.error && (
              <details style={{ marginTop: 'var(--space-lg)', textAlign: 'left' }}>
                <summary style={{ color: '#6b7280', fontSize: 'var(--font-base)', cursor: 'pointer' }}>{t('errors.appCrash.details')}</summary>
                <pre style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-md)', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: 'var(--font-sm)', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{import.meta.env.DEV ? this.state.error.message : t('errors.appCrash.genericMessage')}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export { AppErrorBoundary, TabErrorBoundary, TabLoadingSkeleton };
