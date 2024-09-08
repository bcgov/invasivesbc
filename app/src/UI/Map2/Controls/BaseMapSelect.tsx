import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import { MAP_CHOOSE_BASEMAP } from 'state/actions';
import 'UI/Global.css';
import { MAP_DEFINITIONS } from 'UI/Map2/constants';
import {
  DeviceUnknown,
  DownloadForOffline,
  Hd,
  Landscape,
  Map,
  OfflineBolt,
  OfflinePin,
  OfflineShare,
  Sd,
  SignalCellular0Bar,
  SignalCellularNodata,
  SignalCellularNullOutlined
} from '@mui/icons-material';

export const BaseMapSelect = () => {
  const dispatch = useDispatch();

  const { baseMapLayer, availableBaseMapLayers } = useSelector((state) => state.Map);

  const [toolTip, setToolTip] = useState('');

  function renderIcon(def) {
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
      case 'N/A':
      default:
        return <DeviceUnknown />;
    }
  }

  return (
    <div className={'basemap-btn-group'}>
      {availableBaseMapLayers.map((l) => {
        const found = MAP_DEFINITIONS.find((d) => d.name == l);
        if (!found) {
          return;
        }

        return (
          <div className={baseMapLayer == l ? 'selected' : ''} key={l}>
            <Tooltip
              open={toolTip == l}
              onMouseEnter={() => setToolTip(l)}
              onMouseLeave={() => setToolTip('')}
              classes={{ tooltip: 'toolTip' }}
              title={found.tooltip}
              placement="top-end"
            >
              <span>
                <IconButton
                  className={'button'}
                  onClick={() => {
                    dispatch({ type: MAP_CHOOSE_BASEMAP, payload: l });
                  }}
                >
                  {renderIcon(found)}
                </IconButton>
              </span>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};
