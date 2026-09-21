import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import CanvasRoad from './components/CanvasRoad';
import BusFrame from './components/BusFrame';
import MusicPlayer from './components/MusicPlayer';
import RainEffect from './components/RainEffect';
import AmbientPanel from './components/AmbientPanel';
import './App.css';

// User's requested playlist
const PLAYLIST_ID = 'PLa0lLeBZ2zikvsewH6pnLwi0bzeht30-4';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRainEnabled, setIsRainEnabled] = useState(false);
  const [environment, setEnvironment] = useState('day'); // 'day' | 'night'
  const [playerInstance, setPlayerInstance] = useState(null);
  const playerRef = useRef(null);

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    setPlayerInstance(event.target);
    playerRef.current.setVolume(50);
  };

  const onStateChange = (event) => {
    // 1 is PLAYING, 2 is PAUSED
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const nextTrack = () => playerRef.current && playerRef.current.nextVideo();
  const prevTrack = () => playerRef.current && playerRef.current.previousVideo();

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: PLAYLIST_ID,
      autoplay: 0,
    },
  };

  return (
    <div className="app-container">
      {/* Invisible YouTube Player */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <YouTube opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />
      </div>

      <CanvasRoad environment={environment} />
      
      <RainEffect isRainEnabled={isRainEnabled} />
      
      <BusFrame />

      <div className="hud-stack">
        <AmbientPanel
          environment={environment}
          onToggleEnvironment={setEnvironment}
          isRainEnabled={isRainEnabled}
          onToggleRain={(v) => setIsRainEnabled(v)}
        />

        <MusicPlayer
          playerInstance={playerInstance}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onNext={nextTrack}
          onPrev={prevTrack}
        />
      </div>
    </div>
  );
}

export default App;
