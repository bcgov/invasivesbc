import { ChangeEvent, KeyboardEvent, useCallback, useState } from 'react';
import debounce from 'lodash.debounce';
import { useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useNavigate } from 'react-router';
import './recordSearch.css';

type ActivitySuggestion = {
  short_id: string;
  activity_id: string;
  [key: PropertyKey]: unknown;
};
type IappSuggestion = {
  site_id: number;
};

type Suggestion = ActivitySuggestion | IappSuggestion;

const RecordSearch = () => {
  const MINIMUM_LOOKUP_LENGTH = 5;
  const navigate = useNavigate();
  const DELAY_IN_MS = 750;
  const API_V2_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_BASE);

  /**
   * @param Navigate User to chosen record, infer destination from the suggestion keys.
   */
  const handleNavigate = (suggestion: Suggestion) => {
    setValue('');
    setSuggestions([]);
    if ('activity_id' in suggestion) {
      navigate(`/Records/Activity/${suggestion.activity_id}/form`);
    } else {
      navigate(`/Records/IAPP/${suggestion.site_id}/summary`);
    }
  };

  /**
   * @desc Handle User pressing Enter in the form input. Sends them to the first suggestion.
   */
  const handleKeyDown = (evt: KeyboardEvent) => {
    if (suggestions.length > 0 && evt.key === 'Enter') {
      handleNavigate(suggestions[0]);
    }
  };
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setValue(evt.target.value);
    debouncedApiCall(evt.target.value);
  };

  const [value, setValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const debouncedApiCall = useCallback(
    debounce(async (partialRecordId: string) => {
      // TODO: Replace with new filters in #4499
      const recordsetFilters = (field: 'short_id' | 'site_id') =>
        JSON.stringify({
          filterObjects: [
            {
              id: '123',
              selectColumns: [field],
              limit: 2,
              sortColumn: field,
              tableFilters: [
                {
                  id: '0.987654321',
                  filterType: 'tableFilter',
                  operator: 'CONTAINS',
                  operator2: 'AND',
                  filter: partialRecordId,
                  field: field
                }
              ]
            }
          ]
        });

      let ibcSuggestions = [];
      let iappSuggestions = [];
      try {
        if (partialRecordId.length >= MINIMUM_LOOKUP_LENGTH) {
          const res = await fetch(`${API_V2_BASE}/recordset/rows`, {
            method: 'POST',
            headers: {
              Authorization: await getCurrentJWT(),
              'Content-Type': 'application/json'
            },
            body: recordsetFilters('short_id')
          });
          if (res?.ok) {
            ibcSuggestions = await res.json();
          }
        }
      } catch (e) {
        console.error(e);
      }

      if (partialRecordId.match(/^[0-9]{2,}$/)) {
        try {
          const res = await fetch(`${API_BASE}/api/v2/iapp`, {
            method: 'POST',
            headers: {
              Authorization: await getCurrentJWT(),
              'Content-Type': 'application/json'
            },
            body: recordsetFilters('site_id')
          });
          if (res?.ok) {
            ibcSuggestions = (await res.json())?.result ?? [];
          }
        } catch (e) {
          console.error(e);
        }
      }
      setSuggestions([...ibcSuggestions, ...iappSuggestions]);
    }, DELAY_IN_MS),
    []
  );
  return (
    <div id="record-search">
      <input
        type="text"
        placeholder="Search for a record"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          setTimeout(() => {
            setShowSuggestions(false);
          }, 150);
        }}
      />
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s) => (
            <li key={'activity_id' in s ? s.activity_id : s.site_id}>
              <button type="button" onClick={() => handleNavigate(s)}>
                {'short_id' in s ? <>Record ID: {s.short_id}</> : <>IAPP Site ID: {s.site_id}</>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecordSearch;
