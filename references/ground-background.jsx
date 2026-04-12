import { useRef, useEffect } from "react";

const hash = (n) => {
  const s = Math.sin(n) * 43758.5453;
  return s - Math.floor(s);
};
const SEED = 52908;

function valueNoise(x,y,freq,seed){const fx=x*freq,fy=y*freq,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);const n00=hash((ix+iy*137)*7+seed),n10=hash(((ix+1)+iy*137)*7+seed),n01=hash((ix+(iy+1)*137)*7+seed),n11=hash(((ix+1)+(iy+1)*137)*7+seed);return(n00+(n10-n00)*sx)+((n01+(n11-n01)*sx)-(n00+(n10-n00)*sx))*sy;}
function fbm(x,y,oct,seed){let v=0,a=0.5,f=1,t=0;for(let i=0;i<oct;i++){v+=valueNoise(x,y,f,seed+i*1000)*a;t+=a;a*=0.5;f*=2.1;}return v/t;}
function ridged(x,y,oct,seed){let v=0,a=0.5,f=1,t=0;for(let i=0;i<oct;i++){const n=1-Math.abs(valueNoise(x,y,f,seed+i*1000)*2-1);v+=n*n*a;t+=a;a*=0.45;f*=2.2;}return v/t;}

function bakeBackground(W, H) {
  const cvs = document.createElement("canvas"); cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext("2d");
  const edgeY = H * 0.75, sunX = W * 0.5, sunY = H * 0.3, sunR = H * 0.06, groundH = H - edgeY;

  // Sky
  const sk = ctx.createLinearGradient(0,0,0,H);
  sk.addColorStop(0,"rgb(35,18,10)");sk.addColorStop(0.15,"rgb(65,30,12)");sk.addColorStop(0.3,"rgb(120,55,20)");
  sk.addColorStop(0.45,"rgb(180,95,40)");sk.addColorStop(0.6,"rgb(230,150,75)");sk.addColorStop(0.75,"rgb(250,190,95)");
  sk.addColorStop(0.88,"rgb(255,215,120)");sk.addColorStop(1,"rgb(255,235,155)");
  ctx.fillStyle=sk;ctx.fillRect(0,0,W,H);
  const sg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,Math.max(W,H)*0.6);
  sg.addColorStop(0,"rgba(255,240,180,0.5)");sg.addColorStop(0.1,"rgba(255,210,120,0.35)");sg.addColorStop(0.25,"rgba(255,180,80,0.2)");sg.addColorStop(0.5,"rgba(255,140,50,0.08)");sg.addColorStop(1,"rgba(255,100,30,0)");
  ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
  const sg2=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,H*0.25);
  sg2.addColorStop(0,"rgba(255,245,200,0.6)");sg2.addColorStop(0.2,"rgba(255,220,140,0.35)");sg2.addColorStop(0.5,"rgba(255,180,90,0.12)");sg2.addColorStop(1,"rgba(200,120,50,0)");
  ctx.fillStyle=sg2;ctx.fillRect(0,0,W,H);
  const sd=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,sunR);
  sd.addColorStop(0,"rgba(255,255,240,1)");sd.addColorStop(0.3,"rgba(255,250,200,0.9)");sd.addColorStop(0.6,"rgba(255,225,140,0.5)");sd.addColorStop(1,"rgba(255,190,80,0)");
  ctx.fillStyle=sd;ctx.beginPath();ctx.arc(sunX,sunY,sunR*1.8,0,Math.PI*2);ctx.fill();
  const hz=ctx.createLinearGradient(0,H*0.58,0,edgeY+15);
  hz.addColorStop(0,"rgba(200,140,60,0)");hz.addColorStop(0.4,"rgba(200,140,60,0.05)");hz.addColorStop(0.75,"rgba(185,115,45,0.12)");hz.addColorStop(1,"rgba(170,100,38,0.18)");
  ctx.fillStyle=hz;ctx.fillRect(0,H*0.58,W,edgeY+15-H*0.58);

  // Ground
  const slx=0.08,sly=-0.5,slz=0.86,sLen=Math.sqrt(slx*slx+sly*sly+slz*slz);
  const snx=slx/sLen,sny=sly/sLen,snz=slz/sLen;
  const gScale=0.85,gW=Math.round(W*gScale),gHt=Math.round(groundH*gScale);
  if(gW<4||gHt<4) return cvs;
  const gC=document.createElement("canvas");gC.width=gW;gC.height=gHt;
  const gc=gC.getContext("2d"),gImg=gc.createImageData(gW,gHt),gd=gImg.data;
  const hMap=new Float32Array(gW*gHt);
  const feats=[];
  for(let i=0;i<18;i++)feats.push({cx:hash(i*71+100),cy:0.005+hash(i*71+101)*0.06,rx:0.05+hash(i*71+102)*0.12,ry:0.02+hash(i*71+103)*0.035,h:0.25+hash(i*71+104)*0.4});
  for(let i=0;i<15;i++)feats.push({cx:hash(i*61+150),cy:0.05+hash(i*61+151)*0.14,rx:0.04+hash(i*61+152)*0.1,ry:0.025+hash(i*61+153)*0.04,h:0.18+hash(i*61+154)*0.3});
  for(let i=0;i<18;i++)feats.push({cx:hash(i*83+200),cy:0.15+hash(i*83+201)*0.4,rx:0.04+hash(i*83+202)*0.09,ry:0.03+hash(i*83+203)*0.05,h:0.14+hash(i*83+204)*0.28});
  for(let i=0;i<12;i++)feats.push({cx:hash(i*79+250),cy:0.45+hash(i*79+251)*0.35,rx:0.04+hash(i*79+252)*0.08,ry:0.03+hash(i*79+253)*0.05,h:0.1+hash(i*79+254)*0.22});
  for(let i=0;i<12;i++)feats.push({cx:0.04+hash(i*97+300)*0.92,cy:0.03+hash(i*97+301)*0.8,rx:0.018+hash(i*97+302)*0.04,ry:0.012+hash(i*97+303)*0.03,h:-(0.12+hash(i*97+304)*0.22)});
  feats.push({cx:-0.05,cy:0.85,rx:0.2,ry:0.15,h:0.35},{cx:1.05,cy:0.82,rx:0.18,ry:0.18,h:0.3},{cx:0.5,cy:0.22,rx:0.2,ry:0.16,h:-0.1});
  for(let py=0;py<gHt;py++){const ny=py/gHt,ds=0.7+ny*1.2;for(let px=0;px<gW;px++){const nx=px/gW;
    let h=fbm(nx*2.2,ny*1.3,2,SEED+800)*0.4+fbm(nx*4.5,ny*3,2,SEED+200)*0.3*ds+ridged(nx*3.5,ny*2.5,2,SEED+500)*0.18*ds+fbm(nx*9,ny*6,2,SEED+300)*0.1*ds;
    const pb=fbm(nx*35,ny*22,1,SEED+900);if(pb>0.74)h+=(pb-0.74)*0.35*ds;
    const hn=fbm(nx*28,ny*18,1,SEED+1100);if(hn<0.22)h-=(0.22-hn)*0.3*ds;
    for(const f of feats){const dx=(nx-f.cx)/f.rx,dy=(ny-f.cy)/f.ry,d2=dx*dx+dy*dy;if(d2<4){const t=Math.max(0,1-Math.sqrt(d2)/2);h+=f.h*t*t*(3-2*t);}}
    hMap[py*gW+px]=h;
  }}
  const brushMap=new Float32Array(gW*gHt);
  for(let py=0;py<gHt;py++)for(let px=0;px<gW;px++)brushMap[py*gW+px]=fbm(px/gW*25+py/gHt*2,py/gHt*4,2,SEED+9000);

  // WARMER tones — harmonize with amber particles
  // Shadows: warm dark brown (not cool grey)
  // Lights: amber-touched brown
  for(let py=0;py<gHt;py++){const dT=py/gHt,dC=Math.pow(dT,0.5);
    const contrast=0.4+dT*0.6,warmShift=(1-dT)*22,baseVal=14+dC*52;
    // Warmer shadow tones — shifted from blue-grey to warm brown
    const t0r=baseVal*0.6+warmShift*0.35, t0g=baseVal*0.48+warmShift*0.18, t0b=baseVal*0.4+warmShift*0.08;
    const t1r=baseVal*0.8+warmShift*0.4, t1g=baseVal*0.65+warmShift*0.22, t1b=baseVal*0.5+warmShift*0.1;
    const t2r=baseVal*1.05+warmShift*0.45, t2g=baseVal*0.85+warmShift*0.28, t2b=baseVal*0.6+warmShift*0.12;
    const t3r=baseVal*1.25+warmShift*0.55, t3g=baseVal*0.98+warmShift*0.32, t3b=baseVal*0.65+warmShift*0.14;
    const tones=[[t0r,t0g,t0b],[t0r+(t1r-t0r)*contrast,t0g+(t1g-t0g)*contrast,t0b+(t1b-t0b)*contrast],[t0r+(t2r-t0r)*contrast,t0g+(t2g-t0g)*contrast,t0b+(t2b-t0b)*contrast],[t0r+(t3r-t0r)*contrast,t0g+(t3g-t0g)*contrast,t0b+(t3b-t0b)*contrast]];
    for(let px=0;px<gW;px++){const nx=px/gW;
      const gH3=(x,y)=>hMap[Math.max(0,Math.min(gHt-1,y))*gW+Math.max(0,Math.min(gW-1,x))];
      const bs=6+dT*14,hL=(gH3(px-2,py)+gH3(px-1,py))*0.5,hR=(gH3(px+2,py)+gH3(px+1,py))*0.5;
      const hU=(gH3(px,py-2)+gH3(px,py-1))*0.5,hD=(gH3(px,py+2)+gH3(px,py+1))*0.5;
      const bx=(hL-hR)*bs,by=(hU-hD)*bs,bl=Math.sqrt(bx*bx+by*by+1);
      const rawDot=Math.max(0,(bx/bl)*snx+(by/bl)*sny+(1/bl)*snz);
      const shifted=rawDot+(brushMap[py*gW+px]-0.5)*0.1;
      let ti=shifted>0.62?3:shifted>0.38?2:shifted>0.16?1:0;
      let r=tones[ti][0],g=tones[ti][1],b=tones[ti][2];
      // Soil — warmer variation
      const sA=(fbm(nx*2.8,dT*1.8,2,SEED+1000)-0.5)*2,sB=(fbm(nx*1.5,dT*1.0,2,SEED+2000)-0.5)*2;
      r+=(sA*5+sB*4)*dC;g+=(sA*2+sB*1.5)*dC;b+=(sA*-1+sB*-0.5)*dC;
      const sc=fbm(nx*3,dT*2,2,SEED+3000);if(sc<0.28){const s2=Math.pow((0.28-sc)/0.28,1.3)*0.22;r*=(1-s2);g*=(1-s2);b*=(1-s2);}
      const cn=fbm(nx*10,dT*7,2,SEED+7000),ce=Math.abs(cn-0.5);if(ce<0.014){const cs=(1-ce/0.014);r=r*(1-cs*0.55)+tones[0][0]*cs*0.55;g=g*(1-cs*0.55)+tones[0][1]*cs*0.55;b=b*(1-cs*0.55)+tones[0][2]*cs*0.55;}
      const hg=Math.pow(Math.max(0,1-dT*6),3),scx=Math.exp(-Math.pow((nx-0.5)*2,2));
      r+=hg*scx*35;g+=hg*scx*22;b+=hg*scx*8;
      const eDk=1-Math.pow(Math.abs(nx-0.5)*2,2)*0.1;r*=eDk;g*=eDk;b*=eDk;
      const idx=(py*gW+px)*4;gd[idx]=Math.max(0,Math.min(255,Math.round(r)));gd[idx+1]=Math.max(0,Math.min(255,Math.round(g)));gd[idx+2]=Math.max(0,Math.min(255,Math.round(b)));gd[idx+3]=255;
  }}
  gc.putImageData(gImg,0,0);
  // Ground curve
  const curveH = H * 0.035;
  const groundCurveY = (x, noisy) => {
    const base = edgeY - curveH * Math.pow((x / W - 0.5) * 2, 2);
    if (!noisy) return base;
    const ix = x / W;
    const n1 = fbm(ix * 6, 0.5, 3, SEED + 6000) * 12 - 6;
    const n2 = fbm(ix * 15, 0.5, 2, SEED + 6100) * 5 - 2.5;
    const n3 = ridged(ix * 10, 0.5, 2, SEED + 6200) * 4 - 2;
    return base + n1 + n2 + n3;
  };
  // Draw ground clipped to curve
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) { const x = (i / 200) * W; ctx.lineTo(x, groundCurveY(x, true)); }
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
  ctx.imageSmoothingEnabled=true;ctx.drawImage(gC, 0, edgeY - curveH, W, groundH + curveH);
  // Edges
  const eC2=document.createElement("canvas");eC2.width=gW;eC2.height=gHt;const ec2=eC2.getContext("2d"),eImg2=ec2.createImageData(gW,gHt),ed2=eImg2.data;
  for(let py=1;py<gHt-1;py++){for(let px=1;px<gW-1;px++){const getL=(x,y)=>{const i2=(y*gW+x)*4;return gd[i2]*0.3+gd[i2+1]*0.59+gd[i2+2]*0.11;};const gx2=getL(px+1,py)-getL(px-1,py),gy2=getL(px,py+1)-getL(px,py-1),edge=Math.sqrt(gx2*gx2+gy2*gy2),dT2=py/gHt,threshold=6+dT2*10;if(edge>threshold){const strength=Math.min(1,(edge-threshold)/(threshold*0.7)),a=Math.round(strength*40*(0.3+dT2*0.7)),idx=(py*gW+px)*4;ed2[idx]=10;ed2[idx+1]=8;ed2[idx+2]=6;ed2[idx+3]=a;}}}
  ec2.putImageData(eImg2,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(eC2, 0, edgeY - curveH, W, groundH + curveH);
  // Top texture — sample from MID rows of gd+ed2 (detail exists, color closer to top)
  const topRows = Math.min(Math.round(gHt * 0.35), gHt);
  const srcOffset = Math.round(gHt * 0.3); // mid section
  const tpC2 = document.createElement("canvas"); tpC2.width = gW; tpC2.height = topRows;
  const tpc2 = tpC2.getContext("2d"), tpImg2 = tpc2.createImageData(gW, topRows), tpd2 = tpImg2.data;
  for (let py = 0; py < topRows; py++) {
    const fade = 1 - Math.pow(py / topRows, 1.5);
    const srcY = Math.min(gHt - 1, srcOffset + py);
    for (let px = 0; px < gW; px++) {
      const srcIdx = (srcY * gW + px) * 4;
      const dstIdx = (py * gW + px) * 4;
      let pr = gd[srcIdx], pg = gd[srcIdx+1], pb = gd[srcIdx+2];
      const ea = ed2[srcIdx+3] / 255;
      if (ea > 0) {
        pr = pr * (1 - ea) + ed2[srcIdx] * ea;
        pg = pg * (1 - ea) + ed2[srcIdx+1] * ea;
        pb = pb * (1 - ea) + ed2[srcIdx+2] * ea;
      }
      tpd2[dstIdx] = Math.round(pr);
      tpd2[dstIdx+1] = Math.round(pg);
      tpd2[dstIdx+2] = Math.round(pb);
      tpd2[dstIdx+3] = Math.round(fade * 220);
    }
  }
  tpc2.putImageData(tpImg2, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tpC2, 0, edgeY - curveH, W, Math.round(groundH * 0.35));
  ctx.restore();

  // Ground shade
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) { const x = (i / 200) * W; ctx.lineTo(x, groundCurveY(x, true)); }
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
  const gShade=ctx.createLinearGradient(0,edgeY-curveH,0,edgeY+groundH);
  gShade.addColorStop(0,"rgba(25,12,4,0.0)");
  gShade.addColorStop(0.5,"rgba(20,10,3,0.03)");
  gShade.addColorStop(1,"rgba(12,5,2,0.08)");
  ctx.fillStyle=gShade;ctx.fillRect(0,edgeY-curveH,W,groundH+curveH);
  ctx.globalCompositeOperation="multiply";
  const amberShade=ctx.createLinearGradient(0,edgeY-curveH,0,edgeY+groundH);
  amberShade.addColorStop(0,"rgba(252,230,180,1)");
  amberShade.addColorStop(0.3,"rgba(245,215,160,1)");
  amberShade.addColorStop(0.7,"rgba(235,195,135,1)");
  amberShade.addColorStop(1,"rgba(220,175,115,1)");
  ctx.fillStyle=amberShade;ctx.fillRect(0,edgeY-curveH,W,groundH+curveH);
  ctx.restore();

  // Vignette
  const vR=Math.max(W,H)*0.7,vig=ctx.createRadialGradient(W*0.5,H*0.45,vR*0.3,W*0.5,H*0.45,vR);vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(0.7,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,0,0,0.2)");ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
  return cvs;
}

