import { IconButton } from '@mui/material';
import { DeviceUnknown, Hd, Landscape, Map, SaveAlt, Sd, SignalCellularNodata } from '@mui/icons-material';
import { InvasivesMapLayerDefinitionWithState } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import { useSelector } from 'utils/use_selector';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';

type PrimaryLayerSelectProps = {
  layers: InvasivesMapLayerDefinitionWithState[];
  selectLayer: (layer: string) => void;
};

const PrimaryLayerSelect = ({ layers, selectLayer }: PrimaryLayerSelectProps) => {
  const DEBUG = useSelector((state) => state.Configuration.current.build.DEBUG);

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
        .filter((l) => (DEBUG || l.mode === 'basemap') && l.selectionMode === 'primary-selector')
        .map((l) => (
          <div className={l.active ? 'selected' : ''} key={l.name}>
            <HoverTooltip tooltipText={l.tooltip}>
              <IconButton className={'basemap-btn'} onClick={() => selectLayer(l.name)}>
                {renderIcon(l)}
              </IconButton>
            </HoverTooltip>
          </div>
        ))}
    </div>
  );
};

export type { PrimaryLayerSelectProps };
export default PrimaryLayerSelect;
