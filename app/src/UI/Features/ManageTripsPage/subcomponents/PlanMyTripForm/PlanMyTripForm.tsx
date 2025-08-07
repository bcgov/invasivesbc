import { Button } from '@mui/material';
import './planMyTripForm.css';
import { Draw } from '@mui/icons-material';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import { IPlanMyTripCacheStatuses } from 'utils/plan-my-trip-cache';
import MapSlider from 'UI/Features/TileCache/MapSlider';
import { useDispatch, useSelector } from 'utils/use_selector';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import PlanMyTrip, { ICreateMyTrip } from 'state/actions/planMyTrip/PlanMyTrip';
import { AVAILABLE_ZOOMS } from 'UI/Features/TileCache/constants';

interface CacheOption {
  tooltip: string;
  name: keyof IPlanMyTripCacheStatuses | 'all';
  labelText: string;
}

const PlanMyTripForm = () => {
  const CACHE_OPTIONS: Array<CacheOption> = [
    {
      tooltip: 'Creates an IAPP Recordset with your drawn region as the primary filter',
      name: 'iappRecordset',
      labelText: 'IAPP Records'
    },
    {
      tooltip: 'Creates an InvasivesBC Recordset with your drawn region as the primary filter',
      name: 'activityRecordset',
      labelText: 'InvasivesBC Records'
    },
    {
      tooltip: 'Get locations of recorded groundwater wells in your region for use with Chemical Treatment forms',
      name: 'wellData',
      labelText: 'Well Data'
    },
    {
      tooltip: 'Download Maps available offline for your drawn region',
      name: 'mapTiles',
      labelText: 'Offline Maps'
    }
  ];

  // Clear current shape and set draw tools to Polygon.
  const handleDrawRegion = () => {
    deleteRef.current?.click();
    drawPolygonRef?.current?.click();
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setTripName(e.target.value);

  const handleSelectionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserSelectedCaches((prev) => ({
      ...prev,
      [e.target.name]: !prev[e.target.name]
    }));
  };

  const handleSubmit = () => {
    const request: ICreateMyTrip = {
      name: tripName,
      iapp: userSelectedCaches.iappRecordset,
      activities: userSelectedCaches.activityRecordset,
      wellData: userSelectedCaches.wellData,
      wmsLayers: userSelectedCaches.wmsLayer
    };
    if (userSelectedCaches.mapTiles) {
      request.zoom = mapZoomLevel;
    }
    dispatch(PlanMyTrip.create(request));
    setTripName('');
  };

  const dispatch = useDispatch();

  const deleteRef = useRef<HTMLButtonElement>(
    document.getElementsByClassName('mapbox-gl-draw_trash')?.[0] as HTMLButtonElement
  );
  const drawPolygonRef = useRef<HTMLButtonElement>(
    document.getElementsByClassName('mapbox-gl-draw_polygon')?.[0] as HTMLButtonElement
  );

  const planMyTripRegion = useSelector((state) => state.PlanMyTrip?.drawnShape);

  const [tripName, setTripName] = useState<string>('');
  const [formValid, setFormValid] = useState<boolean>(false);
  const [mapZoomLevel, setMapZoomLevel] = useState<number>(AVAILABLE_ZOOMS[0].value);
  const [isOversizedTileDownload, setIsOversizedTileDownload] = useState<boolean>(false);
  const [userSelectedCaches, setUserSelectedCaches] = useState<Record<keyof IPlanMyTripCacheStatuses, boolean>>({
    wellData: false,
    iappRecordset: false,
    activityRecordset: false,
    mapTiles: false,
    wmsLayer: false
  });

  // Check form validity on changes
  useEffect(() => {
    const isNameSet = !!tripName;
    const isRegionDefined = planMyTripRegion != undefined;
    const isAnyCacheTypeSelected = Object.values(userSelectedCaches).some(Boolean);
    const isTileRequestOversized = isOversizedTileDownload && userSelectedCaches.mapTiles;
    setFormValid(isNameSet && isRegionDefined && isAnyCacheTypeSelected && !isTileRequestOversized);
  }, [tripName, planMyTripRegion, userSelectedCaches, isOversizedTileDownload]);

  return (
    <div id="trip-planning-form">
      <form>
        <h2>Planning Your Trip</h2>
        <p className="overview">
          Draw a region on the map and download detailed information for that area, including maps, records, and well
          data.
        </p>
        <section className="details-section">
          <div className="input-label">
            <label htmlFor="trip-planning-form-name">
              Name of Trip:<span className="required">*</span>
            </label>
            <input type="text" id="trip-planning-form-name" value={tripName} onChange={handleNameChange} />
          </div>
          <div className="drawn-field">
            {drawPolygonRef?.current && (
              <Button
                variant="contained"
                onClick={handleDrawRegion}
                className={'trip-planning-button'}
                color="success"
                id="trip-draw-button"
              >
                <Draw />
                {planMyTripRegion ? 'Redraw Region' : 'Draw Region'}
                <span className="required">*</span>
              </Button>
            )}
          </div>
        </section>
        <section className="contents-section">
          <fieldset>
            <legend>
              What info should come with you?<span className="required">*</span>
            </legend>
            {CACHE_OPTIONS.map(({ tooltip, name, labelText }) => (
              <div className="input-label" key={name}>
                <input
                  type="checkbox"
                  name={name}
                  checked={userSelectedCaches[name]}
                  onChange={handleSelectionChange}
                />
                <label htmlFor="IAPP Records">
                  {labelText} <TooltipWithIcon tooltipText={tooltip} />
                </label>
              </div>
            ))}
          </fieldset>
        </section>
        {userSelectedCaches.mapTiles && (
          <fieldset>
            <legend>
              Offline Map Detail<span className="required">*</span>
            </legend>
            {planMyTripRegion ? (
              <MapSlider
                drawnShape={planMyTripRegion}
                zoom={mapZoomLevel}
                setZoom={setMapZoomLevel}
                setOversizedTileDownload={setIsOversizedTileDownload}
              />
            ) : (
              <p>Please draw a region on the map to see offline map details</p>
            )}
          </fieldset>
        )}
        <div className="control">
          <Button
            variant="contained"
            className={formValid ? 'trip-planning-button' : ''}
            color="primary"
            onClick={handleSubmit}
            disabled={!formValid}
            size="large"
          >
            Plan my Trip!
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlanMyTripForm;
