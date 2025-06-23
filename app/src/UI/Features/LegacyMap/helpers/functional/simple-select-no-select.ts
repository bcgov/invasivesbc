import MapboxDraw from '@mapbox/mapbox-gl-draw';

const SimpleSelect = MapboxDraw.modes.simple_select;

const SimpleSelectNoSelect = {
  ...SimpleSelect,

  onClick(state, e) {
    // Prevent selecting features on click
    return;
  },

  onTap(state, e) {
    // Prevent selecting features on tap (mobile)
    return;
  },

  onMouseMove(state, e) {
    // Optional: disable hover effects
    return;
  }
};

export default SimpleSelectNoSelect;
