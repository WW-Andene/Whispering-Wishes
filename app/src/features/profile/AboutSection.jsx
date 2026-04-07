// ═══════════════════════════════════════════════════════════════════════════════
// AboutSection — Collapsible legal sections (Disclaimer, Privacy, Terms, Sources)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { APP_VERSION } from '../../data/constants.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

const currentYear = new Date().getFullYear();

function AboutSection({ handleAdminTap, adminTapCount }) {
  const [aboutSections, setAboutSections] = useState({});

  const sections = [
    { key: 'disclaimer', label: 'Disclaimer', content: (
      <div className="space-y-1.5">
        <p>Whispering Wishes is an <strong className="text-gray-300">unofficial fan-made tool</strong>. It is not affiliated with, endorsed by, or associated with Kuro Games, Kuro Technology (HK) Co., Limited, or any of their subsidiaries.</p>
        <p>Wuthering Waves, all game content, characters, names, and related media are trademarks and copyrights of Kuro Games © 2024–{currentYear}.</p>
      </div>
    )},
    { key: 'privacy', label: 'Privacy Policy', content: (
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="font-medium text-gray-300">Data stored on your device</p>
          <p>Convene history, calculator settings, team builds, planner notes, and visual preferences are stored <strong className="text-gray-300">locally</strong> in your browser (localStorage). This data never leaves your device unless you explicitly use Cloud Backup or the Leaderboard.</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">Data sent online</p>
          <ul className="space-y-1.5 ml-1">
            <li><strong className="text-gray-300">Google Sign-In</strong> — If you sign in, we receive your display name, profile picture, and a unique ID. We do <em>not</em> store your email.</li>
            <li><strong className="text-gray-300">Cloud Backup</strong> — Your Convene history is stored in Firebase under your Google user ID. Only you can read or write your own backup.</li>
            <li><strong className="text-gray-300">Leaderboard</strong> — Opt-in. Your hashed user ID (not your real game UID), average pity, pull count, 50/50 stats, and owned 5★ items are displayed publicly.</li>
            <li><strong className="text-gray-300">Active users</strong> — An anonymous heartbeat (timestamp only) is sent every 60 seconds. It expires automatically after 2 minutes.</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">Permissions</p>
          <p><strong className="text-gray-300">Camera</strong> — requested only when you use the Convene URL scanner to photograph your screen. The image is processed for OCR and is not stored.</p>
          <p>No other device permissions (microphone, location, etc.) are used.</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">Third-party services</p>
          <ul className="space-y-1 ml-1">
            <li><strong className="text-gray-300">Google Identity Services</strong> — Sign-In authentication. Google's privacy policy applies.</li>
            <li><strong className="text-gray-300">Firebase (Google)</strong> — Cloud storage for backups, leaderboard, and presence.</li>
            <li><strong className="text-gray-300">Groq API</strong> — Server-side screenshot OCR. Images are processed and discarded, never stored.</li>
            <li><strong className="text-gray-300">Wuthering Waves API</strong> — Proxied to fetch your Convene history. We do not log requests.</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">Tracking & cookies</p>
          <p>This app does not use analytics, advertising trackers, cookies, or fingerprinting. No personal data is sold or shared with third parties.</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-300">How to delete your data</p>
          <ul className="space-y-1 ml-1">
            <li><strong className="text-gray-300">All data (local + cloud)</strong> — Use the "Reset All Data" button below. If you are signed in with Google, this also deletes your cloud backup and signs you out.</li>
            <li><strong className="text-gray-300">Local data only</strong> — Clear your browser's site data for this domain.</li>
            <li><strong className="text-gray-300">Leaderboard removal</strong> — Contact <a href="mailto:whisperingwishes.app@gmail.com" className="text-cyan-400 hover:underline">whisperingwishes.app@gmail.com</a> with your leaderboard ID.</li>
          </ul>
        </div>
      </div>
    )},
    { key: 'terms', label: 'Terms of Use', content: (
      <div className="space-y-2">
        <p>By using Whispering Wishes you agree to the following:</p>
        <ul className="space-y-1.5 ml-1">
          <li><strong className="text-gray-300">Personal use only</strong> — This tool is for personal, non-commercial use to manage your own game data.</li>
          <li><strong className="text-gray-300">No abuse</strong> — Do not use the API proxy, OCR, or cloud features for automated scraping, mass requests, or anything unrelated to your personal game data.</li>
          <li><strong className="text-gray-300">Your responsibility</strong> — You are responsible for your Google account and game credentials. We are not liable for data loss or unauthorized access.</li>
          <li><strong className="text-gray-300">Leaderboard</strong> — By submitting, you consent to your pseudonymous stats being displayed publicly. Offensive usernames may be removed.</li>
          <li><strong className="text-gray-300">No warranty</strong> — Provided "as is". We do not guarantee uptime, accuracy, or availability. Features may change or be removed.</li>
          <li><strong className="text-gray-300">Unofficial</strong> — We are not responsible for any consequences to your game account from using third-party tools.</li>
          <li><strong className="text-gray-300">Age</strong> — You must be at least 13 years old to use Google Sign-In or the leaderboard.</li>
        </ul>
        <p>We may restrict access to users who violate these terms.</p>
      </div>
    )},
    { key: 'sources', label: 'Data Sources & Attribution', content: (
      <div className="space-y-1.5">
        <p>Game data, banner schedules, event timings, and character/weapon information sourced from:</p>
        <ul className="space-y-0.5 ml-1">
          <li><a href="https://wuwatracker.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">WuWa Tracker</a> — event timeline and pity tracking</li>
          <li><a href="https://game8.co/games/Wuthering-Waves" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Game8</a> — game guides and data</li>
          <li><a href="https://wutheringwaves.wiki" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Wuthering Waves Wiki</a> — character, weapon, and echo data</li>
          <li><a href="https://www.prydwen.gg/wuthering-waves/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Prydwen.gg</a> — character builds and analytics</li>
        </ul>
        <p className="mt-1">We thank these community resources for their work.</p>
      </div>
    )},
  ];

  return (
    <Card>
      <CardHeader>About</CardHeader>
      <CardBody className="space-y-3 text-xs text-gray-400">
        <div className="text-center">
          <h4 className="text-gray-100 font-bold text-sm">Whispering Wishes</h4>
          <p className="text-gray-500 text-[10px]">Version {APP_VERSION}</p>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-[10px] mb-1">Questions, issues, or feedback?</p>
          <a
            href="mailto:whisperingwishes.app@gmail.com"
            className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors underline"
          >
            whisperingwishes.app@gmail.com
          </a>
        </div>

        <p className="text-center text-[10px] text-gray-500 pt-1">© {currentYear} <span onClick={handleAdminTap} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdminTap(); } }} tabIndex={0} role="button" className="cursor-pointer select-none" style={adminTapCount >= 3 ? { color: 'rgba(237,175,24,0.5)', transition: 'color 0.3s' } : undefined}>{`Whispering Wishes Ver.${APP_VERSION}`}</span> by <a href="https://www.reddit.com/u/WW_Andene" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">u/WW_Andene</a> • Made with ♡ for the WuWa community.</p>

        <div className="kuro-divider" />

        {sections.map(({ key, label, content }) => (
          <div key={key} style={{ background: 'var(--bg-stat)', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setAboutSections(prev => ({ ...prev, [key]: !prev[key] }))}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-300 hover:text-gray-200 transition-colors"
              style={{ padding: '8px 12px' }}
              aria-expanded={!!aboutSections[key]}
            >
              <span>{label}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 text-gray-500 ${aboutSections[key] ? 'rotate-180' : ''}`} />
            </button>
            {aboutSections[key] && (
              <div className="text-[10px] text-gray-400" style={{ padding: '0 12px 10px' }}>
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
