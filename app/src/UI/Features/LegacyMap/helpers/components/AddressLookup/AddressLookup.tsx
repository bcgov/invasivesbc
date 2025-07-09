import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import IParsedAddress from 'sharedAPI/src/interfaces/IParsedAddress';
import './AddressLookup.css';
import { useDispatch, useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import debounce from 'lodash.debounce';
import { Feature } from 'geojson';
import MapIcon from '@mui/icons-material/Map';
import { Home, Place } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { point } from '@turf/helpers';
import { calc_lat_long_from_utm } from 'utils/utm';

const AddressLookup = () => {
  const DELAY_IN_MS = 750;
  const MINIMUM_LOOKUP_LENGTH = 5;
  enum Mode {
    ADDRESS,
    COORDINATE,
    UTM
  }
  /**
   * @desc Fire API Request to get locations, prevent spamming API with debounce + minimum search length
   */
  const debouncedApiCall = useCallback(
    debounce(async (partialAddr: string) => {
      try {
        if (partialAddr.length > MINIMUM_LOOKUP_LENGTH) {
          const res = await fetch(encodeURI(`${base_url}/api/address-search?addr=${partialAddr}`), {
            headers: { Authorization: await getCurrentJWT() }
          });
          if (res?.ok) {
            setSuggestions((await res.json()).results);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, DELAY_IN_MS),
    []
  );

  /**
   * @desc Cycle between all available modes
   */
  const handleModeChange = () => {
    const totalModes = Object.keys(Mode).length / 2;
    setMode((prevMode) => (prevMode + 1) % totalModes);
  };

  /**
   * @desc Query API for Related Addresses
   */
  const handleAddressChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setAddress(evt.target.value);
    debouncedApiCall(evt.target.value);
  };

  /**
   * @desc Handle Coordinate changes, ensure values are valid (no letters + in range)
   * @param value new value
   * @param min Min range
   * @param max Max range
   * @param setter Correct useState Handler
   */
  const coordChangeHandler = (value: string, min: number, max: number, setter: (input: string) => void) => {
    const floatReg = /^[+-]?\d*(?:[.,]\d*)?$/;
    if (!value) {
      setter('');
    } else if (floatReg.test(value)) {
      const parsed = parseFloat(value);
      if ((min <= parsed && parsed <= max) || '-' === value) {
        setter(value);
      }
    }
  };

  const markLocationOnMap = (feature: Feature, suggestedAddress?: string) => {
    dispatch(UserSettings.Map.markCoordinate({ feature, readableIdentifier: suggestedAddress }));
  };

  const handleGoToCoordinates = () => {
    if (disabled) return;
    try {
      const shape = point([parseFloat(long), parseFloat(lat)]);
      const label = `Lat: ${lat},<br/>Long: ${long}`;
      markLocationOnMap(shape, label);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUtmChange = (value: string, setter: (input: string | undefined) => void) => {
    const regex = /^[+-]?\d*(?:[.,]\d*)?$/;
    if (!value) {
      setter(undefined);
    } else if (regex.test(value)) {
      setter(value);
    }
  };

  const handleSubmitUtm = () => {
    if (utmResults.length === 0) return;
    const shape = point([utmResults[0], utmResults[1]]);
    const label = `
      Zone: ${Number(zone).toLocaleString()}<br/>
      Easting: ${Number(easting).toLocaleString()}<br/>
      Northing: ${Number(northing).toLocaleString()}
    `;
    markLocationOnMap(shape, label);
  };

  const dispatch = useDispatch();

  const base_url = useSelector((state) => state.Configuration.current.runtime.API_BASE);
  const connected = useSelector((state) => state.Network.connected);
  const authorizedUser = useSelector((state) => state.Auth.loggedInOrWorkingOffline);

  // Address Mode states
  const [address, setAddress] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<IParsedAddress[]>([]);

  // LatLong Mode states
  const [lat, setLat] = useState<string>('');
  const [long, setLong] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);

  // UTM States
  const [northing, setNorthing] = useState<string>();
  const [easting, setEasting] = useState<string>();
  const [zone, setZone] = useState<string>();
  const [utmResults, setUtmResults] = useState<number[]>([]);

  // Mode
  const [mode, setMode] = useState<Mode>(Mode.UTM);

  /**
   * Calculate lat long from UTM.
   */
  useEffect(() => {
    try {
      if (zone !== undefined && easting !== undefined && northing !== undefined) {
        setUtmResults(calc_lat_long_from_utm(parseFloat(zone), parseFloat(easting), parseFloat(northing)) ?? []);
      } else {
        setUtmResults([]);
      }
    } catch (ex) {
      console.error(ex);
      setUtmResults([]);
    }
  }, [zone, easting, northing]);

  useEffect(() => {
    setDisabled(!lat || !long);
  }, [lat, long]);

  if (!connected || !authorizedUser) return;
  return (
    <div id="address-lookup">
      {
        {
          [Mode.ADDRESS]: (
            <>
              <div className="flex-row">
                <input
                  type="text"
                  placeholder="Search by address"
                  value={address}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowSuggestions(false);
                    }, 150);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={handleAddressChange}
                />
                <IconButton onClick={handleModeChange}>
                  <Home />
                </IconButton>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="address-suggestions">
                  {suggestions.map(({ feature, suggestedAddress }) => (
                    <li key={suggestedAddress}>
                      <button onClick={markLocationOnMap.bind(this, feature, suggestedAddress)}>
                        <Place />
                        <span>{suggestedAddress}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ),
          [Mode.COORDINATE]: (
            <>
              <div className="flex-row">
                <div>
                  <input
                    type="text"
                    data-testid="latitude"
                    onChange={(evt) => coordChangeHandler(evt.target.value, -90, 90, setLat)}
                    onKeyDown={(event) => {
                      if (event.code === 'Enter') {
                        handleGoToCoordinates();
                      }
                    }}
                    value={lat}
                    placeholder="Lat, e.g. 54.321"
                  />
                  <input
                    type="text"
                    data-testid="longitude"
                    value={long}
                    onChange={(evt) => coordChangeHandler(evt.target.value, -180, 180, setLong)}
                    onKeyDown={(event) => {
                      if (event.code === 'Enter') {
                        handleGoToCoordinates();
                      }
                    }}
                    placeholder="Long, e.g. -123.21"
                  />
                </div>
                <IconButton onClick={handleModeChange} disabled={!connected}>
                  <Place />
                </IconButton>
              </div>
              <button
                data-testid="coordinate-button"
                className="coordinate-button"
                disabled={disabled}
                onClick={handleGoToCoordinates}
              >
                Go to Location
              </button>
            </>
          ),
          [Mode.UTM]: (
            <>
              <div className="flex-row">
                <div>
                  <input
                    type="text"
                    value={zone ?? ''}
                    onKeyDown={(event) => {
                      if (event.code === 'Enter') {
                        handleSubmitUtm();
                      }
                    }}
                    onChange={(e) => handleUtmChange(e.target.value, setZone)}
                    placeholder="Zone"
                  />
                  <input
                    type="text"
                    value={easting ?? ''}
                    onKeyDown={(event) => {
                      if (event.code === 'Enter') {
                        handleSubmitUtm();
                      }
                    }}
                    onChange={(e) => handleUtmChange(e.target.value, setEasting)}
                    placeholder="Easting"
                  />
                  <input
                    type="text"
                    value={northing ?? ''}
                    onKeyDown={(event) => {
                      if (event.code === 'Enter') {
                        handleSubmitUtm();
                      }
                    }}
                    onChange={(e) => handleUtmChange(e.target.value, setNorthing)}
                    placeholder="Northing"
                  />
                </div>
                <IconButton onClick={handleModeChange}>
                  <MapIcon />
                </IconButton>
              </div>
              <button
                data-testid="utm-button"
                className="coordinate-button"
                disabled={utmResults.length === 0}
                onClick={handleSubmitUtm}
              >
                Go to location
              </button>
            </>
          )
        }[mode]
      }
    </div>
  );
};

export default AddressLookup;
