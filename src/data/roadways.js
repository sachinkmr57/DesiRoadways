import haryanaInterior from '../assets/haryana_bus_interior_masked.png';
import upInterior from '../assets/up_bus_interior_masked.png';
import punjabInterior from '../assets/punjab_bus_interior_masked.png';
import mpInterior from '../assets/mp_bus_interior_masked.png';
import biharInterior from '../assets/bihar_bus_interior_masked.png';
import rajasthanInterior from '../assets/rajasthan_bus_interior_masked.png';

export const ROADWAYS = [
  {
    id: 'haryana',
    name: 'Haryana Roadways',
    localName: 'हरियाणा रोडवेज',
    playlistId: 'PLa0lLeBZ2zikvsewH6pnLwi0bzeht30-4',
    interior: haryanaInterior,
    accent: '#ff4757',
  },
  {
    id: 'up',
    name: 'UP Roadways',
    localName: 'उत्तर प्रदेश परिवहन',
    // Salim Barber Shop (90s Bangers)
    playlistId: 'PLF22QdnT4yIOw_WttQFnR88DpniCT5mZk',
    interior: upInterior,
    accent: '#3b6ea5',
  },
  {
    id: 'punjab',
    name: 'Punjab Roadways',
    localName: 'ਪੰਜਾਬ ਰੋਡਵੇਜ਼',
    playlistId: 'PL22cE9yxZwJvRXcU-VtW7xh9I0TfxD0yq',
    interior: punjabInterior,
    accent: '#2d8a4e',
  },
  {
    id: 'mp',
    name: 'MP Roadways',
    localName: 'मध्य प्रदेश परिवहन',
    // Truck driver's 90s evergreen songs
    playlistId: 'PLPddStlYRHyBtoNXPPULBeE9sOFPtBHOL',
    interior: mpInterior,
    accent: '#c45c26',
  },
  {
    id: 'bihar',
    name: 'Bihar Roadways',
    localName: 'बिहार राज्य पथ परिवहन',
    // 90s truck-driver cassette rotation
    playlistId: 'PLTUHprxV-ZVWRaCOrtsCLRYwvekz09Zfu',
    interior: biharInterior,
    accent: '#2a5aa8',
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan Roadways',
    localName: 'राजस्थान परिवहन',
    // Elite Bus / Auto / Barber Collection
    playlistId: 'PLfdfb0LKtKKs8IcyIvtsf_FfmJU-1pbI1',
    interior: rajasthanInterior,
    accent: '#b45309',
  },
];

export const DEFAULT_ROADWAY_ID = 'haryana';

export const getRoadwayById = (id) =>
  ROADWAYS.find((r) => r.id === id) || ROADWAYS[0];
