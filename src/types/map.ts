import { StaticImageData } from "next/image";

export interface MapPoint {
  id: number;
  name: string;
  mainImageUrl: StaticImageData;
  location: {
    latitude: number;
    longitude: number;
  };
  phoneNumber: string;
}
