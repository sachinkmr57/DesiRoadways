/**
 * Painterly ink-and-wash helpers for the windshield countryside.
 * Tuned to sit with the Haryana Roadways bus interior: muted earth,
 * dark outlines, matte fills, grain — not glossy arcade 3D.
 */

export const PALETTES = {
  day: {
    skyTop: '#5e7a90',
    skyMid: '#8ea0a8',
    skyHorizon: '#d5c6a8',
    sun: '#e6c878',
    sunInk: '#b8893a',
    cloud: '#ece6da',
    cloudShade: '#9a9080',
    cloudInk: '#6a6458',
    hillFar: '#7d8a6a',
    hillNear: '#3e4c30',
    haze: 'rgba(210, 196, 168, 0.42)',
    fieldOlive: '#5e6a40',
    fieldOliveDark: '#535c38',
    fieldMustard: '#9a8644',
    fieldMustardDark: '#8a763c',
    dust: '#7a6c54',
    dustDark: '#6a5e48',
    road: '#3c3a36',
    roadDark: '#35332f',
    roadLine: '#c8b56a',
    ink: '#1a1410',
    inkSoft: '#2a241c',
    pole: '#8a8478',
    poleShadow: '#6e685c',
    lampDay: '#d4c48a',
    lampNight: '#ffd090',
    village: '#6a5a48',
    villageRoof: '#5a4030',
    unify: 'rgba(196, 168, 130, 0.18)',
    bird: '#2a241c',
  },
  night: {
    skyTop: '#10141f',
    skyMid: '#1a2030',
    skyHorizon: '#3a3640',
    sun: '#e8e4d4',
    sunInk: '#9a9688',
    cloud: '#4a4e62',
    cloudShade: '#2e3244',
    cloudInk: '#1c2030',
    hillFar: '#243040',
    hillNear: '#1a2820',
    haze: 'rgba(40, 36, 48, 0.45)',
    fieldOlive: '#1c281c',
    fieldOliveDark: '#162016',
    fieldMustard: '#2a2818',
    fieldMustardDark: '#222016',
    dust: '#2a261c',
    dustDark: '#221e18',
    road: '#1c1c1a',
    roadDark: '#161614',
    roadLine: '#8a7840',
    ink: '#0a0a0e',
    inkSoft: '#141418',
    pole: '#3a3a38',
    poleShadow: '#2a2a28',
    lampDay: '#d4c48a',
    lampNight: '#ffc878',
    village: '#1c2028',
    villageRoof: '#241820',
    unify: 'rgba(28, 32, 48, 0.14)',
    bird: '#0a0c12',
  },
};

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Irregular closed blob — the illustrated equivalent of a circle. */
export function blobPath(ctx, cx, cy, rx, ry, rng, points = 9) {
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const a = t * Math.PI * 2;
    const j = 0.72 + rng() * 0.38;
    const x = cx + Math.cos(a) * rx * j;
    const y = cy + Math.sin(a) * ry * j;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function bakeGrain(size = 128) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 100 + Math.random() * 90;
    img.data[i] = v;
    img.data[i + 1] = v - 6;
    img.data[i + 2] = v - 14;
    img.data[i + 3] = 52;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function inkStroke(ctx, pal, width) {
  ctx.strokeStyle = pal.ink;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
}

/**
 * kind: 0 eucalyptus (tall/skinny), 1 neem (round), 2 keekar (scraggly)
 */
export function bakeTree(seed, w, h, kind) {
  const rng = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const pal = PALETTES.day;
  const ink = pal.ink;
  const groundY = h * 0.94;
  const isEuc = kind === 0;
  const isKeekar = kind === 2;

  const trunkMidX = w * 0.5 + (rng() - 0.5) * w * 0.05;
  const baseW = isEuc ? w * 0.055 : isKeekar ? w * 0.07 : w * 0.1;
  const topW = isEuc ? w * 0.03 : w * 0.04;
  const trunkTop = isEuc ? h * 0.28 : isKeekar ? h * 0.46 : h * 0.4;
  const lean = (rng() - 0.5) * w * 0.08;

  ctx.beginPath();
  ctx.moveTo(trunkMidX - baseW, groundY);
  ctx.quadraticCurveTo(
    trunkMidX - baseW * 0.4 + lean * 0.4,
    (groundY + trunkTop) / 2,
    trunkMidX - topW + lean,
    trunkTop
  );
  ctx.lineTo(trunkMidX + topW + lean, trunkTop);
  ctx.quadraticCurveTo(
    trunkMidX + baseW * 0.4 + lean * 0.4,
    (groundY + trunkTop) / 2,
    trunkMidX + baseW,
    groundY
  );
  ctx.closePath();
  ctx.fillStyle = '#3a2c22';
  ctx.fill();
  inkStroke(ctx, pal, Math.max(2.4, w * 0.012));
  ctx.stroke();

  ctx.strokeStyle = '#2a1e16';
  ctx.lineWidth = Math.max(1, w * 0.004);
  const barkN = isEuc ? 4 : 6;
  for (let i = 0; i < barkN; i++) {
    const y1 = trunkTop + (groundY - trunkTop) * (0.12 + i * 0.12);
    ctx.beginPath();
    ctx.moveTo(trunkMidX - baseW * 0.35 + lean * 0.4, y1);
    ctx.quadraticCurveTo(
      trunkMidX + lean * 0.5,
      y1 + h * 0.02,
      trunkMidX + baseW * 0.3 + lean * 0.4,
      y1 + h * 0.03
    );
    ctx.stroke();
  }

  // ground tuft so the trunk doesn't float
  ctx.fillStyle = '#4a5a30';
  blobPath(ctx, trunkMidX, groundY - h * 0.01, w * 0.16, h * 0.03, rng, 7);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.stroke();

  const greens = ['#24301c', '#334628', '#4a5c34', '#5c6e3c'];
  const clumpCount = isEuc ? 6 : isKeekar ? 7 : 9;
  const canopyCx = trunkMidX + lean;
  const canopyCy = isEuc ? h * 0.26 : isKeekar ? h * 0.38 : h * 0.32;

  for (let i = 0; i < clumpCount; i++) {
    const spreadX = isEuc ? 0.18 : isKeekar ? 0.28 : 0.32;
    const spreadY = isEuc ? 0.22 : 0.2;
    const cx = canopyCx + (rng() - 0.5) * w * spreadX * 2;
    const cy = canopyCy + (rng() - 0.5) * h * spreadY * 2;
    const rx = w * (isEuc ? 0.14 : 0.16) * (0.7 + rng() * 0.5);
    const ry = h * (isEuc ? 0.1 : 0.11) * (0.7 + rng() * 0.5);
    ctx.fillStyle = greens[i % greens.length];
    blobPath(ctx, cx, cy, rx, ry, rng, 8 + (i % 3));
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(2, w * 0.01);
    ctx.stroke();
  }

  // matte highlight clump (upper-left, never glossy white)
  ctx.fillStyle = isEuc ? '#6a7a48' : '#677848';
  blobPath(
    ctx,
    canopyCx - w * 0.08,
    canopyCy - h * 0.06,
    w * 0.1,
    h * 0.06,
    rng,
    7
  );
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.globalAlpha = 1;

  return c;
}

export function bakeBush(seed, w, h) {
  const rng = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const ink = PALETTES.day.ink;
  const tones = ['#2c3c22', '#3c4e2c', '#4e6036'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = tones[i % tones.length];
    blobPath(
      ctx,
      w * (0.28 + i * 0.16),
      h * (0.55 + (i % 2) * 0.08),
      w * (0.22 + rng() * 0.08),
      h * (0.28 + rng() * 0.1),
      rng,
      8
    );
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(2, w * 0.018);
    ctx.stroke();
  }
  return c;
}

export function bakeTruck(seed, w, h) {
  const rng = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const pal = PALETTES.day;
  const bodies = ['#6a7a88', '#8a5a4a', '#7a6a48', '#5a6a58'];
  const body = bodies[Math.floor(rng() * bodies.length)];
  const bodyDark = '#2a241c';

  const x = w * 0.12;
  const y = h * 0.18;
  const bw = w * 0.76;
  const bh = h * 0.52;

  // cargo box
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(x, y, bw, bh, 4);
  ctx.fill();
  inkStroke(ctx, pal, 2.2);
  ctx.stroke();

  // rear door split
  ctx.strokeStyle = pal.inkSoft;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + bw / 2, y + 6);
  ctx.lineTo(x + bw / 2, y + bh - 6);
  ctx.stroke();

  // faded tarp stripe
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#d8c8a8';
  ctx.fillRect(x + 8, y + bh * 0.18, bw - 16, bh * 0.16);
  ctx.globalAlpha = 1;

  // chassis
  ctx.fillStyle = bodyDark;
  ctx.fillRect(x + bw * 0.06, y + bh, bw * 0.88, h * 0.06);
  ctx.strokeRect(x + bw * 0.06, y + bh, bw * 0.88, h * 0.06);

  // bumper
  ctx.fillStyle = '#4a4840';
  ctx.fillRect(x + bw * 0.12, y + bh + h * 0.05, bw * 0.76, h * 0.045);

  // wheels
  const wheelY = y + bh + h * 0.1;
  const wheelR = h * 0.09;
  for (const wx of [x + bw * 0.2, x + bw * 0.8]) {
    ctx.beginPath();
    ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1612';
    ctx.fill();
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wx, wheelY, wheelR * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#3a342c';
    ctx.fill();
  }

  // tail lamps (matte, not neon)
  ctx.fillStyle = '#7a3a32';
  ctx.fillRect(x + 8, y + bh * 0.62, bw * 0.1, bh * 0.16);
  ctx.fillRect(x + bw - 8 - bw * 0.1, y + bh * 0.62, bw * 0.1, bh * 0.16);
  ctx.strokeStyle = pal.ink;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + bh * 0.62, bw * 0.1, bh * 0.16);
  ctx.strokeRect(x + bw - 8 - bw * 0.1, y + bh * 0.62, bw * 0.1, bh * 0.16);

  return c;
}

