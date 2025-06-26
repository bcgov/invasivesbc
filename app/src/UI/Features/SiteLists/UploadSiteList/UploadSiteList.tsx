import { Button } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import StyledModal from 'UI/Reusable/StyledModal/StyledModal';
import './UploadSiteList.css';
import * as xlsx from 'xlsx';
import { useDispatch } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { reShortId, reUuid } from 'sharedAPI/src/regex';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';

const UploadSiteList = () => {
  interface IRequiredColumns {
    ID: number | string;
  }
  const REQUIRED_COLUMNS = ['ID'];

  enum ValidationStatus {
    Default,
    Missing_Columns,
    Blank_Entries,
    No_Data,
    Success
  }

  // Input Handler for Files coming in
  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    cleanup();
    const selectedFile = evt.target.files?.[0] ?? null;
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
    let data: ArrayBuffer | null;
    try {
      data = await new Promise<ArrayBuffer | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
      });
    } catch (e) {
      console.error('Failed to read file: ', e);
      setComponentState(ValidationStatus.No_Data);
      return;
    }

    const workbook = xlsx.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const extractedJSON: Array<IRequiredColumns> = xlsx.utils.sheet_to_json(worksheet);

    if (extractedJSON.length === 0) {
      setComponentState(ValidationStatus.No_Data);
      return;
    }
    const fileColumns = Object.keys(extractedJSON[0]);
    if (!REQUIRED_COLUMNS.every((key) => fileColumns.includes(key))) {
      setComponentState(ValidationStatus.Missing_Columns);
      return;
    }
    const entriesWithIds = extractedJSON.filter((entry) => !!entry.ID);
    setFileData(entriesWithIds);
    if (entriesWithIds.length !== extractedJSON.length) {
      setComponentState(ValidationStatus.Blank_Entries);
    } else {
      setComponentState(ValidationStatus.Success);
    }
  };

  const handleConfirm = () => {
    const reIappSite = new RegExp(/^\d+$/);
    const iappIds: Array<string> = [];
    const activityIds: Array<string> = [];
    const ids = fileData.filter((entry) => !!entry.ID);
    ids.forEach((entry) => {
      if (!entry.ID) return;
      if (typeof entry.ID === 'string' && (reShortId.test(entry.ID) || reUuid.test(entry.ID))) {
        activityIds.push(entry.ID);
      } else if (reIappSite.test(entry.ID.toString())) {
        iappIds.push(entry.ID.toString());
      }
    });
    dispatch(
      UserSettings.SiteLists.createRecordsetsFromSiteList({
        iappIds: iappIds,
        activityIds,
        name: userSiteListName
      })
    );
    cleanup(true);
  };

  /**
   * @desc Reset Component State to default
   * @param close Modal should close
   */
  const cleanup = (close: boolean = false) => {
    setOpen(!close);
    setComponentState(ValidationStatus.Default);
    setFile(undefined);
    setFileData([]);
    setUserSiteListName('');
  };

  const dispatch = useDispatch();

  const [componentState, setComponentState] = useState<ValidationStatus>(ValidationStatus.Default);
  const [file, setFile] = useState<File>();
  const [fileData, setFileData] = useState<IRequiredColumns[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [userSiteListName, setUserSiteListName] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (!file) return;
      await handleUpload();
    })();
  }, [file]);

  return (
    <FeatureGated requires="USER_SITE_LIST">
      <Button className="site-list-button" data-testid="add-site-list" onClick={setOpen.bind(this, true)}>
        Add Site List from xlsx
      </Button>
      <StyledModal open={open} onClose={setOpen.bind(this, false)} variant="primary">
        <div id="upload-site-list">
          <div className="header">Upload Site List</div>
          <div className="content">
            <p>
              When you upload your site list, two new recordsets will be generated: one for IAPP data and one for
              Activity data. These recordsets will be prefiltered to include only the records matching the IDs in your
              uploaded file.
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
                    [ValidationStatus.Missing_Columns]: (
                      <>
                        <p>
                          <span>The uploaded file is invalid.</span> Please ensure it contains the following columns:
                        </p>
                        <ul>
                          {REQUIRED_COLUMNS.map((col) => (
                            <li key={col}>{col}</li>
                          ))}
                        </ul>
                        <p>Note: these columns are case-sensitive</p>
                      </>
                    ),
                    [ValidationStatus.Blank_Entries]: (
                      <div className="missing-coordinates">
                        <p className="warn">
                          Some entries in the Excel sheet are <span className="deep-red">missing record IDs</span>.
                        </p>
                        <p>You may proceed with the upload, but records without IDs will be excluded.</p>
                      </div>
                    ),
                    [ValidationStatus.No_Data]: (
                      <p className="deep-red">No data could be extracted from the provided document.</p>
                    ),
                    [ValidationStatus.Success]: <p className="green">File Ready to Upload.</p>
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
              disabled={![ValidationStatus.Success, ValidationStatus.Blank_Entries].includes(componentState)}
              variant="contained"
              size="small"
              onClick={handleConfirm}
            >
              Create
            </Button>
          </div>
        </div>
      </StyledModal>
    </FeatureGated>
  );
};

export default UploadSiteList;
