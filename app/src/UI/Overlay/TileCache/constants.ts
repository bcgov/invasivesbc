export const DOWNLOAD_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GiB

// seems to be about right for this dataset
export const APPROX_SIZE_PER_TILE = 15 * 1024;

export const AVAILABLE_ZOOMS = [
  {
    value: 12,
    label: 'Zoom 12',
    scale: '1:150,000'
  },
  {
    value: 14,
    label: 'Zoom 14',
    scale: '1:35,000'
  },
  {
    value: 16,
    label: 'Zoom 16',
    scale: '1:8,000'
  },
  {
    value: 18,
    label: 'Zoom 18',
    scale: '1:2,000'
  },
  {
    value: 20,
    label: 'Zoom 20',
    scale: '1:500'
  }
];
