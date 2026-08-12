import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ListMusic, X } from 'lucide-react';
import clsx from 'clsx';

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

const MusicPlayer = ({ playerInstance, isPlaying, onTogglePlay, onNext, onPrev }) => {
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
  const menuRef = useRef(null);
  const titlesFetched = useRef(new Set());

  useEffect(() => {
    const clearDrag = () => {
      setDraggingProgress(false);
      setDraggingVolume(false);
    };
    window.addEventListener('mouseup', clearDrag);
    window.addEventListener('touchend', clearDrag);
    return () => {
      window.removeEventListener('mouseup', clearDrag);
      window.removeEventListener('touchend', clearDrag);
    };
  }, []);

  // Close playlist when clicking outside
  useEffect(() => {
    if (!playlistOpen) return;
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setPlaylistOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [playlistOpen]);

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

    // Fetch in small batches to avoid hammering noembed
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

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const cover = thumbUrl(videoId);

  return (
    <div
      className={clsx('music-player glass-panel', { 'is-hovering': isHovering, 'playlist-open': playlistOpen })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      ref={menuRef}
    >
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

        <div className="playback-controls">
          <button className="icon-btn" onClick={onPrev} aria-label="Previous">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
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
          <button className="icon-btn" onClick={onNext} aria-label="Next">
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
  );
};

export default MusicPlayer;
