import React from 'react';
import busInterior from '../assets/haryana_bus_interior_masked.png';

const BusFrame = () => {
  return (
    <div className="bus-frame-container">
      {/* Transparent PNG — road animation shows through keyed windows */}
      <div
        className="bus-interior-img"
        style={{ backgroundImage: `url(${busInterior})` }}
      />
    </div>
  );
};

export default BusFrame;
