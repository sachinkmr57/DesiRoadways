import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import CanvasRoad from './components/CanvasRoad';
import BusFrame from './components/BusFrame';
import MusicPlayer from './components/MusicPlayer';
import RainEffect from './components/RainEffect';
import AmbientPanel from './components/AmbientPanel';
import RegionSelector from './components/RegionSelector';
import { DEFAULT_REGION_ID, getRegionById } from './data/roadways';
import './App.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRainEnabled, setIsRainEnabled] = useState(false);
  const [environment, setEnvironment] = useState('day'); // 'day' | 'night'
  const [playerInstance, setPlayerInstance] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState(DEFAULT_REGION_ID);
  const playerRef = useRef(null);

  const selectedRegion = getRegionById(selectedRegionId);

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

  const handleSelectRegion = (regionId) => {
    if (regionId === selectedRegionId) return;
    setSelectedRegionId(regionId);
    setIsPlaying(false);
    setPlayerInstance(null);
  };

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: selectedRegion.playlistId,
      autoplay: 0,
    },
  };

  return (
    <div className="app-container">
      {/* Invisible YouTube Player */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <YouTube key={selectedRegion.id} opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />
      </div>

      <CanvasRoad environment={environment} />

      <RainEffect isRainEnabled={isRainEnabled} />

      <BusFrame region={selectedRegion} />

      {/* Top Left: Region Selector */}
      <RegionSelector selectedRegionId={selectedRegionId} onSelectRegion={handleSelectRegion} />

      {/* Bottom Right: Lights & Ambient Sound Panel */}
      <AmbientPanel
        environment={environment}
        onToggleEnvironment={setEnvironment}
        isRainEnabled={isRainEnabled}
        onToggleRain={(v) => setIsRainEnabled(v)}
      />

      {/* Bottom Center Music Player */}
      <MusicPlayer 
        playerInstance={playerInstance}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
      />
    </div>
  );
}

export default App;