export function bakeCar(seed, w, h) {
  const rng = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const pal = PALETTES.day;
  const bodies = ['#c8c0b0', '#6a6e70', '#7a4a42', '#4a5a4c'];
  const body = bodies[Math.floor(rng() * bodies.length)];

  const x = w * 0.16;
  const y = h * 0.28;
  const bw = w * 0.68;
  const bh = h * 0.4;

  // body
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + bh);
  ctx.lineTo(x, y + bh * 0.45);
  ctx.quadraticCurveTo(x + bw * 0.1, y, x + bw * 0.5, y);
  ctx.quadraticCurveTo(x + bw * 0.9, y, x + bw, y + bh * 0.45);
  ctx.lineTo(x + bw - 4, y + bh);
  ctx.closePath();
  ctx.fill();
  inkStroke(ctx, pal, 2);
  ctx.stroke();

  // rear window
  ctx.fillStyle = '#2a3840';
  ctx.beginPath();
  ctx.moveTo(x + bw * 0.18, y + bh * 0.18);
  ctx.lineTo(x + bw * 0.82, y + bh * 0.18);
  ctx.lineTo(x + bw * 0.76, y + bh * 0.48);
  ctx.lineTo(x + bw * 0.24, y + bh * 0.48);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = pal.ink;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // bumper
  ctx.fillStyle = '#3a3834';
  ctx.fillRect(x + bw * 0.08, y + bh * 0.82, bw * 0.84, h * 0.07);
  ctx.strokeRect(x + bw * 0.08, y + bh * 0.82, bw * 0.84, h * 0.07);

  // tail lamps
  ctx.fillStyle = '#6a3830';
  ctx.fillRect(x + bw * 0.1, y + bh * 0.55, bw * 0.16, bh * 0.14);
  ctx.fillRect(x + bw * 0.74, y + bh * 0.55, bw * 0.16, bh * 0.14);

  // wheels
  const wheelY = y + bh + h * 0.02;
  for (const wx of [x + bw * 0.22, x + bw * 0.78]) {
    ctx.beginPath();
    ctx.arc(wx, wheelY, h * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1612';
    ctx.fill();
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  return c;
}

export function drawSky(ctx, width, height, horizonY, pal, isNight) {
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, pal.skyTop);
  sky.addColorStop(0.55, pal.skyMid);
  sky.addColorStop(1, pal.skyHorizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, Math.ceil(horizonY) + 2);

  // dusty ground under horizon (fields overdraw this)
  ctx.fillStyle = pal.fieldOlive;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  if (isNight) {
    ctx.fillStyle = 'rgba(232, 228, 212, 0.55)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97) % width;
      const sy = ((i * 53) % Math.max(1, horizonY * 0.78));
        ctx.globalAlpha = 0.45 + (i % 5) * 0.12;
      ctx.beginPath();
      ctx.arc(sx, sy, i % 4 === 0 ? 1.6 : 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export function drawCelestial(ctx, width, height, pal, isNight) {
  const cx = width * 0.7;
  const cy = height * 0.185;
  const r = isNight ? 20 : 26;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = pal.sun;
  ctx.fill();
  ctx.strokeStyle = pal.sunInk;
  ctx.lineWidth = 2;
  ctx.stroke();
  if (!isNight) {
    // inner matte disc — illustration, not bloom
    ctx.beginPath();
    ctx.arc(cx - r * 0.12, cy - r * 0.1, r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = '#f0dc9a';
    ctx.globalAlpha = 0.45;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function paintCloud(ctx, cx, cy, w, h, pal, rng, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = pal.cloud;
  ctx.strokeStyle = pal.cloudInk;
  ctx.lineWidth = Math.max(1, h * 0.05);
  ctx.lineJoin = 'round';
  const parts = 4;
  for (let i = 0; i < parts; i++) {
    blobPath(
      ctx,
      cx + (i - 1.5) * w * 0.18,
      cy + (i % 2) * h * 0.12,
      w * (0.22 + rng() * 0.08),
      h * (0.42 + rng() * 0.12),
      rng,
      8
    );
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = pal.cloudShade;
  ctx.globalAlpha = alpha * 0.45;
  blobPath(ctx, cx + w * 0.08, cy + h * 0.18, w * 0.2, h * 0.28, rng, 7);
  ctx.fill();
  ctx.restore();
}

export function drawHorizonLand(ctx, width, horizonY, pal) {
  const haze = ctx.createLinearGradient(0, horizonY - 90, 0, horizonY + 8);
  haze.addColorStop(0, 'rgba(0,0,0,0)');
  haze.addColorStop(1, pal.haze);
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizonY - 90, width, 100);

  ctx.fillStyle = pal.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  for (let x = 0; x <= width; x += 20) {
    const peak =
      horizonY -
      (16 + 20 * Math.abs(Math.sin(x * 0.007 + 1.1)) + 8 * Math.sin(x * 0.019));
    ctx.lineTo(x, peak);
  }
  ctx.lineTo(width, horizonY);
  ctx.closePath();
  ctx.fill();

  // nearer tree-line — bumpy ink silhouette
  ctx.fillStyle = pal.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  for (let x = 0; x <= width; x += 5) {
    const n =
      14 +
      16 * Math.abs(Math.sin(x * 0.045 + 0.4)) +
      10 * Math.abs(Math.sin(x * 0.11)) +
      (x % 13) * 0.2;
    ctx.lineTo(x, horizonY - n);
  }
  ctx.lineTo(width, horizonY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = pal.inkSoft;
  ctx.lineWidth = 1.1;
  ctx.stroke();
}

export function drawVillage(ctx, width, horizonY, pal, isNight) {
  const baseX = width * 0.62;
  const baseY = horizonY;
  ctx.save();
  ctx.fillStyle = pal.village;
  ctx.strokeStyle = pal.inkSoft;
  ctx.lineWidth = 1;

  const buildings = [
    { x: 0, w: 18, h: 14 },
    { x: 16, w: 22, h: 18 },
    { x: 36, w: 14, h: 11 },
    { x: 50, w: 20, h: 16 },
    { x: 72, w: 12, h: 10 },
  ];
  for (const b of buildings) {
    ctx.fillRect(baseX + b.x, baseY - b.h, b.w, b.h);
    ctx.strokeRect(baseX + b.x, baseY - b.h, b.w, b.h);
    ctx.fillStyle = pal.villageRoof;
    ctx.fillRect(baseX + b.x - 1, baseY - b.h - 3, b.w + 2, 3);
    ctx.fillStyle = pal.village;
  }

  // water tower
  const tx = baseX + 96;
  ctx.fillStyle = pal.village;
  ctx.fillRect(tx, baseY - 28, 4, 28);
  ctx.beginPath();
  ctx.ellipse(tx + 2, baseY - 34, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeRect(tx, baseY - 28, 4, 28);

  if (isNight) {
    ctx.fillStyle = 'rgba(255, 186, 80, 0.35)';
    ctx.fillRect(baseX + 22, baseY - 12, 3, 3);
    ctx.fillRect(baseX + 56, baseY - 10, 3, 3);
  }
  ctx.restore();
}

export function drawBirds(ctx, width, horizonY, pal, t) {
  ctx.strokeStyle = pal.bird;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const x = ((width * 0.15 + i * 70 + t * (0.2 + i * 0.04)) % (width * 0.9)) + width * 0.05;
    const y = horizonY * (0.18 + (i % 3) * 0.08);
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 2);
    ctx.quadraticCurveTo(x - 1, y - 3, x, y);
    ctx.quadraticCurveTo(x + 1, y - 3, x + 5, y + 2);
    ctx.stroke();
  }
}

export function drawPole(ctx, destX, destY, destW, destH, pal, isNight, side) {
  const postW = Math.max(2, destW);
  ctx.fillStyle = pal.pole;
  ctx.strokeStyle = pal.ink;
  ctx.lineWidth = Math.max(1, postW * 0.12);
  ctx.fillRect(destX - postW / 2, destY, postW, destH);
  ctx.strokeRect(destX - postW / 2, destY, postW, destH);

  const armW = postW * 7;
  const armH = Math.max(2, postW * 0.7);
  const armX = side > 0 ? destX - armW : destX;
  ctx.fillStyle = pal.poleShadow;
  ctx.fillRect(armX, destY + postW, armW, armH);
  ctx.strokeRect(armX, destY + postW, armW, armH);

  const lampX = side > 0 ? destX - armW : destX + armW;
  const lampY = destY + postW * 1.6;
  ctx.fillStyle = isNight ? pal.lampNight : pal.lampDay;
  ctx.beginPath();
  ctx.arc(lampX, lampY, postW * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pal.ink;
  ctx.stroke();

  if (isNight) {
    ctx.fillStyle = 'rgba(255, 186, 80, 0.22)';
    ctx.beginPath();
    ctx.moveTo(lampX, lampY);
    ctx.lineTo(lampX - postW * 11, destY + destH);
    ctx.lineTo(lampX + postW * 11, destY + destH);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawPolygon(ctx, x1, y1, w1, x2, y2, w2, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 - w1, y1);
  ctx.lineTo(x2 - w2, y2);
  ctx.lineTo(x2 + w2, y2);
  ctx.lineTo(x1 + w1, y1);
  ctx.closePath();
  ctx.fill();
}

export function bakeHatch(size = 72) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = 'rgba(26, 20, 16, 0.55)';
  ctx.lineWidth = 1;
  for (let i = -size; i < size * 2; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }
  return c;
}

export function tileHatch(ctx, hatch, width, height, horizonY) {
  if (!hatch) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizonY, width, height - horizonY);
  ctx.clip();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = ctx.createPattern(hatch, 'repeat');
  ctx.fillRect(0, horizonY, width, height - horizonY);
  ctx.restore();
}

export function tileGrain(ctx, grain, width, height) {
  if (!grain) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const pat = ctx.createPattern(grain, 'repeat');
  ctx.fillStyle = pat;
  ctx.globalAlpha = 0.72;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function drawHeadlightWash(ctx, width, height, horizonY) {
  ctx.save();
  const g = ctx.createLinearGradient(width / 2, height, width / 2, horizonY);
  g.addColorStop(0, 'rgba(255, 210, 140, 0.2)');
  g.addColorStop(0.55, 'rgba(255, 210, 140, 0.06)');
  g.addColorStop(1, 'rgba(255, 210, 140, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(width / 2 - width * 0.18, height);
  ctx.lineTo(width / 2 + width * 0.18, height);
  ctx.lineTo(width / 2 + 10, horizonY);
  ctx.lineTo(width / 2 - 10, horizonY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function unifyWash(ctx, width, height, pal) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = pal.unify;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function bakeSpriteSheet() {
  const treeSpecs = [
    { seed: 1400, w: 240, h: 440, kind: 0, worldW: 1500 },
    { seed: 1497, w: 320, h: 380, kind: 1, worldW: 2300 },
    { seed: 1594, w: 300, h: 360, kind: 2, worldW: 1900 },
    { seed: 1691, w: 240, h: 440, kind: 0, worldW: 1600 },
    { seed: 1788, w: 320, h: 380, kind: 1, worldW: 2400 },
    { seed: 1885, w: 300, h: 360, kind: 2, worldW: 1800 },
  ];
  const trees = treeSpecs.map((s) => bakeTree(s.seed, s.w, s.h, s.kind));
  const treeWidths = treeSpecs.map((s) => s.worldW);
  const bushes = [0, 1, 2].map((i) => bakeBush(2400 + i * 53, 180, 120));
  const trucks = [0, 1, 2].map((i) => bakeTruck(3400 + i * 71, 240, 180));
  const cars = [0, 1, 2, 3].map((i) => bakeCar(4400 + i * 67, 200, 130));
  const grain = bakeGrain(128);
  const hatch = bakeHatch(72);
  return { trees, treeWidths, bushes, trucks, cars, grain, hatch };
}
