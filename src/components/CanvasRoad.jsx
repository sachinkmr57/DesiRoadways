import React, { useEffect, useRef } from 'react';
import {
  PALETTES,
  mulberry32,
  bakeSpriteSheet,
  drawSky,
  drawCelestial,
  paintCloud,
  drawHorizonLand,
  drawVillage,
  drawBirds,
  drawPole,
  drawPolygon,
  tileGrain,
  unifyWash,
} from '../road/illustrate';

const CanvasRoad = ({ environment }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let pos = 0;
    let cloudOffset = 0;
    let last = performance.now();
    const speed = 150;

    const cameraDepth = 0.8;
    const segmentLength = 200;
    const roadWidth = 2000;
    const drawDistance = 280;
    const horizonYRatio = 0.3;

    const sprites = bakeSpriteSheet();
    const rngCloud = mulberry32(88);

    const lines = [];
    for (let i = 0; i < 1500; i++) {
      const line = {
        z: i * segmentLength,
        x: i > 300 && i < 700 ? Math.sin(i * 0.05) * 1500 : 0,
        y: 0,
        kind: null,
        sprite: null,
        spriteX: 0,
        worldW: 0,
      };

      if (i % 16 === 0 && Math.random() > 0.18) {
        line.kind = 'tree';
        line.sprite = sprites.trees[i % sprites.trees.length];
        line.spriteX = (Math.random() > 0.5 ? 1 : -1) * (1.45 + Math.random() * 2.1);
        line.worldW = 2000 + (i % 3) * 400;
      } else if (i % 11 === 0 && Math.random() > 0.28) {
        line.kind = 'bush';
        line.sprite = sprites.bushes[i % sprites.bushes.length];
        line.spriteX = (Math.random() > 0.5 ? 1 : -1) * (1.12 + Math.random() * 0.45);
        line.worldW = 520;
      } else if (i % 26 === 0) {
        line.kind = 'pole';
        line.spriteX = (Math.random() > 0.5 ? 1 : -1) * 1.06;
      } else if (i % 110 === 0 && Math.random() > 0.4) {
        const isTruck = Math.random() > 0.35;
        line.kind = isTruck ? 'truck' : 'car';
        line.sprite = isTruck
          ? sprites.trucks[i % sprites.trucks.length]
          : sprites.cars[i % sprites.cars.length];
        line.spriteX = Math.random() > 0.5 ? 0.42 : -0.42;
        line.worldW = isTruck ? 720 : 520;
      }

      lines.push(line);
    }

    const clouds = Array.from({ length: 12 }, (_, i) => ({
      x: (i / 12) * 2.2 - 0.3 + rngCloud() * 0.1,
      y: 0.12 + rngCloud() * 0.62,
      w: 0.2 + rngCloud() * 0.28,
      h: 0.06 + rngCloud() * 0.07,
      speed: 0.0015 + rngCloud() * 0.0035,
      alpha: 0.4 + rngCloud() * 0.28,
      seed: 900 + i * 17,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const fieldColor = (pal, z) => {
      const band = Math.floor(z / (segmentLength * 14)) % 4;
      switch (band) {
        case 0:
          return pal.fieldOlive;
        case 1:
          return pal.fieldMustard;
        case 2:
          return pal.fieldOliveDark;
        default:
          return pal.fieldMustardDark;
      }
    };

    const render = (now) => {
      const dt = Math.min(48, now - last);
      last = now;

      const isNight = environment === 'night';
      const pal = isNight ? PALETTES.night : PALETTES.day;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const horizonY = height * horizonYRatio;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      drawSky(ctx, width, height, horizonY, pal, isNight);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, horizonY);
      ctx.clip();
      drawCelestial(ctx, width, height, pal, isNight);
      cloudOffset += 0.12 * (dt / 16.67);
      for (const cloud of clouds) {
        const drift = ((cloud.x + cloudOffset * cloud.speed) % 1.5) - 0.22;
        paintCloud(
          ctx,
          drift * width,
          cloud.y * horizonY * 0.82,
          cloud.w * width,
          Math.min(cloud.h * height, horizonY * 0.32),
          pal,
          mulberry32(cloud.seed),
          isNight ? cloud.alpha * 0.5 : cloud.alpha
        );
      }
      if (!isNight) drawBirds(ctx, width, horizonY, pal, cloudOffset);
      ctx.restore();

      drawHorizonLand(ctx, width, horizonY, pal);
      drawVillage(ctx, width, horizonY, pal, isNight);

      pos += speed * (dt / 16.67);

      while (lines.length > 0 && lines[0].z <= pos) {
        const firstLine = lines.shift();
        firstLine.z += 1500 * segmentLength;
        lines.push(firstLine);
      }

      const startPos = pos;
      let maxy = height;
      const camH = 1500;
      const look = lines[24];
      const sway = Math.sin(pos * 0.00018) * 70;
      const camX = (look ? look.x * 0.32 : 0) + sway;
      const bob = Math.sin(pos * 0.0022) * 3;

      for (let i = 0; i < drawDistance; i++) {
        const line = lines[i];
        if (!line) break;

        const z = line.z - startPos;
        if (z <= 0) continue;

        const scale = cameraDepth / z;
        const projectedX = width / 2 + scale * (line.x - camX) * width / 2;
        const projectedY = horizonY + bob + scale * camH * height / 2;
        const projectedW = scale * roadWidth * width / 2;

        line.pX = projectedX;
        line.pY = projectedY;
        line.pW = projectedW;
        line.scale = scale;
        line.zCam = z;

        if (projectedY >= maxy) continue;
        maxy = projectedY;

        const prevLine = lines[i - 1];
        if (!prevLine || prevLine.pY == null) continue;

        const isDark = Math.floor(line.z / (segmentLength * 3)) % 2 === 0;
        const grass = fieldColor(pal, line.z);
        ctx.fillStyle = grass;
        ctx.fillRect(0, prevLine.pY, width, line.pY - prevLine.pY);

        drawPolygon(
          ctx,
          prevLine.pX, prevLine.pY, prevLine.pW * 1.16,
          line.pX, line.pY, line.pW * 1.16,
          isDark ? pal.dust : pal.dustDark
        );
        drawPolygon(
          ctx,
          prevLine.pX, prevLine.pY, prevLine.pW,
          line.pX, line.pY, line.pW,
          isDark ? pal.road : pal.roadDark
        );

        if (isDark) {
          drawPolygon(
            ctx,
            prevLine.pX, prevLine.pY, prevLine.pW * 0.035,
            line.pX, line.pY, line.pW * 0.035,
            pal.roadLine
          );
        }
      }

      for (let i = drawDistance - 1; i >= 0; i--) {
        const line = lines[i];
        if (!line || line.pY == null) continue;

        const distFade = Math.max(0.2, Math.min(1, 1.15 - line.zCam / (drawDistance * segmentLength * 0.55)));

        if (line.kind === 'pole') {
          const destX = line.pX + line.scale * line.spriteX * roadWidth * (width / 2);
          const destW = line.scale * 48 * (width / 2);
          const destH = line.scale * 2100 * (width / 2);
          const destY = line.pY - destH;
          if (destY <= height) {
            ctx.save();
            ctx.globalAlpha = distFade;
            drawPole(ctx, destX, destY, destW, destH, pal, isNight, Math.sign(line.spriteX));
            ctx.restore();
          }
        }

        if (line.sprite) {
          const sprite = line.sprite;
          const destW = line.scale * line.worldW * (width / 2);
          const destH = destW * (sprite.height / sprite.width);
          const destX = line.pX + line.scale * line.spriteX * roadWidth * (width / 2);
          const destY = line.pY - destH;

          if (destY <= height && destW > 1) {
            ctx.save();
            ctx.globalAlpha = distFade;
            if (isNight) ctx.filter = 'brightness(0.42) saturate(0.55)';
            ctx.drawImage(sprite, destX - destW / 2, destY, destW, destH);
            ctx.filter = 'none';
            ctx.restore();
          }
        }
      }

      unifyWash(ctx, width, height, pal);
      tileGrain(ctx, sprites.grain, width, height);

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [environment]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />;
};

export default CanvasRoad;
