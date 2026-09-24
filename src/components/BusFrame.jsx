import React from 'react';

const BusFrame = ({ interiorSrc }) => {
  return (
    <div className="bus-frame-container">
      {/* Transparent PNG — road animation shows through keyed windows */}
      <div
        className="bus-interior-img"
        style={{ backgroundImage: `url(${interiorSrc})` }}
      />
    </div>
  );
};

export default BusFrame;