function createParticle(W, H, seed, type) {
  const s = seed;
  const p = {
    type,
    x: hash(s) * W, y: H * 0.15 + hash(s+1) * H * 0.83,
    vx: 0.5 + hash(s+2) * 1.2,
    vy: -(0.4 + hash(s+3) * 1.0),
    rot: hash(s+4) * Math.PI * 2,
    rotSpeed: (hash(s+5) - 0.5) * 0.07,
    wobbleAmp: 0.5 + hash(s+6) * 1.4,
    wobbleFreq: 0.7 + hash(s+7) * 2.0,
    wobblePhase: hash(s+8) * Math.PI * 2,
    wobbleAmp2: 0.3 + hash(s+17) * 0.8,
    wobbleFreq2: 0.4 + hash(s+18) * 1.3,
    wobblePhase2: hash(s+19) * Math.PI * 2,
    life: 0,
    maxLife: 400 + hash(s+9) * 600,
    baseSize: 0,
    intensity: 0.4 + hash(s+10) * 0.6,
    hueShift: (hash(s+11) - 0.5) * 25,
    shape: [],
    // Disintegration state
    fragments: [],
    disintegrateAt: 0, // life fraction when breaking apart starts
  };

  if (type === 0) {
    p.baseSize = 6 + hash(s+12) * 12;
    p.vy *= 0.7;
    p.curl = (hash(s+14) - 0.5) * 0.45;
    p.disintegrateAt = 0.45 + hash(s+15) * 0.25;
    const fragCount = 4 + Math.floor(hash(s+16) * 5);
    for (let f = 0; f < fragCount; f++) {
      p.fragments.push({
        offX: (hash(s+f*7+40)-0.5) * p.baseSize * 0.7,
        offY: (hash(s+f*7+41)-0.5) * p.baseSize * 0.5,
        vx: 0.2 + hash(s+f*7+42) * 0.5,
        vy: -(0.1 + hash(s+f*7+43) * 0.3),
        size: 2.5 + hash(s+f*7+44) * 5,
        rot: hash(s+f*7+45) * Math.PI * 2,
        delay: hash(s+f*7+46) * 0.3,
        active: false, x: 0, y: 0,
      });
    }
  } else if (type === 1) {
    p.baseSize = 6 + hash(s+12) * 14;
    p.vx *= 1.1;
    p.disintegrateAt = 0.5 + hash(s+15) * 0.25;
    const fragCount = 2 + Math.floor(hash(s+16) * 3);
    for (let f = 0; f < fragCount; f++) {
      p.fragments.push({
        offX: (hash(s+f*7+40)-0.5) * p.baseSize,
        offY: (hash(s+f*7+41)-0.5) * p.baseSize * 0.5,
        vx: 0.15 + hash(s+f*7+42) * 0.4,
        vy: -(0.05 + hash(s+f*7+43) * 0.2),
        size: 1.5 + hash(s+f*7+44) * 3.5,
        rot: hash(s+f*7+45) * Math.PI * 2,
        delay: hash(s+f*7+46) * 0.25,
        active: false, x: 0, y: 0,
      });
    }
  } else if (type === 2) {
    p.baseSize = 3 + hash(s+12) * 7;
    p.vx *= 1.5;
    p.vy *= 1.5;
    p.disintegrateAt = 0.6 + hash(s+15) * 0.2;
  } else {
    const sizeRoll = hash(s+12);
    p.baseSize = sizeRoll < 0.12 ? (8 + hash(s+13) * 5) : sizeRoll < 0.35 ? (3 + hash(s+13) * 4) : (1 + sizeRoll * 3);
    p.vx *= 1.6 + hash(s+16) * 0.8;
    p.vy *= 1.5 + hash(s+17) * 0.6;
    p.vx += hash(s+15) * 0.8;
    p.disintegrateAt = 0.65 + hash(s+15) * 0.2;
  }

  // Shape — simple natural torn outlines
  if (type === 0) {
    // Paper scrap: 5-8 verts, varied aspect ratio
    const verts = 5 + Math.floor(hash(s+13) * 4);
    p.aspectW = 0.4 + hash(s+60) * 0.4; // width multiplier
    p.aspectH = 0.25 + hash(s+61) * 0.3; // height multiplier
    for (let v = 0; v < verts; v++) {
      const baseA = (Math.PI * 2 / verts) * v;
      const jitter = (hash(s + v * 3 + 20) - 0.5) * 0.5;
      const rad = 0.45 + hash(s + v * 3 + 21) * 0.55;
      p.shape.push({ a: baseA + jitter, rad });
    }
  } else if (type <= 2) {
    const verts = 3 + Math.floor(hash(s+13) * 3);
    p.aspectW = 0.35; p.aspectH = 0.2;
    for (let v = 0; v < verts; v++) {
      p.shape.push({ a: (Math.PI*2/verts)*v + hash(s+v*3+20)*0.5, rad: 0.4+hash(s+v*3+21)*0.6 });
    }
  } else {
    p.aspectW = 0.3; p.aspectH = 0.3;
    for (let v = 0; v < 3; v++) {
      p.shape.push({ a: (Math.PI*2/3)*v + hash(s+v*3+20)*0.4, rad: 0.5+hash(s+v*3+21)*0.5 });
    }
  }
  return p;
}

