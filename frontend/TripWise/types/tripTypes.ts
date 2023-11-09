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
  location: string;
};
