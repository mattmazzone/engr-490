import { Meeting } from "./tripTypes"

export type UserProfile = {
  uid: string;
  firstName: string;
  lastName: string;
  interests: string[];
  settings: UserSettings;
  ongoingTrip: string; // trip id
  pastTrips: string[]; // trip ids
  currentMeetings: Meeting[];
  // ... other user profile properties
};

export type UserSettings = {
  emailNotification: boolean;
  pushNotification: boolean;
  backgroundTheme: boolean; //true is dark mode and false is light mode
};

export type UserPermissions = {
  // ... user permissions properties
};
