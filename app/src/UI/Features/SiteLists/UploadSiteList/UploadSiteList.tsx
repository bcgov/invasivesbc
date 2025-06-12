import { Button } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import StyledModal from 'UI/Reusable/StyledModal/StyledModal';
import './UploadSiteList.css';
import * as xlsx from 'xlsx';
import { useDispatch, useSelector } from 'utils/use_selector';
import { multiPoint } from '@turf/helpers';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { buffer, convex } from '@turf/turf';

const UploadSiteList = () => {
  interface IRequiredColumns {
    SiteID: number | string;
    Latitude: number;
    Longitude: number;
  }
  const REQUIRED_COLUMNS = ['SiteID', 'Latitude', 'Longitude'];
  enum ComponentState {
    Api_Response_Failed,
    Default,
    Missing_Columns,
    Missing_Geospatial_Data,
    No_Data,
    Success
  }

  // Input Handler for Files coming in
  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    cleanup();
    const selectedFile = evt.target.files?.[0] || null;
    setUserSiteListName(selectedFile?.name ?? '');
    setFile(selectedFile ?? undefined);
  };

  /**
   * @desc Handles User Selected File. Checks of file has necessary columns to perform operations,
   *       Performs Checks for:
   *         - File contains Data
   *         - File contains Necessary Columns
   *         - File has blank fields
   */
  const handleUpload = async () => {
    if (!file) return;
    const data = await new Promise<ArrayBuffer | null>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });

    if (!data) {
      // File could not be read
      setComponentState(ComponentState.No_Data);
      return;
    }

    const workbook = xlsx.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const extractedJSON: Array<IRequiredColumns> = xlsx.utils.sheet_to_json(worksheet);

    if (extractedJSON.length === 0) {
      setComponentState(ComponentState.No_Data);
      return;
    }
    const fileColumns = Object.keys(extractedJSON[0]);
    if (!REQUIRED_COLUMNS.every((key) => fileColumns.includes(key))) {
      setComponentState(ComponentState.Missing_Columns);
      return;
    }
    const entriesWithCoords = extractedJSON.filter((entry) => !!entry.Longitude && !!entry.Longitude);
    setFileData(entriesWithCoords);
    if (entriesWithCoords.length !== extractedJSON.length) {
      setComponentState(ComponentState.Missing_Geospatial_Data);
    } else {
      setComponentState(ComponentState.Success);
    }
  };

  const createShape = (filledInInfo: Array<[number, number]> = []) => {
    const latLongs = fileData.map((entry) => [entry.Longitude, entry.Latitude]);
    const pointCollection = multiPoint([...latLongs, ...filledInInfo]);
    const convexShape = convex(pointCollection);
    if (!convexShape) return;
    const shape = buffer(convexShape, 5, { units: 'meters' });
    if (!shape) return;
    dispatch(UserSettings.Boundaries.createSiteListLayer({ feature: shape, name: userSiteListName }));
  };

  const handleConfirm = () => {
    (async () => {
      try {
        if (shouldFetchFromApi) {
          //Do the API Thing
          const re = RegExp(/[a-zA-Z]/);
          const iappIds: Array<string | number> = [];
          const activityIds: Array<string> = [];
          const missingData = fileData.filter((entry) => !entry.Latitude || !entry.Longitude);
          missingData.forEach((entry) => {
            if (typeof entry.SiteID === 'string' && re.test(entry.SiteID)) {
              activityIds.push(entry.SiteID);
            } else {
              iappIds.push(entry.SiteID);
            }
          });
          const response = await fetch(`${API_BASE}`);
          if (response?.ok) {
            const parsed = await response.json();
            createShape(parsed);
          }
        } else {
          createShape();
        }
        cleanup(true);
      } catch (e) {
        console.error(e);
        cleanup();
      }
    })();
  };

  /**
   * @desc Reset Component State to default
   * @param close Modal should close
   */
  const cleanup = (close: boolean = false) => {
    setOpen(!close);
    setComponentState(ComponentState.Default);
    setFile(undefined);
    setFileData([]);
    setUserSiteListName('');
    setShouldFetchFromApi(false);
  };

  const dispatch = useDispatch();
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_BASE);

  const [componentState, setComponentState] = useState<ComponentState>(ComponentState.Default);
  const [file, setFile] = useState<File>();
  const [fileData, setFileData] = useState<IRequiredColumns[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [shouldFetchFromApi, setShouldFetchFromApi] = useState<boolean>(false);
  const [userSiteListName, setUserSiteListName] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (!file) return;
      await handleUpload();
    })();
  }, [file]);

  return (
    <>
      <Button className="site-list-button" data-testid="add-site-list" onClick={setOpen.bind(this, true)}>
        Add Site List from xlsx
      </Button>
      <StyledModal open={open} onClose={setOpen.bind(this, false)} variant="primary">
        <div id="upload-site-list">
          <div className="header">Upload Site List</div>
          <div className="content">
            <p>
              Uploading your site list will generate a custom boundary based on the provided locations. This boundary
              can then be used to filter Activity and IAPP Recordsets to include only those within the surrounding area.
            </p>
            <div className="form-inputs">
              <div className="file-input">
                <label htmlFor="site-list-file-input">Select File</label>
                <p className="file-name">{file?.name ?? 'No file selected'}</p>
                <input
                  type="file"
                  id="site-list-file-input"
                  onChange={handleFileChange}
                  accept="application/vnd.ms-excel, .xlsx"
                />
              </div>
              {file && (
                <div>
                  <label htmlFor="name-site-list">Name Site List:</label>
                  <input
                    type="text"
                    id="name-site-list"
                    onChange={(evt) => setUserSiteListName(evt.target.value)}
                    value={userSiteListName}
                  />
                </div>
              )}
            </div>
            {componentState != undefined && (
              <div className="warning">
                {
                  {
                    [ComponentState.Missing_Columns]: (
                      <>
                        <p>
                          <span>The uploaded file is invalid.</span> Please ensure it contains the following columns:
                        </p>
                        <ul>
                          {REQUIRED_COLUMNS.map((col) => (
                            <li>{col}</li>
                          ))}
                        </ul>
                        <p>Note: these columns are case-sensitive</p>
                      </>
                    ),
                    [ComponentState.Missing_Geospatial_Data]: (
                      <div className="missing-coordinates">
                        <p className="warn">
                          The Excel sheet is <span className="deep-red">missing geospatial data</span> in some entries.
                        </p>
                        <p>Would you like to supplement the missing data using information from the database?</p>
                        <div className="form-inputs">
                          <div>
                            <label htmlFor="fill-from-api">Get Missing Information</label>

                            <input
                              className="checkbox"
                              id="fill-from-api"
                              type="checkbox"
                              checked={shouldFetchFromApi}
                              onChange={() => setShouldFetchFromApi((prev) => !prev)}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                    [ComponentState.No_Data]: (
                      <>
                        <p className="deep-red">No data could be extracted from the provided Excel document.</p>
                      </>
                    ),
                    [ComponentState.Api_Response_Failed]: <p>Error Occured in API</p>,
                    [ComponentState.Success]: <p className="green">File Upload Successful.</p>
                  }[componentState]
                }
              </div>
            )}
          </div>
          <div className="control">
            <Button size="small" onClick={cleanup.bind(this, true)}>
              Cancel
            </Button>
            <Button
              disabled={![ComponentState.Success, ComponentState.Missing_Geospatial_Data].includes(componentState)}
              variant="contained"
              size="small"
              onClick={handleConfirm}
            >
              Create
            </Button>
          </div>
        </div>
      </StyledModal>
    </>
  );
};

export default UploadSiteList;
