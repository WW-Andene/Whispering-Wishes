// ═══════════════════════════════════════════════════════════════════════════════
// AboutSection — Collapsible legal sections (Disclaimer, Privacy, Terms, Sources)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { APP_VERSION } from '../../data/constants.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { t } from '../../utils/i18n.js';

const currentYear = new Date().getFullYear();

// F-15 audit fix: returning users who want to replay the onboarding tour get
// a button here. Dispatches the same SET_SETTINGS(showOnboarding=true) action
// the fresh-install path uses; the App.jsx effect at :257-258 picks it up and
// renders OnboardingModal on the next render.
function AboutSection({ handleAdminTap, adminTapCount, dispatch, toast }) {
  const [aboutSections, setAboutSections] = useState({});

  const handleReplayOnboarding = () => {
    if (typeof dispatch === 'function') {
      dispatch({ type: 'SET_SETTINGS', field: 'showOnboarding', value: true });
      toast?.addToast?.(t('profile.about.onboardingRestored'), 'info');
    }
  };

  const sections = [
    { key: 'disclaimer', label: t('profile.about.disclaimer'), content: (
      <div className="space-y-1.5">
        <p>{t('profile.about.disclaimerBody1')}</p>
        <p>{t('profile.about.disclaimerBody2', { year: currentYear })}</p>
        <p>{t('profile.about.disclaimerBody3')}</p>
      </div>
    )},
    { key: 'privacy', label: t('profile.about.privacy'), content: (
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="font-medium text-gray-300">{t('profile.about.privacyLocalTitle')}</p>
          <p>{t('profile.about.privacyLocalBody')}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">{t('profile.about.privacyOnlineTitle')}</p>
          <ul className="space-y-1.5 ml-1">
            <li>{t('profile.about.privacyOnlineGoogle')}</li>
            <li>{t('profile.about.privacyOnlineBackup')}</li>
            <li>{t('profile.about.privacyOnlineLeaderboard')}</li>
            <li>{t('profile.about.privacyOnlineActive')}</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">{t('profile.about.privacyPermissionsTitle')}</p>
          <p>{t('profile.about.privacyPermissionsCamera')}</p>
          <p>{t('profile.about.privacyPermissionsOther')}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">{t('profile.about.privacyThirdPartyTitle')}</p>
          <ul className="space-y-1 ml-1">
            <li>{t('profile.about.privacyThirdPartyGoogle')}</li>
            <li>{t('profile.about.privacyThirdPartyFirebase')}</li>
            <li>{t('profile.about.privacyThirdPartyGroq')}</li>
            <li>{t('profile.about.privacyThirdPartyWuwa')}</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">{t('profile.about.privacyTrackingTitle')}</p>
          <p>{t('profile.about.privacyTrackingBody')}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">{t('profile.about.privacyDeleteTitle')}</p>
          <ul className="space-y-1 ml-1">
            <li>{t('profile.about.privacyDeleteAll')}</li>
            <li>{t('profile.about.privacyDeleteLocal')}</li>
            <li>{t('profile.about.privacyDeleteLeaderboard', { email: 'whisperingwishes.app@gmail.com' })}</li>
          </ul>
        </div>
      </div>
    )},
    { key: 'terms', label: t('profile.about.terms'), content: (
      <div className="space-y-2">
        <p>{t('profile.about.termsIntro')}</p>
        <ul className="space-y-1.5 ml-1">
          <li>{t('profile.about.termsPersonalUse')}</li>
          <li>{t('profile.about.termsNoAbuse')}</li>
          <li>{t('profile.about.termsResponsibility')}</li>
          <li>{t('profile.about.termsLeaderboard')}</li>
          <li>{t('profile.about.termsWarranty')}</li>
          <li>{t('profile.about.termsUnofficial')}</li>
          <li>{t('profile.about.termsAge')}</li>
        </ul>
        <p>{t('profile.about.termsOutro')}</p>
      </div>
    )},
    { key: 'sources', label: t('profile.about.sources'), content: (
      <div className="space-y-1.5">
        <p>{t('profile.about.sourcesIntro')}</p>
        <ul className="space-y-0.5 ml-1">
          <li><a href="https://wuwatracker.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">WuWa Tracker</a> — {t('profile.about.sourceWuwaTracker')}</li>
          <li><a href="https://game8.co/games/Wuthering-Waves" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Game8</a> — {t('profile.about.sourceGame8')}</li>
          <li><a href="https://wutheringwaves.wiki" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Wuthering Waves Wiki</a> — {t('profile.about.sourceWiki')}</li>
          <li><a href="https://www.prydwen.gg/wuthering-waves/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Prydwen.gg</a> — {t('profile.about.sourcePrydwen')}</li>
          <li><a href="https://nanoka.cc" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Nanoka.cc</a> — {t('profile.about.sourceNanoka')}</li>
          <li><a href="https://x.com/KiriyumeBun" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@KiriyumeBun</a> — {t('profile.about.sourceKiriyumeBun')}</li>
          <li><a href="https://x.com/naruVT" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@naruVT</a> — {t('profile.about.sourceNaruVT')}</li>
        </ul>
        <p className="mt-1">{t('profile.about.sourcesOutro')}</p>
      </div>
    )},
  ];

  return (
    <Card>
      <CardHeader>{t('profile.about.title')}</CardHeader>
      <CardBody className="space-y-3 text-base text-gray-400">
        <div className="text-center">
          <h4 className="text-gray-100 font-bold text-xl">Whispering Wishes</h4>
          <p className="text-gray-500 text-sm">{t('profile.about.version', { version: APP_VERSION })}</p>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">{t('profile.about.feedbackPrompt')}</p>
          <a
            href="mailto:whisperingwishes.app@gmail.com"
            className="text-cyan-400 text-base hover:text-cyan-300 transition-colors underline"
          >
            whisperingwishes.app@gmail.com
          </a>
        </div>

        <p className="text-center text-sm text-gray-500 pt-1">© {currentYear} <span onClick={handleAdminTap} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdminTap(); } }} tabIndex={0} role="button" className="cursor-pointer select-none" style={adminTapCount >= 3 ? { color: 'rgba(237,175,24,0.5)', transition: 'color 0.3s' } : undefined}>{`Whispering Wishes Ver.${APP_VERSION}`}</span> {t('profile.about.by')} <a href="https://www.reddit.com/u/WW_Andene" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">u/WW_Andene</a> • {t('profile.about.madeWithSuffix')}</p>

        {/* F-15 audit fix: replay onboarding for returning users who want the tour again. */}
        {typeof dispatch === 'function' && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={handleReplayOnboarding}
              className="kuro-btn kuro-btn-sm inline-flex items-center gap-1.5 text-sm"
              aria-label={t('profile.about.replayOnboardingAria')}
            >
              <BookOpen size={14} aria-hidden="true" />
              {t('profile.about.replayOnboarding')}
            </button>
          </div>
        )}

        <div className="kuro-divider" />

        {sections.map(({ key, label, content }) => (
          <div key={key} style={{ background: 'var(--bg-stat)', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setAboutSections(prev => ({ ...prev, [key]: !prev[key] }))}
              className="w-full flex items-center justify-between text-base font-semibold text-gray-300 hover:text-gray-200 transition-colors"
              style={{ padding: 'var(--space-sm) var(--space-md)' }}
              aria-expanded={!!aboutSections[key]}
            >
              <span>{label}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 text-gray-500 ${aboutSections[key] ? 'rotate-180' : ''}`} />
            </button>
            {aboutSections[key] && (
              <div className="text-sm text-gray-400" style={{ padding: '0 12px 10px' }}>
                {content}
              </div>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export default React.memo(AboutSection);
