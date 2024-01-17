export interface SimilarityTableResponse {
  nearbyPlaces: NearbyPlaces;
  similarityScores: {
    Similarity: Record<string, number>;
  };
}

export interface NearbyPlaces {
  places: Place[];
}

export interface Place {
  id: string;
  types: string[];
  formattedAddress: string;
  rating: number;
  regularOpeningHours?: RegularOpeningHours;
  priceLevel?: string;
  displayName: DisplayName;
}

export interface RegularOpeningHours {
  openNow: boolean;
  periods: Period[];
  weekdayDescriptions: string[];
}

export interface Period {
  open: Open;
  close?: Close;
}

export interface Open {
  day: number;
  hour: number;
  minute: number;
}

export interface Close {
  day: number;
  hour: number;
  minute: number;
}

export interface DisplayName {
  text: string;
  languageCode: string;
}
