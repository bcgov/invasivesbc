import React from 'react';
import AdminBoundriesLayers from './AdminBoundriesLayers';
import AquaticLayers from './AquaticLayers';
import IAPPLayers from './IAPPLayers';
import InvasivesBCRecordsLayers from './InvasivesBCRecordsLayers';
import TerrestrialLayers from './TerrestrialLayers';

const Layers = (props: any) => {
  return (
    <>
      <AdminBoundriesLayers inputGeo={props.inputGeo} />
      <AquaticLayers inputGeo={props.inputGeo} />
      <IAPPLayers inputGeo={props.inputGeo} />
      <TerrestrialLayers inputGeo={props.inputGeo} />
      <InvasivesBCRecordsLayers inputGeo={props.inputGeo} />
    </>
    // <>
    //   {layers.map((parent) => (
    //     <div key={Math.random()}>
    //       {parent.children.map(
    //         (child) =>
    //           child.enabled &&
    //           (child.bcgw_code ? (
    //             <div key={Math.random()}>
    //               <DataBCLayer
    //                 opacity={child.opacity}
    //                 bcgw_code={child.bcgw_code}
    //                 layer_mode={child.layer_mode}
    //                 dataBCAcceptsGeometry={child.dataBCAcceptsGeometry}
    //                 simplifyPercentage={child.simplifyPercentage}
    //                 inputGeo={props.inputGeo}
    //                 color_code={child.color_code}
    //                 zIndex={parent.zIndex + child.zIndex}
    //               />
    //             </div>
    //           ) : (
    //             <div key={Math.random()}>
    //               <IndependentLayer
    //                 opacity={child.opacity}
    //                 layer_code={child.layer_code}
    //                 bcgw_code={child.bcgw_code}
    //                 activity_subtype={child.activity_subtype}
    //                 poi_type={child.poi_type}
    //                 layer_mode={child.layer_mode}
    //                 inputGeo={props.inputGeo}
    //                 color_code={child.color_code}
    //                 zIndex={parent.zIndex + child.zIndex}
    //               />
    //             </div>
    //           ))
    //       )}
    //     </div>
    //   ))}
    // </>
  );
};

export default Layers;
