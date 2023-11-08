export type UserProfile = {
  uid: string;
  firstName: string;
  lastName: string;
  interests: string[];
  ongoingTrip: string; // trip id
  pastTrips: string[]; // trip ids
  // ... other user profile properties
};

export type UserSettings = {
  // ... user settings properties
};

export type UserPermissions = {
  // ... user permissions properties
};
