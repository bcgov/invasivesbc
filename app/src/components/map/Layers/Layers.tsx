import React from 'react';
import AdminBoundriesLayers from './AdminBoundriesLayers';
import AquaticLayers from './AquaticLayers';
import IAPPLayers from './IAPPLayers';
import InvasivesBCRecordsLayers from './InvasivesBCRecordsLayers';
import TerrestrialLayers from './TerrestrialLayers';
import UserUploadedLayers from './UserUploadedLayers';

const Layers = (props: any) => {
  return (
    <>
      <AdminBoundriesLayers inputGeo={props.inputGeo} />
      <AquaticLayers inputGeo={props.inputGeo} />
      <IAPPLayers inputGeo={props.inputGeo} />
      <TerrestrialLayers inputGeo={props.inputGeo} />
      <InvasivesBCRecordsLayers inputGeo={props.inputGeo} />
      <UserUploadedLayers inputGeo={props.inputGeo} />
    </>
  );
};

export default Layers;
