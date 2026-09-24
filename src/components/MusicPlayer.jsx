import React, { useEffect, useState, useRef, useCallback } from 'react';
import YouTube from 'react-youtube';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ListMusic,
  X,
  Sun,
  Moon,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

const AMBIENT_SOUNDS = [
  { id: 'none', label: 'None', icon: '🔇', videoId: null },
  { id: 'rain', label: 'Rain', icon: '🌧️', videoId: 'NAIjcQYVvGo' },
  { id: 'sea', label: 'Sea Waves', icon: '🌊', videoId: 'zlWfPu_AfUA' },
  { id: 'wind', label: 'Wind', icon: '💨', videoId: '12uHsymTNzM' },
  { id: 'bus', label: 'Bus Interior', icon: '🚌', videoId: 'ubTEeAeROcg' },
  { id: 'traffic', label: 'City Traffic', icon: '🚗', videoId: 'VqbLs31HyZM' },
  { id: 'railway', label: 'Railway Station', icon: '🚉', videoId: 'Q0bK2rumZ_k' },
  { id: 'train_night', label: 'Night Train', icon: '🌙🚂', videoId: 'VgAGhNG6hCw' },
  { id: 'crickets', label: 'Night Crickets', icon: '🦗', videoId: 'M_GwfOYKw_E' },
  { id: 'cafe', label: 'Café Chatter', icon: '☕', videoId: 'K8WO8nhVDUE' },
  { id: 'forest', label: 'Forest Birds', icon: '🌿', videoId: 'LAH5NzoM3Qo' },
  { id: 'thunderstorm', label: 'Thunderstorm', icon: '⛈️', videoId: 'GWhrNIi_HQE' },
];

const RAIN_SOUND_IDS = ['rain', 'train_night', 'thunderstorm'];

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const thumbUrl = (videoId) =>
  videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : null;

const fetchTitle = async (videoId) => {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.title || null;
  } catch {
    return null;
  }
};

