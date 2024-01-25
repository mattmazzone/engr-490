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
  id?: number;
  providerId?: string;
  location?: string;
  color?: string;
};

export type TripType = {
  tripStart: Date;
  tripEnd: Date;
  tripMeetings: Meeting[];
  freeSlots: FreeSlot[];
};

export type FreeSlot = {
  start: Date;
  end: Date;
};
