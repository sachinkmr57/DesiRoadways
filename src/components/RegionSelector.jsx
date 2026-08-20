import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { REGIONS, getRegionById } from '../data/roadways';

const RegionSelector = ({ selectedRegionId, onSelectRegion }) => {
  const [expanded, setExpanded] = useState(false);
  const activeRegion = getRegionById(selectedRegionId);

  return (
    <div className="region-panel glass-panel">
      <button
        type="button"
        className={clsx('region-toggle', { active: expanded })}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span
          className="region-toggle-badge"
          style={{ backgroundColor: activeRegion.livery.primary }}
        >
          {activeRegion.badge}
        </span>
        <span className="region-toggle-label">{activeRegion.corporation}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="region-grid">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              type="button"
              className={clsx('region-chip', { active: region.id === selectedRegionId })}
              onClick={() => {
                onSelectRegion(region.id);
                setExpanded(false);
              }}
              title={region.corporation}
            >
              <span className="region-chip-dot" style={{ backgroundColor: region.livery.primary }} />
              <span className="region-chip-label">{region.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegionSelector;