const MusicPlayer = ({
  playerInstance,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  environment,
  onToggleEnvironment,
  isRainEnabled,
  onToggleRain,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('Loading track...');
  const [videoId, setVideoId] = useState(null);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isHovering, setIsHovering] = useState(false);
  const [draggingProgress, setDraggingProgress] = useState(false);
  const [draggingVolume, setDraggingVolume] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [playlistIds, setPlaylistIds] = useState([]);
  const [titlesById, setTitlesById] = useState({});
  const [activeSound, setActiveSound] = useState('none');
  const [ambientVolume, setAmbientVolume] = useState(40);
  const [ambientOpen, setAmbientOpen] = useState(false);
  const [draggingAmbientVolume, setDraggingAmbientVolume] = useState(false);
  const menuRef = useRef(null);
  const ambientPlayerRef = useRef(null);
  const titlesFetched = useRef(new Set());

  const syncRain = (soundId) => {
    onToggleRain?.(RAIN_SOUND_IDS.includes(soundId));
  };

  useEffect(() => {
    if (isRainEnabled && activeSound === 'none') {
      selectSound('rain');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRainEnabled]);

  useEffect(() => {
    const clearDrag = () => {
      setDraggingProgress(false);
      setDraggingVolume(false);
      setDraggingAmbientVolume(false);
    };
    window.addEventListener('mouseup', clearDrag);
    window.addEventListener('touchend', clearDrag);
    return () => {
      window.removeEventListener('mouseup', clearDrag);
      window.removeEventListener('touchend', clearDrag);
    };
  }, []);

  useEffect(() => {
    if (!playlistOpen && !ambientOpen) return;
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setPlaylistOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setPlaylistOpen(false);
        setAmbientOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [playlistOpen, ambientOpen]);

  useEffect(() => {
    if (!playlistOpen) return;
    const el = menuRef.current?.querySelector('.playlist-item.active');
    el?.scrollIntoView({ block: 'nearest' });
  }, [playlistOpen, playlistIndex]);

  useEffect(() => {
    let interval;
    if (playerInstance) {
      interval = setInterval(() => {
        try {
          if (isPlaying && !draggingProgress) {
            setCurrentTime(playerInstance.getCurrentTime() || 0);
          }
          setDuration(playerInstance.getDuration() || 0);

          const videoData = playerInstance.getVideoData();
          if (videoData?.title) setTitle(videoData.title);
          if (videoData?.video_id) {
            setVideoId(videoData.video_id);
            setTitlesById((prev) =>
              prev[videoData.video_id] ? prev : { ...prev, [videoData.video_id]: videoData.title }
            );
          }

          const idx = playerInstance.getPlaylistIndex?.();
          if (typeof idx === 'number' && idx >= 0) setPlaylistIndex(idx);

          const ids = playerInstance.getPlaylist?.();
          if (Array.isArray(ids) && ids.length && ids.length !== playlistIds.length) {
            setPlaylistIds(ids);
          }
        } catch {
          // Ignore API errors
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [playerInstance, isPlaying, draggingProgress, playlistIds.length]);

  const loadPlaylistTitles = useCallback(async (ids) => {
    const missing = ids.filter((id) => id && !titlesFetched.current.has(id));
    if (!missing.length) return;

    const batchSize = 6;
    for (let i = 0; i < missing.length; i += batchSize) {
      const batch = missing.slice(i, i + batchSize);
      batch.forEach((id) => titlesFetched.current.add(id));
      const results = await Promise.all(batch.map((id) => fetchTitle(id)));
      setTitlesById((prev) => {
        const next = { ...prev };
        batch.forEach((id, j) => {
          if (results[j]) next[id] = results[j];
        });
        return next;
      });
    }
  }, []);

  const openPlaylist = () => {
    const next = !playlistOpen;
    setPlaylistOpen(next);
    if (next) setAmbientOpen(false);
    if (next && playerInstance) {
      try {
        const ids = playerInstance.getPlaylist?.() || [];
        if (ids.length) {
          setPlaylistIds(ids);
          loadPlaylistTitles(ids);
        }
      } catch {
        // ignore
      }
    }
  };

  const toggleAmbientMenu = () => {
    setAmbientOpen((open) => {
      const next = !open;
      if (next) setPlaylistOpen(false);
      return next;
    });
  };

  const selectTrack = (index) => {
    if (!playerInstance) return;
    try {
      playerInstance.playVideoAt(index);
      setPlaylistIndex(index);
      setPlaylistOpen(false);
    } catch {
      // ignore
    }
  };

  const selectSound = (id) => {
    if (id === activeSound) {
      if (ambientPlayerRef.current) {
        try {
          ambientPlayerRef.current.stopVideo();
        } catch (_) {}
      }
      setActiveSound('none');
      syncRain('none');
      return;
    }

    setActiveSound(id);
    syncRain(id);

    const sound = AMBIENT_SOUNDS.find((s) => s.id === id);
    if (sound?.videoId && ambientPlayerRef.current) {
      try {
        ambientPlayerRef.current.loadVideoById(sound.videoId);
        ambientPlayerRef.current.setVolume(ambientVolume);
      } catch (_) {}
    } else if (!sound?.videoId && ambientPlayerRef.current) {
      try {
        ambientPlayerRef.current.stopVideo();
      } catch (_) {}
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerInstance) {
      playerInstance.seekTo(newTime, true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    if (playerInstance) {
      playerInstance.setVolume(newVol);
    }
  };

  const handleAmbientVolumeChange = (v) => {
    setAmbientVolume(v);
    if (ambientPlayerRef.current) {
      try {
        ambientPlayerRef.current.setVolume(v);
      } catch (_) {}
    }
  };

  const onAmbientPlayerReady = (event) => {
    ambientPlayerRef.current = event.target;
    ambientPlayerRef.current.setVolume(ambientVolume);
    if (activeSound !== 'none') {
      const sound = AMBIENT_SOUNDS.find((s) => s.id === activeSound);
      if (sound?.videoId) {
        ambientPlayerRef.current.loadVideoById(sound.videoId);
      }
    }
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const cover = thumbUrl(videoId);
  const activeLabel = AMBIENT_SOUNDS.find((s) => s.id === activeSound);

  return (
    <div
      className={clsx('music-player glass-panel', {
        'is-hovering': isHovering,
        'playlist-open': playlistOpen,
        'ambient-open': ambientOpen,
      })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      ref={menuRef}
    >
      <div className="ambient-yt-host" aria-hidden="true">
        <YouTube
          opts={{
            height: '1',
            width: '1',
            playerVars: { autoplay: 0, controls: 0, loop: 1 },
          }}
          onReady={onAmbientPlayerReady}
        />
      </div>

      {playlistOpen && (
        <div className="playlist-menu" role="menu" aria-label="Playlist">
          <div className="playlist-menu-header">
            <span>Playlist</span>
            <button
              type="button"
              className="icon-btn playlist-close"
              onClick={() => setPlaylistOpen(false)}
              aria-label="Close playlist"
            >
              <X size={16} />
            </button>
          </div>
          <div className="playlist-menu-list">
            {playlistIds.length === 0 && (
              <div className="playlist-empty">Loading playlist…</div>
            )}
            {playlistIds.map((id, index) => {
              const trackTitle = titlesById[id] || `Track ${index + 1}`;
              const active = index === playlistIndex;
              return (
                <button
                  key={`${id}-${index}`}
                  type="button"
                  role="menuitem"
                  className={clsx('playlist-item', { active })}
                  onClick={() => selectTrack(index)}
                >
                  <img
                    className="playlist-item-thumb"
                    src={thumbUrl(id)}
                    alt=""
                    loading="lazy"
                  />
                  <span className="playlist-item-meta">
                    <span className="playlist-item-index">{index + 1}</span>
                    <span className="playlist-item-title">{trackTitle}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {ambientOpen && (
        <div className="ambient-expand" role="region" aria-label="Ambient sounds">
          <div className="ambient-volume-row">
            <VolumeX size={14} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
            <input
              type="range"
              min="0"
              max="100"
              value={ambientVolume}
              onChange={(e) => handleAmbientVolumeChange(parseInt(e.target.value))}
              onMouseDown={() => setDraggingAmbientVolume(true)}
              onMouseUp={() => setDraggingAmbientVolume(false)}
              onTouchStart={() => setDraggingAmbientVolume(true)}
              onTouchEnd={() => setDraggingAmbientVolume(false)}
              className={clsx('ambient-vol-slider', { dragging: draggingAmbientVolume })}
              style={{ '--progress': `${ambientVolume}%` }}
              aria-label="Ambient volume"
            />
            <Volume2 size={14} style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
            <span className="ambient-vol-label">{ambientVolume}%</span>
          </div>

          <div className="sound-grid">
            {AMBIENT_SOUNDS.map((sound) => (
              <button
                key={sound.id}
                type="button"
                className={clsx('sound-chip', { active: activeSound === sound.id })}
                onClick={() => selectSound(sound.id)}
                title={sound.label}
                aria-pressed={activeSound === sound.id}
              >
                <span className="sound-emoji">{sound.icon}</span>
                <span className="sound-label">{sound.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="player-secondary">
        <div className="env-toggles">
          <button
            type="button"
            className={clsx('env-btn', { active: environment === 'day' })}
            onClick={() => onToggleEnvironment('day')}
            title="Day mode"
            aria-label="Day mode"
          >
            <Sun size={18} />
          </button>
          <button
            type="button"
            className={clsx('env-btn', { active: environment === 'night' })}
            onClick={() => onToggleEnvironment('night')}
            title="Night mode"
            aria-label="Night mode"
          >
            <Moon size={18} />
          </button>
        </div>

        <button
          type="button"
          className={clsx('icon-btn ambient-btn', { active: ambientOpen || activeSound !== 'none' })}
          onClick={toggleAmbientMenu}
          aria-label={ambientOpen ? 'Collapse ambient sounds' : 'Expand ambient sounds'}
          aria-expanded={ambientOpen}
        >
          <span className="active-sound-emoji">
            {activeSound !== 'none' ? activeLabel?.icon : '🎵'}
          </span>
          {ambientOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>

      <div className="player-body">
        <div className="player-info">
          <div className="player-now-playing">
            <div className="track-thumb-wrap">
              {cover ? (
                <img className="track-thumb" src={cover} alt="" />
              ) : (
                <div className="track-thumb track-thumb-placeholder" />
              )}
            </div>
            <div className="track-title-container">
              <div className={clsx('track-title', { scrolling: title.length > 28 })}>
                {title}
              </div>
            </div>
          </div>
        </div>

        <div className="player-progress">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            onMouseDown={() => setDraggingProgress(true)}
            onMouseUp={() => setDraggingProgress(false)}
            onTouchStart={() => setDraggingProgress(true)}
            onTouchEnd={() => setDraggingProgress(false)}
            className={clsx('progress-slider', { dragging: draggingProgress })}
            style={{ '--progress': `${progressPct}%` }}
            aria-label="Seek"
          />
          <span className="time">{formatTime(duration)}</span>
        </div>

        <div className="player-controls">
          <div className="player-controls-start">
            <div className={clsx('volume-control', { visible: isHovering || draggingVolume })}>
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                onMouseDown={() => setDraggingVolume(true)}
                onMouseUp={() => setDraggingVolume(false)}
                onTouchStart={() => setDraggingVolume(true)}
                onTouchEnd={() => setDraggingVolume(false)}
                className={clsx('volume-slider small', { dragging: draggingVolume })}
                style={{ '--progress': `${volume}%` }}
                aria-label="Volume"
              />
            </div>
          </div>

          <div className="playback-controls">
            <button type="button" className="icon-btn" onClick={onPrev} aria-label="Previous">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              type="button"
              className="icon-btn play-btn"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </button>
            <button type="button" className="icon-btn" onClick={onNext} aria-label="Next">
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>

          <div className="player-controls-end">
            <button
              type="button"
              className={clsx('icon-btn playlist-btn', { active: playlistOpen })}
              onClick={openPlaylist}
              aria-label="View playlist"
              aria-expanded={playlistOpen}
            >
              <ListMusic size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
