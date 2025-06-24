import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import 'UI/Global.css';
import { DeviceUnknown, Hd, Landscape, Map, SaveAlt, Sd, SignalCellularNodata } from '@mui/icons-material';
import { InvasivesMapLayerDefinition } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

type PrimaryLayerSelectProps = {
  layers: InvasivesMapLayerDefinition[];
  selectedLayer: string;
  selectLayer: (layer: InvasivesMapLayerDefinition) => void;
};

const PrimaryLayerSelect = ({ layers, selectedLayer, selectLayer }: PrimaryLayerSelectProps) => {
  // const offlineDefinitions = useSelector((state) => state.TileCache?.mapSpecifications) ?? [];

  const [toolTip, setToolTip] = useState('');

  function renderIcon(def: InvasivesMapLayerDefinition) {
    switch (def.icon) {
      case 'Hd':
        return <Hd />;
      case 'Sd':
        return <Sd />;
      case 'Landscape':
        return <Landscape />;
      case 'Map':
        return <Map />;
      case 'Offline':
        return <SignalCellularNodata />;
      case 'OfflineVector':
        return <Landscape />;
      case 'OfflineSatellite':
        return <Sd />;
      case 'Cached':
        return <SaveAlt />;
      case 'N/A':
      default:
        return <DeviceUnknown />;
    }
  }

  return (
    <div className={'basemap-btn-group'}>
      {layers.map((l) => {
        return (
          <div className={selectedLayer == l.name ? 'selected' : ''} key={l.name}>
            <Tooltip
              open={toolTip == l.name}
              onMouseEnter={() => setToolTip(l.name)}
              onMouseLeave={() => setToolTip('')}
              classes={{ tooltip: 'toolTip' }}
              title={l.tooltip}
              placement="top-end"
            >
              <IconButton
                className={'basemap-btn'}
                onClick={() => {
                  setToolTip(l.name);
                }}
              >
                {renderIcon(l)}
              </IconButton>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export type { PrimaryLayerSelectProps };
export default PrimaryLayerSelect;
