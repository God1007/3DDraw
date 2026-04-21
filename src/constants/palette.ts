export const CRAYON_COLORS = [
  { name: 'Red', value: '#ef476f' },
  { name: 'Orange', value: '#f78c35' },
  { name: 'Yellow', value: '#ffd166' },
  { name: 'Light Green', value: '#9adf6d' },
  { name: 'Green', value: '#43aa5c' },
  { name: 'Cyan', value: '#48c6c2' },
  { name: 'Light Blue', value: '#7cc7ff' },
  { name: 'Blue', value: '#3a86ff' },
  { name: 'Purple', value: '#8e6ad8' },
  { name: 'Pink', value: '#ff86c8' },
  { name: 'Brown', value: '#9c6644' },
  { name: 'Black', value: '#2d2a32' },
] as const;

export const DEFAULT_COLOR = CRAYON_COLORS[0].value;
