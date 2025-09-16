import { ReactNode, useMemo } from 'react';
import { selectGlobalRecordsetFilters } from 'state/reducers/map';
import { useSelector } from 'utils/use_selector';
import { ActivitySubtypeShortLabels } from 'sharedAPI';
import './GlobalFilterWarning.css';
import { WarningAmberRounded } from '@mui/icons-material';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';

const GlobalFilterWarning = () => {
  const START_OF_SUBTYPES = 2; // ["!in", "activity_subtype", ...subtypes]
  const globalMapFilters = useSelector(selectGlobalRecordsetFilters);

  const alertMessage = useMemo<ReactNode>(() => {
    if (globalMapFilters == undefined) return null;
    return (
      <div className="global-filter-tooltip">
        <p>Global filters are active. The map will not show the following data:</p>
        <ul>
          {(globalMapFilters as unknown as Array<string>).slice(START_OF_SUBTYPES).map((f) => (
            <li key={f}>{ActivitySubtypeShortLabels?.[f]}</li>
          ))}
        </ul>
      </div>
    );
  }, [globalMapFilters]);

  if (!alertMessage) return null;
  return <TooltipWithIcon tooltipText={alertMessage} icon={<WarningAmberRounded color="warning" />} />;
};

export default GlobalFilterWarning;
