import { buildTimeConfig } from 'state/configuration/build-time-config';

// available from CDN, but not in asset pack
const VECTOR_MAP_FONT_FACE = buildTimeConfig.MOBILE ? 'Noto Sans Bold' : 'Open Sans Bold';

export default VECTOR_MAP_FONT_FACE;
