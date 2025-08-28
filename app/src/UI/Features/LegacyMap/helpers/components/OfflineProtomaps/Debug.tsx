import { useDispatch, useSelector } from 'utils/use_selector';
import { Button, Modal } from '@mui/material';
import { OfflineProtomapsActions } from 'state/actions/offlineProtomaps';

import './OfflineProtomaps.css';
import OfflineMaps, { DownloadRequestCallback, OfflineMapRecord } from 'utils/offline-protomaps/capacitor';
import { useCallback, useRef, useState } from 'react';

const Debug = () => {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.Map.offlineProtomaps.debugPanelOpen);

  const plugin = OfflineMaps;
  const [log, setLog] = useState<string[]>([]);
  const mutLogs = useRef<string[]>([]);

  const [pluginRasters, setPluginRasters] = useState<OfflineMapRecord[]>([]);
  const [pluginVectors, setPluginVectors] = useState<OfflineMapRecord[]>([]);

  const reportDownloadProgress: DownloadRequestCallback = useCallback((message) => {
    if (!message) {
      return;
    }
    mutLogs.current.push(JSON.stringify(message));

    setLog([...mutLogs.current]);
  }, []);

  const refresh = async () => {
    const { rasters, vectors } = await plugin.listDownloads({});
    setPluginVectors(vectors);
    setPluginRasters(rasters);
  };

  return (
    <Modal
      className={'offline-protomaps-debug'}
      open={open}
      hideBackdrop
      onClose={() => {
        dispatch(OfflineProtomapsActions.setDebugPanelState(false));
      }}
    >
      <div>
        <h4>Offline Protomaps</h4>
        <Button
          variant="outlined"
          onClick={async () => {
            console.dir(
              await plugin.requestDownload(
                {
                  type: 'vector',
                  format: 'pmtiles',
                  name: `protomaps-${Date.now()}`,
                  url: 'https://nrs.objectstore.gov.bc.ca/rzivsz/invasives-prod.pmtiles',
                  metadata: JSON.stringify({
                    bbox: {
                      recordSetId: Math.floor(Math.random() * 100000),
                      comment: 'some metadata we need to save for this map',
                      minX: 1,
                      minY: 2,
                      maxX: 3,
                      maxY: 4
                    }
                  })
                },
                reportDownloadProgress
              )
            );
          }}
        >
          Request Download
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            refresh();
          }}
        >
          List Local Files (Native)
        </Button>
        <table>
          <thead>
            <th>Type</th>
            <th>Filename</th>
            <th>Metadata</th>
            <th>Actions</th>
          </thead>
          {pluginVectors.map((f) => (
            <tr key={f.name}>
              <td>Vector Map</td>
              <td>{f.name}</td>
              <td className={'json'}>{f.metadata}</td>
              <td>
                <Button
                  onClick={() => {
                    OfflineMaps.delete({ type: 'vectors', name: f.name }).then(() => {
                      refresh();
                    });
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {pluginRasters.map((f) => (
            <tr key={f.name}>
              <td>Raster Map</td>
              <td>{f.name}</td>
              <td className={'json'}>{f.metadata}</td>
              <Button
                onClick={() => {
                  OfflineMaps.delete({ type: 'rasters', name: f.name }).then(() => refresh());
                }}
              >
                Delete
              </Button>
            </tr>
          ))}
        </table>
        <div className={'messages'}>
          <h5>Debug Messages from Capacitor</h5>
          <ol>
            {log.map((l, idx) => (
              <li key={idx}>{l}</li>
            ))}
          </ol>
        </div>
        <hr />
        <Button
          onClick={() => {
            dispatch(OfflineProtomapsActions.setDebugPanelState(false));
          }}
        >
          Close Pane
        </Button>
      </div>
    </Modal>
  );
};

export default Debug;