function resetParticle(p, W, H) {
  const side = Math.random();
  if (side < 0.30) { p.x = Math.random() * W; p.y = H * 0.55 + Math.random() * H * 0.45; }
  else if (side < 0.40) { p.x = -15 - Math.random() * 30; p.y = H * 0.15 + Math.random() * H * 0.7; }
  else if (side < 0.50) { p.x = W + 15 + Math.random() * 30; p.y = H * 0.15 + Math.random() * H * 0.7; }
  else if (side < 0.60) { p.x = Math.random() * W; p.y = H * 0.8 + Math.random() * H * 0.2; }
  else if (side < 0.70) { p.x = Math.random() * W; p.y = H * 0.12 + Math.random() * H * 0.35; }
  else if (side < 0.90) { p.x = Math.random() * W * 0.45; p.y = Math.random() * H * 0.5; }
  else { p.x = W * 0.6 + Math.random() * W * 0.4; p.y = H * 0.05 + Math.random() * H * 0.45; }
  p.life = 0;
  p.maxLife = 400 + Math.random() * 600;
  p.rot = Math.random() * Math.PI * 2;
  for (const f of p.fragments) { f.active = false; }
}

export default function App() {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W, H, animId;

    const init = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
      bgRef.current = bakeBackground(W, H);
      const particles = [];
      for (let i = 0; i < 80; i++) particles.push(createParticle(W, H, i*97+13000, 1));
      for (let i = 0; i < 100; i++) particles.push(createParticle(W, H, i*79+15000, 2));
      for (let i = 0; i < 140; i++) particles.push(createParticle(W, H, i*67+17000, 3));
      for (let i = 0; i < 60; i++) particles.push(createParticle(W, H, i*53+19000, 3));
      for (const p of particles) {
        // Pre-simulate: advance position to match staggered life
        const stagger = Math.random() * p.maxLife * 0.8;
        p.life = stagger;
        p.x += p.vx * stagger;
        p.y += p.vy * stagger;
      }
      particlesRef.current = particles;
    };
    init();
    window.addEventListener("resize", init);

    const draw = () => {
      animId = requestAnimationFrame(draw);
      if (!bgRef.current || !particlesRef.current) return;
      ctx.drawImage(bgRef.current, 0, 0);

      const particles = particlesRef.current;
      // Global wind — strong gusts, layered
      const time = performance.now() * 0.001;
      const windGustX = Math.sin(time * 0.35) * 0.3 + Math.sin(time * 0.8 + 2) * 0.15 + Math.sin(time * 1.7 + 5) * 0.08;
      const windGustY = Math.sin(time * 0.45 + 1) * 0.12 + Math.sin(time * 1.1 + 3) * 0.06;

      for (const p of particles) {
        p.life++;
        if (p.life > p.maxLife || p.x < -50 || p.x > W + 50 || p.y < -50) {
          resetParticle(p, W, H);
        }

        const depth = Math.max(0, Math.min(1, p.y / H));
        const depthScale = 0.55 + depth * 0.45;
        const depthAlpha = 0.6 + depth * 0.4;

        // Dual-axis wobble
        const wobbleX = Math.sin(p.life * 0.02 * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;
        const wobbleY = Math.sin(p.life * 0.015 * p.wobbleFreq2 + p.wobblePhase2) * p.wobbleAmp2;
        p.x += (p.vx + wobbleX * 0.4 + windGustX) * depthScale;
        p.y += (p.vy + wobbleY * 0.3 + windGustY) * depthScale;
        p.rot += (p.rotSpeed + windGustX * 0.015) * depthScale;

        const lifeT = p.life / p.maxLife;
        const fadeIn = Math.min(1, p.life / 25);
        const fadeOut = Math.min(1, (p.maxLife - p.life) / 40);
        const alpha = fadeIn * fadeOut * depthAlpha;
        if (alpha < 0.01) continue;

        const burnT = lifeT > p.disintegrateAt ? (lifeT - p.disintegrateAt) / (1 - p.disintegrateAt) : 0;

        // === Draw shed fragments ===
        if (p.fragments.length > 0 && burnT > 0) {
          for (const f of p.fragments) {
            if (burnT > f.delay && !f.active) {
              f.active = true;
              f.x = p.x + f.offX;
              f.y = p.y + f.offY;
            }
            if (!f.active) continue;
            f.x += f.vx + windGustX * 0.9 + wobbleX * 0.12;
            f.y += f.vy - 0.08 + windGustY * 0.6;
            f.rot += 0.03 + windGustX * 0.01;
            const fragLife = Math.min(1, (burnT - f.delay) / Math.max(0.01, 1 - f.delay));
            const fragAlpha = Math.max(0, 1 - fragLife * 1.2) * alpha;
            const fragSize = f.size * Math.max(0.1, 1 - fragLife * 0.9) * depthScale;
            if (fragAlpha < 0.02 || fragSize < 0.15) continue;

            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.rot);
            ctx.globalCompositeOperation = "lighter";
            const pulse = 0.5 + Math.sin(p.life * 0.08 + f.delay * 12) * 0.5;
            const fragFlicker = 0.7 + Math.sin(p.life * 0.15 + f.delay * 20) * 0.3;
            const fR = Math.round((210 + p.hueShift) * p.intensity * pulse);
            const fG = Math.round((90 + p.hueShift * 0.3) * p.intensity * pulse);
            const fB = Math.round(20 * p.intensity * pulse);
            // Glow
            const glR2 = fragSize * (5 + pulse * 2);
            const gl = ctx.createRadialGradient(0,0,0,0,0,glR2);
            gl.addColorStop(0, "rgba("+Math.min(255,fR+30)+","+Math.min(255,fG+25)+","+Math.min(255,fB+15)+","+(fragAlpha*0.7*fragFlicker)+")");
            gl.addColorStop(0.25, "rgba("+fR+","+fG+","+fB+","+(fragAlpha*0.35*fragFlicker)+")");
            gl.addColorStop(0.6, "rgba("+Math.round(fR*0.6)+","+Math.round(fG*0.4)+",0,"+(fragAlpha*0.1)+")");
            gl.addColorStop(1, "rgba("+Math.round(fR*0.3)+",0,0,0)");
            ctx.fillStyle = gl;
            ctx.beginPath(); ctx.arc(0,0,glR2,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = "rgba("+Math.min(255,fR+40)+","+Math.min(255,fG+20)+","+Math.min(255,fB+8)+","+(fragAlpha*0.8*fragFlicker)+")";
            ctx.beginPath(); ctx.arc(0,0,fragSize*0.6,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = "rgba(255,240,180,"+(fragAlpha*0.6*fragFlicker)+")";
            ctx.beginPath(); ctx.arc(0,0,fragSize*0.2,0,Math.PI*2); ctx.fill();
            ctx.restore();
          }
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;


        if (p.type <= 2) {
          // === EMBERS — round bokeh glowing dots ===
          ctx.globalCompositeOperation = "lighter";
          const pulse = 0.5 + Math.sin(p.life * 0.06 + p.wobblePhase) * 0.3 + Math.sin(p.life * 0.13) * 0.2;
          const flicker = 0.7 + Math.sin(p.life * 0.19 + p.wobblePhase * 3) * 0.15 + Math.sin(p.life * 0.31 + p.wobblePhase * 5) * 0.15;
          const dim = 1 - burnT * 0.7;
          const sz = p.baseSize * (1 - burnT * 0.4) * depthScale;
          const depthFocus = 0.6 + (p.y / H) * 0.4;
          const hotness = p.intensity * pulse * flicker;
          const coreR = Math.round(Math.min(255, 255 * hotness));
          const coreG = Math.round(Math.min(255, (235 + p.hueShift * 0.2) * hotness));
          const coreB = Math.round(Math.min(255, (160 + p.hueShift * 0.15) * hotness));
          const midR = Math.round(Math.min(255, (255 + p.hueShift * 0.5) * hotness));
          const midG = Math.round(Math.min(255, (140 + p.hueShift * 0.3) * hotness));
          const midB = Math.round(Math.min(80, 35 * hotness));
          const outerR = Math.round(Math.min(255, (200 + p.hueShift) * hotness * 0.7));
          const outerG = Math.round(Math.min(120, (55 + p.hueShift * 0.2) * hotness * 0.5));
          const outerB = Math.round(8 * hotness * 0.3);
          if (sz > 0.3) {
            const bokehR = sz * (3.0 + (1 - depthFocus) * 3.0) * dim;
            const bk = ctx.createRadialGradient(0, 0, 0, 0, 0, bokehR);
            bk.addColorStop(0, "rgba("+outerR+","+outerG+","+outerB+","+(0.5 * pulse * dim)+")");
            bk.addColorStop(0.35, "rgba("+outerR+","+outerG+","+outerB+","+(0.2 * pulse * dim)+")");
            bk.addColorStop(0.7, "rgba("+Math.round(outerR*0.6)+","+Math.round(outerG*0.4)+","+outerB+","+(0.07 * pulse * dim)+")");
            bk.addColorStop(1, "rgba("+Math.round(outerR*0.3)+","+Math.round(outerG*0.2)+",0,0)");
            ctx.fillStyle = bk;
            ctx.beginPath(); ctx.arc(0, 0, bokehR, 0, Math.PI * 2); ctx.fill();
            const midGlowR = sz * 1.4 * dim;
            const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, midGlowR);
            mg.addColorStop(0, "rgba("+midR+","+midG+","+midB+","+(0.7 * pulse * dim)+")");
            mg.addColorStop(0.5, "rgba("+midR+","+midG+","+midB+","+(0.3 * pulse * dim)+")");
            mg.addColorStop(1, "rgba("+outerR+","+outerG+",0,0)");
            ctx.fillStyle = mg;
            ctx.beginPath(); ctx.arc(0, 0, midGlowR, 0, Math.PI * 2); ctx.fill();
            const coreSize = sz * 0.4 * dim * depthFocus;
            const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
            cg.addColorStop(0, "rgba("+coreR+","+coreG+","+coreB+","+(0.9 * flicker * dim)+")");
            cg.addColorStop(0.4, "rgba("+midR+","+midG+","+midB+","+(0.5 * flicker * dim)+")");
            cg.addColorStop(1, "rgba("+midR+","+Math.round(midG*0.5)+",0,0)");
            ctx.fillStyle = cg;
            ctx.beginPath(); ctx.arc(0, 0, coreSize, 0, Math.PI * 2); ctx.fill();
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 0.6 && sz > 1) {
              const trailLen = Math.min(sz * 3.5, speed * 4) * dim;
              const dx = -p.vx / speed, dy = -p.vy / speed;
              const tg = ctx.createLinearGradient(0, 0, dx * trailLen, dy * trailLen);
              tg.addColorStop(0, "rgba("+midR+","+midG+","+midB+","+(0.45 * pulse * dim)+")");
              tg.addColorStop(0.5, "rgba("+outerR+","+outerG+",0,"+(0.15 * pulse * dim)+")");
              tg.addColorStop(1, "rgba("+outerR+",0,0,0)");
              ctx.fillStyle = tg;
              const tw = sz * 0.35 * dim;
              ctx.beginPath();
              ctx.moveTo(-dy * tw, dx * tw);
              ctx.lineTo(dy * tw, -dx * tw);
              ctx.lineTo(dx * trailLen, dy * trailLen);
              ctx.closePath();
              ctx.fill();
            }
          }

        } else {
          // === SPARKS — bright bokeh dots with motion streaks ===
          ctx.globalCompositeOperation = "lighter";
          const pulse = 0.5 + Math.sin(p.life * 0.09 + p.wobblePhase) * 0.3 + Math.sin(p.life * 0.17 + p.wobblePhase * 3) * 0.2;
          const rapidFlicker = 0.7 + Math.sin(p.life * 0.37 + p.wobblePhase * 7) * 0.2 + Math.sin(p.life * 0.53) * 0.1;
          const dim = 1 - burnT * 0.8;
          const sz = p.baseSize * dim * depthScale;
          const temp = p.intensity * pulse * rapidFlicker;
          const cr = Math.round(Math.min(255, 255 * temp));
          const cg2 = Math.round(Math.min(255, (200 + p.hueShift * 0.4) * temp));
          const cb2 = Math.round(Math.min(140, (85 + p.hueShift * 0.2) * temp));
          const outerCr = Math.round(Math.min(255, (230 + p.hueShift) * temp * 0.7));
          const outerCg = Math.round(Math.min(120, (60 + p.hueShift * 0.2) * temp * 0.5));
          if (sz > 0.2) {
            const haloR = sz * (3.5 + (1 - p.y / H) * 2.5);
            const hg2 = ctx.createRadialGradient(0, 0, 0, 0, 0, haloR);
            hg2.addColorStop(0, "rgba("+outerCr+","+outerCg+",8,"+(0.4 * pulse * dim)+")");
            hg2.addColorStop(0.4, "rgba("+outerCr+","+Math.round(outerCg*0.5)+",0,"+(0.15 * pulse * dim)+")");
            hg2.addColorStop(0.75, "rgba("+Math.round(outerCr*0.4)+","+Math.round(outerCg*0.2)+",0,"+(0.04 * pulse * dim)+")");
            hg2.addColorStop(1, "rgba("+Math.round(outerCr*0.2)+",0,0,0)");
            ctx.fillStyle = hg2;
            ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI * 2); ctx.fill();
            const coreR2 = sz * 0.5;
            const ccg = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR2);
            ccg.addColorStop(0, "rgba("+cr+","+cg2+","+cb2+","+(0.85 * rapidFlicker * dim)+")");
            ccg.addColorStop(0.4, "rgba("+cr+","+Math.round(cg2*0.7)+","+Math.round(cb2*0.4)+","+(0.4 * rapidFlicker * dim)+")");
            ccg.addColorStop(1, "rgba("+outerCr+","+outerCg+",0,0)");
            ctx.fillStyle = ccg;
            ctx.beginPath(); ctx.arc(0, 0, coreR2, 0, Math.PI * 2); ctx.fill();
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 0.4) {
              const dx = -p.vx / speed, dy = -p.vy / speed;
              const trailLen = Math.min(sz * 5, speed * 3.5) * dim;
              const tw = sz * 0.25 * dim;
              const sg3 = ctx.createLinearGradient(0, 0, dx * trailLen, dy * trailLen);
              sg3.addColorStop(0, "rgba("+cr+","+cg2+","+cb2+","+(0.5 * pulse * dim)+")");
              sg3.addColorStop(0.4, "rgba("+outerCr+","+outerCg+",0,"+(0.15 * pulse * dim)+")");
              sg3.addColorStop(1, "rgba("+outerCr+",0,0,0)");
              ctx.fillStyle = sg3;
              ctx.beginPath();
              ctx.moveTo(-dy * tw, dx * tw);
              ctx.lineTo(dy * tw, -dx * tw);
              ctx.lineTo(dx * trailLen, dy * trailLen);
              ctx.closePath();
              ctx.fill();
            }
          }
        }


        ctx.globalAlpha = 1;
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", init); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#0c0804" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100vw", height: "100vh" }} />
    </div>
  );
}
