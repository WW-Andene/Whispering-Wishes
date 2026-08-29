// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — idCardRenderer.js
// Standalone ID card canvas renderer. Extracted from ProfileTab.jsx (585 lines).
// Pure async function: takes data, produces downloadable canvas image.
// ═══════════════════════════════════════════════════════════════════════════════

import { ALL_CHARACTERS } from '../../data/characters.js';

// The real home-screen app icon (also the PWA/manifest icon), used as the ID card's default
// avatar watermark when no profile picture is set — deliberately not HEADER_ICON, which is a
// different (Radiant Tide currency) image despite the name.
const APP_ICON = './app-title-icon/icon-192x192.png';

/**
 * Render and download an ID card as PNG.
 * @param {Object} params
 * @param {string} params.format - 'landscape' or 'portrait'
 * @param {Object} params.profile - profile
 * @param {string} params.server - server
 * @param {Object} params.overallStats - computed overall stats
 * @param {number} params.luckRating - luck rating value
 * @param {string[]} params.ownedCharNames - owned character names
 * @param {Object} params.collectionImages - character image URLs
 * @param {Object} params.trophies - trophy data
 * @param {Function} params.getImageFraming - image framing function
 * @param {Object} [params.toast] - toast provider, for the export-result notifications below
 */
export async function renderIdCard({ format, profile, server, overallStats, luckRating, ownedCharNames, collectionImages, trophies, getImageFraming, toast }) {
    const isPortrait = format === 'portrait';
    const canvas = document.createElement('canvas');
    const W = isPortrait ? 1080 : 1920;
    const H = isPortrait ? 1920 : 1080;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const rr = (x,y,w,h,r) => { ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); };

    // Data
    const picName = profile.profilePic;
    const picUrl = picName ? (collectionImages[picName] || '') : '';
    let pImg = null;
    // AUDIT-FIX H1: Clear timeouts to prevent leaks on image preload
    if (picUrl) { try { pImg = new Image(); pImg.crossOrigin = 'anonymous'; await new Promise((r,j)=>{const t=setTimeout(j,3000);pImg.onload=()=>{clearTimeout(t);r();};pImg.onerror=()=>{clearTimeout(t);j();};pImg.src=picUrl;}); } catch { pImg = null; } }
    let appIco = null;
    try { appIco = new Image(); await new Promise((r,j)=>{const t=setTimeout(j,2000);appIco.onload=()=>{clearTimeout(t);r();};appIco.onerror=()=>{clearTimeout(t);j();};appIco.src=APP_ICON;}); } catch { appIco = null; }

    // Preload resonator portrait images
    const resImgs = {};
    const charHist0 = [...(profile.featured?.history||[]),...(profile.standardChar?.history||[]),...(profile.beginner?.history||[]).filter(p=>p.name&&ALL_CHARACTERS.has(p.name))];
    const preloadNames = [...new Set(charHist0.filter(p=>(p.rarity===5||p.rarity===4)&&p.name&&ALL_CHARACTERS.has(p.name)).map(p=>p.name))].reverse().slice(0, 24);
    await Promise.all(preloadNames.map(name => {
      const url = collectionImages[name];
      if (!url) return Promise.resolve();
      return new Promise(resolve => {
        const img = new Image(); img.crossOrigin = 'anonymous';
        // AUDIT-FIX H1: Clear timeout on load/error to prevent leaks
        const t = setTimeout(resolve, 3000);
        img.onload = () => { clearTimeout(t); resImgs[name] = img; resolve(); };
        img.onerror = () => { clearTimeout(t); resolve(); }; img.src = url;
      });
    }));

    const uname = profile.username || 'Resonator';
    const uid = profile.uid || '--';
    const svr = server;
    const lr = luckRating;
    const tList = [...(trophies?.list || [])].sort((a,b) => (TROPHY_TIER_ORDER[a.tier]??99) - (TROPHY_TIER_ORDER[b.tier]??99)).slice(0, 5);
    const impDate = profile.importedAt ? new Date(profile.importedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    const beginnerHist = profile.beginner?.history||[];
    const charHist = [
      ...(profile.featured?.history || []),
      ...(profile.standardChar?.history || []),
      ...beginnerHist.filter(p => p.name && ALL_CHARACTERS.has(p.name))
    ];
    const weapHist = [
      ...(profile.weapon?.history || []),
      ...(profile.standardWeap?.history || []),
      ...beginnerHist.filter(p => p.name && !ALL_CHARACTERS.has(p.name))
    ];

    const countUniqueOwned = (h, r, isChar) =>
      new Set(h.filter(p => p.rarity === r && p.name && (isChar ? ALL_CHARACTERS.has(p.name) : !ALL_CHARACTERS.has(p.name))).map(p => p.name)).size;

    const c5 = countUniqueOwned(charHist, 5, true);
    const c4 = countUniqueOwned(charHist, 4, true);
    const w5 = countUniqueOwned(weapHist, 5, false);
    const w4 = countUniqueOwned(weapHist, 4, false);
    const w3 = countUniqueOwned(weapHist, 3, false);
    const w2 = countUniqueOwned(weapHist, 2, false);
    const w1 = countUniqueOwned(weapHist, 1, false);

    const newestRes = [...new Set(
      charHist.filter(p => (p.rarity === 5 || p.rarity === 4) && p.name && ALL_CHARACTERS.has(p.name)).map(p => p.name)
    )].reverse();

    const fiveStarPulls = [...charHist, ...weapHist].filter(p => p.rarity === 5 && p.pity > 0);

    const { buckets: histBuckets, labels: histLabels } = buildPityHistogram(fiveStarPulls);

    const histSummary = fiveStarPulls.length >= 2 ? {
      max: Math.max(...Object.values(histBuckets), 1),
      avg: (fiveStarPulls.reduce((s, p) => s + p.pity, 0) / fiveStarPulls.length).toFixed(1),
      lo: Math.min(...fiveStarPulls.map(p => p.pity)),
      hi: Math.max(...fiveStarPulls.map(p => p.pity))
    } : null;
    const sts = [
      {l:'Avg Pity',v:overallStats?.avgPity??'--',c:'#edaf18'},
      {l:'Total Convenes',v:overallStats?.totalPulls?.toLocaleString('en-US')??'--',c:'#e2e8f0'},
      {l:'5★',v:String(overallStats?.fiveStars??'--'),c:'#c084fc'},
      {l:'50/50 Win',v:overallStats?.winRate?overallStats.winRate+'%':'--',c:'#4ade80'},
      {l:'Won',v:String(overallStats?.won5050??'--'),c:'#4ade80'},
      {l:'Lost',v:String(overallStats?.lost5050??'--'),c:'#f87171'},
    ];

    // Per-banner breakdown data
    const featHist = profile.featured?.history||[];
    const weapBannerHist = profile.weapon?.history||[];
    const stdCHist = profile.standardChar?.history||[];
    const stdWHist = profile.standardWeap?.history||[];
    const bgnHist = profile.beginner?.history||[];
    const bannerStats = [
      {l:'Featured',v:String(featHist.length),c:'#edaf18',s:featHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Weapon',v:String(weapBannerHist.length),c:'#c084fc',s:weapBannerHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Standard Resonator',v:String(stdCHist.length),c:'#60a5fa',s:stdCHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Standard Weapon',v:String(stdWHist.length),c:'#60a5fa',s:stdWHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Beginner',v:String(bgnHist.length),c:'#34d399',s:bgnHist.filter(p=>p.rarity===5).length+' ★5'},
    ];

    // ═══ DRAWING PRIMITIVES ═══
    // Outer card — .kuro-card
    const drawShell = (x,y,w,h) => {
      ctx.fillStyle='rgba(12,16,24,0.8)';rr(x,y,w,h,24);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1.5;rr(x,y,w,h,24);ctx.stroke();
      const il=ctx.createLinearGradient(x,y,x,y+3);il.addColorStop(0,'rgba(255,255,255,0.07)');il.addColorStop(1,'transparent');
      ctx.fillStyle=il;ctx.fillRect(x+24,y+1,w-48,2);
      const sh=ctx.createLinearGradient(x,0,x+w,0);
      sh.addColorStop(0,'transparent');sh.addColorStop(0.2,'rgba(255,255,255,0.35)');sh.addColorStop(0.5,'rgba(255,255,255,0.55)');sh.addColorStop(0.8,'rgba(255,255,255,0.35)');sh.addColorStop(1,'transparent');
      ctx.fillStyle=sh;ctx.fillRect(x+24,y,w-48,1.5);
      ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x+w-12-18,y+12);ctx.lineTo(x+w-12,y+12);ctx.lineTo(x+w-12,y+12+18);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.14)';
      ctx.beginPath();ctx.moveTo(x+12+18,y+h-12);ctx.lineTo(x+12,y+h-12);ctx.lineTo(x+12,y+h-12-18);ctx.stroke();
    };

    // Header
    const drawHeader = (x,y,w) => {
      const hH=54;
      const hg=ctx.createLinearGradient(x,y,x+w,y);
      hg.addColorStop(0,'rgba(255,255,255,0.02)');hg.addColorStop(0.4,'transparent');hg.addColorStop(0.6,'transparent');hg.addColorStop(1,'rgba(255,255,255,0.02)');
      ctx.fillStyle=hg;ctx.fillRect(x,y,w,hH);
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y+hH);ctx.lineTo(x+w,y+hH);ctx.stroke();
      const gb=ctx.createLinearGradient(0,y+15,0,y+15+26);gb.addColorStop(0,'rgba(237,175,24,0.9)');gb.addColorStop(1,'rgba(237,175,24,0.4)');
      ctx.fillStyle=gb;rr(x+18,y+15,4,26,2);ctx.fill();
      ctx.shadowColor='rgba(237,175,24,0.3)';ctx.shadowBlur=12;rr(x+18,y+15,4,26,2);ctx.fill();ctx.shadowColor='transparent';ctx.shadowBlur=0;
      ctx.fillStyle='#f1f5f9';ctx.font='600 18px sans-serif';ctx.fillText('RESONATOR ID',x+32,y+34);
      ctx.fillStyle='#4b5563';ctx.font='14px sans-serif';ctx.textAlign='right';ctx.fillText('whisperingwishes.app',x+w-18,y+34);ctx.textAlign='left';
      return hH;
    };

    // Section panel with gold bar label
    const drawPanel = (x,y,w,h,label) => {
      ctx.fillStyle='rgba(10,14,22,0.55)';rr(x,y,w,h,15);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1.5;rr(x,y,w,h,15);ctx.stroke();
      const ps=ctx.createLinearGradient(x,0,x+w,0);ps.addColorStop(0,'transparent');ps.addColorStop(0.3,'rgba(255,255,255,0.18)');ps.addColorStop(0.5,'rgba(255,255,255,0.3)');ps.addColorStop(0.7,'rgba(255,255,255,0.18)');ps.addColorStop(1,'transparent');
      ctx.fillStyle=ps;ctx.fillRect(x+12,y,w-24,1.5);
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x+w-9-12,y+6);ctx.lineTo(x+w-9,y+6);ctx.lineTo(x+w-9,y+6+12);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+9+12,y+h-6);ctx.lineTo(x+9,y+h-6);ctx.lineTo(x+9,y+h-6-12);ctx.stroke();
      if(label){
        const gb2=ctx.createLinearGradient(0,y+12,0,y+12+20);gb2.addColorStop(0,'rgba(237,175,24,0.8)');gb2.addColorStop(1,'rgba(237,175,24,0.3)');
        ctx.fillStyle=gb2;rr(x+15,y+12,3.5,20,1.5);ctx.fill();
        ctx.fillStyle='#e2e8f0';ctx.font='600 17px sans-serif';ctx.fillText(label,x+26,y+28);
        return 39;
      }
      return 9;
    };

    // .kuro-stat cell
    const drawStat = (x,y,w,h,val,lab,col,fs) => {
      ctx.fillStyle='rgba(10,14,22,0.8)';rr(x,y,w,h,12);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.20)';ctx.lineWidth=1;rr(x,y,w,h,12);ctx.stroke();
      const ss=ctx.createLinearGradient(x,0,x+w,0);ss.addColorStop(0,'transparent');ss.addColorStop(0.5,'rgba(255,255,255,0.40)');ss.addColorStop(1,'transparent');
      ctx.fillStyle=ss;ctx.fillRect(x+6,y,w-12,1.5);
      const f=Math.round((fs||24)*1.1);
      ctx.fillStyle=col;ctx.font=`bold ${f}px monospace`;ctx.textAlign='center';ctx.fillText(val,x+w/2,y+h*0.48);
      ctx.fillStyle='#9ca3af';ctx.font=`${Math.max(11,Math.round(f*0.5))}px sans-serif`;ctx.fillText(lab,x+w/2,y+h*0.78);ctx.textAlign='left';
    };

    // Resonator portrait — collection-panel style: tall card with image + gradient name overlay
    const drawResPortrait = (x,y,cellW,cellH,name,img) => {
      ctx.fillStyle='rgba(10,14,22,0.9)';rr(x,y,cellW,cellH,9);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;rr(x,y,cellW,cellH,9);ctx.stroke();
      if(img){
        ctx.save();rr(x+1,y+1,cellW-2,cellH-2,8);ctx.clip();
        const f=getImageFraming('collection-'+name);
        const sc=f.zoom/100;
        // Preserve aspect ratio (object-contain): fit image inside cell
        const imgAR=img.naturalWidth/img.naturalHeight;
        const cellAR=cellW/cellH;
        let bw2,bh2;
        if(imgAR>cellAR){bw2=cellW;bh2=cellW/imgAR;}else{bh2=cellH;bw2=cellH*imgAR;}
        const dw=bw2*sc,dh=bh2*sc;
        const dx=x+(cellW-dw)/2-(f.x/100)*bw2*sc;
        const dy=y+(cellH-dh)/2-(f.y/100)*bh2*sc;
        ctx.drawImage(img,dx,dy,dw,dh);
        ctx.restore();
        const fade=ctx.createLinearGradient(0,y+cellH-33,0,y+cellH);
        fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,0.85)');
        ctx.save();rr(x+1,y+1,cellW-2,cellH-2,8);ctx.clip();
        ctx.fillStyle=fade;ctx.fillRect(x+1,y+cellH-33,cellW-2,32);
        ctx.restore();
      } else {
        ctx.fillStyle='#4b5563';ctx.font=Math.max(14,Math.round(cellW*0.3))+'px sans-serif';
        ctx.textAlign='center';ctx.fillText(name[0],x+cellW/2,y+cellH/2+6);ctx.textAlign='left';
      }
      ctx.fillStyle='#e5e7eb';ctx.font='11px sans-serif';ctx.textAlign='center';
      const ml=Math.floor(cellW/5.5);
      ctx.fillText(name.length>ml?name.slice(0,ml-1)+'..':name,x+cellW/2,y+cellH-5);ctx.textAlign='left';
    };

    // Draw icon using canvas path primitives — guaranteed to render (no font/Unicode dependency)
    const drawIconPath = (icx,icy,r,iconName,color) => {
      ctx.save();ctx.fillStyle=color;ctx.strokeStyle=color;
      ctx.lineWidth=Math.max(1.5,r*0.15);ctx.lineCap='round';ctx.lineJoin='round';
      const s=r*0.65;
      switch(iconName){
        case 'Crown':{ctx.beginPath();ctx.moveTo(icx-s,icy+s*0.5);ctx.lineTo(icx-s*0.9,icy-s*0.3);ctx.lineTo(icx-s*0.4,icy+s*0.05);ctx.lineTo(icx,icy-s*0.6);ctx.lineTo(icx+s*0.4,icy+s*0.05);ctx.lineTo(icx+s*0.9,icy-s*0.3);ctx.lineTo(icx+s,icy+s*0.5);ctx.closePath();ctx.fill();break;}
        case 'Sparkles':{ctx.beginPath();for(let i=0;i<8;i++){const a=(i*Math.PI/4)-Math.PI/2,rd=i%2===0?s:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
        case 'Heart':{const ht=s*0.9;ctx.beginPath();ctx.moveTo(icx,icy+ht*0.55);ctx.bezierCurveTo(icx-ht*1.1,icy-ht*0.2,icx-ht*0.5,icy-ht*0.9,icx,icy-ht*0.3);ctx.bezierCurveTo(icx+ht*0.5,icy-ht*0.9,icx+ht*1.1,icy-ht*0.2,icx,icy+ht*0.55);ctx.fill();break;}
        case 'Swords':{ctx.lineWidth=r*0.18;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy-s*0.7);ctx.lineTo(icx+s*0.7,icy+s*0.7);ctx.moveTo(icx+s*0.7,icy-s*0.7);ctx.lineTo(icx-s*0.7,icy+s*0.7);ctx.stroke();break;}
        case 'Sword':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx,icy-s*0.8);ctx.lineTo(icx,icy+s*0.6);ctx.moveTo(icx-s*0.35,icy-s*0.1);ctx.lineTo(icx+s*0.35,icy-s*0.1);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy+s*0.7,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'Shield':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.75);ctx.lineTo(icx+s*0.7,icy-s*0.35);ctx.lineTo(icx+s*0.55,icy+s*0.25);ctx.quadraticCurveTo(icx,icy+s*0.85,icx,icy+s*0.85);ctx.quadraticCurveTo(icx,icy+s*0.85,icx-s*0.55,icy+s*0.25);ctx.lineTo(icx-s*0.7,icy-s*0.35);ctx.closePath();ctx.fill();break;}
        case 'Gift':{ctx.fillStyle=color;rr(icx-s*0.55,icy-s*0.15,s*1.1,s*0.8,2);ctx.fill();rr(icx-s*0.65,icy-s*0.45,s*1.3,s*0.35,2);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(icx-s*0.06,icy-s*0.45,s*0.12,s*1.25);ctx.fillRect(icx-s*0.65,icy-s*0.35,s*1.3,s*0.1);break;}
        case 'Zap':{ctx.beginPath();ctx.moveTo(icx+s*0.15,icy-s*0.8);ctx.lineTo(icx-s*0.3,icy+s*0.05);ctx.lineTo(icx+s*0.05,icy+s*0.05);ctx.lineTo(icx-s*0.15,icy+s*0.8);ctx.lineTo(icx+s*0.3,icy-s*0.05);ctx.lineTo(icx-s*0.05,icy-s*0.05);ctx.closePath();ctx.fill();break;}
        case 'Clover':{const cr=s*0.28;ctx.beginPath();ctx.arc(icx,icy-cr,cr,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx-cr*0.87,icy+cr*0.5,cr,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx+cr*0.87,icy+cr*0.5,cr,0,Math.PI*2);ctx.fill();ctx.lineWidth=r*0.1;ctx.beginPath();ctx.moveTo(icx,icy+cr*0.4);ctx.lineTo(icx,icy+s*0.8);ctx.stroke();break;}
        case 'Flame':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.8);ctx.bezierCurveTo(icx+s*0.6,icy-s*0.3,icx+s*0.5,icy+s*0.4,icx,icy+s*0.7);ctx.bezierCurveTo(icx-s*0.5,icy+s*0.4,icx-s*0.6,icy-s*0.3,icx,icy-s*0.8);ctx.fill();break;}
        case 'Target':{ctx.lineWidth=r*0.12;ctx.beginPath();ctx.arc(icx,icy,s*0.7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy,s*0.4,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'AlertCircle':{ctx.lineWidth=r*0.12;ctx.beginPath();ctx.arc(icx,icy,s*0.7,0,Math.PI*2);ctx.stroke();ctx.fillRect(icx-s*0.07,icy-s*0.35,s*0.14,s*0.4);ctx.beginPath();ctx.arc(icx,icy+s*0.32,s*0.08,0,Math.PI*2);ctx.fill();break;}
        case 'TrendingUp':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy+s*0.35);ctx.lineTo(icx-s*0.1,icy-s*0.15);ctx.lineTo(icx+s*0.2,icy+s*0.1);ctx.lineTo(icx+s*0.7,icy-s*0.4);ctx.stroke();ctx.beginPath();ctx.moveTo(icx+s*0.3,icy-s*0.4);ctx.lineTo(icx+s*0.7,icy-s*0.4);ctx.lineTo(icx+s*0.7,icy);ctx.stroke();break;}
        case 'TrendingDown':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy-s*0.35);ctx.lineTo(icx-s*0.1,icy+s*0.15);ctx.lineTo(icx+s*0.2,icy-s*0.1);ctx.lineTo(icx+s*0.7,icy+s*0.4);ctx.stroke();ctx.beginPath();ctx.moveTo(icx+s*0.3,icy+s*0.4);ctx.lineTo(icx+s*0.7,icy+s*0.4);ctx.lineTo(icx+s*0.7,icy);ctx.stroke();break;}
        case 'Fish':{ctx.beginPath();ctx.moveTo(icx+s*0.6,icy);ctx.quadraticCurveTo(icx,icy-s*0.5,icx-s*0.45,icy);ctx.quadraticCurveTo(icx,icy+s*0.5,icx+s*0.6,icy);ctx.fill();ctx.beginPath();ctx.moveTo(icx-s*0.45,icy);ctx.lineTo(icx-s*0.75,icy-s*0.3);ctx.lineTo(icx-s*0.75,icy+s*0.3);ctx.closePath();ctx.fill();break;}
        case 'Diamond':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.7);ctx.lineTo(icx+s*0.5,icy);ctx.lineTo(icx,icy+s*0.7);ctx.lineTo(icx-s*0.5,icy);ctx.closePath();ctx.fill();break;}
        case 'Gamepad2':{rr(icx-s*0.6,icy-s*0.25,s*1.2,s*0.5,s*0.15);ctx.fill();ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.arc(icx-s*0.28,icy,s*0.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx+s*0.28,icy,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'Star':{ctx.beginPath();for(let i=0;i<10;i++){const a=(i*Math.PI/5)-Math.PI/2,rd=i%2===0?s*0.75:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
        case 'Trophy':{ctx.beginPath();ctx.moveTo(icx-s*0.45,icy-s*0.5);ctx.lineTo(icx+s*0.45,icy-s*0.5);ctx.lineTo(icx+s*0.3,icy+s*0.1);ctx.quadraticCurveTo(icx,icy+s*0.35,icx-s*0.3,icy+s*0.1);ctx.closePath();ctx.fill();ctx.fillRect(icx-s*0.07,icy+s*0.1,s*0.14,s*0.25);rr(icx-s*0.25,icy+s*0.35,s*0.5,s*0.12,2);ctx.fill();break;}
        default:{ctx.beginPath();for(let i=0;i<10;i++){const a=(i*Math.PI/5)-Math.PI/2,rd=i%2===0?s*0.75:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
      }
      ctx.restore();
    };

    // Trophy card — flat dark cell style with trophy color accents
    const drawTrophy = (x,y,size,t) => {
      const tc=t.color||'#9ca3af';
      // Dark fill base
      ctx.fillStyle='rgba(10,14,22,0.8)';rr(x,y,size,size,12);ctx.fill();
      // Colored gradient overlay (stronger tint so color is clearly visible)
      const bg2=ctx.createLinearGradient(x,y,x+size,y+size);
      bg2.addColorStop(0,tc+'30');bg2.addColorStop(1,tc+'12');
      ctx.fillStyle=bg2;rr(x,y,size,size,12);ctx.fill();
      // Colored border
      ctx.strokeStyle=tc+'50';ctx.lineWidth=1;rr(x,y,size,size,12);ctx.stroke();
      // Colored shimmer top line
      const ss=ctx.createLinearGradient(x,0,x+size,0);
      ss.addColorStop(0,'transparent');ss.addColorStop(0.5,tc+'60');ss.addColorStop(1,'transparent');
      ctx.fillStyle=ss;ctx.fillRect(x+6,y,size-12,1.5);
      // Icon — centered, with colored glow for premium look
      const iconR=size*0.28;
      ctx.save();
      ctx.shadowColor=tc;ctx.shadowBlur=Math.max(12,size*0.1);
      drawIconPath(x+size/2,y+size*0.38,iconR,t.icon,tc);
      ctx.restore();
      // Name — white bold, centered
      const nameFontSize=Math.max(10,Math.floor(size*0.12));
      ctx.fillStyle='#ffffff';ctx.font=`bold ${nameFontSize}px sans-serif`;
      const maxW=size-14;
      let nameText=t.name;
      if(ctx.measureText(nameText).width>maxW){
        while(nameText.length>1&&ctx.measureText(nameText+'..').width>maxW)nameText=nameText.slice(0,-1);
        nameText=nameText+'..';
      }
      ctx.textAlign='center';ctx.fillText(nameText,x+size/2,y+size*0.78);
      ctx.textAlign='left';
    };

    // Hero profile image — large, with collection-style framing and gradient fade
    const drawHero = (x,y,w,h) => {
      ctx.fillStyle='rgba(8,12,18,0.95)';rr(x,y,w,h,15);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;rr(x,y,w,h,15);ctx.stroke();
      if(pImg){
        ctx.save();rr(x+2,y+2,w-4,h-4,14);ctx.clip();
        const f=picName?getImageFraming('collection-'+picName):{zoom:100,x:0,y:0};
        const sc=f.zoom/100;
        // Preserve aspect ratio (object-contain)
        const imgAR=pImg.naturalWidth/pImg.naturalHeight;
        const cellAR=w/h;
        let bw2,bh2;
        if(imgAR>cellAR){bw2=w;bh2=w/imgAR;}else{bh2=h;bw2=h*imgAR;}
        const dw=bw2*sc,dh=bh2*sc;
        const dx=x+(w-dw)/2-(f.x/100)*bw2*sc;
        const dy=y+(h-dh)/2-(f.y/100)*bh2*sc;
        ctx.drawImage(pImg,dx,dy,dw,dh);
        ctx.restore();
        const fade=ctx.createLinearGradient(0,y+h-90,0,y+h);
        fade.addColorStop(0,'rgba(8,12,18,0)');fade.addColorStop(1,'rgba(8,12,18,0.9)');
        ctx.fillStyle=fade;ctx.fillRect(x+2,y+h-90,w-4,88);
      } else if(appIco){
        const sz=Math.min(w,h)*0.3;ctx.globalAlpha=0.08;ctx.drawImage(appIco,x+(w-sz)/2,y+(h-sz)/2,sz,sz);ctx.globalAlpha=1;
      }
      if(picName){ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(picName,x+w/2,y+h-9);ctx.textAlign='left';}
    };

    // Luck bar
    const drawLuck = (x,y,w) => {
      if(!lr)return 0;
      rr(x,y,w,12,6);ctx.fillStyle='rgba(10,14,22,0.8)';ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;rr(x,y,w,12,6);ctx.stroke();
      const fw=Math.max(6,Math.min(lr.percentile||50,100)/100*w);
      ctx.save();rr(x,y,w,12,6);ctx.clip();
      const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#f87171');g.addColorStop(0.5,'#edaf18');g.addColorStop(1,'#34d399');
      ctx.fillStyle=g;rr(x,y,fw,12,6);ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(10,14,22,0.85)';rr(x+w+9,y-5,105,21,6);ctx.fill();
      ctx.strokeStyle=(lr.color||'#edaf18')+'60';ctx.lineWidth=1;rr(x+w+9,y-5,105,21,6);ctx.stroke();
      ctx.fillStyle=lr.color||'#edaf18';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText(lr.tier+' '+lr.rating,x+w+61,y+10);ctx.textAlign='left';
      return 27;
    };

    // Stats grid 3x2
    const drawStats = (sx,sy,gw,ch2,fs) => {
      const g2=8,cols=3,cw2=(gw-(cols-1)*g2)/cols;
      sts.forEach((s,i)=>{const col=i%cols,row=Math.floor(i/cols);drawStat(sx+col*(cw2+g2),sy+row*(ch2+g2),cw2,ch2,s.v,s.l,s.c,fs);});
      return (ch2+g2)*2-g2;
    };

    // Resonator portraits grid — collection-panel style (tall cards, fills width)
    const drawResTags = (rx,ry,mw,cols,max) => {
      const ch2=newestRes.slice(0,max);if(!ch2.length)return 0;
      const g2=6,cellW=(mw-(cols-1)*g2)/cols,cellH=Math.round(cellW*1.6);
      ch2.forEach((n,i)=>{drawResPortrait(rx+(i%cols)*(cellW+g2),ry+Math.floor(i/cols)*(cellH+g2),cellW,cellH,n,resImgs[n]);});
      const rows=Math.ceil(ch2.length/cols);let h2=rows*(cellH+g2)-g2;
      if(newestRes.length>max){ctx.fillStyle='#4b5563';ctx.font='14px sans-serif';ctx.fillText('+'+String(newestRes.length-max)+' more',rx,ry+h2+18);h2+=21;}
      return h2;
    };

    // Collection row
    const drawColl = (cx2,cy2,cw2) => {
      const items=[{l:'5* Res',o:c5,t:ALL_5STAR_RESONATORS.length,c:'#edaf18'},{l:'4* Res',o:c4,t:ALL_4STAR_RESONATORS.length,c:'#c084fc'},{l:'5* Wep',o:w5,t:ALL_5STAR_WEAPONS.length,c:'#edaf18'},{l:'4* Wep',o:w4,t:ALL_4STAR_WEAPONS.length,c:'#c084fc'},{l:'3* Wep',o:w3,t:ALL_3STAR_WEAPONS.length,c:'#60a5fa'},{l:'2* Wep',o:w2,t:ALL_2STAR_WEAPONS.length,c:'#4ade80'},{l:'1* Wep',o:w1,t:ALL_1STAR_WEAPONS.length,c:'#9ca3af'}];
      const g2=6,iw=(cw2-(items.length-1)*g2)/items.length;
      items.forEach((it,i)=>{drawStat(cx2+i*(iw+g2),cy2,iw,48,it.o+'/'+it.t,it.l,it.c,16);});
      return 48;
    };

    // Mini histogram — neon glow style matching Stats tab
    // Helper: draw bar path with only top corners rounded (flat bottom, like CSS rounded-t)
    const barPath = (bx,by,bw,bh2,r) => {
      ctx.beginPath();
      ctx.moveTo(bx+r,by);ctx.lineTo(bx+bw-r,by);
      ctx.quadraticCurveTo(bx+bw,by,bx+bw,by+r);
      ctx.lineTo(bx+bw,by+bh2);ctx.lineTo(bx,by+bh2);
      ctx.lineTo(bx,by+r);
      ctx.quadraticCurveTo(bx,by,bx+r,by);
      ctx.closePath();
    };
    const drawHisto = (hx,hy,hw,hh) => {
      if(!histSummary||!histLabels.length)return;
      const bg2=3,bw2=(hw-(histLabels.length-1)*bg2)/histLabels.length,area=hh-24;
      histLabels.forEach((lab,i)=>{
        const cnt=histBuckets[lab]||0,bh=histSummary.max>0?Math.max(5,(cnt/histSummary.max)*area):5;
        const bx2=hx+i*(bw2+bg2),by2=hy+area-bh;
        const bucket=parseInt(lab, 10)||0;
        const bc=bucket<=20?'#22c55e':bucket<=40?'#4ade80':bucket<=50?'#edaf18':bucket<=60?'#f97316':'#ef4444';
        // Semi-transparent gradient fill with outer glow (single fill, no stacking)
        ctx.save();ctx.shadowColor=bc+'50';ctx.shadowBlur=12;
        const barGrad=ctx.createLinearGradient(0,by2+bh,0,by2);
        barGrad.addColorStop(0,bc+'40');barGrad.addColorStop(1,bc+'20');
        ctx.fillStyle=barGrad;barPath(bx2,by2,bw2,bh,3);ctx.fill();
        ctx.restore();
        // Border — top and sides only, no bottom (matches borderBottom: 'none')
        ctx.strokeStyle=bc+'90';ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(bx2,by2+bh);ctx.lineTo(bx2,by2+3);
        ctx.quadraticCurveTo(bx2,by2,bx2+3,by2);
        ctx.lineTo(bx2+bw2-3,by2);
        ctx.quadraticCurveTo(bx2+bw2,by2,bx2+bw2,by2+3);
        ctx.lineTo(bx2+bw2,by2+bh);
        ctx.stroke();
        // Bottom glow line — full bar width (matches Stats tab bottom glow)
        if(cnt>0){ctx.save();ctx.shadowColor=bc;ctx.shadowBlur=8;ctx.fillStyle=bc;
        ctx.fillRect(bx2,by2+bh-2,bw2,2);ctx.restore();}
        // Count label with glow (matches textShadow: 0 0 8px ${color})
        if(cnt>0){ctx.save();ctx.shadowColor=bc;ctx.shadowBlur=8;ctx.fillStyle=bc;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(cnt,bx2+bw2/2,by2-5);ctx.textAlign='left';ctx.restore();}
        // Bottom label
        ctx.fillStyle='#6b7280';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(lab.split('-')[0],bx2+bw2/2,hy+area+15);ctx.textAlign='left';
      });
    };

    // Banner Breakdown — per-banner pull count + 5★ count row
    const drawBannerRow = (bx2,by2,bw2,bh2) => {
      const g2=6,iw=(bw2-4*g2)/5;
      bannerStats.forEach((bs,i)=>{
        const sx=bx2+i*(iw+g2);
        // stat cell background
        ctx.fillStyle='rgba(10,14,22,0.8)';rr(sx,by2,iw,bh2,12);ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.20)';ctx.lineWidth=1;rr(sx,by2,iw,bh2,12);ctx.stroke();
        const ss=ctx.createLinearGradient(sx,0,sx+iw,0);ss.addColorStop(0,'transparent');ss.addColorStop(0.5,'rgba(255,255,255,0.40)');ss.addColorStop(1,'transparent');
        ctx.fillStyle=ss;ctx.fillRect(sx+6,by2,iw-12,1.5);
        // Pull count (main value)
        ctx.fillStyle=bs.c;ctx.font='bold 22px monospace';ctx.textAlign='center';
        ctx.fillText(bs.v,sx+iw/2,by2+bh2*0.35);
        // 5★ sub-value
        ctx.fillStyle='#9ca3af';ctx.font='12px sans-serif';
        ctx.fillText(bs.s,sx+iw/2,by2+bh2*0.58);
        // Label
        ctx.fillStyle='#6b7280';ctx.font='11px sans-serif';
        ctx.fillText(bs.l,sx+iw/2,by2+bh2*0.8);
        ctx.textAlign='left';
      });
      return bh2;
    };

    // Footer
    const drawFooter = (x,y,w) => {
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();
      ctx.fillStyle='#4b5563';ctx.font='14px monospace';ctx.fillText('Generated '+new Date().toLocaleDateString(),x,y+18);
      ctx.textAlign='right';ctx.fillText('whisperingwishes.app',x+w,y+18);ctx.textAlign='left';
    };

    // ═══ RENDER ═══
    ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);
    const bgG=ctx.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.4,W*0.5);
    bgG.addColorStop(0,'rgba(237,175,24,0.008)');bgG.addColorStop(1,'transparent');
    ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);

    const M=18,ox=M,oy=M,ow=W-M*2,oh=H-M*2;
    drawShell(ox,oy,ow,oh);
    const hH=drawHeader(ox+1,oy+1,ow-2);
    const P=15,bx=ox+P,bw=ow-P*2;
    const footH=30;
    let Y=oy+1+hH+P;
    const bottomY=oy+oh-footH-P;

    if(!isPortrait){
      // ═══ LANDSCAPE 1920x1080 — content-adaptive ═══
      const gap=9;
      const leftW=Math.floor(bw*0.35);
      const rightX=bx+leftW+gap;
      const rightW=bw-leftW-gap;
      const contentH=bottomY-Y;

      // Hero image takes top of left column
      const heroH=Math.floor(contentH*0.32);
      drawHero(bx,Y,leftW,heroH);

      // Profile + Stats + Pity Distribution below hero — fills rest of left
      const idY=Y+heroH+gap;
      const idH=contentH-heroH-gap;
      const idOff=drawPanel(bx,idY,leftW,idH,'Profile');
      ctx.fillStyle='#f1f5f9';ctx.font='bold 30px sans-serif';ctx.fillText(uname,bx+15,idY+idOff+21);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('UID',bx+15,idY+idOff+45);
      ctx.fillStyle='#e2e8f0';ctx.font='18px monospace';ctx.fillText(uid,bx+48,idY+idOff+45);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('Server',bx+15,idY+idOff+66);
      ctx.fillStyle='#edaf18';ctx.font='18px monospace';ctx.fillText(svr,bx+72,idY+idOff+66);
      if(lr)drawLuck(bx+15,idY+idOff+87,leftW-135);
      const metaY=idY+idOff+(lr?117:90);
      ctx.fillStyle='#6b7280';ctx.font='12px sans-serif';
      let metaLine1='';
      if(tList.length>0)metaLine1+=tList.length+' Trophies';
      if(impDate)metaLine1+=(metaLine1?' · ':'')+impDate;
      if(metaLine1)ctx.fillText(metaLine1,bx+15,metaY);
      if(overallStats?.totalAstrite)ctx.fillText(overallStats.totalAstrite.toLocaleString('en-US')+' Astrite',bx+15,metaY+16);
      // Convene Stats inside profile panel
      const statCellH=36,statStartY=metaY+(overallStats?.totalAstrite?36:21);
      drawStats(bx+9,statStartY,leftW-18,statCellH,16);
      // Pity Distribution below stats inside profile panel
      const histoY=statStartY+(statCellH+8)*2-8+15;
      const histoH=idY+idH-histoY-9;
      if(histSummary&&histoH>40){
        ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx+15,histoY-6);ctx.lineTo(bx+leftW-15,histoY-6);ctx.stroke();
        ctx.fillStyle='#e2e8f0';ctx.font='600 13px sans-serif';ctx.fillText('Pity Distribution',bx+15,histoY+6);
        drawHisto(bx+9,histoY+15,leftW-18,histoH-15);
        ctx.fillStyle='#4b5563';ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText('Lo '+histSummary.lo+' | Avg '+histSummary.avg+' | Hi '+histSummary.hi,bx+leftW-12,idY+idH-6);ctx.textAlign='left';
      }

      // ── Right column: Collection → Resonators → Trophies → Banner Breakdown ──
      const panelPad=39;
      const collH=panelPad+48+6;
      const trophyCols=Math.max(tList.length,1),trophyGap=8;
      const trophyCellSize=Math.min(160,Math.floor((rightW-18-(trophyCols-1)*trophyGap)/trophyCols));
      const trophyPanelH=panelPad+trophyCellSize+6;
      const bannerH=panelPad+72+6; // banner breakdown panel height

      const resCols=10,resGap2=6;
      const resMax=Math.min(newestRes.length,20);
      const resCellW=(rightW-18-(resCols-1)*resGap2)/resCols,resCellH=Math.round(resCellW*1.6);
      const resRows=Math.ceil(Math.max(resMax,1)/resCols);
      const resContentH=panelPad+resRows*(resCellH+resGap2)-resGap2+6+(newestRes.length>resMax?21:0);

      // Draw Row 1: Collection (full width)
      const cp1o=drawPanel(rightX,Y,rightW,collH,'Collection');
      drawColl(rightX+9,Y+cp1o,rightW-18);

      // Draw Row 2: Resonators — sized to content, fills width
      const r2Y=Y+collH+gap;
      const rp1o=drawPanel(rightX,r2Y,rightW,resContentH,'Resonators ('+newestRes.length+')');
      drawResTags(rightX+9,r2Y+rp1o,rightW-18,10,resMax);

      // Draw Row 3: Trophies — fixed height, centered
      const r3Y=r2Y+resContentH+gap;
      if(tList.length>0){
        const tp1o=drawPanel(rightX,r3Y,rightW,trophyPanelH,'Trophies ('+tList.length+')');
        tList.forEach((t,i)=>{drawTrophy(rightX+9+i*(trophyCellSize+trophyGap),r3Y+tp1o,trophyCellSize,t);});
      }

      // Draw Row 4: Banner Breakdown — fills remaining
      const r4Y=r3Y+(tList.length>0?trophyPanelH:0)+gap;
      const r4H=bottomY-r4Y;
      if(r4H>60){
        const bp1o=drawPanel(rightX,r4Y,rightW,r4H,'Convene Breakdown');
        drawBannerRow(rightX+9,r4Y+bp1o,rightW-18,r4H-bp1o-6);
      }

      drawFooter(bx,bottomY,bw);

    } else {
      // ═══ PORTRAIT 1080x1920 — content-adaptive ═══
      const gap=9;
      const contentH=bottomY-Y;

      // ── Top: Hero + Profile (with stats inside) side by side ──
      const heroW=Math.floor(bw*0.38);
      // Profile needs: panelPad(39) + name(30) + UID(24) + Server(24) + luck(27+18) + meta(18) + stats(2 rows * (51+8) - 8) = ~280
      const pStatCellH=51,pPad=39;
      const profileMinH=pPad+30+24+24+(lr?45:0)+18+(pStatCellH+8)*2-8+15;
      const heroH=Math.max(Math.floor(contentH*0.22),profileMinH);
      drawHero(bx,Y,heroW,heroH);

      const ix=bx+heroW+gap,iw=bw-heroW-gap;
      const idOff=drawPanel(ix,Y,iw,heroH,'Profile');
      ctx.fillStyle='#f1f5f9';ctx.font='bold 33px sans-serif';ctx.fillText(uname,ix+15,Y+idOff+21);
      const uidLY=Y+idOff+48;
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('UID',ix+15,uidLY);
      ctx.fillStyle='#e2e8f0';ctx.font='18px monospace';ctx.fillText(uid,ix+48,uidLY);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('Server',ix+15,uidLY+24);
      ctx.fillStyle='#edaf18';ctx.font='18px monospace';ctx.fillText(svr,ix+72,uidLY+24);
      if(lr)drawLuck(ix+15,uidLY+51,iw-135);
      const metaY2=uidLY+(lr?84:57);
      ctx.fillStyle='#6b7280';ctx.font='12px sans-serif';
      let metaLine='';
      if(tList.length>0)metaLine+=tList.length+' Trophies';
      if(impDate)metaLine+=(metaLine?' · ':'')+impDate;
      if(overallStats?.totalAstrite)metaLine+=(metaLine?' · ':'')+overallStats.totalAstrite.toLocaleString('en-US')+' Astrite';
      if(metaLine)ctx.fillText(metaLine,ix+15,metaY2);
      // Convene Stats inside profile panel
      const pStatY=metaY2+30;
      drawStats(ix+9,pStatY,iw-18,pStatCellH,22);

      Y+=heroH+gap;

      // Pre-calculate content heights for adaptive layout
      const pCollH=pPad+48+6;
      const pHistoH=144;
      const pResCols=8,pResGap2=6;
      const pResMax=Math.min(newestRes.length,24);
      const pResCellW=(bw-18-(pResCols-1)*pResGap2)/pResCols,pResCellH=Math.round(pResCellW*1.6);
      const pResRows=Math.ceil(Math.max(pResMax,1)/pResCols);
      const pResContentH=pPad+pResRows*(pResCellH+pResGap2)-pResGap2+6+(newestRes.length>pResMax?21:0);
      const pTrophyCols=Math.max(tList.length,1),pTrophyGap=8;
      const pTrophySize=Math.min(200,Math.floor((bw-18-(pTrophyCols-1)*pTrophyGap)/pTrophyCols));
      const pTrophyPanelH=pPad+pTrophySize+6;
      const pBannerH=pPad+80+6; // banner breakdown

      // ── Pity Distribution ──
      const hp2o=drawPanel(bx,Y,bw,pHistoH,'Pity Distribution');
      if(histSummary){drawHisto(bx+9,Y+hp2o,bw-18,pHistoH-hp2o-12);
        ctx.fillStyle='#4b5563';ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText('Low '+histSummary.lo+' | Avg '+histSummary.avg+' | High '+histSummary.hi,bx+bw-12,Y+pHistoH-5);ctx.textAlign='left';}
      Y+=pHistoH+gap;

      // ── Collection ──
      const cp2o=drawPanel(bx,Y,bw,pCollH,'Collection');
      drawColl(bx+9,Y+cp2o,bw-18);
      Y+=pCollH+gap;

      // ── Resonators — fills width ──
      const rp2o=drawPanel(bx,Y,bw,pResContentH,'Resonators ('+newestRes.length+')');
      drawResTags(bx+9,Y+rp2o,bw-18,8,pResMax);
      Y+=pResContentH+gap;

      // ── Trophies — fixed height, centered ──
      if(tList.length>0){
        const tp2o=drawPanel(bx,Y,bw,pTrophyPanelH,'Trophies ('+tList.length+')');
        tList.forEach((t,i)=>{drawTrophy(bx+9+i*(pTrophySize+pTrophyGap),Y+tp2o,pTrophySize,t);});
        Y+=pTrophyPanelH+gap;
      }

      // ── Banner Breakdown — fills remaining ──
      const pRemaining=bottomY-Y;
      if(pRemaining>60){
        const bp2o=drawPanel(bx,Y,bw,pRemaining,'Convene Breakdown');
        drawBannerRow(bx+9,Y+bp2o,bw-18,pRemaining-bp2o-6);
      }

      drawFooter(bx,bottomY,bw);
    }

    try {
      canvas.toBlob(blob=>{
        if(!blob){toast?.addToast?.('ID Card export failed — image may be blocked by CORS','error');return;}const url=URL.createObjectURL(blob);const a=document.createElement('a');
        a.href=url;a.download='resonator-id-'+(profile.username||profile.uid||'card')+(isPortrait?'-portrait':'')+'.png';
        a.click();setTimeout(() => URL.revokeObjectURL(url), 100);toast?.addToast?.('ID Card saved!','success');
      },'image/png');
    } catch (e) {
      console.error('ID card export failed (possible CORS tainted canvas):', e);
      throw e; // Let caller handle toast/UI feedback
    }
}
