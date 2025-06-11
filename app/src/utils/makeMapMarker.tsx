import { MutableRefObject } from 'react';
import { RecordSetType } from 'interfaces/UserRecordSet';
import maplibregl, { Popup } from 'maplibre-gl';

/**
 * @desc Created Marker Element to use on the Map.
 * @param image /path/to/image
 * @param classes Class names to apply to marker
 * @returns <div>
 *            <image src={image} />
 *          </div>
 */
const makeMarkerElement = (image: string, classes: string) => {
  const main = document.createElement('div');
  main.className = classes;
  const img = document.createElement('img');
  img.src = image;
  main.appendChild(img);
  return main;
};

/**
 * Reusable Handler for Populating Marker Popup Menus.
 * We can't use React components so the components are generated in a vanilla JS way.
 * @param markerRef Marker reference. Needed for the clear option to work
 * @param { string | number } [id] ID displayed in Menu
 * @param { RecordSetType }   [recordType] Type of Record
 * @returns <div>
 *              {ID && <p>Prefix: ID</p>}
 *              <button> </button>
 *          <div>
 */
const markerPopoverContents = (
  markerRef: MutableRefObject<maplibregl.Marker | undefined>,
  id?: string | number,
  recordType?: RecordSetType
) => {
  const main = document.createElement('div');
  if (id) {
    const p = document.createElement('p');
    p.innerHTML = (() => {
      switch (recordType) {
        case RecordSetType.Activity:
          return `<span>Record ID</span>: ${id}`;
        case RecordSetType.IAPP:
          return `<span>Site ID</span>: ${id}`;
        default:
          return id.toString();
      }
    })();
    main.appendChild(p);
  }
  const button = document.createElement('button');
  button.className = 'marker-close-button';
  button.innerHTML = 'Remove Marker';
  button.addEventListener('click', () => markerRef?.current?.remove());
  main.appendChild(button);
  return main;
};

interface IMarkerOptions {
  ref: MutableRefObject<maplibregl.Marker | undefined>;
  classes?: string;
  id?: string | number;
  recordType?: RecordSetType;
}
interface IMarkerOptionsIcon extends IMarkerOptions {
  iconSrc: string;
}
interface IMarkerSupplyMarker extends IMarkerOptions {
  marker: maplibregl.Marker;
}
/**
 * Creates a Map Marker With removable Popup Menu using supplied options
 * @param options Configuration
 * @returns Maplibre Map Marker
 */
const makeMapMarker = (options: IMarkerOptionsIcon | IMarkerSupplyMarker) => {
  const { ref, classes = '', id, recordType } = options;
  const newMarker =
    'marker' in options
      ? options.marker
      : new maplibregl.Marker({
          element: makeMarkerElement(options.iconSrc, classes)
        });

  newMarker.setPopup(
    new Popup({
      closeButton: false,
      closeOnMove: true,
      className: 'map-marker-popup'
    }).setDOMContent(markerPopoverContents(ref, id, recordType))
  );
  const element = newMarker.getElement();
  // Touch doesn't work as expected so manually enter a command to bridge the gap
  element.addEventListener('touchend', () => element.click());
  return newMarker;
};

export { makeMapMarker, markerPopoverContents, makeMarkerElement };
