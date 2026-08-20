export const PLAYLIST_ID = 'PLa0lLeBZ2zikvsewH6pnLwi0bzeht30-4';

export const REGIONS = [
  {
    id: 'haryana',
    name: 'Haryana',
    corporation: 'Haryana Roadways',
    badge: 'HR',
    livery: { primary: '#4E7A6B', secondary: '#C9A66B' },
    tint: null,
    playlistId: PLAYLIST_ID,
    busInteriorImage: null,
  },
  {
    id: 'punjab',
    name: 'Punjab',
    corporation: 'Punjab Roadways',
    badge: 'PB',
    livery: { primary: '#1B7A3D', secondary: '#FFFFFF' },
    tint: { hueRotate: -45, saturate: 1.2, brightness: 1.02, contrast: 1, sepia: 0 },
    playlistId: PLAYLIST_ID,
    busInteriorImage: null,
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    corporation: 'RSRTC',
    badge: 'RJ',
    livery: { primary: '#D6336C', secondary: '#6C757D' },
    tint: { hueRotate: 100, saturate: 0.9, brightness: 1.08, contrast: 1.05, sepia: 0.1 },
    playlistId: PLAYLIST_ID,
    busInteriorImage: null,
  },
  {
    id: 'up',
    name: 'Uttar Pradesh',
    corporation: 'UPSRTC',
    badge: 'UP',
    livery: { primary: '#FF7722', secondary: '#FFFFFF' },
    tint: { hueRotate: 140, saturate: 0.9, brightness: 1.05, contrast: 1, sepia: 0.25 },
    playlistId: PLAYLIST_ID,
    busInteriorImage: null,
  },
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    corporation: 'HRTC',
    badge: 'HP',
    livery: { primary: '#2E7D32', secondary: '#FFFFFF' },
    tint: { hueRotate: -25, saturate: 1.05, brightness: 1.1, contrast: 1.03, sepia: 0 },
    playlistId: PLAYLIST_ID,
    busInteriorImage: null,
  },
  {
    id: 'delhi',
    name: 'Delhi',
    corporation: 'DTC',
    badge: 'DL',
    livery: { primary: '#C1272D', secondary: '#2E7D32' },
    tint: { hueRotate: -150, saturate: 1.1, brightness: 0.95, contrast: 1.08, sepia: 0 },
    playlistId: PLAYLIST_ID,
    busInteriorImage: null,
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    corporation: 'MSRTC',
    badge: 'MH',
    livery: { primary: '#B5292F', secondary: '#F0E6D2' },
    tint: { hueRotate: -170, saturate: 1.25, brightness: 1.02, contrast: 1.05, sepia: 0.1 },
    playlistId: PLAYLIST_ID,
    busInteriorImage: null,
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    corporation: 'Karnataka SRTC',
    badge: 'KA',
    livery: { primary: '#1E88E5', secondary: '#FFFFFF' },
    tint: { hueRotate: 15, saturate: 1.15, brightness: 1.08, contrast: 1, sepia: 0 },
    playlistId: PLAYLIST_ID,
    busInteriorImage: null,
  },
];

export const DEFAULT_REGION_ID = 'haryana';

export const getRegionById = (id) =>
  REGIONS.find((r) => r.id === id) ?? REGIONS.find((r) => r.id === DEFAULT_REGION_ID);
