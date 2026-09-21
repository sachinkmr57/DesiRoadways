import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Sun, Moon, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

// ---------------------------------------------------------------------------
// Curated YouTube ambient sound videos (real recordings)
// ---------------------------------------------------------------------------
const AMBIENT_SOUNDS = [
  { id: 'none',      label: 'None',             icon: '🔇', videoId: null },
  { id: 'rain',      label: 'Rain',             icon: '🌧️', videoId: 'NAIjcQYVvGo' },
  { id: 'sea',       label: 'Sea Waves',        icon: '🌊', videoId: 'zlWfPu_AfUA' },
  { id: 'wind',      label: 'Wind',             icon: '💨', videoId: '12uHsymTNzM' },
  { id: 'bus',       label: 'Bus Interior',     icon: '🚌', videoId: 'ubTEeAeROcg' },
  { id: 'traffic',   label: 'City Traffic',     icon: '🚗', videoId: 'VqbLs31HyZM' },
  { id: 'railway',   label: 'Railway Station',  icon: '🚉', videoId: 'Q0bK2rumZ_k' },
  { id: 'train_night', label: 'Night Train',   icon: '🌙🚂', videoId: 'VgAGhNG6hCw' },
  { id: 'crickets',  label: 'Night Crickets',   icon: '🦗', videoId: 'M_GwfOYKw_E' },
  { id: 'cafe',      label: 'Café Chatter',     icon: '☕', videoId: 'K8WO8nhVDUE' }, // Coffee shop ambience 1hr
  { id: 'forest',    label: 'Forest Birds',     icon: '🌿', videoId: 'LAH5NzoM3Qo' }, // Forest birds 1hr, no music
  { id: 'thunderstorm', label: 'Thunderstorm', icon: '⛈️', videoId: 'GWhrNIi_HQE' }, // Thunderstorm & heavy rain
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AmbientPanel = ({ environment, onToggleEnvironment, isRainEnabled, onToggleRain }) => {
  const [activeSound, setActiveSound] = useState('none');
  const [ambientVolume, setAmbientVolume] = useState(40);
  const [expanded, setExpanded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [draggingVolume, setDraggingVolume] = useState(false);
  const ambientPlayerRef = useRef(null);

  // Sync rain toggle with ambient sound selection (for visual rain effect)
  const syncRain = (soundId) => {
    const rainIds = ['rain', 'train_night', 'thunderstorm'];
    onToggleRain && onToggleRain(rainIds.includes(soundId));
  };

  // When isRainEnabled is toggled externally, sync to the panel
  useEffect(() => {
    if (isRainEnabled && activeSound === 'none') {
      selectSound('rain');
    }
    // Note: don't toggle off here to avoid feedback loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRainEnabled]);

  const selectSound = (id) => {
    if (id === activeSound) {
      // Toggle off
      if (ambientPlayerRef.current) {
        try { ambientPlayerRef.current.stopVideo(); } catch (_) {}
      }
      setActiveSound('none');
      syncRain('none');
      return;
    }

    setActiveSound(id);
    syncRain(id);

    // Play via YouTube player
    const sound = AMBIENT_SOUNDS.find(s => s.id === id);
    if (sound?.videoId && ambientPlayerRef.current) {
      try {
        ambientPlayerRef.current.loadVideoById(sound.videoId);
        ambientPlayerRef.current.setVolume(ambientVolume);
      } catch (_) {}
    } else if (!sound?.videoId) {
      if (ambientPlayerRef.current) {
        try { ambientPlayerRef.current.stopVideo(); } catch (_) {}
      }
    }
  };

  const handleVolumeChange = (v) => {
    setAmbientVolume(v);
    if (ambientPlayerRef.current) {
      try { ambientPlayerRef.current.setVolume(v); } catch (_) {}
    }
  };

  const onAmbientPlayerReady = (event) => {
    ambientPlayerRef.current = event.target;
    ambientPlayerRef.current.setVolume(ambientVolume);
    // If a sound was selected before the player was ready, start it
    if (activeSound !== 'none') {
      const sound = AMBIENT_SOUNDS.find(s => s.id === activeSound);
      if (sound?.videoId) {
        ambientPlayerRef.current.loadVideoById(sound.videoId);
      }
    }
  };

  const activeLabel = AMBIENT_SOUNDS.find(s => s.id === activeSound);

  return (
    <div className="ambient-panel glass-panel">
      {/* Hidden YouTube player for ambient audio */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden' }}>
        <YouTube
          opts={{
            height: '1',
            width: '1',
            playerVars: { autoplay: 0, controls: 0, loop: 1 },
          }}
          onReady={onAmbientPlayerReady}
        />
      </div>

      {/* Header row */}
      <div className="ambient-header">
        {/* Environment toggles */}
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

        <div className="ambient-divider" />

        {/* Volume control */}
        <button
          type="button"
          className={clsx('env-btn', { active: showVolumeSlider })}
          onClick={() => setShowVolumeSlider(v => !v)}
          title="Ambient volume"
          aria-label="Ambient volume"
        >
          {ambientVolume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Expand/collapse sounds */}
        <button
          type="button"
          className={clsx('env-btn expand-btn', { active: expanded || activeSound !== 'none' })}
          onClick={() => setExpanded(e => !e)}
          title="Ambient sounds"
          aria-label={expanded ? 'Hide ambient sounds' : 'Show ambient sounds'}
          aria-expanded={expanded}
        >
          <span className="active-sound-emoji">
            {activeSound !== 'none' ? activeLabel?.icon : '🎵'}
          </span>
          {expanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>

      {/* Volume slider */}
      {showVolumeSlider && (
        <div className="ambient-volume-row">
          <VolumeX size={14} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          <input
            type="range"
            min="0" max="100"
            value={ambientVolume}
            onChange={e => handleVolumeChange(parseInt(e.target.value))}
            onMouseDown={() => setDraggingVolume(true)}
            onMouseUp={() => setDraggingVolume(false)}
            onTouchStart={() => setDraggingVolume(true)}
            onTouchEnd={() => setDraggingVolume(false)}
            className={clsx('ambient-vol-slider', { dragging: draggingVolume })}
            style={{ '--progress': `${ambientVolume}%` }}
            aria-label="Ambient volume"
          />
          <Volume2 size={14} style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
          <span className="ambient-vol-label">{ambientVolume}%</span>
        </div>
      )}

      {/* Sound grid */}
      {expanded && (
        <div className="sound-grid">
          {AMBIENT_SOUNDS.map(sound => (
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
      )}
    </div>
  );
};

export default AmbientPanel;
