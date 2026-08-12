import React, { useEffect, useRef } from 'react';

const CanvasRoad = ({ environment }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let pos = 0;
    let cloudOffset = 0;
    const speed = 150;
    
    // Load Sprites
    const treeImg = new Image();
    treeImg.src = '/src/assets/tree.png';
    const carImg = new Image();
    carImg.src = '/src/assets/car.png';

    // Simple 3D projection parameters
    const cameraDepth = 0.8;
    const segmentLength = 200;
    const roadWidth = 2000;
    const drawDistance = 300;
    // Horizon mid-windshield; tall trees fill above it
    const horizonYRatio = 0.26;
    
    const lines = [];
    for (let i = 0; i < 1500; i++) {
      lines.push({
        z: i * segmentLength,
        x: i > 300 && i < 700 ? Math.sin(i * 0.05) * 1500 : 0,
        y: 0,
        sprite: null,
        spriteX: 0
      });
      
      if (i % 18 === 0 && Math.random() > 0.15) {
        lines[i].sprite = treeImg;
        lines[i].spriteX = (Math.random() > 0.5 ? 1 : -1) * (1.4 + Math.random() * 2.2);
      }
      
      if (i % 12 === 0 && !lines[i].sprite && Math.random() > 0.25) {
        lines[i].type = 'bush';
        lines[i].spriteX = (Math.random() > 0.5 ? 1 : -1) * (1.1 + Math.random() * 0.5);
      }

      if (i % 28 === 0 && !lines[i].sprite && !lines[i].type) {
        lines[i].type = 'pole';
        lines[i].spriteX = (Math.random() > 0.5 ? 1 : -1) * 1.05;
      }
      
      if (i % 120 === 0 && Math.random() > 0.5) {
        lines[i].sprite = carImg;
        lines[i].spriteX = (Math.random() > 0.5 ? 0.5 : -0.5);
      }
    }

    // Soft drifting cloud puffs (world-space X offsets + sizes)
    const clouds = Array.from({ length: 24 }, (_, i) => ({
      x: (i / 24) * 2.4 - 0.35 + Math.random() * 0.08,
      y: 0.15 + Math.random() * 0.75,
      w: 0.22 + Math.random() * 0.32,
      h: 0.07 + Math.random() * 0.09,
      speed: 0.002 + Math.random() * 0.005,
      alpha: 0.55 + Math.random() * 0.35
    }));

    const drawPolygon = (x1, y1, w1, x2, y2, w2, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1 - w1, y1);
      ctx.lineTo(x2 - w2, y2);
      ctx.lineTo(x2 + w2, y2);
      ctx.lineTo(x1 + w1, y1);
      ctx.fill();
    };

    const drawCloud = (cx, cy, w, h, alpha, isNight) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = isNight ? 'rgba(90, 95, 130, 0.95)' : 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.5, h * 0.55, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - w * 0.28, cy + h * 0.1, w * 0.32, h * 0.45, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + w * 0.3, cy + h * 0.08, w * 0.35, h * 0.48, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - w * 0.05, cy - h * 0.25, w * 0.28, h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (!isNight) {
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillStyle = '#e8eef5';
        ctx.beginPath();
        ctx.ellipse(cx - w * 0.08, cy - h * 0.15, w * 0.22, h * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawSky = (width, height, isNight) => {
      const horizonY = height * horizonYRatio;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      if (isNight) {
        skyGrad.addColorStop(0, '#050514');
        skyGrad.addColorStop(0.45, '#0c1030');
        skyGrad.addColorStop(1, '#1a2040');
      } else {
        skyGrad.addColorStop(0, '#4aa3d9');
        skyGrad.addColorStop(0.55, '#87CEEB');
        skyGrad.addColorStop(1, '#c8e6f5');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, Math.ceil(horizonY) + 2);

      // Ground fill below horizon (overdrawn by road, prevents gaps)
      ctx.fillStyle = isNight ? '#051005' : '#3d8c40';
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Stars (night)
      if (isNight) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 60; i++) {
          const sx = ((i * 97) % width);
          const sy = ((i * 53) % Math.max(1, horizonY * 0.85));
          const sr = (i % 3 === 0) ? 1.4 : 0.8;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Clouds — clipped strictly to sky so they never sit on the road
      cloudOffset += 0.15;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, horizonY);
      ctx.clip();
      for (const cloud of clouds) {
        const drift = ((cloud.x + cloudOffset * cloud.speed) % 1.4) - 0.2;
        const cx = drift * width;
        const cy = cloud.y * horizonY * 0.85;
        const cw = cloud.w * width;
        const ch = Math.min(cloud.h * height, horizonY * 0.35);
        drawCloud(cx, cy, cw, ch, isNight ? cloud.alpha * 0.55 : cloud.alpha, isNight);
      }
      ctx.restore();

      // Distant hill silhouette under horizon for depth (above road, below clouds)
      ctx.fillStyle = isNight ? '#0a1520' : '#6a9e6a';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 40) {
        const hy = horizonY - (12 + 18 * Math.sin(x * 0.01) + 10 * Math.sin(x * 0.023));
        ctx.lineTo(x, hy);
      }
      ctx.lineTo(width, horizonY);
      ctx.closePath();
      ctx.fill();

      // Sun / Moon in upper sky
      const celestialY = height * 0.1;
      ctx.fillStyle = isNight ? '#f5f5ff' : '#FFD700';
      ctx.beginPath();
      ctx.arc(width * 0.78, celestialY, isNight ? 28 : 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = isNight ? 24 : 40;
      ctx.shadowColor = isNight ? '#c8d0ff' : '#FF8C00';
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const isNight = environment === 'night';
      const width = canvas.width;
      const height = canvas.height;
      const horizonY = height * horizonYRatio;
      
      drawSky(width, height, isNight);

      pos += speed;
      
      while (lines.length > 0 && lines[0].z <= pos) {
        const firstLine = lines.shift();
        firstLine.z += 1500 * segmentLength;
        lines.push(firstLine);
      }

      const startPos = pos;
      let maxy = height;
      let camH = 1500;
      let camX = 0;

      for (let i = 0; i < drawDistance; i++) {
        const line = lines[i];
        if (!line) break;
        
        const z = line.z - startPos;
        if (z <= 0) continue;

        const scale = cameraDepth / z;
        const projectedX = (width / 2) + scale * (line.x - camX) * width / 2;
        // Anchor vanishing point at raised horizon instead of screen mid
        const projectedY = horizonY + scale * camH * height / 2;
        const projectedW = scale * roadWidth * width / 2;

        line.pX = projectedX;
        line.pY = projectedY;
        line.pW = projectedW;
        line.scale = scale;

        if (projectedY >= maxy) continue;
        maxy = projectedY;

        const prevLine = lines[i - 1];
        if (!prevLine) continue;

        const isDark = Math.floor(line.z / (segmentLength * 3)) % 2 === 0;
        
        const grassColor = isNight 
          ? (isDark ? '#051005' : '#0a150a')
          : (isDark ? '#3d8c40' : '#459e48');
          
        const rumbleColor = isNight
          ? (isDark ? '#1a1a1a' : '#888')
          : (isDark ? '#fff' : '#f00');
          
        const roadColor = isNight ? '#111' : '#444';

        ctx.fillStyle = grassColor;
        ctx.fillRect(0, prevLine.pY, width, line.pY - prevLine.pY);

        drawPolygon(prevLine.pX, prevLine.pY, prevLine.pW * 1.2, line.pX, line.pY, line.pW * 1.2, rumbleColor);
        drawPolygon(prevLine.pX, prevLine.pY, prevLine.pW, line.pX, line.pY, line.pW, roadColor);

        if (isDark) {
          drawPolygon(prevLine.pX, prevLine.pY, prevLine.pW * 0.05, line.pX, line.pY, line.pW * 0.05, isNight ? '#555' : '#fff');
        }
      }

      for (let i = drawDistance - 1; i >= 0; i--) {
        const line = lines[i];
        if (!line) continue;
        
        if (line.type) {
           const destX = line.pX + line.scale * line.spriteX * roadWidth * (width / 2);
           
           if (line.type === 'bush') {
             const destW = line.scale * 400 * (width / 2);
             const destH = destW * 0.8;
             const destY = line.pY - destH;
             if (destY <= height) {
                ctx.fillStyle = isNight ? '#082a08' : '#228B22';
                ctx.beginPath();
                ctx.arc(destX, destY + destH/2, destW/2, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(destX - destW/3, destY + destH*0.7, destW/2.5, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(destX + destW/3, destY + destH*0.7, destW/2.5, 0, Math.PI*2);
                ctx.fill();
             }
           }
           
           if (line.type === 'pole') {
             const destW = line.scale * 40 * (width / 2);
             // Taller poles so lights read higher in the windshield
             const destH = line.scale * 2200 * (width / 2);
             const destY = line.pY - destH;
             if (destY <= height) {
                ctx.fillStyle = isNight ? '#222' : '#888';
                ctx.fillRect(destX - destW/2, destY, destW, destH);
                const overhangW = line.scale * 300 * (width / 2) * Math.sign(line.spriteX);
                ctx.fillRect(destX - destW/2, destY, -overhangW, destW);
                ctx.fillStyle = isNight ? '#fffae6' : '#ffd700';
                ctx.beginPath();
                ctx.arc(destX - destW/2 - overhangW, destY + destW/2, destW*2, 0, Math.PI*2);
                ctx.fill();
                if (isNight) {
                   ctx.shadowBlur = 20;
                   ctx.shadowColor = '#ffaa00';
                   ctx.fill();
                   ctx.shadowBlur = 0;
                }
             }
           }
        }
        
        if (line.sprite) {
          const sprite = line.sprite;
          if (sprite.complete && sprite.naturalWidth > 0) {
            // Tall roadside trees so crowns sit well above the horizon
            const worldW = sprite === carImg ? 600 : 2400;
            const destW = line.scale * worldW * (width / 2);
            const destH = destW * (sprite.height / sprite.width);
            
            const destX = line.pX + line.scale * line.spriteX * roadWidth * (width / 2);
            const destY = line.pY - destH;
            
            if (destY <= height) {
              ctx.drawImage(sprite, destX - destW/2, destY, destW, destH);
            }
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [environment]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />;
};

export default CanvasRoad;
