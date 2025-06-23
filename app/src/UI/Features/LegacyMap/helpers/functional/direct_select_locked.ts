import MapboxDraw from '@mapbox/mapbox-gl-draw';

const DirectSelect = MapboxDraw.modes.direct_select;
const DirectSelectLocked = {
  ...DirectSelect,

  onClick(state, e) {
    // Prevent exiting edit mode when clicking outside the feature
    const isFeatureClick = e.featureTarget || e.features?.length > 0;

    if (isFeatureClick && typeof DirectSelect.onClick === 'function') {
      return DirectSelect.onClick.call(this, state, e);
    }

    // Do nothing if clicked outside
    return;
  },

  onTap(state, e) {
    // Prevent exiting edit mode when clicking outside the feature
    const isFeatureClick = e.featureTarget || e.features?.length > 0;

    if (isFeatureClick && typeof DirectSelect.onTap === 'function') {
      return DirectSelect.onTap.call(this, state, e);
    }

    // Do nothing if clicked outside
    return;
  }
};

export default DirectSelectLocked;
