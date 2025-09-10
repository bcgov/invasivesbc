import { ChangeEvent, useState } from 'react';
import center from '@turf/center';
import { Button, Tab, Tabs } from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import { useDispatch, useSelector } from 'utils/use_selector';
import { calc_utm } from 'utils/utm';
import 'UI/Features/WhatsHere/WhatsHereTable.css';
import { ArrowLeftIcon } from '@mui/x-date-pickers/icons';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { RecordSetType } from 'interfaces/UserRecordSet';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import RecordTablePopoverContent from 'UI/Features/Records/RecordSet/RecordTablePopoverContent/RecordTablePopoverContent';
import { useNavigate } from 'react-router';
import TabularWhatsHereData from './Subcomponents/TabularWhatsHereData';

export const WhatsHereTable = () => {
  const createDataUTM = (name: string, value: any) => ({ name, value });
  const handleChange = (_event: ChangeEvent<{}>, newSection: string) => {
    setRecordTab(newSection as RecordSetType);
    dispatch(WhatsHere.map_change_tab());
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    <div id="whats-here-page">
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <RecordTablePopoverContent
          recordDisplayId={recordDisplayId[recordTab]}
          recordType={recordTab}
          recordLookupId={recordLookupId[recordTab]}
        />
      </CustomPopover>
      <div className="whats-here-back">
        <Button onClick={() => navigate(-1)} color="info" variant="contained">
          <ArrowLeftIcon />
          Back
        </Button>
        <p>Features in Area</p>
      </div>
      <div className="top-level">
        <div className="utm-details">
          What's Here: <br /> {`UTM: Z-${utmRows[0]?.value} E-${utmRows[1]?.value} N-${utmRows[2]?.value}`}
        </div>
        <div>
          <Tabs value={recordTab} onChange={handleChange} centered>
            <Tab value={RecordSetType.Activity} label="InvasivesBC Records" icon={<FolderIcon />} />
            <Tab value={RecordSetType.IAPP} label="IAPP Records" icon={<AdjustIcon />} />
          </Tabs>
        </div>
      </div>
      {loadingInProgress && <Spinner />}
      <TabularWhatsHereData recordsetType={recordTab} setAnchorEl={setAnchorEl} />
    </div>
  );
};
