import { ChangeEvent, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import { ArrowLeftIcon } from '@mui/x-date-pickers/icons';
import { useNavigate } from 'react-router';
import { useSelector } from 'utils/use_selector';
import { calc_utm } from 'utils/utm';
import { RecordSetType } from 'interfaces/UserRecordSet';
import TabularWhatsHereData from './Subcomponents/TabularWhatsHereData';
import Button from 'UI/Reusable/Button/Button';
import LoadingPage from '../SystemStatusPages/LoadingPage/LoadingPage';
import 'UI/Features/WhatsHere/WhatsHereTable.css';

export const WhatsHereTable = () => {
  const handleChange = (_event: ChangeEvent<{}>, newSection: RecordSetType) => setRecordTab(newSection);

  const navigate = useNavigate();
  const whatsHere = useSelector((state) => state.Map?.whatsHere);

  const [recordTab, setRecordTab] = useState<RecordSetType>(RecordSetType.Activity);
  const [long, lat] = whatsHere.shapeCentre ?? [0, 0];

  const [zone, easting, northing] = calc_utm(long, lat);

  if (whatsHere.loadingActivities || whatsHere.loadingIAPP) return <LoadingPage />;
  return (
    <div id="whats-here-page">
      <div className="whats-here-back">
        <Button onClick={() => navigate(-1)} color="info" variant="contained">
          <ArrowLeftIcon />
          Back
        </Button>
        <p>Features in Area</p>
      </div>
      <div className="top-level">
        <dl className="utm-details">
          <dt>What's Here:</dt>
          <dd>{`UTM: Z-${zone} E-${easting} N-${northing}`}</dd>
        </dl>
        <div>
          <Tabs value={recordTab} onChange={handleChange} centered>
            <Tab value={RecordSetType.Activity} label="InvasivesBC Records" icon={<FolderIcon />} />
            <Tab value={RecordSetType.IAPP} label="IAPP Records" icon={<AdjustIcon />} />
          </Tabs>
        </div>
      </div>
      <TabularWhatsHereData recordsetType={recordTab} />
    </div>
  );
};
