import React from 'react';
import Donut from '../Donut';

export const DonutLayer = () => {
  const center = [53.908011, -122.808612];

  return (
    <>
      <Donut
        center={[52.1718463, -121.6168777]}
        data={[
          { name: 'Sample A', count: 12, fillColour: 'red' },
          { name: 'Sample B', count: 3, fillColour: 'black' },
          { name: 'Sample C', count: 92, fillColour: '#20e490' }
        ]}
      />
      <Donut
        center={[53.1718463, -121.6168777]}
        data={[
          { name: 'Sample A', count: 6 },
          { name: 'Sample A', count: 2 }
        ]}
      />
      ;
    </>
  );
};
