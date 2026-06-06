export type EventCategory = "music" | "food" | "sport" | "culture";

export type EventComment = {
  avatar: string;
  bio: string;
  likes: number;
  message: string;
  name: string;
};

export type CityEvent = {
  address: string;
  attendees: number;
  category: EventCategory;
  comments: EventComment[];
  dates: string[];
  description: string;
  district: string;
  id: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  mapUrl: string;
  price: string;
  sourceLabel: string;
  sourceUrl?: string;
  time: string;
  title: string;
  venue: string;
};

export type MapSpot = {
  description: {
    de: string;
    en: string;
  };
  district: string;
  emoji: string;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  type: "cafe" | "bar" | "ubahn" | "sbahn" | "hvv" | "park" | "kita";
};
