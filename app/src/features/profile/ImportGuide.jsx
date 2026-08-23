// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/profile/ImportGuide.jsx
// ImportGuide component + IMPORT_GUIDE_DATA
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import { t } from '../../utils/i18n.js';

const B = ({ children }) => <span className="text-gray-100 font-medium">{children}</span>;

// Import guide data — driven by locale/*/profile.json under `importGuide.*`.
const IMPORT_GUIDE_DATA = {
  pc: {
    title: () => t('profile.importGuide.pc.title'),
    steps: [
      () => <>{t('profile.importGuide.step.openConvene.pre')} <B>{t('profile.importGuide.step.openConvene.convene')}</B> → <B>{t('profile.importGuide.step.openConvene.history')}</B> → <B>{t('profile.importGuide.step.openConvene.viewDetails')}</B></>,
      () => <>{t('profile.importGuide.pc.step2.pre')} <B>{t('profile.importGuide.pc.step2.powershell')}</B> {t('profile.importGuide.pc.step2.post')}</>,
      () => <code className="block bg-black/40 rounded px-2 py-1.5 text-sm font-mono text-cyan-400 break-all select-all">iwr -useb https://raw.githubusercontent.com/WW-Andene/Whispering-Wishes/main/app/public/import.ps1 | iex</code>,
      () => <>{t('profile.importGuide.pc.step4.pre')} <B>{t('profile.importGuide.pc.step4.autoCopied')}</B> {t('profile.importGuide.pc.step4.post')}</>,
      () => <>{t('profile.importGuide.step.pasteImport.pre')} <B>{t('profile.importGuide.step.pasteImport.urlField')}</B> {t('profile.importGuide.step.pasteImport.mid')} <B>{t('profile.importGuide.step.pasteImport.import')}</B></>,
    ],
    footer: () => t('profile.importGuide.pc.footer'),
  },
  android: {
    title: () => t('profile.importGuide.android.title'),
    steps: [
      () => <>{t('profile.importGuide.step.openConvene.pre')} <B>{t('profile.importGuide.step.openConvene.convene')}</B> → <B>{t('profile.importGuide.step.openConvene.history')}</B> → <B>{t('profile.importGuide.step.openConvene.viewDetails')}</B></>,
      () => <>{t('profile.importGuide.android.step2.pre')} <B>{t('profile.importGuide.android.step2.fullUrl')}</B> {t('profile.importGuide.android.step2.post')}</>,
      () => <>{t('profile.importGuide.step.pasteImport.pre')} <B>{t('profile.importGuide.step.pasteImport.urlField')}</B> {t('profile.importGuide.step.pasteImport.mid')} <B>{t('profile.importGuide.step.pasteImport.import')}</B></>,
    ],
    footer: () => t('profile.importGuide.android.footer'),
  },
  ps5: {
    title: () => t('profile.importGuide.ps5.title'),
    steps: [
      () => <>{t('profile.importGuide.step.openConvene.pre')} <B>{t('profile.importGuide.step.openConvene.convene')}</B> → <B>{t('profile.importGuide.step.openConvene.history')}</B> → <B>{t('profile.importGuide.step.openConvene.viewDetails')}</B></>,
      () => <>{t('profile.importGuide.ps5.step2.pre')} <B>{t('profile.importGuide.ps5.step2.options')}</B> → <B>{t('profile.importGuide.ps5.step2.pageInfo')}</B> {t('profile.importGuide.ps5.step2.post')}</>,
      () => <>{t('profile.importGuide.ps5.step3.pre')} <B>{t('profile.importGuide.ps5.step3.cameraScan')}</B> {t('profile.importGuide.ps5.step3.post')}</>,
      () => <>{t('profile.importGuide.ps5.step4.pre')} <B>{t('profile.importGuide.ps5.step4.idsManually')}</B> {t('profile.importGuide.ps5.step4.post')}</>,
    ],
    footer: () => t('profile.importGuide.ps5.footer'),
  },
};

const ImportGuide = memo(({ platform }) => {
  const guide = IMPORT_GUIDE_DATA[platform];
  if (!guide) return null;
  return (
    <div className="p-3 bg-white/5 border border-[var(--border-medium)] rounded-lg text-sm text-gray-200 space-y-2">
      <p className="text-gray-100 font-medium text-base">{guide.title()}</p>
      {guide.steps.map((Step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-6 h-6 rounded bg-white/10 text-gray-200 flex items-center justify-center text-sm font-bold">{i + 1}</span>
          <p><Step /></p>
        </div>
      ))}
      {guide.footer && <p className="text-gray-400 text-sm pt-1 border-t border-[var(--border-medium)]">{guide.footer()}</p>}
    </div>
  );
});
ImportGuide.displayName = 'ImportGuide';

export { ImportGuide, IMPORT_GUIDE_DATA };
