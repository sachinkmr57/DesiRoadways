import React from 'react';
import busInteriorBase from '../assets/haryana_bus_interior_masked.png';

const buildFilter = (tint) => {
  if (!tint) return 'none';
  const { hueRotate = 0, saturate = 1, brightness = 1, contrast = 1, sepia = 0 } = tint;
  return `hue-rotate(${hueRotate}deg) saturate(${saturate}) brightness(${brightness}) contrast(${contrast}) sepia(${sepia})`;
};

const BusFrame = ({ region }) => {
  const imageSrc = region?.busInteriorImage || busInteriorBase;
  const filter = buildFilter(region?.tint);

  return (
    <div className="bus-frame-container">
      {/* Transparent PNG — road animation shows through keyed windows */}
      <div
        className="bus-interior-img"
        style={{ backgroundImage: `url(${imageSrc})`, filter }}
      />
    </div>
  );
};

export default BusFrame;
