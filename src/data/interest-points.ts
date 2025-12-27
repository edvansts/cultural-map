import CasaDaVeraImage from "@/public/assets/arroz-com-galinha-da-vera.png";
import PesticariaGaragemImage from "@/public/assets/petiscaria-garagem.png";
import PubLigaRockImage from "@/public/assets/pub-liga-rock.jpg";
import { MapPoint } from "@/src/types/map";

export const interestPoints: MapPoint[] = [
  {
    id: 1,
    name: "Casa de Vera do arroz de galinha",
    mainImageUrl: CasaDaVeraImage,

    location: {
      latitude: -10.9126626,
      longitude: -37.6743148,
    },

    phoneNumber: "(79) 99999-9999",
  },
  {
    id: 2,
    name: "Petiscaria Garagem",
    mainImageUrl: PesticariaGaragemImage,
    location: {
      latitude: -10.8961889,
      longitude: -37.6886258,
    },
    phoneNumber: "(79) 98888-8888",
  },
  {
    id: 3,
    name: "Pub Liga Rock",
    mainImageUrl: PubLigaRockImage,
    location: {
      latitude: -10.9150451,
      longitude: -37.7053501,
    },
    phoneNumber: "(79) 97777-7777",
  },
];
