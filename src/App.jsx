import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import CanvasRoad from './components/CanvasRoad';
import BusFrame from './components/BusFrame';
import MusicPlayer from './components/MusicPlayer';
import RainEffect from './components/RainEffect';
import RoadwayPicker from './components/RoadwayPicker';
import { DEFAULT_ROADWAY_ID, getRoadwayById } from './data/roadways';
import './App.css';

const STORAGE_KEY = 'desiroadways.activeRoadway';

function App() {
  const [roadwayId, setRoadwayId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && getRoadwayById(saved).id === saved) return saved;
    } catch {
      // ignore
    }
    return DEFAULT_ROADWAY_ID;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRainEnabled, setIsRainEnabled] = useState(false);
  const [environment, setEnvironment] = useState('day'); // 'day' | 'night'
  const [playerInstance, setPlayerInstance] = useState(null);
  const playerRef = useRef(null);
  const skipStreakRef = useRef(0);
  const wantPlayRef = useRef(false);
  const stuckSinceRef = useRef(null);
  const lastVideoIdRef = useRef(null);

  const roadway = getRoadwayById(roadwayId);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, roadwayId);
    } catch {
      // ignore
    }
  }, [roadwayId]);

  const skipUnavailable = () => {
    const player = playerRef.current;
    if (!player) return;

    const playlist = player.getPlaylist?.() || [];
    const limit = Math.max(playlist.length, 1);
    if (skipStreakRef.current >= limit) {
      // Every track failed — stop rather than looping forever
      wantPlayRef.current = false;
      stuckSinceRef.current = null;
      setIsPlaying(false);
      return;
    }

    skipStreakRef.current += 1;
    stuckSinceRef.current = null;
    try {
      player.nextVideo();
      // After an error, nextVideo sometimes cues without playing
      if (wantPlayRef.current) {
        window.setTimeout(() => {
          try {
            playerRef.current?.playVideo();
          } catch {
            // ignore
          }
        }, 250);
      }
    } catch {
      // ignore
    }
  };

  // Some unavailable playlist videos never fire onError — they hang
  // in buffering/unstarted with zero progress. Skip those too.
  useEffect(() => {
    if (!playerInstance) return;

    const STUCK_MS = 4000;
    const id = window.setInterval(() => {
      if (!wantPlayRef.current || !playerRef.current) {
        stuckSinceRef.current = null;
        return;
      }

      try {
        const player = playerRef.current;
        const state = player.getPlayerState?.();
        const time = player.getCurrentTime?.() || 0;
        const videoData = player.getVideoData?.() || {};
        const videoId = videoData.video_id || null;

        if (videoId && videoId !== lastVideoIdRef.current) {
          lastVideoIdRef.current = videoId;
          stuckSinceRef.current = null;
        }

        // Playing with real progress — healthy
        if (state === 1 && time > 0.4) {
          skipStreakRef.current = 0;
          stuckSinceRef.current = null;
          return;
        }

        // Paused on purpose, or still buffering a real stream
        if (state === 2 || state === 3) {
          stuckSinceRef.current = null;
          return;
        }

        // Unavailable playlist items often sit in unstarted/cued,
        // or "play" at 0s forever without advancing
        const maybeStuck =
          state === -1 || state === 5 || (state === 1 && time < 0.25);
        if (!maybeStuck) {
          stuckSinceRef.current = null;
          return;
        }

        const now = Date.now();
        if (!stuckSinceRef.current) {
          stuckSinceRef.current = now;
          return;
        }

        if (now - stuckSinceRef.current >= STUCK_MS) {
          skipUnavailable();
        }
      } catch {
        // ignore
      }
    }, 1000);

    return () => window.clearInterval(id);
    // skipUnavailable closes over refs only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerInstance]);

  const selectRoadway = (id) => {
    if (id === roadwayId) return;
    setIsPlaying(false);
    wantPlayRef.current = false;
    skipStreakRef.current = 0;
    stuckSinceRef.current = null;
    lastVideoIdRef.current = null;
    setPlayerInstance(null);
    playerRef.current = null;
    setRoadwayId(id);
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    setPlayerInstance(event.target);
    playerRef.current.setVolume(50);
    skipStreakRef.current = 0;
    stuckSinceRef.current = null;
    lastVideoIdRef.current = null;
  };

  const onStateChange = (event) => {
    // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
    if (event.data === 1) {
      stuckSinceRef.current = null;
      setIsPlaying(true);
      wantPlayRef.current = true;
    }
    if (event.data === 2) {
      setIsPlaying(false);
      wantPlayRef.current = false;
      stuckSinceRef.current = null;
    }
  };

  const onPlayerError = () => {
    // 2/5/100/101/150 — invalid, HTML5 error, removed, or embedding blocked
    skipUnavailable();
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        wantPlayRef.current = false;
        stuckSinceRef.current = null;
        playerRef.current.pauseVideo();
      } else {
        wantPlayRef.current = true;
        stuckSinceRef.current = null;
        playerRef.current.playVideo();
      }
    }
  };

  const nextTrack = () => {
    skipStreakRef.current = 0;
    stuckSinceRef.current = null;
    playerRef.current?.nextVideo();
  };
  const prevTrack = () => {
    skipStreakRef.current = 0;
    stuckSinceRef.current = null;
    playerRef.current?.previousVideo();
  };

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: roadway.playlistId,
      autoplay: 0,
    },
  };

  return (
    <div className="app-container" style={{ '--accent': roadway.accent }}>
      {/* Invisible YouTube Player — remount when playlist changes */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <YouTube
          key={roadway.playlistId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
          onError={onPlayerError}
        />
      </div>

      <CanvasRoad environment={environment} />

      <RainEffect isRainEnabled={isRainEnabled} />

      <BusFrame interiorSrc={roadway.interior} />

      <RoadwayPicker activeId={roadway.id} onSelect={selectRoadway} />

      <div className="hud-stack">
        <MusicPlayer
          playerInstance={playerInstance}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onNext={nextTrack}
          onPrev={prevTrack}
          environment={environment}
          onToggleEnvironment={setEnvironment}
          isRainEnabled={isRainEnabled}
          onToggleRain={setIsRainEnabled}
        />
      </div>
    </div>
  );
}

export default App;
