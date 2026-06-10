import { Button } from '@mui/material';
import './TripForm.css';
import { Draw } from '@mui/icons-material';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import {
  IPlanMyTripCacheStatuses,
  IPlanMyTripRepositoryMetadata,
  PlanMyTripCacheService
} from 'utils/plan-my-trip-cache';
import { useDispatch, useSelector } from 'utils/use_selector';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import PlanMyTrip, { ICreateMyTrip } from 'state/actions/planMyTrip/PlanMyTrip';
import Alerts from 'state/actions/alerts/Alerts';
import tripAlertMessages from 'constants/alerts/tripAlerts';
import { FeatureFlags } from 'state/configuration/feature-flags';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';
import MapEstimator from 'UI/Features/TileCache/ProtomapsImplementation/MapEstimator';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { NavLink, useNavigate } from 'react-router';

interface CacheOption {
  tooltip: string;
  name: keyof IPlanMyTripCacheStatuses | 'all';
  labelText: string;
  featureFlag: keyof FeatureFlags;
}

const TripForm = () => {
  const navigate = useNavigate();

  const CACHE_OPTIONS: Array<CacheOption> = [
    {
      tooltip: 'Creates an IAPP Recordset with your drawn region as the primary filter',
      name: 'iappRecordset',
      labelText: 'IAPP Records',
      featureFlag: 'CACHE_RECORDSETS'
    },
    {
      tooltip: 'Creates an InvasivesBC Recordset with your drawn region as the primary filter',
      name: 'activityRecordset',
      labelText: 'InvasivesBC Records',
      featureFlag: 'CACHE_RECORDSETS'
    },
    {
      tooltip: 'Get locations of recorded groundwater wells in your region for use with Chemical Treatment forms',
      name: 'wellData',
      labelText: 'Well Data',
      featureFlag: 'CACHE_WELLS'
    },
    {
      tooltip: 'Download Maps available offline for your drawn region',
      name: 'mapTiles',
      labelText: 'Offline Maps',
      featureFlag: 'CACHE_TILES'
    }
  ];

  // Clear current shape and set draw tools to Polygon.
  const handleDrawRegion = () => {
    deleteRef.current?.click();
    drawPolygonRef?.current?.click();
    dispatch(Alerts.create(tripAlertMessages.drawToolClicked));
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
    navigate('/ManageTrips/maps');
  };

  const dispatch = useDispatch();

  const deleteRef = useRef<HTMLButtonElement>(
    document.getElementsByClassName('mapbox-gl-draw_trash')?.[0] as HTMLButtonElement
  );
  const drawPolygonRef = useRef<HTMLButtonElement>(
    document.getElementsByClassName('mapbox-gl-draw_polygon')?.[0] as HTMLButtonElement
  );

  const planMyTripRegion = useSelector((state) => state.PlanMyTrip?.drawnShape);

  const connected = useSelector((state) => state.Network.connected);

  const [tripService, setTripService] = useState<PlanMyTripCacheService>();
  const [repositories, setRepositories] = useState<IPlanMyTripRepositoryMetadata[]>([]);

  useEffect(() => {
    if (!tripService) return;
    (async () => {
      const repositories = await tripService.listRepositories();
      setRepositories(repositories);
    })();
  }, [tripService]);

  useEffect(() => {
    (async () => {
      const service = await PlanMyTripCacheServiceFactory.getPlatformInstance();
      setTripService(service);
    })();
  }, []);

  const [tripName, setTripName] = useState<string>('');
  const [formValid, setFormValid] = useState<boolean>(false);
  const [mapEstimateValid, setMapEstimateValid] = useState<boolean>(true);
  const [nameUniqueWarning, setNameUniqueWarning] = useState<boolean>(false);
  const [mapZoomLevel, setMapZoomLevel] = useState<number>(12);
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
    const isNameUnique = !repositories.some((r) => r.name === tripName);
    setFormValid(isNameSet && isRegionDefined && isAnyCacheTypeSelected && isNameUnique && mapEstimateValid);
    setNameUniqueWarning(isNameSet && !isNameUnique);
  }, [tripName, planMyTripRegion, userSelectedCaches, repositories, mapEstimateValid]);

  /**
   * @desc Set Draw tools mode while component is active.
   */
  useEffect(() => {
    dispatch(PlanMyTrip.setPlanMyTripDrawMode(true));
    return () => {
      // Clear Tile Cache states from state,
      dispatch(PlanMyTrip.setPlanMyTripDrawMode(false));
      dispatch(PlanMyTrip.clearShape());
    };
  }, []);

  return (
    <div id="trip-planning-form">
      <form onSubmit={(e) => e.preventDefault()}>
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
            {nameUniqueWarning && <span className={'red'}>Name must be unique</span>}
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
            {CACHE_OPTIONS.map(({ tooltip, name, labelText, featureFlag }) => (
              <FeatureGated requires={featureFlag} key={name}>
                <div className="input-label">
                  <input
                    type="checkbox"
                    name={name}
                    checked={userSelectedCaches[name]}
                    onChange={handleSelectionChange}
                  />
                  <label htmlFor={name}>
                    {labelText} <TooltipWithIcon tooltipText={tooltip} />
                  </label>
                </div>
              </FeatureGated>
            ))}
          </fieldset>
        </section>
        {userSelectedCaches.mapTiles && (
          <fieldset>
            <legend>
              Offline Map Detail<span className="required">*</span>
            </legend>
            <p className={'help'}>
              When map tiles are included in your trip, they will be processed by the server into an archive for fast
              download. After submitting your trip, it is no longer necessary to keep your device active while the
              server prepares the map archive. Once ready, you can view and install it on the{' '}
              <NavLink to={'/ManageTrips/maps'}>Offline Maps</NavLink> page.
            </p>
            {planMyTripRegion ? (
              <>
                <MapEstimator
                  drawnShape={planMyTripRegion as GeoJSON.Polygon}
                  zoom={mapZoomLevel}
                  setZoom={setMapZoomLevel}
                  setValid={setMapEstimateValid}
                  valid={mapEstimateValid}
                />
              </>
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
            disabled={!formValid || !connected}
            size="large"
          >
            Plan my Trip!
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;
