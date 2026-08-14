import LaunchIcon from '@mui/icons-material/Launch';
import { IconButton } from '@mui/material';
import './layerDataMarkerContent.css';
import { ArrowCircleLeftOutlined, ArrowCircleRightOutlined, CopyAll } from '@mui/icons-material';
import { useState } from 'react';
import { NavigateFunction } from 'react-router';
import { Dispatch } from 'redux';
import Prompt from 'state/actions/prompts/Prompt';
import Activity from 'state/actions/activity/Activity';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';

type PropTypes = {
  features: Array<{
    label: string;
    url: string;
    value: string;
    map_symbol: string;
    id?: string | number;
  }>;
  canCopyShape: boolean;
  dispatch: Dispatch;
  navigate: NavigateFunction;
};

const LayerDataMarkerContent = ({ features, navigate, dispatch, canCopyShape: canCopyRecord }: PropTypes) => {
  const STEP = 3;
  const handleGoTo = (url: string) => navigate(url);
  const handleCopy = (id: string | number) =>
    dispatch(
      Prompt.confirmation({
        title: 'Copy shape',
        prompt:
          'Do you want to replace your current shape with this one? Your existing shape will be lost if you continue.',
        confirmText: 'Copy shape',
        callback: (confirm: boolean) => {
          if (confirm) {
            dispatch(Activity.Autofill.copyGeometry(id.toString()));
          }
        }
      })
    );

  const inc = () => setFirstPos((oldPos) => Math.min(oldPos + STEP, features.length));
  const dec = () => setFirstPos((oldPos) => Math.max(oldPos - STEP, 0));
  const [firstPos, setFirstPos] = useState<number>(0);
  const slicedFeatures = features.slice(firstPos, firstPos + STEP);
  return (
    <>
      <div className="title">Records in Area</div>
      <div className="content">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Record ID</th>
              <th>Map Symbol</th>
            </tr>
          </thead>
          <tbody>
            {slicedFeatures.map(({ id, label, map_symbol, value, url }) => (
              <tr key={value + map_symbol + label}>
                <td>{label}</td>
                <td>{value}</td>
                <td>{map_symbol}</td>

                <td className="buttons">
                  {id && canCopyRecord && (
                    <HoverTooltip tooltipText={'Replace your current shape with this one'}>
                      <IconButton disabled={!canCopyRecord} onClick={handleCopy.bind(this, id)}>
                        <CopyAll />
                      </IconButton>
                    </HoverTooltip>
                  )}
                  <IconButton onClick={handleGoTo.bind(this, url)}>
                    <LaunchIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="control">
        <IconButton onClick={dec} disabled={firstPos <= 0}>
          <ArrowCircleLeftOutlined />
        </IconButton>
        <p>
          {firstPos + 1} to {Math.min(firstPos + STEP, features.length)} of {features.length} Records
        </p>
        <IconButton onClick={inc} disabled={firstPos + STEP >= features.length}>
          <ArrowCircleRightOutlined />
        </IconButton>
      </div>
    </>
  );
};
export default LayerDataMarkerContent;
