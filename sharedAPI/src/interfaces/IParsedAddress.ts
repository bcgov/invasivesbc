import { Feature } from 'geojson';

interface IParsedAddress {
  suggestedAddress: string;
  feature: Feature;
}

export default IParsedAddress;
