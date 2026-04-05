// ═══════════════════════════════════════════════════════════════════════════════
// AdminBannersTab — Banner form: version, dates, characters/weapons JSON,
// image URLs with positions, save/reset controls
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { CURRENT_BANNERS } from '../../data/banners.js';
import { ADMIN_BANNER_KEY } from '../../shared/components/bannerUtils.js';
import { storageAvailable } from '../../core/storage.js';

export default function AdminBannersTab({
  bannerForm, setBannerForm, updateBannerForm,
  activeBanners, setActiveBanners,
  saveCustomBanners,
  setShowAdminPanel, setAdminUnlocked, setAdminPassword,
  toast, confirm,
}) {
  const saveBanners = () => {
    try {
      if (bannerForm.charsJson.length > 100000 || bannerForm.weapsJson.length > 100000) throw new Error('JSON input too large (max 100KB)');
      const chars = JSON.parse(bannerForm.charsJson);
      const weaps = JSON.parse(bannerForm.weapsJson);
      if (!Array.isArray(chars) || !Array.isArray(weaps)) throw new Error('Characters and weapons must be arrays');
      if (chars.length === 0) throw new Error('At least one character required');
      if (weaps.length === 0) throw new Error('At least one weapon required');
      const validateImgUrl = (url, label) => {
        if (!url) return;
        try {
          const u = new URL(url);
          if (u.protocol !== 'https:') throw new Error(`${label} must use HTTPS`);
        } catch (e) {
          if (e.message.includes('HTTPS')) throw e;
          throw new Error(`${label} has an invalid URL`);
        }
      };
      chars.forEach((c, i) => {
        if (!c.id || !c.name) throw new Error(`Character ${i + 1} missing id or name`);
        const img = (bannerForm.charImages[i] ?? '').trim();
        if (img) { validateImgUrl(img, `Character ${i + 1} image`); c.imageUrl = img; }
        const pos = (bannerForm.charImagePositions[i] ?? '').trim();
        if (pos) c.imagePosition = pos;
      });
      weaps.forEach((w, i) => {
        if (!w.id || !w.name) throw new Error(`Weapon ${i + 1} missing id or name`);
        const img = (bannerForm.weapImages[i] ?? '').trim();
        if (img) { validateImgUrl(img, `Weapon ${i + 1} image`); w.imageUrl = img; }
        const pos = (bannerForm.weapImagePositions[i] ?? '').trim();
        if (pos) w.imagePosition = pos;
      });
      const startDate = new Date(bannerForm.startDate);
      const endDate = new Date(bannerForm.endDate);
      if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
      if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
      if (endDate <= startDate) throw new Error('End date must be after start date');
      [bannerForm.standardCharImg, bannerForm.standardWeapImg, bannerForm.wwImg, bannerForm.emImg, bannerForm.ppImg, bannerForm.toaImg, bannerForm.irImg, bannerForm.drImg].forEach((url, i) => {
        const labels = ['Standard char banner', 'Standard weap banner', 'Whimpering Wastes', 'Endstate Matrix', 'Pioneer Podcast', 'Tower of Adversity', 'Illusive Realm', 'Daily reset'];
        if (url?.trim()) validateImgUrl(url.trim(), labels[i] + ' image');
      });
      const newBanners = {
        ...activeBanners,
        version: bannerForm.version || '1.0',
        phase: parseInt(bannerForm.phase, 10) || 1,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        characters: chars,
        weapons: weaps,
        standardCharBannerImage: bannerForm.standardCharImg.trim(),
        standardWeapBannerImage: bannerForm.standardWeapImg.trim(),
        whimperingWastesImage: bannerForm.wwImg.trim(),
        endstateMatrixImage: bannerForm.emImg.trim(),
        pioneerPodcastImage: bannerForm.ppImg.trim(),
        towerOfAdversityImage: bannerForm.toaImg.trim(),
        illusiveRealmImage: bannerForm.irImg.trim(),
        dailyResetImage: bannerForm.drImg.trim(),
      };
      saveCustomBanners(newBanners);
      setShowAdminPanel(false);
      setAdminUnlocked(false);
      setAdminPassword('');
    } catch (e) {
      toast?.addToast?.('Invalid data: ' + e.message, 'error');
    }
  };

  const resetBanners = async () => {
    if (!await confirm({ title: 'Reset banners', message: 'Reset to default banners?\nCustom banner data will be lost.', confirmLabel: 'Reset', destructive: true })) return;
    if (storageAvailable) {
      try { localStorage.removeItem(ADMIN_BANNER_KEY); } catch {}
    }
    setActiveBanners(CURRENT_BANNERS);
    toast?.addToast?.('Reset to default banners', 'success');
  };

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">Quick Banner Update</h3>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Version (e.g., 3.1)" value={bannerForm.version} onChange={(e) => updateBannerForm('version', e.target.value)} className="kuro-input text-[10px] py-1" aria-label="Banner version" />
          <input type="number" placeholder="e.g. 1" value={bannerForm.phase} onChange={(e) => updateBannerForm('phase', e.target.value)} className="kuro-input text-[10px] py-1" aria-label="Banner phase" />
          <input type="datetime-local" placeholder="Start Date" value={bannerForm.startDate} onChange={(e) => updateBannerForm('startDate', e.target.value)} className="kuro-input text-[10px] py-1" aria-label="Banner start date" />
          <input type="datetime-local" placeholder="End Date" value={bannerForm.endDate} onChange={(e) => updateBannerForm('endDate', e.target.value)} className="kuro-input text-[10px] py-1" aria-label="Banner end date" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">Featured Resonators (JSON)</h3>
        <textarea className="kuro-input w-full h-32 text-[10px] font-mono" value={bannerForm.charsJson} onChange={(e) => updateBannerForm('charsJson', e.target.value)} placeholder="Paste characters array JSON" aria-label="Featured resonators JSON" />
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">Featured Weapons (JSON)</h3>
        <textarea className="kuro-input w-full h-32 text-[10px] font-mono" value={bannerForm.weapsJson} onChange={(e) => updateBannerForm('weapsJson', e.target.value)} placeholder="Paste weapons array JSON" aria-label="Featured weapons JSON" />
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">Resonator Images</h3>
        <div className="space-y-1">
          {activeBanners.characters.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              <span className="text-gray-300 text-[10px] w-20 truncate">{c.name}</span>
              <input type="text" placeholder="https://i.ibb.co/..." value={bannerForm.charImages[i] ?? ''} onChange={(e) => setBannerForm(prev => ({ ...prev, charImages: { ...prev.charImages, [i]: e.target.value } }))} className="kuro-input flex-1 text-[10px] py-1" aria-label={`${c.name} image URL`} />
              <input type="text" placeholder="center 20%" value={bannerForm.charImagePositions[i] ?? ''} onChange={(e) => setBannerForm(prev => ({ ...prev, charImagePositions: { ...prev.charImagePositions, [i]: e.target.value } }))} className="kuro-input w-24 text-[10px] py-1" aria-label={`${c.name} image position`} title="CSS object-position (e.g. center 20%)" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">Weapon Images</h3>
        <div className="space-y-1">
          {activeBanners.weapons.map((w, i) => (
            <div key={w.id} className="flex items-center gap-2">
              <span className="text-gray-300 text-[10px] w-20 truncate">{w.name}</span>
              <input type="text" placeholder="https://i.ibb.co/..." value={bannerForm.weapImages[i] ?? ''} onChange={(e) => setBannerForm(prev => ({ ...prev, weapImages: { ...prev.weapImages, [i]: e.target.value } }))} className="kuro-input flex-1 text-[10px] py-1" aria-label={`${w.name} image URL`} />
              <input type="text" placeholder="center 30%" value={bannerForm.weapImagePositions[i] ?? ''} onChange={(e) => setBannerForm(prev => ({ ...prev, weapImagePositions: { ...prev.weapImagePositions, [i]: e.target.value } }))} className="kuro-input w-24 text-[10px] py-1" aria-label={`${w.name} image position`} title="CSS object-position (e.g. center 30%)" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">Standard Banner Images</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-[10px] w-28">Tidal Chorus</span>
            <input type="text" placeholder="https://i.ibb.co/..." value={bannerForm.standardCharImg} onChange={(e) => updateBannerForm('standardCharImg', e.target.value)} className="kuro-input flex-1 text-[10px] py-1" aria-label="Tidal Chorus banner image URL" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-[10px] w-28">Winter Brume</span>
            <input type="text" placeholder="https://i.ibb.co/..." value={bannerForm.standardWeapImg} onChange={(e) => updateBannerForm('standardWeapImg', e.target.value)} className="kuro-input flex-1 text-[10px] py-1" aria-label="Winter Brume banner image URL" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">Event Banner Images</h3>
        <div className="space-y-1">
          {[
            ['Whimpering Wastes', 'wwImg'],
            ['Endstate Matrix', 'emImg'],
            ['Tower of Adversity', 'toaImg'],
            ['Illusive Realm', 'irImg'],
            ['Daily Reset', 'drImg'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-gray-300 text-[10px] w-28">{label}</span>
              <input type="text" placeholder="https://i.ibb.co/..." value={bannerForm[key]} onChange={(e) => updateBannerForm(key, e.target.value)} className="kuro-input flex-1 text-[10px] py-1" aria-label={`${label} image URL`} />
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-[10px]">Paste direct image URLs from ibb.co (use i.ibb.co links)</p>
      </div>

      <div className="flex gap-2">
        <button onClick={saveBanners} className="kuro-btn flex-1">Save Banner Updates</button>
        <button onClick={resetBanners} className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/30">Reset</button>
      </div>
    </>
  );
}
