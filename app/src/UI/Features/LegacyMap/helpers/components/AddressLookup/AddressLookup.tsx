import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import IParsedAddress from 'sharedAPI/src/interfaces/IParsedAddress';
import './AddressLookup.css';
import { useDispatch, useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import debounce from 'lodash.debounce';
import { Feature } from 'geojson';
import { Home, Place } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { point } from '@turf/helpers';

const AddressLookup = () => {
  const DELAY_IN_MS = 750;
  const MINIMUM_LOOKUP_LENGTH = 5;
  enum Mode {
    ADDRESS,
    COORDINATE
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

  /** @desc Cycle between Address and Coordinate Modes */
  const handleModeChange = () => setMode((prev) => (prev === Mode.ADDRESS ? Mode.COORDINATE : Mode.ADDRESS));
  const handleAddressChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setAddress(evt.target.value);
    debouncedApiCall(evt.target.value);
  };
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

  const markLocationOnMap = (feature: Feature) => {
    dispatch(UserSettings.Map.markCoordinate(feature));
  };

  const handleGoToCoordinates = () => {
    if (disabled) return;
    try {
      markLocationOnMap(point([parseFloat(long), parseFloat(lat)]));
    } catch (e) {
      console.error(e);
    }
  };

  const dispatch = useDispatch();

  const base_url = useSelector((state) => state.Configuration.current.runtime.API_BASE);
  const connected = useSelector((state) => state.Network.connected);

  const [address, setAddress] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);
  const [lat, setLat] = useState<string>('');
  const [long, setLong] = useState<string>('');
  const [mode, setMode] = useState<Mode>(Mode.ADDRESS);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<IParsedAddress[]>([]);

  useEffect(() => {
    setDisabled(!lat || !long);
  }, [lat, long]);

  if (!connected) return;
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
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.suggestedAddress}>
                      <button onClick={markLocationOnMap.bind(this, suggestion.feature)}>
                        <Place />
                        <span>{suggestion.suggestedAddress}</span>
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
          )
        }[mode]
      }
    </div>
  );
};

export default AddressLookup;
