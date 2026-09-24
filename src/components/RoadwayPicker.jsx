import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { ROADWAYS, getRoadwayById } from '../data/roadways';

const RoadwayPicker = ({ activeId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const active = getRoadwayById(activeId);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (id) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <div
      className={clsx('roadway-picker glass-panel', { open })}
      ref={rootRef}
      style={{ '--roadway-accent': active.accent }}
    >
      <button
        type="button"
        className="roadway-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose roadway"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="roadway-trigger-text">
          <span className="roadway-option-name">{active.name}</span>
          <span className="roadway-option-local">{active.localName}</span>
        </span>
        <ChevronDown size={16} className={clsx('roadway-chevron', { open })} />
      </button>

      {open && (
        <div className="roadway-menu" role="listbox" aria-label="Roadways">
          {ROADWAYS.map((roadway) => {
            const selected = roadway.id === activeId;
            return (
              <button
                key={roadway.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={clsx('roadway-option', { active: selected })}
                style={selected ? { '--roadway-accent': roadway.accent } : undefined}
                onClick={() => select(roadway.id)}
              >
                <span className="roadway-option-name">{roadway.name}</span>
                <span className="roadway-option-local">{roadway.localName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoadwayPicker;
