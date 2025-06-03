import { Feature } from 'geojson';

interface IParsedAddress {
  suggestedAddress: string;
  shape: Feature;
}

export default IParsedAddress;
