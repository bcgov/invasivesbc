import LaunchIcon from '@mui/icons-material/Launch';
import { IconButton } from '@mui/material';
import './layerDataMarkerContent.css';
import { Fragment } from 'react/jsx-runtime';
import { ArrowCircleLeftOutlined, ArrowCircleRightOutlined, ArrowCircleRightRounded } from '@mui/icons-material';
import { useState } from 'react';
import { History } from 'history';

type PropTypes = {
  features: Array<{
    label: string;
    url: string;
    value: string;
    map_symbol: string;
  }>;
  history: History;
};

const LayerDataMarkerContent = ({ features, history }: PropTypes) => {
  const STEP = 4;
  const handleGoTo = (url: string) => history.push(url);
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
              <th colSpan={2}>Map Symbol</th>
              <th>
                <Fragment />
              </th>
            </tr>
          </thead>
          <tbody>
            {slicedFeatures.map(({ label, map_symbol, value, url }) => (
              <tr key={value + map_symbol + label}>
                <td>{label}</td>
                <td>{value}</td>
                <td>{map_symbol}</td>
                <td>
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
