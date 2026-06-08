import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import 'UI/Global.css';
import { DeviceUnknown, Hd, Landscape, Map, SaveAlt, Sd, SignalCellularNodata } from '@mui/icons-material';
import { InvasivesMapLayerDefinitionWithState } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import { useSelector } from 'utils/use_selector';
import { Platform } from 'state/configuration/build-time-config';

type PrimaryLayerSelectProps = {
  layers: InvasivesMapLayerDefinitionWithState[];
  selectLayer: (layer: string) => void;
};

const PrimaryLayerSelect = ({ layers, selectLayer }: PrimaryLayerSelectProps) => {
  const [toolTip, setToolTip] = useState('');

  const DEBUG = useSelector((state) => state.Configuration.current.build.DEBUG);
  const IOS = useSelector((state) => state.Configuration.current.build.PLATFORM === Platform.IOS);

  function renderIcon(def: InvasivesMapLayerDefinitionWithState) {
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
      {layers
        .filter((l) => l.mode === 'basemap' && l.selectionMode === 'primary-selector')
        .map((l) => {
          return (
            <div className={l.active ? 'selected' : ''} key={l.name}>
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
                    selectLayer(l.name);
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
