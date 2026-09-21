import React, { useEffect, useRef } from 'react';

const RainEffect = ({ isRainEnabled }) => {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Audio synthesis for rain (white noise + lowpass filter)
  useEffect(() => {
    if (!isRainEnabled) {
      if (gainNodeRef.current && audioCtxRef.current) {
        // Fade out
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        setTimeout(() => {
          if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
            audioCtxRef.current.suspend();
          }
        }, 1000);
      }
      return;
    }

    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      // Lowpass filter to make it sound like rain/rumble
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000; // Adjust for different rain sounds

      const gain = ctx.createGain();
      gain.gain.value = 0;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(0);

      noiseNodeRef.current = whiteNoise;
      filterNodeRef.current = filter;
      gainNodeRef.current = gain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    // Fade in
    gainNodeRef.current.gain.setTargetAtTime(0.5, audioCtxRef.current.currentTime, 0.5);

    return () => {
       // Cleanup handled on unmount, not on toggle
    };
  }, [isRainEnabled]);

  // Visual Rain Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    resize();

    const initW = canvas.clientWidth || window.innerWidth;
    const initH = canvas.clientHeight || window.innerHeight;
    const dropCount = initW < 700 ? 80 : 150;

    // Create rain drops
    for (let i = 0; i < dropCount; i++) {
      particles.push({
        x: Math.random() * initW,
        y: Math.random() * initH,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 15,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    const render = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (isRainEnabled) {
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          // Angle of rain (wind)
          ctx.lineTo(p.x - p.length * 0.5, p.y + p.length);
          ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
          ctx.stroke();

          p.y += p.speed;
          p.x -= p.speed * 0.5; // Wind effect

          if (p.y > h) {
            p.y = -p.length;
            p.x = Math.random() * w + 100; // Shifted due to wind
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRainEnabled]);

  return <canvas ref={canvasRef} className="rain-canvas" />;
};

export default RainEffect;
