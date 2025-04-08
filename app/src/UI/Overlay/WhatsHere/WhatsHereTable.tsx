import { ChangeEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import center from '@turf/center';
import { Button, Grid, Tab, TableContainer, Tabs } from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import { useHistory } from 'react-router';
import RenderTableActivity from './Subcomponents/RenderTableActivity';
import RenderTablePOI from './Subcomponents/RenderTablePOI';
import { useSelector } from 'utils/use_selector';
import { calc_utm } from 'utils/utm';
import './WhatsHereTable.css';
import { ArrowLeftIcon } from '@mui/x-date-pickers/icons';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import Spinner from 'UI/Spinner/Spinner';
import { RecordSetType } from 'interfaces/UserRecordSet';
import CustomPopover from 'UI/CustomPopover/CustomPopover';
import RecordTablePopoverContent from '../Records/RecordSet/RecordTablePopoverContent/RecordTablePopoverContent';

export const WhatsHereTable = () => {
  const createDataUTM = (name: string, value: any) => ({ name, value });
  const handleChange = (_event: ChangeEvent<{}>, newSection: string) => {
    setRecordTab(newSection as RecordSetType);
    dispatch(WhatsHere.map_change_tab());
  };

  const dispatch = useDispatch();
  const history = useHistory();
  const whatsHere = useSelector((state) => state.Map?.whatsHere);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [recordTab, setRecordTab] = useState<RecordSetType>(RecordSetType.Activity);
  const loadingInProgress = whatsHere.loadingActivities || whatsHere.loadingIAPP;

  const position = whatsHere?.feature?.geometry ? center(whatsHere?.feature?.geometry)?.geometry.coordinates : [0, 0];
  const recordDisplayId = {
    [RecordSetType.Activity]: whatsHere?.clickedActivityDescription,
    [RecordSetType.IAPP]: whatsHere?.clickedIAPP
  };
  const recordLookupId = {
    [RecordSetType.Activity]: whatsHere?.clickedActivity,
    [RecordSetType.IAPP]: whatsHere?.clickedIAPP
  };

  const utmResult = calc_utm(position[0], position[1]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];

  return (
    <div className="whatshere-container">
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <RecordTablePopoverContent
          recordDisplayId={recordDisplayId[recordTab]}
          recordType={recordTab}
          recordLookupId={recordLookupId[recordTab]}
        />
      </CustomPopover>
      <div className="whatshere-table-container">
        <div className="whatshere_back_button">
          <Button onClick={history.goBack} color="info" variant="contained">
            <ArrowLeftIcon />
            Back
          </Button>
        </div>
        <div id="whatsherepopup" className="whatshere-table">
          <Grid className="whatshere-header" container justifyContent="center" sx={{ mb: 2 }}>
            <div className="whatshere-title">
              What's Here: <br /> {`UTM: Z-${utmRows[0]?.value} E-${utmRows[1]?.value} N-${utmRows[2]?.value}`}
            </div>
            <Tabs value={recordTab} onChange={handleChange} centered>
              <Tab value={RecordSetType.Activity} label="InvasivesBC Records" icon={<FolderIcon />} />
              <Tab value={RecordSetType.IAPP} label="IAPP Records" icon={<AdjustIcon />} />
            </Tabs>
          </Grid>
          {loadingInProgress && <Spinner />}
          <TableContainer className="whatshere-position">
            {
              {
                [RecordSetType.Activity]: <RenderTableActivity setAnchorEl={setAnchorEl} />,
                [RecordSetType.IAPP]: <RenderTablePOI setAnchorEl={setAnchorEl} />
              }[recordTab]
            }
          </TableContainer>
        </div>
      </div>
    </div>
  );
};
