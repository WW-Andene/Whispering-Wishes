// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ImportGuide.jsx
// ImportGuide component + IMPORT_GUIDE_DATA
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';

// Import guide data — eliminates ~90 lines of repetitive numbered-step JSX
const IMPORT_GUIDE_DATA = {
  pc: {
    title: 'PC',
    steps: [
      <>Open Wuthering Waves, go to <span className="text-gray-100 font-medium">Convene</span> → <span className="text-gray-100 font-medium">History</span> → <span className="text-gray-100 font-medium">View Details</span></>,
      <>Open <span className="text-gray-100 font-medium">PowerShell</span> and paste this command:</>,
      <><code className="block bg-black/40 rounded px-2 py-1.5 text-xs font-mono text-cyan-400 break-all select-all">iwr -useb https://raw.githubusercontent.com/WW-Andene/Whispering-Wishes/main/app/public/import.ps1 | iex</code></>,
      <>The URL is <span className="text-gray-100 font-medium">automatically copied</span> to your clipboard</>,
      <>Paste it in the <span className="text-gray-100 font-medium">URL field</span> below and click <span className="text-gray-100 font-medium">Import</span></>,
    ],
    footer: 'This script only reads game logs. It does not modify anything.',
  },
  android: {
    title: 'Android (11+)',
    steps: [
      <>Open Wuthering Waves, go to <span className="text-gray-100 font-medium">Convene</span> → <span className="text-gray-100 font-medium">History</span> → <span className="text-gray-100 font-medium">View Details</span></>,
      <>Copy the <span className="text-gray-100 font-medium">full URL</span> from the in-game browser address bar</>,
      <>Paste it in the <span className="text-gray-100 font-medium">URL field</span> below and click <span className="text-gray-100 font-medium">Import</span></>,
    ],
    footer: 'The URL expires after a few minutes. Use it quickly.',
  },
  ps5: {
    title: 'PS5',
    steps: [
      <>Open Wuthering Waves, go to <span className="text-gray-100 font-medium">Convene</span> → <span className="text-gray-100 font-medium">History</span> → <span className="text-gray-100 font-medium">View Details</span></>,
      <>Press <span className="text-gray-100 font-medium">Options</span> → <span className="text-gray-100 font-medium">Page Information</span> to see the URL</>,
      <>Use the <span className="text-gray-100 font-medium">camera scan</span> below to capture the URL from your screen</>,
      <>Or enter the <span className="text-gray-100 font-medium">IDs manually</span> from the URL</>,
    ],
    footer: 'The URL expires after some time. Use it as soon as possible.',
  },
};

const ImportGuide = memo(({ platform }) => {
  const guide = IMPORT_GUIDE_DATA[platform];
  if (!guide) return null;
  return (
    <div className="p-3 bg-white/5 border border-[var(--border-medium)] rounded-lg text-xs text-gray-200 space-y-2">
      <p className="text-gray-100 font-medium text-xs">{guide.title}</p>
      {guide.steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-xs font-bold">{i + 1}</span>
          <p>{step}</p>
        </div>
      ))}
      {guide.footer && <p className="text-gray-400 text-sm pt-1 border-t border-[var(--border-medium)]">{guide.footer}</p>}
    </div>
  );
});
ImportGuide.displayName = 'ImportGuide';

export { ImportGuide, IMPORT_GUIDE_DATA };
