import * as L from 'leaflet';
import { useLeafletContext } from '@react-leaflet/core';
import React, { useEffect, useRef } from 'react';
import { LatLngExpression } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../styles/donuts.scss';

interface IDonutSVGProps {
  data: {
    name: string;
    count: number;
    fillColour?: string;
  }[];
  bins?: number;
  thickness?: number;
}

export const DonutSVG: React.FC<IDonutSVGProps> = ({ data, bins = 32, thickness = 20 }) => {
  const activityPalette = {
    Biocontrol : '#845ec2',
    FREP: '#de852c',
    Monitoring: '#2138e0',
    Observation: '#399c3e',
    Treatment: '#c6c617'
  };

  const segments = [];

  // figure out segment arc coordinates
  for (let i = 0; i < bins; i++) {
    segments.push({
      rotation: (i / bins) * 360.0,
      outerArc: {
        start: {
          x: 190,
          y: 100
        },
        end: {
          x: 100 + Math.cos((Math.PI * 2.0) / bins) * 90.0,
          y: 100 + Math.sin((Math.PI * 2.0) / bins) * 90.0
        }
      },
      innerArc: {
        start: {
          x: 190 - thickness,
          y: 100
        },
        end: {
          x: 100 + Math.cos((Math.PI * 2.0) / bins) * (90.0 - thickness),
          y: 100 + Math.sin((Math.PI * 2.0) / bins) * (90.0 - thickness)
        }
      }
    });
  }

  // map data to segments
  const sortedData: {
    name: string;
    count: number;
    startBin?: number;
    endBin?: number;
    fillColour?: string;
  }[] = [...data].sort((a, b) => b.count - a.count);

  while (sortedData.length > bins) {
    sortedData.pop();
  }

  const sum = sortedData.reduce((prev, current) => prev + current.count, 0.0);
  let startingBin = 0;
  for (const item of sortedData) {
    item.startBin = startingBin;
    item.endBin = startingBin + Math.floor((item.count / sum) * bins);
    if (item.endBin >= bins) {
      item.endBin = bins - 1;
    }
    startingBin = item.endBin;
    startingBin++;
  }

  return (
    <svg viewBox={`0 0 200 200`}>
      {sortedData.map((d, i) => {
        let fillColour;   
        if (!!d.fillColour) {
          fillColour = d.fillColour;
        } else {
          fillColour = activityPalette[d.name];
        }
        const rendered = [];
        for (let s = d.startBin; s <= d.endBin; s++) {
          let segment = segments[s];
          rendered.push(
            <path
              key={`outerpath-${i}`}
              className={'path'}
              fill={fillColour}
              transform={`rotate(${segment.rotation} 100 100)`}
              d={`M ${segment.outerArc.start.x} ${segment.outerArc.start.y}
          A 90 90 0 0 1 ${segment.outerArc.end.x} ${segment.outerArc.end.y}
          L ${segment.innerArc.end.x} ${segment.innerArc.end.y}
          A ${90 - thickness} ${90 - thickness} 0 0 0 ${segment.innerArc.start.x} ${segment.innerArc.start.y}
          `}
            />
          );
        }


        const total = sortedData?.reduce((prev, current) => prev + current.count, 0.0);
        return (
          <g key={'Donut-Key-g-' + Math.random()} className={'donut-group'}>
            <g className={'path'}>
            {rendered}
            </g>
            <g className={'donut-total-label'}>
              <text x="100" y="84" className="donut-total-label" textAnchor={'middle'} dominantBaseline={'middle'}>
                {total}
              </text>
            </g>
            <g className={'donut-label'}>
              <text x="100" y="84" className="donut-label" textAnchor={'middle'} dominantBaseline={'middle'}>
                {d.name}
              </text>
              <text x="100" y="116" className="donut-label" textAnchor={'middle'} dominantBaseline={'middle'}>
                {d.count}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

interface IDonutProps {
  center: LatLngExpression;
  size?: number;

  data: {
    name: string;
    count: number;
    fillColour?: string;
  }[];
}

const Donut: React.FC<IDonutProps> = ({ center, data, size = 64 }) => {
  const context = useLeafletContext();
  const donutRef = useRef();

  useEffect(() => {
    if (data != null && data.length > 0) {
      const donutIcon = new L.DivIcon({
        html: renderToStaticMarkup(<DonutSVG bins={200} data={data} />),
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      // @ts-ignore
      donutRef.current = new L.Marker(center, { icon: donutIcon });
      const container = context.layerContainer || context.map;
      container.addLayer(donutRef.current);
      return () => {
        container.removeLayer(donutRef.current);
      };
    }
  }, [center, data, size]);

  return null;
};

export default Donut;
