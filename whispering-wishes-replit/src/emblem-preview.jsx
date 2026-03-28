import { useRef, useEffect } from 'react';

const emblems = [
  { name: 'Crossed Swords', draw: (ctx, cx, cy, s) => {
    ctx.strokeStyle = 'rgba(210,155,50,0.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx-s*0.7,cy-s*0.7); ctx.lineTo(cx+s*0.7,cy+s*0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+s*0.7,cy-s*0.7); ctx.lineTo(cx-s*0.7,cy+s*0.7); ctx.stroke();
    const g=s*0.3, gl=s*0.22;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx-g-gl*0.7,cy-g+gl*0.7); ctx.lineTo(cx-g+gl*0.7,cy-g-gl*0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+g-gl*0.7,cy+g+gl*0.7); ctx.lineTo(cx+g+gl*0.7,cy+g-gl*0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+g+gl*0.7,cy-g+gl*0.7); ctx.lineTo(cx+g-gl*0.7,cy-g-gl*0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-g+gl*0.7,cy+g+gl*0.7); ctx.lineTo(cx-g-gl*0.7,cy+g-gl*0.7); ctx.stroke();
    ctx.fillStyle = 'rgba(210,155,50,0.6)';
    [[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]].forEach(([px,py])=>{ctx.beginPath();ctx.arc(cx+s*px,cy+s*py,s*0.08,0,Math.PI*2);ctx.fill();});
  }},
  { name: 'Crown', draw: (ctx, cx, cy, s) => {
    ctx.fillStyle = 'rgba(210,155,50,0.6)';
    ctx.beginPath(); ctx.moveTo(cx-s,cy+s*0.3); ctx.lineTo(cx-s*0.7,cy-s*0.5); ctx.lineTo(cx-s*0.3,cy);
    ctx.lineTo(cx,cy-s*0.8); ctx.lineTo(cx+s*0.3,cy); ctx.lineTo(cx+s*0.7,cy-s*0.5);
    ctx.lineTo(cx+s,cy+s*0.3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(210,155,50,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-s*0.9,cy+s*0.3); ctx.lineTo(cx+s*0.9,cy+s*0.3); ctx.stroke();
    ctx.fillStyle = 'rgba(210,155,50,0.8)';
    ctx.beginPath(); ctx.arc(cx,cy-s*0.8,s*0.1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx-s*0.7,cy-s*0.5,s*0.07,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+s*0.7,cy-s*0.5,s*0.07,0,Math.PI*2); ctx.fill();
  }},
  { name: 'Shield', draw: (ctx, cx, cy, s) => {
    ctx.strokeStyle = 'rgba(210,155,50,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx-s*0.7,cy-s*0.8); ctx.lineTo(cx+s*0.7,cy-s*0.8);
    ctx.lineTo(cx+s*0.7,cy+s*0.1); ctx.bezierCurveTo(cx+s*0.6,cy+s*0.7,cx+s*0.2,cy+s,cx,cy+s*1.1);
    ctx.bezierCurveTo(cx-s*0.2,cy+s,cx-s*0.6,cy+s*0.7,cx-s*0.7,cy+s*0.1); ctx.closePath(); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx,cy-s*0.8); ctx.lineTo(cx,cy+s*1.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-s*0.7,cy+s*0.1); ctx.lineTo(cx+s*0.7,cy+s*0.1); ctx.stroke();
  }},
  { name: 'Flame', draw: (ctx, cx, cy, s) => {
    ctx.fillStyle = 'rgba(210,155,50,0.5)';
    ctx.beginPath(); ctx.moveTo(cx,cy-s*1.1);
    ctx.bezierCurveTo(cx+s*0.3,cy-s*0.5,cx+s*0.6,cy,cx+s*0.4,cy+s*0.5);
    ctx.bezierCurveTo(cx+s*0.3,cy+s*0.8,cx+s*0.1,cy+s,cx,cy+s*0.7);
    ctx.bezierCurveTo(cx-s*0.1,cy+s,cx-s*0.3,cy+s*0.8,cx-s*0.4,cy+s*0.5);
    ctx.bezierCurveTo(cx-s*0.6,cy,cx-s*0.3,cy-s*0.5,cx,cy-s*1.1);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(210,155,50,0.7)';
    ctx.beginPath(); ctx.moveTo(cx,cy-s*0.5);
    ctx.bezierCurveTo(cx+s*0.15,cy-s*0.1,cx+s*0.2,cy+s*0.2,cx,cy+s*0.4);
    ctx.bezierCurveTo(cx-s*0.2,cy+s*0.2,cx-s*0.15,cy-s*0.1,cx,cy-s*0.5);
    ctx.closePath(); ctx.fill();
  }},
  { name: 'Crescent & Star', draw: (ctx, cx, cy, s) => {
    ctx.fillStyle = 'rgba(210,155,50,0.55)';
    ctx.beginPath(); ctx.arc(cx-s*0.15,cy,s*0.7,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgb(110,22,14)';
    ctx.beginPath(); ctx.arc(cx+s*0.2,cy-s*0.1,s*0.55,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(210,155,50,0.7)';
    ctx.beginPath();
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2,r=i%2===0?s*0.25:s*0.1;ctx.lineTo(cx+s*0.5+Math.cos(a)*r,cy-s*0.25+Math.sin(a)*r);}
    ctx.closePath(); ctx.fill();
  }},
  { name: 'Wings', draw: (ctx, cx, cy, s) => {
    ctx.fillStyle = 'rgba(210,155,50,0.5)';
    for(let side=-1;side<=1;side+=2){
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.bezierCurveTo(cx+side*s*0.3,cy-s*0.8,cx+side*s*0.9,cy-s*0.9,cx+side*s*1.1,cy-s*0.3);
      ctx.bezierCurveTo(cx+side*s*0.8,cy-s*0.1,cx+side*s*0.4,cy+s*0.1,cx,cy);
      ctx.closePath(); ctx.fill();
      // Feather lines
      ctx.strokeStyle = 'rgba(210,155,50,0.3)'; ctx.lineWidth = 0.8;
      for(let f=0;f<3;f++){const t=(f+1)*0.25;
        ctx.beginPath();ctx.moveTo(cx+side*s*t*0.5,cy-s*t*0.6);ctx.lineTo(cx+side*s*(t+0.3),cy-s*(0.3+t*0.4));ctx.stroke();
      }
    }
  }},
  { name: 'Dragon Head', draw: (ctx, cx, cy, s) => {
    ctx.fillStyle = 'rgba(210,155,50,0.55)';
    ctx.beginPath(); ctx.moveTo(cx+s*0.8,cy-s*0.2);
    ctx.lineTo(cx+s*0.9,cy-s*0.5); ctx.lineTo(cx+s*0.6,cy-s*0.3);
    ctx.bezierCurveTo(cx+s*0.3,cy-s*0.8,cx-s*0.2,cy-s*0.9,cx-s*0.5,cy-s*0.6);
    ctx.bezierCurveTo(cx-s*0.8,cy-s*0.3,cx-s*0.7,cy+s*0.2,cx-s*0.3,cy+s*0.5);
    ctx.bezierCurveTo(cx,cy+s*0.7,cx+s*0.3,cy+s*0.5,cx+s*0.5,cy+s*0.2);
    ctx.bezierCurveTo(cx+s*0.7,cy,cx+s*0.8,cy-s*0.1,cx+s*0.8,cy-s*0.2);
    ctx.closePath(); ctx.fill();
    // Eye
    ctx.fillStyle = 'rgba(210,155,50,0.9)';
    ctx.beginPath(); ctx.arc(cx+s*0.3,cy-s*0.35,s*0.08,0,Math.PI*2); ctx.fill();
  }},
  { name: 'Eye', draw: (ctx, cx, cy, s) => {
    ctx.strokeStyle = 'rgba(210,155,50,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx-s,cy);
    ctx.bezierCurveTo(cx-s*0.5,cy-s*0.7,cx+s*0.5,cy-s*0.7,cx+s,cy);
    ctx.bezierCurveTo(cx+s*0.5,cy+s*0.7,cx-s*0.5,cy+s*0.7,cx-s,cy);
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = 'rgba(210,155,50,0.5)';
    ctx.beginPath(); ctx.arc(cx,cy,s*0.35,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(210,155,50,0.8)';
    ctx.beginPath(); ctx.arc(cx,cy,s*0.12,0,Math.PI*2); ctx.fill();
  }},
  { name: 'Compass Rose', draw: (ctx, cx, cy, s) => {
    ctx.fillStyle = 'rgba(210,155,50,0.55)';
    for(let ci=0;ci<4;ci++){const a=ci*Math.PI/2-Math.PI/2;
      ctx.beginPath();ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(a-0.15)*s,cy+Math.sin(a-0.15)*s);
      ctx.lineTo(cx+Math.cos(a)*s*1.2,cy+Math.sin(a)*s*1.2);
      ctx.lineTo(cx+Math.cos(a+0.15)*s,cy+Math.sin(a+0.15)*s);ctx.closePath();ctx.fill();
    }
    ctx.fillStyle = 'rgba(210,155,50,0.3)';
    for(let ci=0;ci<4;ci++){const a=ci*Math.PI/2-Math.PI/2+Math.PI/4;
      ctx.beginPath();ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(a-0.1)*s*0.6,cy+Math.sin(a-0.1)*s*0.6);
      ctx.lineTo(cx+Math.cos(a)*s*0.75,cy+Math.sin(a)*s*0.75);
      ctx.lineTo(cx+Math.cos(a+0.1)*s*0.6,cy+Math.sin(a+0.1)*s*0.6);ctx.closePath();ctx.fill();
    }
    ctx.strokeStyle='rgba(210,155,50,0.4)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(cx,cy,s*0.3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(210,155,50,0.7)';ctx.beginPath();ctx.arc(cx,cy,s*0.08,0,Math.PI*2);ctx.fill();
  }},
  { name: 'Spiral Vortex', draw: (ctx, cx, cy, s) => {
    ctx.strokeStyle = 'rgba(210,155,50,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0;i<80;i++){const a=i*0.18,r=s*0.08+i*s*0.012;
      if(i===0)ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
      else ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
    }
    ctx.stroke();
    ctx.fillStyle='rgba(210,155,50,0.7)';ctx.beginPath();ctx.arc(cx,cy,s*0.08,0,Math.PI*2);ctx.fill();
  }}
];

export default function EmblemPreview() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cols = 5, rows = 2;
    const cellW = 120, cellH = 140;
    canvas.width = cols * cellW;
    canvas.height = rows * cellH;

    // Dark background
    ctx.fillStyle = '#0a0604';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    emblems.forEach((em, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = col * cellW + cellW / 2;
      const cy = row * cellH + cellH / 2 - 10;
      const r = 40;

      // Red circle backing
      ctx.fillStyle = 'rgb(120,25,15)';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgb(200,155,45)'; ctx.lineWidth = 2;
      ctx.stroke();

      // Draw emblem
      em.draw(ctx, cx, cy, r * 0.55);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(em.name, cx, cy + r + 18);

      // Number
      ctx.fillStyle = 'rgba(255,200,100,0.6)';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText((i + 1).toString(), cx, cy - r - 6);
    });
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', margin: '20px auto', borderRadius: 12, border: '1px solid rgba(200,155,45,0.3)' }} />;
}
