// ---------------------------------------------------------------------------
// Data-driven floor list. To change level layout / difficulty / theme,
// edit this file — the FloorScene reads everything from here.
// ---------------------------------------------------------------------------

export const WORLD = {
  width: 1600, // per-floor level width in pixels (side-scrolling)
  height: 270, // matches base game height
  groundHeight: 32
};

export const FLOORS = [
  {
    id: 1,
    name: 'Lobby',
    theme: 'white',
    bg: 0xf5f5f0,
    ground: 0xcfcfc8,
    accent: 0xb8b8b0,
    hasCombat: false,
    enemies: { spider: 0, mob: 0 },
    intro: 'Welcome to Skillwill Tower. Head right to the elevator.'
  },
  { id: 2, name: 'Floor 2', theme: 'red', bg: 0x5c1414, ground: 0x8a2020, accent: 0xc0392b, hasCombat: true, enemies: { spider: 2, mob: 1 } },
  { id: 3, name: 'Floor 3', theme: 'red', bg: 0x5c1414, ground: 0x8a2020, accent: 0xc0392b, hasCombat: true, enemies: { spider: 3, mob: 1 } },
  { id: 4, name: 'Floor 4', theme: 'blue', bg: 0x123049, ground: 0x1b4a70, accent: 0x2980b9, hasCombat: true, enemies: { spider: 3, mob: 2 } },
  { id: 5, name: 'Floor 5', theme: 'blue', bg: 0x123049, ground: 0x1b4a70, accent: 0x2980b9, hasCombat: true, enemies: { spider: 3, mob: 2 } },
  { id: 6, name: 'Floor 6', theme: 'yellow', bg: 0x5c4e0f, ground: 0x8a7317, accent: 0xf1c40f, hasCombat: true, enemies: { spider: 4, mob: 2 } },
  { id: 7, name: 'Floor 7', theme: 'yellow', bg: 0x5c4e0f, ground: 0x8a7317, accent: 0xf1c40f, hasCombat: true, enemies: { spider: 4, mob: 2 } },
  { id: 8, name: 'Floor 8', theme: 'purple', bg: 0x371a41, ground: 0x522862, accent: 0x8e44ad, hasCombat: true, enemies: { spider: 4, mob: 3 } },
  { id: 9, name: 'Floor 9', theme: 'purple', bg: 0x371a41, ground: 0x522862, accent: 0x8e44ad, hasCombat: true, enemies: { spider: 4, mob: 3 } },
  // Second yellow zone (intentional per design) — a slightly different amber
  // shade so it reads as its own zone while staying clearly "yellow".
  { id: 10, name: 'Floor 10', theme: 'amber', bg: 0x5c3a0f, ground: 0x8a5817, accent: 0xf39c12, hasCombat: true, enemies: { spider: 5, mob: 3 } },
  { id: 11, name: 'Floor 11', theme: 'amber', bg: 0x5c3a0f, ground: 0x8a5817, accent: 0xf39c12, hasCombat: true, enemies: { spider: 5, mob: 3 } },
  {
    id: 12,
    name: 'Office',
    theme: 'office',
    bg: 0x22303f,
    ground: 0x2c3e50,
    accent: 0x34495e,
    hasCombat: false,
    enemies: { spider: 0, mob: 0 },
    intro: 'Kosta’s office. He is waiting for you upstairs, on the balcony.'
  },
  {
    id: 13,
    name: 'Balcony',
    theme: 'balcony',
    bg: 0x87ceeb,
    ground: 0x6d6d6d,
    accent: 0xffffff,
    hasCombat: true,
    isBoss: true,
    enemies: { spider: 0, mob: 0 },
    intro: 'Kosta blocks the way. Defeat him.'
  }
];

export function getFloor(id) {
  return FLOORS.find(f => f.id === id);
}

export function nextFloorId(id) {
  const idx = FLOORS.findIndex(f => f.id === id);
  if (idx === -1 || idx === FLOORS.length - 1) return null;
  return FLOORS[idx + 1].id;
}
