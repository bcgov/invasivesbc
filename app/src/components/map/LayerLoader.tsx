import React, { useContext, useEffect, useRef, useState } from 'react';

// TODO call out source types as enum
// TODO call out output types as enum
// Can all output types be a map container child????

const LayerLoader: React.FC = (props) => {
  switch ((props as any).SourceType) {
    case 'REF_PointOfInterest': {
      return <></>;
    }
    case 'REF_Activity': {
      return <></>;
    }
    case 'DataBCWFS': {
      return <></>;
    }
    case 'UploadedKML': {
      return <></>;
    }
  }
  return null;
};
export default LayerLoader;
