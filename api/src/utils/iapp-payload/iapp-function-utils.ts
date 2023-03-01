export const densityMap = {
  '0: Unknown Density': 'X',
  '1: Low (<= 1 plant/m2)': 'L',
  '2: Med (2-5 plants/m2)': 'M',
  '3: High (6-10 plants/m2)': 'H',
  '4: Dense (>10 plants/m2)': 'D'
};

export const distributionMap = {
  '0: Unknown distribution': 'NA',
  '1: rare individual / single occurrence': 'RS',
  '2: few sporadically': 'FS',
  '3: single patch or clump': 'CL',
  '4: several sporadically individuals': 'SS',
  '5: a few patches or clumps': 'FP',
  '6: several well-spaced patches / clumps': 'WS',
  '7: continuous / uniform': 'CU',
  '8: continuous with a few gaps': 'CO',
  '9: continuous / dense': 'CD'
};

export const mapSlope = (slope) => {
  if (slope === '') return 'NA';
  slope = Number(slope);
  if (!slope) return '';
  if (slope < 5) return 'NF';
  if (slope < 10) return 'GS';
  if (slope < 15) return 'MS';
  if (slope < 20) return 'SS';
  if (slope < 25) return 'VS';
  if (slope < 30) return 'ES';
  if (slope < 45) return 'ST';
  if (slope >= 45) return 'VT';
  return 'NA';
};

export const mapAspect = (aspect) => {
  aspect = Number(aspect);
  if (!aspect) return '';
  if ((aspect > 333.5 && aspect <= 360) || aspect <= 22.5) return 'N';
  if (aspect <= 67.5) return 'NE';
  if (aspect <= 112.5) return 'E';
  if (aspect <= 157.5) return 'SE';
  if (aspect <= 202.5) return 'S';
  if (aspect <= 247.5) return 'SW';
  if (aspect <= 292.5) return 'W';
  if (aspect <= 333.5) return 'NW';
  return 'NA';
};

export const mapTankMix = (mix) => {
  if (mix === 'Y') return 'Yes';
  if (!mix) return 'No';
  if (mix === '') return 'No';
  return 'No';
};
