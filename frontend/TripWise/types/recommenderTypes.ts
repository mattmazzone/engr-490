export interface RecommendActivitiesResponse {
  activities: Activity[];
}

export interface Activity {
  id: string;
  types: string[];//type of restaurant
  formattedAddress: string;
  rating: number;
  regularOpeningHours?: RegularOpeningHours;
  priceLevel?: string;
  displayName: DisplayName;
  similarity: number;//similarity value for how good the activity is best
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
