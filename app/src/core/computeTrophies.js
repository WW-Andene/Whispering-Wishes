// ═══════════════════════════════════════════════════════════════════════════════
// computeTrophies — Trophy calculation engine extracted from App.jsx
// Pure function: takes profile state + constants, returns trophy list + stats
// ═══════════════════════════════════════════════════════════════════════════════

import { ALL_CHARACTERS, ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS, STANDARD_5STAR_CHARACTERS } from '../data/characters.js';
import { HARD_PITY, ALL_5STAR_WEAPONS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS } from '../data/constants.js';
import { getMergedHistories } from './historyUtils.js';

export function computeTrophies(profile, overallStats, trophyOverrides = {}) {
    if (!profile.importedAt) return null;

    const { allHistory } = getMergedHistories(profile);
    const featuredHist = profile.featured?.history || [];
    const weaponHist = profile.weapon?.history || [];
    const stdCharHist = profile.standardChar?.history || [];
    const stdWeapHist = profile.standardWeap?.history || [];
    
    // All 5★ pulls with pity
    const all5Stars = allHistory.filter(p => p.rarity === 5 && p.pity > 0);
    const featured5Stars = featuredHist.filter(p => p.rarity === 5);
    
    // Early 5★ (under 40 pity)
    const early5Star = all5Stars.some(p => p.pity <= 40);
    const earliest5Star = all5Stars.length > 0 ? Math.min(...all5Stars.map(p => p.pity)) : null;
    
    // 50/50 streaks
    let currentWinStreak = 0, currentLossStreak = 0, bestWinStreak = 0, worstLossStreak = 0;
    featured5Stars.forEach(p => {
      if (p.won5050 === true) {
        currentWinStreak++;
        currentLossStreak = 0;
        bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
      } else if (p.won5050 === false) {
        currentLossStreak++;
        currentWinStreak = 0;
        worstLossStreak = Math.max(worstLossStreak, currentLossStreak);
      }
      // Guaranteed pulls (won5050 === null) don't affect streaks
    });
    
    // Current streak (most recent)
    let recentStreak = { type: null, count: 0 };
    for (let i = featured5Stars.length - 1; i >= 0; i--) {
      const p = featured5Stars[i];
      if (p.won5050 === null) continue; // Skip guaranteed
      if (recentStreak.type === null) {
        recentStreak.type = p.won5050 ? 'win' : 'loss';
        recentStreak.count = 1;
      } else if ((recentStreak.type === 'win' && p.won5050 === true) || (recentStreak.type === 'loss' && p.won5050 === false)) {
        recentStreak.count++;
      } else {
        break;
      }
    }
    
    // Collection counts (charHistory/weapHistory from getMergedHistories already include beginner)
    const { charHistory, weapHistory } = getMergedHistories(profile);
    const owned5StarChars = new Set(charHistory.filter(p => p.rarity === 5 && p.name).map(p => p.name));
    const owned4StarChars = new Set(charHistory.filter(p => p.rarity === 4 && p.name).map(p => p.name));
    const owned5StarWeaps = new Set(weapHistory.filter(p => p.rarity === 5 && p.name).map(p => p.name));
    const owned4StarWeaps = new Set(weapHistory.filter(p => p.rarity === 4 && p.name).map(p => p.name));
    const owned3StarWeaps = new Set(weapHistory.filter(p => p.rarity === 3 && p.name).map(p => p.name));
    
    const all5ResOwned = ALL_5STAR_RESONATORS.every(name => owned5StarChars.has(name));
    const all4ResOwned = ALL_4STAR_RESONATORS.every(name => owned4StarChars.has(name));
    const all5WeapOwned = ALL_5STAR_WEAPONS.every(name => owned5StarWeaps.has(name));
    const all4WeapOwned = ALL_4STAR_WEAPONS.every(name => owned4StarWeaps.has(name));
    const all3WeapOwned = ALL_3STAR_WEAPONS.every(name => owned3StarWeaps.has(name));
    const allCollected = all5ResOwned && all4ResOwned && all5WeapOwned && all4WeapOwned && all3WeapOwned;
    
    // Total pulls
    const totalPulls = allHistory.length;
    const isWhale = totalPulls >= 1000;
    const isMegaWhale = totalPulls >= 2000;
    
    // Build trophy list - WuWa lore-themed names
    const list = [];
    
    // ═══ COLLECTION TROPHIES ═══
    if (allCollected) list.push({ id: 'all', name: 'No Life Achievement', desc: 'Every Resonator and Weapon collected. go outside.', icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    if (all5ResOwned) list.push({ id: '5res', name: 'Gotta Whale \'Em All', desc: 'All 5★ Resonators unlocked', icon: 'Sparkles', color: '#edaf18', tier: 'gold' });
    if (all4ResOwned) list.push({ id: '4res', name: 'Sonata Effect', desc: 'All 4★ Resonators in your roster', icon: 'Heart', color: '#a855f7', tier: 'purple' });
    if (all5WeapOwned) list.push({ id: '5weap', name: 'Forgemaster', desc: 'All 5★ Weapons acquired', icon: 'Swords', color: '#ec4899', tier: 'gold' });
    if (all4WeapOwned) list.push({ id: '4weap', name: 'Armory of Jinzhou', desc: 'All 4★ Weapons in your arsenal', icon: 'Sword', color: '#a855f7', tier: 'purple' });
    if (all3WeapOwned) list.push({ id: '3weap', name: 'Data Bank: Full', desc: 'Every 3★ Weapon catalogued', icon: 'Shield', color: '#60a5fa', tier: 'blue' });
    
    // ═══ LUCK TROPHIES ═══
    if (earliest5Star === 1) list.push({ id: 'pity1', name: 'Pity 1. Screenshot or Fake.', desc: '5★ on the first Convene. nobody believes you', icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    else if (earliest5Star && earliest5Star <= 10) list.push({ id: 'early10', name: 'Dev Account?', desc: `5★ at pity ${earliest5Star} - go buy a lottery ticket`, icon: 'Gift', color: '#edaf18', tier: 'legendary' });
    else if (earliest5Star && earliest5Star <= 20) list.push({ id: 'early20', name: 'Disgusting Luck', desc: `5★ at pity ${earliest5Star}`, icon: 'Zap', color: '#edaf18', tier: 'gold' });
    else if (earliest5Star && earliest5Star <= 40) list.push({ id: 'early40', name: 'Echo of Fortune', desc: `5★ at pity ${earliest5Star}`, icon: 'Clover', color: '#22c55e', tier: 'green' });
    
    // Hard pity - the unluckiest possible outcome
    const hitHardPity = all5Stars.some(p => p.pity >= HARD_PITY);
    if (hitHardPity) list.push({ id: 'hard80', name: 'Pity 80 Club', desc: 'Went the full distance. pain.', icon: 'Shield', color: '#6b7280', tier: 'gray' });
    
    // Soft pity zone specialist - majority of 5★ came from 65-79
    const softPityPulls = all5Stars.filter(p => p.pity >= 65 && p.pity < 80);
    if (softPityPulls.length >= 10) list.push({ id: 'softpro2', name: 'Soft Pity Landlord', desc: `${softPityPulls.length} five-stars from soft zone - you own property here`, icon: 'TrendingUp', color: '#ec4899', tier: 'pink' });
    else if (softPityPulls.length >= 5) list.push({ id: 'softpro', name: 'Soft Pity Merchant', desc: `${softPityPulls.length} five-stars from soft zone - never early, never late`, icon: 'TrendingUp', color: '#f97316', tier: 'orange' });
    
    // Back-to-back - two 5★ within 20 pulls across any banner
    const hasBackToBack = all5Stars.some(p => p.pity > 0 && p.pity <= 15);
    const backToBackCount = all5Stars.filter(p => p.pity > 0 && p.pity <= 15).length;
    if (backToBackCount >= 3) list.push({ id: 'b2b3', name: 'Actual Hack', desc: `${backToBackCount} five-stars within 15 Convenes - how`, icon: 'Zap', color: '#a855f7', tier: 'purple' });
    else if (hasBackToBack) list.push({ id: 'b2b', name: 'Back to Back', desc: '5★ within 15 Convenes of the last - flexing is permitted', icon: 'Zap', color: '#22c55e', tier: 'green' });
    
    // ═══ 50/50 STREAK TROPHIES ═══
    if (bestWinStreak >= 10) list.push({ id: 'win10', name: 'Rover\'s Blessing', desc: `${bestWinStreak}× 50/50 wins - the Sentinel chose you`, icon: 'Crown', color: '#ef4444', tier: 'legendary' });
    else if (bestWinStreak >= 7) list.push({ id: 'win7', name: 'Rigged (Positive)', desc: `${bestWinStreak}× 50/50 wins - actual witchcraft`, icon: 'Flame', color: '#edaf18', tier: 'legendary' });
    else if (bestWinStreak >= 5) list.push({ id: 'win5', name: 'Main Character Energy', desc: `${bestWinStreak}× 50/50 wins in a row`, icon: 'Flame', color: '#f97316', tier: 'orange' });
    else if (bestWinStreak >= 4) list.push({ id: 'win4', name: 'Resonance Chain', desc: `${bestWinStreak}× 50/50 wins in a row - keep the chain going`, icon: 'Flame', color: '#22c55e', tier: 'green' });
    else if (bestWinStreak >= 3) list.push({ id: 'win3', name: 'Casually Winning', desc: `${bestWinStreak}× 50/50 wins in a row`, icon: 'Target', color: '#22c55e', tier: 'green' });

    if (worstLossStreak >= 10) list.push({ id: 'loss10s', name: 'Lament Never Ended', desc: `${worstLossStreak}× 50/50 losses - the catastrophe hit your account`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    else if (worstLossStreak >= 7) list.push({ id: 'loss7', name: 'Clinically Cursed', desc: `${worstLossStreak}× 50/50 losses - uninstall tbh`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    else if (worstLossStreak >= 5) list.push({ id: 'loss5', name: 'Kuro Hates You', desc: `${worstLossStreak}× 50/50 losses in a row`, icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    else if (worstLossStreak >= 4) list.push({ id: 'loss4', name: 'Waveworn', desc: `${worstLossStreak}× 50/50 losses in a row - eroded by RNG`, icon: 'TrendingDown', color: '#6b7280', tier: 'gray' });
    else if (worstLossStreak >= 3) list.push({ id: 'loss3', name: 'Skill Issue (Gacha)', desc: `${worstLossStreak}× 50/50 losses in a row`, icon: 'TrendingDown', color: '#6b7280', tier: 'gray' });
    
    // Won first ever 50/50
    const first5050 = featured5Stars.find(p => p.won5050 === true || p.won5050 === false);
    if (first5050 && first5050.won5050 === true) list.push({ id: 'first5050', name: 'Beginner\'s Luck', desc: 'Won your very first 50/50', icon: 'Clover', color: '#22c55e', tier: 'green' });
    
    // Redemption arc - lost 50/50 then won next one (look for loss→win pattern)
    let hasRedemption = false;
    for (let i = 0; i < featured5Stars.length - 1; i++) {
      if (featured5Stars[i].won5050 === false) {
        // Next non-guaranteed pull
        for (let j = i + 1; j < featured5Stars.length; j++) {
          if (featured5Stars[j].won5050 === null) continue;
          if (featured5Stars[j].won5050 === true) { hasRedemption = true; }
          break;
        }
      }
      if (hasRedemption) break;
    }
    if (hasRedemption) list.push({ id: 'redeem', name: 'Copium Rewarded', desc: 'Lost 50/50, then won the next - anime protagonist arc', icon: 'Heart', color: '#06b6d4', tier: 'cyan' });
    
    // ═══ MILESTONE TROPHIES ═══
    if (isMegaWhale) list.push({ id: 'mega', name: 'Mortgage Status', desc: '2000+ Convenes - seek financial advice', icon: 'Fish', color: '#06b6d4', tier: 'cyan' });
    else if (totalPulls >= 1500) list.push({ id: '1500', name: 'Astrite Overdose', desc: '1500+ Convenes - Kuro sends you a Christmas card', icon: 'Fish', color: '#06b6d4', tier: 'cyan' });
    else if (isWhale) list.push({ id: 'whale', name: 'Kuro Employee of the Month', desc: '1000+ Convenes - they know you by name', icon: 'Fish', color: '#06b6d4', tier: 'cyan' });
    else if (totalPulls >= 750) list.push({ id: '750', name: 'Terminal Stage', desc: '750+ Convenes - the Lament hit your wallet', icon: 'Fish', color: '#a855f7', tier: 'purple' });
    else if (totalPulls >= 500) list.push({ id: '500', name: 'Down the Rabbit Hole', desc: '500+ Convenes - no turning back', icon: 'Diamond', color: '#a855f7', tier: 'purple' });
    else if (totalPulls >= 300) list.push({ id: '300', name: 'Sunk Cost Fallacy', desc: '300+ Convenes - too deep to quit, too broke to continue', icon: 'Diamond', color: '#60a5fa', tier: 'blue' });
    else if (totalPulls >= 200) list.push({ id: '200', name: 'Rover\'s Allowance: Gone', desc: '200+ Convenes - emotionally and financially invested', icon: 'Gamepad2', color: '#60a5fa', tier: 'blue' });
    else if (totalPulls >= 100) list.push({ id: '100', name: 'First Steps', desc: '100+ Convenes', icon: 'Gamepad2', color: '#60a5fa', tier: 'blue' });
    
    // 5★ count milestones
    const total5Stars = all5Stars.length;
    if (total5Stars >= 100) list.push({ id: '100stars', name: 'Convene Printer Goes Brr', desc: `${total5Stars} five-stars obtained - you ARE the banner`, icon: 'Star', color: '#ef4444', tier: 'legendary' });
    else if (total5Stars >= 75) list.push({ id: '75stars', name: 'Resonance Overload', desc: `${total5Stars} five-stars obtained - Sonata Effect: maxed`, icon: 'Star', color: '#edaf18', tier: 'gold' });
    else if (total5Stars >= 50) list.push({ id: '50stars', name: 'Addicted', desc: `${total5Stars} five-stars obtained - this is a problem`, icon: 'Star', color: '#edaf18', tier: 'gold' });
    else if (total5Stars >= 35) list.push({ id: '35stars', name: 'Tacet Discord Hoarder', desc: `${total5Stars} five-stars obtained - your roster IS the Tacet Discord`, icon: 'Star', color: '#a855f7', tier: 'purple' });
    else if (total5Stars >= 25) list.push({ id: '25stars', name: 'Stargazer', desc: `${total5Stars} five-stars obtained`, icon: 'Star', color: '#a855f7', tier: 'purple' });
    else if (total5Stars >= 15) list.push({ id: '15stars', name: 'Sequence Node: Farming', desc: `${total5Stars} five-stars obtained - the grind is real`, icon: 'Star', color: '#60a5fa', tier: 'blue' });
    else if (total5Stars >= 10) list.push({ id: '10stars', name: 'Rising Star', desc: `${total5Stars} five-stars obtained`, icon: 'Star', color: '#60a5fa', tier: 'blue' });
    else if (total5Stars >= 5) list.push({ id: '5stars', name: 'First Expedition', desc: `${total5Stars} five-stars obtained - your team is forming`, icon: 'Star', color: '#22c55e', tier: 'green' });

    // First 5★
    if (total5Stars > 0 && total5Stars < 5) list.push({ id: 'first5', name: 'Awakening', desc: 'Obtained your first 5★', icon: 'Star', color: '#edaf18', tier: 'gold' });
    
    // Banner diversity - pulled on multiple banner types
    const bannerTypesUsed = [featuredHist, weaponHist, stdCharHist, stdWeapHist].filter(h => h.length > 0).length;
    if (bannerTypesUsed >= 4) list.push({ id: 'diverse', name: 'Pioneer Podcast', desc: 'Convened on all banner types', icon: 'Trophy', color: '#06b6d4', tier: 'cyan' });
    else if (bannerTypesUsed === 3) list.push({ id: 'diverse3', name: 'Pioneer Intern', desc: 'Convened on 3 different banner types - almost a real Pioneer', icon: 'Trophy', color: '#60a5fa', tier: 'blue' });

    // ═══ CHARACTER OWNERSHIP PROGRESSION ═══
    const owned5Count = owned5StarChars.size;
    if (owned5Count >= 30) list.push({ id: 'own30', name: 'Huanglong\'s Census', desc: `${owned5Count} unique 5★ Resonators - Rover collected them all`, icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    else if (owned5Count >= 25) list.push({ id: 'own25', name: 'Sonata Library: Full', desc: `${owned5Count} unique 5★ Resonators - you ARE the tier list`, icon: 'Crown', color: '#edaf18', tier: 'gold' });
    else if (owned5Count >= 20) list.push({ id: 'own20', name: 'Jinzhou Housing Crisis', desc: `${owned5Count} unique 5★ Resonators - where do they all sleep`, icon: 'Sparkles', color: '#a855f7', tier: 'purple' });
    else if (owned5Count >= 15) list.push({ id: 'own15', name: 'Forte Circuit Overload', desc: `${owned5Count} unique 5★ Resonators - too many builds to farm`, icon: 'Sparkles', color: '#a855f7', tier: 'purple' });
    else if (owned5Count >= 10) list.push({ id: 'own10', name: 'Union Level: Whale', desc: `${owned5Count} unique 5★ Resonators - the roster is stacked`, icon: 'Sparkles', color: '#60a5fa', tier: 'blue' });
    else if (owned5Count >= 5) list.push({ id: 'own5', name: 'First Expedition Team', desc: `${owned5Count} unique 5★ Resonators - your party is forming`, icon: 'Sparkles', color: '#22c55e', tier: 'green' });

    // ═══ WEAPON OWNERSHIP PROGRESSION ═══
    const owned5WeapCount = owned5StarWeaps.size;
    if (owned5WeapCount >= 20) list.push({ id: 'weap20', name: 'Forgery Domain Resident', desc: `${owned5WeapCount} unique 5★ Weapons - open a museum in Jinzhou`, icon: 'Swords', color: '#edaf18', tier: 'gold' });
    else if (owned5WeapCount >= 15) list.push({ id: 'weap15', name: 'Sonance Casket: Stuffed', desc: `${owned5WeapCount} unique 5★ Weapons - inventory management simulator`, icon: 'Swords', color: '#a855f7', tier: 'purple' });
    else if (owned5WeapCount >= 10) list.push({ id: 'weap10', name: 'Pioneer\'s Arsenal', desc: `${owned5WeapCount} unique 5★ Weapons - a blade for every occasion`, icon: 'Swords', color: '#60a5fa', tier: 'blue' });
    else if (owned5WeapCount >= 5) list.push({ id: 'weap5', name: 'Tacet Field Sweep', desc: `${owned5WeapCount} unique 5★ Weapons - the field has been cleared`, icon: 'Sword', color: '#22c55e', tier: 'green' });
    else if (owned5WeapCount >= 3) list.push({ id: 'weap3', name: 'First Forgery Run', desc: `${owned5WeapCount} unique 5★ Weapons - your collection begins`, icon: 'Sword', color: '#22c55e', tier: 'green' });

    // Max sequences - any character pulled 7+ times (S6)
    const charCounts = {};
    charHistory.filter(p => p.rarity === 5 && p.name).forEach(p => { charCounts[p.name] = (charCounts[p.name] ?? 0) + 1; });
    
    // Per-character S6 trophies - lore-themed names
    const s6Trophies = {
      'Jiyan': { name: 'Dragon Deez Nuts', desc: 'S6 Jiyan -1.0 loyalty that costs more than rent', color: '#22c55e' },
      'Calcharo': { name: 'Sentence: S6', desc: 'S6 Calcharo - guilty of whaling in the first degree', color: '#a855f7' },
      'Encore': { name: 'Woolies World Domination', desc: 'S6 Encore - Cosmos and Cloudy run this account now', color: '#f97316' },
      'Jianxin': { name: 'Down Bad for Parry', desc: 'S6 Jianxin -"I\'ll take all the 50/50 losses" energy', color: '#22c55e' },
      'Lingyang': { name: 'You Actually S6\'d HIM?!', desc: 'S6 Lingyang - built different or brain different', color: '#38bdf8' },
      'Verina': { name: 'Lost 50/50 Seven Times', desc: 'S6 Verina - and every single one was a W', color: '#edaf18' },
      'Yinlin': { name: 'Down Catastrophic', desc: 'S6 Yinlin - she pulled your strings and your wallet', color: '#a855f7' },
      'Jinhsi': { name: 'Simp Magistrate', desc: 'S6 Jinhsi - sold Jinzhou to fund this', color: '#edaf18' },
      'Changli': { name: 'Touch Grass? Touch Fire.', desc: 'S6 Changli - your savings went up in flames', color: '#f97316' },
      'Zhezhi': { name: 'Drawing Bankruptcy', desc: 'S6 Zhezhi - her art costs more than actual art', color: '#38bdf8' },
      'Xiangli Yao': { name: 'He Did The Math (x7)', desc: 'S6 Xiangli Yao - calculated your savings into Hypercubes', color: '#a855f7' },
      'Shorekeeper': { name: 'She Protecc (x7)', desc: 'S6 Shorekeeper - your team cannot die. ever.', color: '#edaf18' },
      'Camellya': { name: 'Dislocated But Worth It', desc: 'S6 Camellya - thumbs broken, damage beautiful', color: '#ec4899' },
      'Carlotta': { name: 'Wallet? Frozen.', desc: 'S6 Carlotta - bank account colder than her kit', color: '#38bdf8' },
      'Roccia': { name: 'Hard Carried (Literally)', desc: 'S6 Roccia - Mamma mia...who\'s the clown now?', color: '#ec4899' },
      'Phoebe': { name: 'Feebi Chupi Supremacy', desc: 'S6 Phoebe - max power cheek pinch unlocked', color: '#edaf18' },
      'Brant': { name: 'Burned Through Savings', desc: 'S6 Brant - fire DPS, fire wallet', color: '#f97316' },
      'Cantarella': { name: 'Toxic Relationship', desc: 'S6 Cantarella - she\'s poison and you keep coming back', color: '#ec4899' },
      'Zani': { name: 'Frazzle Addict', desc: 'S6 Zani -19 stacks of Frazzle, zero stacks of savings', color: '#edaf18' },
      'Ciaccona': { name: 'Wind Main in 2026', desc: 'S6 Ciaccona - bold, delusional, committed', color: '#22c55e' },
      'Cartethyia': { name: 'Blessed Wallet Drain', desc: 'S6 Cartethyia - the Maiden blessed your poverty', color: '#22c55e' },
      'Lupa': { name: 'Awoo\'d Too Hard', desc: 'S6 Lupa - the wolf pack ate your bank account', color: '#f97316' },
      'Phrolova': { name: 'Puppet? You\'re the Puppet.', desc: 'S6 Phrolova - she played you like her dolls', color: '#ec4899' },
      'Augusta': { name: 'Shocking Bill', desc: 'S6 Augusta - electrifying damage, electrifying debt', color: '#a855f7' },
      'Iuno': { name: 'Tone Deaf Spending', desc: 'S6 Iuno - the melody was "swipe swipe swipe"', color: '#22c55e' },
      'Galbrena': { name: 'Witch Time: Maxed', desc: 'S6 Galbrena - she IS Bayonetta now', color: '#f97316' },
      'Qiuyuan': { name: 'Echo Chamber', desc: 'S6 Qiuyuan - he echoed "one more Convene" seven times', color: '#22c55e' },
      'Chisa': { name: 'Cut Your Losses (Didn\'t)', desc: 'S6 Chisa - the blade cuts everything except your spending', color: '#ec4899' },
      'Lynae': { name: 'Lynae Impact', desc: 'S6 Lynae - just rename the game already', color: '#edaf18' },
      'Mornye': { name: 'Rhythm of Regret', desc: 'S6 Mornye - the beat dropped and so did your balance', color: '#f97316' },
      'Luuk Herssen': { name: 'Fist Full of Debt', desc: 'S6 Luuk Herssen - punched his way through your wallet', color: '#edaf18' },
      'Aemeath': { name: 'Rode Into Bankruptcy', desc: 'S6 Aemeath - the Exostrider ran over your finances', color: '#f97316' },
      'Sigrika': { name: 'Rune Bankruptcy', desc: 'S6 Sigrika - deciphered every rune except your bank statement', color: '#22c55e' },
    };
    
    // Check each character for S6
    Object.entries(charCounts).forEach(([name, count]) => {
      if (count >= 7 && s6Trophies[name]) {
        const t = s6Trophies[name];
        list.push({ id: `s6_${name.replace(/\s/g, '')}`, name: t.name, desc: t.desc, icon: 'Crown', color: t.color, tier: 'legendary' });
      }
    });
    
    // Fallback for any future character not in the map
    const anyS6 = Object.entries(charCounts).find(([name, c]) => c >= 7 && !s6Trophies[name]);
    if (anyS6) list.push({ id: 's6_other', name: 'The Shaper', desc: `S6 ${anyS6[0]} - fully Sequenced`, icon: 'Crown', color: '#ec4899', tier: 'legendary' });
    
    // "Gathering Wives" mega trophy - ALL 5-star characters at S6
    // Use ALL_5STAR_RESONATORS as source of truth (s6Trophies may lag behind new characters)
    const s6Count = ALL_5STAR_RESONATORS.filter(n => (charCounts[n] || 0) >= 7).length;
    const total5StarCount = ALL_5STAR_RESONATORS.length;
    if (s6Count >= total5StarCount) {
      list.push({ id: 's6_all', name: 'Gathering Wives: Complete', desc: 'Every 5★ at S6 - Rover\'s harem is full. seek help.', icon: 'Crown', color: '#ef4444', tier: 'legendary' });
    } else if (s6Count >= 20) {
      list.push({ id: 's6_harem20', name: 'Harem Protagonist EX', desc: `${s6Count}/${total5StarCount} at S6 - your wallet is in critical condition`, icon: 'Crown', color: '#ff4500', tier: 'legendary' });
    } else if (s6Count >= 10) {
      list.push({ id: 's6_harem10', name: 'Gathering Wives', desc: `${s6Count}/${total5StarCount} at S6 - Rover didn't stutter`, icon: 'Crown', color: '#ff6347', tier: 'legendary' });
    } else if (s6Count >= 5) {
      list.push({ id: 's6_harem5', name: 'Starting a Collection', desc: `${s6Count} at S6 - the harem arc is canon`, icon: 'Crown', color: '#ff8c00', tier: 'epic' });
    }
    
    // ═══ WEAPON REFINEMENT TROPHIES ═══
    const weapCounts = {};
    weapHistory.filter(p => p.rarity === 5 && p.name).forEach(p => { weapCounts[p.name] = (weapCounts[p.name] ?? 0) + 1; });
    const r5Weapons = Object.entries(weapCounts).filter(([, c]) => c >= 5);
    const r3Weapons = Object.entries(weapCounts).filter(([, c]) => c >= 3);
    const maxedWeap = r5Weapons[0];
    if (r5Weapons.length >= 3) list.push({ id: 'r5three', name: 'Forge of Impermanence', desc: `${r5Weapons.length} R5 weapons - your armory costs more than a car`, icon: 'Swords', color: '#ef4444', tier: 'legendary' });
    else if (r5Weapons.length >= 2) list.push({ id: 'r5two', name: 'Tuner Diff', desc: `${r5Weapons.length} R5 weapons - one wasn't enough apparently`, icon: 'Swords', color: '#ec4899', tier: 'legendary' });
    else if (maxedWeap) list.push({ id: 'r5', name: 'Weapon Banner Victim', desc: `R5 ${maxedWeap[0]} - financially irresponsible`, icon: 'Swords', color: '#ec4899', tier: 'legendary' });
    else if (r3Weapons.length >= 1) list.push({ id: 'r3', name: 'Halfway to Copium', desc: `R3+ ${r3Weapons[0][0]} - too invested to stop, too broke to finish`, icon: 'Sword', color: '#a855f7', tier: 'purple' });

    // Weapon banner pull volume
    const weapBannerPulls = weaponHist.length;
    if (weapBannerPulls >= 500) list.push({ id: 'weapvol5', name: 'Weapon Banner Prisoner', desc: `${weapBannerPulls} weapon banner Convenes - this is a lifestyle choice`, icon: 'Swords', color: '#edaf18', tier: 'gold' });
    else if (weapBannerPulls >= 200) list.push({ id: 'weapvol2', name: 'Signature Cope', desc: `${weapBannerPulls} weapon banner Convenes -"it's a DPS increase bro"`, icon: 'Sword', color: '#60a5fa', tier: 'blue' });

    // More weapon Convenes than character Convenes
    if (weapBannerPulls > 0 && featuredHist.length > 0 && weapBannerPulls > featuredHist.length) {
      list.push({ id: 'weapsimp', name: 'BiS or Bust', desc: 'More weapon Convenes than character Convenes - priorities moment', icon: 'Sword', color: '#f97316', tier: 'orange' });
    }

    // Never Convened on weapon banner
    if (weapBannerPulls === 0 && totalPulls >= 100) list.push({ id: 'noweap', name: 'Fists Only Challenge', desc: 'Zero weapon banner Convenes - who needs signatures anyway', icon: 'Shield', color: '#22c55e', tier: 'green' });
    
    // Average pity under 50 with 10+ 5★ (consistently lucky)
    if (total5Stars >= 10 && overallStats?.avgPity) {
      const avg = parseFloat(overallStats.avgPity);
      if (!isNaN(avg) && avg <= 35) list.push({ id: 'luckyavg2', name: 'Edited Convene Log', desc: `Avg pity ${overallStats.avgPity} across ${total5Stars} five-stars - has to be fake right??`, icon: 'Clover', color: '#ef4444', tier: 'legendary' });
      else if (!isNaN(avg) && avg <= 45) list.push({ id: 'luckyavg', name: 'Illegal Luck', desc: `Avg pity ${overallStats.avgPity} across ${total5Stars} five-stars - report this account`, icon: 'Clover', color: '#edaf18', tier: 'gold' });
      else if (!isNaN(avg) && avg >= 70) list.push({ id: 'unluckyavg', name: 'Certified Unlucky', desc: `Avg pity ${overallStats.avgPity} - genuinely painful to look at`, icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
      else if (!isNaN(avg) && avg >= 65) list.push({ id: 'unluckyavg2', name: 'Soft Pity Squatter', desc: `Avg pity ${overallStats.avgPity} - you live in the soft zone rent-free`, icon: 'AlertCircle', color: '#f97316', tier: 'orange' });
    }

    // Never got early pity - all 5★ at pity 50+ (with 5+ pulls)
    const allLatePity = total5Stars >= 5 && all5Stars.every(p => p.pity >= 65);
    if (allLatePity) list.push({ id: 'neverearly', name: 'Waveplate Syndrome', desc: 'Never once got a 5★ before soft pity - always waiting, never winning', icon: 'Shield', color: '#6b7280', tier: 'gray' });

    // Multiple hard pity hits
    const hardPityCount = all5Stars.filter(p => p.pity >= HARD_PITY).length;
    if (hardPityCount >= 5) list.push({ id: 'hard5', name: 'Tacet Mark: Permanent', desc: `Hit hard pity ${hardPityCount}× - the Lament scarred your account`, icon: 'Shield', color: '#ef4444', tier: 'red' });
    else if (hardPityCount >= 3) list.push({ id: 'hard3', name: 'Frequent Flyer: Pity 80', desc: `Hit hard pity ${hardPityCount}× - you know the road to 80 by heart`, icon: 'Shield', color: '#6b7280', tier: 'gray' });

    // Got a 5★ at very low pity multiple times
    const veryEarlyCount = all5Stars.filter(p => p.pity > 0 && p.pity <= 10).length;
    if (veryEarlyCount >= 5) list.push({ id: 'early5x', name: 'Rover\'s Plot Armor', desc: `${veryEarlyCount} five-stars within first 10 pity - protagonist luck is real`, icon: 'Clover', color: '#edaf18', tier: 'legendary' });
    else if (veryEarlyCount >= 3) list.push({ id: 'early3x', name: 'Resonance Beacon', desc: `${veryEarlyCount} five-stars within first 10 pity - they come to you`, icon: 'Clover', color: '#22c55e', tier: 'green' });
    
    // ═══ 50/50 LOSS CHARACTER TROPHIES ═══
    // Standard banner chars you can lose 50/50 to: Calcharo, Encore, Jianxin, Lingyang, Verina
    const lostTo = featured5Stars.filter(p => p.won5050 === false && p.name);
    const lostToNames = lostTo.map(p => p.name);
    const lostCount = (name) => lostToNames.filter(n => n === name).length;
    
    // Lingyang - the community's most memed 50/50 loss
    const lingyangLosses = lostCount('Lingyang');
    if (lingyangLosses >= 3) list.push({ id: 'tiger3', name: 'Lingyang Main (Involuntary)', desc: `Lost 50/50 to Lingyang ${lingyangLosses}× - he chose you`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    else if (lingyangLosses >= 1) list.push({ id: 'tiger1', name: 'Lingyang\'d', desc: 'Lost 50/50 to Lingyang - welcome to the club', icon: 'AlertCircle', color: '#f97316', tier: 'orange' });
    
    // Calcharo - memetic loser of the community
    const calcharoLosses = lostCount('Calcharo');
    if (calcharoLosses >= 3) list.push({ id: 'calch3', name: 'Calcharo Stalker Victim', desc: `Lost 50/50 to Calcharo ${calcharoLosses}× - restraining order when`, icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    else if (calcharoLosses >= 1) list.push({ id: 'calch1', name: 'Sentenced', desc: 'Lost 50/50 to Calcharo - guilty as charged', icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    
    // Jianxin
    if (lostCount('Jianxin') >= 1) list.push({ id: 'jianxin', name: 'Parry This Casual', desc: `Lost 50/50 to Jianxin ${lostCount('Jianxin')}×`, icon: 'Shield', color: '#22c55e', tier: 'green' });
    
    // Encore
    if (lostCount('Encore') >= 1) list.push({ id: 'encore', name: 'Woolie\'d', desc: `Lost 50/50 to Encore ${lostCount('Encore')}× - Cosmos sends his regards`, icon: 'Flame', color: '#ec4899', tier: 'pink' });
    
    // Verina - the only "good" 50/50 loss
    if (lostCount('Verina') >= 1) list.push({ id: 'verina', name: 'W in Disguise', desc: `Lost 50/50 to Verina ${lostCount('Verina')}× - best L you ever took`, icon: 'Heart', color: '#22c55e', tier: 'green' });
    
    // Lost to all 5 standard characters across all 50/50 losses
    const stdChars = [...STANDARD_5STAR_CHARACTERS];
    const lostToAllStd = stdChars.every(name => lostToNames.includes(name));
    if (lostToAllStd) list.push({ id: 'allstd', name: 'Gotta Lose \'Em All', desc: 'Lost 50/50 to every standard character - completionist arc', icon: 'Trophy', color: '#a855f7', tier: 'purple' });
    
    // Total 50/50 losses
    const totalLosses = lostTo.length;
    const totalWins = featured5Stars.filter(p => p.won5050 === true).length;
    if (totalLosses >= 10) list.push({ id: 'loss10', name: 'Down Bad (Financially)', desc: `${totalLosses} 50/50 losses - at what point do you stop`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    
    // Win rate trophy
    const total5050s = totalWins + totalLosses;
    if (total5050s >= 5) {
      const winRate = Math.round((totalWins / total5050s) * 100);
      if (winRate >= 80) list.push({ id: 'highwr', name: 'Account For Sale?', desc: `${winRate}% win rate across ${total5050s} flips - this isn't normal`, icon: 'Crown', color: '#edaf18', tier: 'legendary' });
      else if (winRate >= 65) list.push({ id: 'goodwr', name: 'Jinzhou\'s Luckiest', desc: `${winRate}% win rate across ${total5050s} flips - the Magistrate blesses you`, icon: 'Clover', color: '#22c55e', tier: 'green' });
      else if (winRate <= 20) list.push({ id: 'lowwr', name: 'Statistically Bullied', desc: `${winRate}% win rate across ${total5050s} flips - file a complaint`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
      else if (winRate <= 35) list.push({ id: 'badwr', name: 'Tacet Field: Account', desc: `${winRate}% win rate across ${total5050s} flips - corrupted beyond repair`, icon: 'AlertCircle', color: '#f97316', tier: 'orange' });
      // Perfectly balanced - exactly 50% ±2%
      if (total5050s >= 10 && winRate >= 48 && winRate <= 52) list.push({ id: 'balanced', name: '50/50 at 50/50', desc: `${winRate}% win rate across ${total5050s} flips - mathematically perfect copium`, icon: 'Target', color: '#06b6d4', tier: 'cyan' });
    }

    // 50/50 win total milestones
    if (totalWins >= 20) list.push({ id: 'wins20', name: 'Shorekeeper\'s Chosen', desc: `${totalWins} 50/50 wins - she protects your account too`, icon: 'Crown', color: '#edaf18', tier: 'gold' });
    else if (totalWins >= 10) list.push({ id: 'wins10', name: 'Sonance Cascade', desc: `${totalWins} 50/50 wins total - the echoes answer`, icon: 'Target', color: '#22c55e', tier: 'green' });

    // Against All Odds - won 50/50 immediately after 3+ consecutive losses
    let hasAgainstOdds = false;
    let lossRunCount = 0;
    for (const p of featured5Stars) {
      if (p.won5050 === null) continue;
      if (p.won5050 === false) lossRunCount++;
      else { if (lossRunCount >= 3) { hasAgainstOdds = true; break; } lossRunCount = 0; }
    }
    if (hasAgainstOdds) list.push({ id: 'odds', name: 'Plot Armor Activated', desc: 'Won 50/50 after 3+ consecutive losses - anime comeback arc', icon: 'Flame', color: '#f97316', tier: 'orange' });
    
    // ═══ META TEAM TROPHIES ═══
    // Check if player owns all members of a meta team (using their 5★ collection)
    const owns = (name) => owned5StarChars.has(name);
    const ownsAll = (...names) => names.every(owns);
    
    // T0 Meta Teams
    if (ownsAll('Phrolova', 'Cantarella')) list.push({ id: 'phrol', name: 'Codependency', desc: 'Phrolova + Cantarella - useless without each other, broken together', icon: 'Heart', color: '#a855f7', tier: 'purple' });
    if (ownsAll('Phoebe', 'Zani')) list.push({ id: 'zaphi', name: 'Wheelchair', desc: 'Phoebe + Zani -19 Frazzle stacks, zero skill required', icon: 'Heart', color: '#edaf18', tier: 'gold' });
    if (ownsAll('Lynae', 'Mornye')) list.push({ id: 'lynmor', name: 'Pay2Win Unlocked', desc: 'Lynae + Mornye - the game plays itself now', icon: 'Sparkles', color: '#edaf18', tier: 'gold' });
    if (ownsAll('Changli') && ownsAll('Brant') && ownsAll('Lupa')) list.push({ id: 'monofusion', name: 'Arsonist Squad', desc: 'Changli + Brant + Lupa - everything burns, including your primos', icon: 'Flame', color: '#f97316', tier: 'orange' });
    if (ownsAll('Galbrena', 'Qiuyuan', 'Shorekeeper')) list.push({ id: 'fusion', name: 'Bayonetta at Home', desc: 'Galbrena + Qiuyuan + SK - Mom said we have Bayonetta at home', icon: 'Flame', color: '#f97316', tier: 'orange' });
    if (ownsAll('Jiyan') && owned4StarChars.has('Mortefi')) list.push({ id: 'jiyan', name: 'Boomer Comp', desc: 'Jiyan + Mortefi -1.0 copium that refuses to retire', icon: 'Shield', color: '#22c55e', tier: 'green' });
    
    // Own both Shorekeeper and Verina (the two universal supports)
    if (ownsAll('Shorekeeper', 'Verina')) list.push({ id: 'heals', name: 'Skill Issue Insurance', desc: 'SK + Verina - can\'t die even if you tried', icon: 'Heart', color: '#22c55e', tier: 'green' });

    // Jinhsi + Changli (Jinzhou power couple)
    if (ownsAll('Jinhsi', 'Changli')) list.push({ id: 'jinzhou', name: 'Magistrate\'s Flame', desc: 'Jinhsi + Changli - Jinzhou\'s power duo', icon: 'Flame', color: '#f97316', tier: 'orange' });
    // Carlotta + Roccia (Rinascita duo)
    if (ownsAll('Carlotta', 'Roccia')) list.push({ id: 'rinascita', name: 'Rinascita Familia', desc: 'Carlotta + Roccia - the ice queen and her ride', icon: 'Diamond', color: '#38bdf8', tier: 'blue' });
    // Own all standard 5★ characters
    if (stdChars.length > 0 && [...stdChars].every(n => owns(n))) list.push({ id: 'stdall', name: 'Losers Club', desc: 'All standard 5★ Resonators - the "thanks for the 50/50 loss" squad', icon: 'Trophy', color: '#a855f7', tier: 'purple' });
    
    // Own 3+ T0 DPS
    const t0Dps = ['Cartethyia', 'Camellya', 'Carlotta', 'Xiangli Yao', 'Phrolova', 'Iuno', 'Augusta', 'Aemeath'];
    const ownedT0 = t0Dps.filter(n => owns(n));
    if (ownedT0.length >= 6) list.push({ id: 't0six', name: 'Tower? Cleared.', desc: `${ownedT0.length} T0 DPS - ToA is your personal playground`, icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    else if (ownedT0.length >= 3) list.push({ id: 't0three', name: 'Meta Slave', desc: `${ownedT0.length} T0 DPS - tier list told you to Convene`, icon: 'Trophy', color: '#a855f7', tier: 'purple' });
    
    // ═══ QUIRKY / COMMUNITY TROPHIES ═══
    // Never lost a 50/50 (with at least 3 wins)
    if (totalWins >= 3 && totalLosses === 0) list.push({ id: 'noloss', name: 'Literally Never Lost', desc: `${totalWins} 50/50 wins, zero losses - touch grass`, icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    
    // Lost first 50/50 (very first was a loss)
    if (first5050 && first5050.won5050 === false) list.push({ id: 'firstloss', name: 'First Time?', desc: 'First 50/50 was a loss - it only gets worse', icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    
    // 4★ only - lots of pulls but very few 5★ (bad luck overall)
    if (totalPulls >= 200 && total5Stars <= 2) list.push({ id: 'dry', name: 'Down Horrendous', desc: `${totalPulls} Convenes, ${total5Stars} five-stars - delete the app`, icon: 'TrendingDown', color: '#6b7280', tier: 'gray' });
    
    // Duplicate magnet - same standard char lost to 3+ times
    const dupMagnet = stdChars.find(name => lostCount(name) >= 3);
    if (dupMagnet && dupMagnet !== 'Lingyang') list.push({ id: 'dup', name: 'Hostage Situation', desc: `${dupMagnet} S${lostCount(dupMagnet) - 1} from 50/50 losses alone - didn't even want them`, icon: 'Diamond', color: '#6b7280', tier: 'gray' });

    // ═══ MORE QUIRKY / SITUATIONAL TROPHIES ═══
    // Only own 1 unique 5★ character
    if (owned5StarChars.size === 1 && totalPulls >= 50) list.push({ id: 'onetrick', name: 'Solo Resonator', desc: `Only ${[...owned5StarChars][0]} - loyalty or poverty?`, icon: 'Target', color: '#f97316', tier: 'orange' });

    // Pulled 5★ character and their signature weapon
    const sigPairs = [
      ['Jiyan', 'Verdant Summit'], ['Yinlin', 'Stringmaster'], ['Jinhsi', 'Ages of Harvest'],
      ['Changli', 'Blazing Brilliance'], ['Zhezhi', 'Rime-Draped Sprouts'], ['Xiangli Yao', "Verity's Handle"],
      ['Shorekeeper', 'Stellar Symphony'], ['Camellya', 'Red Spring'], ['Carlotta', 'The Last Dance'],
      ['Roccia', 'Tragicomedy'], ['Phoebe', 'Luminous Hymn'], ['Brant', 'Unflickering Valor'],
      ['Cantarella', 'Whispers of Sirens'], ['Zani', 'Blazing Justice'], ['Ciaccona', 'Woodland Aria'],
      ['Cartethyia', "Defier's Thorn"], ['Lupa', 'Wildfire Mark'], ['Phrolova', 'Lethean Elegy'],
      ['Augusta', 'Thunderflare Dominion'], ['Iuno', "Moongazer's Sigil"], ['Galbrena', 'Lux & Umbra'],
      ['Qiuyuan', 'Emerald Sentence'], ['Chisa', 'Kumokiri'], ['Lynae', 'Spectrum Blaster'],
      ['Mornye', 'Starfield Calibrator'], ['Luuk Herssen', 'Everbright Polestar'], ['Aemeath', "Daybreaker's Spine"],
      ['Sigrika', 'Solsworn Ciphers'],
    ];
    const sigCount = sigPairs.filter(([char, weap]) => owned5StarChars.has(char) && owned5StarWeaps.has(weap)).length;
    if (sigCount >= 10) list.push({ id: 'sig10', name: 'Tuning Complete', desc: `${sigCount} characters with their signature - peak Forte optimization`, icon: 'Swords', color: '#edaf18', tier: 'gold' });
    else if (sigCount >= 5) list.push({ id: 'sig5', name: 'Forte Synergy', desc: `${sigCount} characters with their signature weapon - built different`, icon: 'Sword', color: '#a855f7', tier: 'purple' });
    else if (sigCount >= 3) list.push({ id: 'sig3', name: 'Echo Equipped', desc: `${sigCount} characters with their signature weapon`, icon: 'Sword', color: '#60a5fa', tier: 'blue' });
    else if (sigCount >= 1) list.push({ id: 'sig1', name: 'Signature Acquired', desc: 'Convened a character and their signature weapon - BiS secured', icon: 'Sword', color: '#22c55e', tier: 'green' });

    // Speedrun - won 50/50 at low pity (<25)
    const speedrun5050 = featured5Stars.find(p => p.won5050 === true && p.pity > 0 && p.pity <= 20);
    if (speedrun5050) list.push({ id: 'speed', name: 'Early Pity Any%', desc: `Won 50/50 at pity ${speedrun5050.pity} - frame-perfect gacha luck`, icon: 'Zap', color: '#22c55e', tier: 'green' });

    // Max Sequence on a standard character from 50/50 losses alone
    const stdS6FromLosses = [...stdChars].find(name => lostCount(name) >= 7);
    if (stdS6FromLosses) list.push({ id: 'stdS6', name: 'Accidental S6: Coping', desc: `S6 ${stdS6FromLosses} entirely from 50/50 losses - didn't even Convene for them`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });

    // Guaranteed streak - multiple 5★ in a row that were all guaranteed (lost 50/50 every time)
    let guaranteedStreak = 0, maxGuaranteedStreak = 0;
    for (const p of featured5Stars) {
      if (p.won5050 === null) { guaranteedStreak++; } // null = guaranteed
      else { maxGuaranteedStreak = Math.max(maxGuaranteedStreak, guaranteedStreak); guaranteedStreak = 0; }
    }
    maxGuaranteedStreak = Math.max(maxGuaranteedStreak, guaranteedStreak);
    if (maxGuaranteedStreak >= 3) list.push({ id: 'guar3', name: 'Guarantee Gang', desc: `${maxGuaranteedStreak} guaranteed 5★ in a row - never won a 50/50 between them`, icon: 'Shield', color: '#f97316', tier: 'orange' });

    // F2P indicator - less than 200 pulls total but has 5+ five-stars (efficient)
    if (totalPulls > 0 && totalPulls <= 200 && total5Stars >= 5) list.push({ id: 'efficient', name: 'F2P BTW', desc: `${total5Stars} five-stars in only ${totalPulls} Convenes - maximum Astrite efficiency`, icon: 'Clover', color: '#22c55e', tier: 'green' });

    // Biggest gap - over 150 pulls between 5★ at any point
    let maxDryStreak = 0;
    let currentDry = 0;
    for (const p of allHistory) {
      currentDry++;
      if (p.rarity === 5) { maxDryStreak = Math.max(maxDryStreak, currentDry); currentDry = 0; }
    }
    if (maxDryStreak >= 160) list.push({ id: 'dry150', name: 'Huanglong\'s Desert', desc: `${maxDryStreak} Convenes between 5★ - the wasteland arc`, icon: 'TrendingDown', color: '#ef4444', tier: 'red' });
    else if (maxDryStreak >= 145) list.push({ id: 'dry130', name: 'Tacet Drought', desc: `${maxDryStreak} Convenes between 5★ - silence from the banner`, icon: 'TrendingDown', color: '#f97316', tier: 'orange' });

    // Apply admin trophy name/desc overrides
    const finalList = list.map(t => {
      const ov = trophyOverrides[t.id];
      if (!ov) return t;
      return { ...t, ...(ov.name && { name: ov.name }), ...(ov.desc && { desc: ov.desc }) };
    });

    return {
      list: finalList,
      stats: {
        earliest5Star,
        bestWinStreak,
        worstLossStreak,
        currentStreak: recentStreak,
        totalPulls,
        owned5StarChars: owned5StarChars.size,
        owned4StarChars: owned4StarChars.size,
        owned5StarWeaps: owned5StarWeaps.size,
        owned4StarWeaps: owned4StarWeaps.size,
        owned3StarWeaps: owned3StarWeaps.size,
      }
    };
}
