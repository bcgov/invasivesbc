import mapLayers from './mapLayers';

const LayerSourcesTable = () => {
  return (
    <div id="layer-source-table">
      <table>
        <thead>
          <tr>
            <th>Layer Picker Label</th>
            <th>Object Name</th>
          </tr>
        </thead>
        <tbody>
          {mapLayers.map((layer) => (
            <tr key={layer.objectName}>
              <td>{layer.layerPickerLabel}</td>
              <td>{layer.objectName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LayerSourcesTable;
