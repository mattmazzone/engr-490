export type DateRange = {
  startDate: Date | undefined;
  endDate: Date | undefined;
};
export type Time = {
  hours: number;
  minutes: number;
};

export type Meeting = {
  title: string;
  start: Date;
  end: Date;
  id: number;
  providerId?: string;
  location: string;
};

export type TripType = {
  tripStart: Date;
  tripEnd: Date;
  tripMeetings: Meeting[];
  // scheduledActivities[0] = activity start timestamp as string
  // scheduledActivities[1] = activity end timestamp as string
  scheduledActivities: ScheduledActivity[];
};

export type ScheduledActivity = {
  end: string;
  place_similarity: PlaceSimilarity;
  start: string;
};

export interface PlaceSimilarity {
  place_id: string;
  score: number;
}
