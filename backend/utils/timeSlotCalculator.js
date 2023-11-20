// Helper function to add buffer to meeting times
exports.addBufferToMeeting = function(meeting, bufferInMinutes) {
  let start = new Date(meeting.start);
  start.setMinutes(start.getMinutes() - bufferInMinutes);

  let end = new Date(meeting.end);
  end.setMinutes(end.getMinutes() + bufferInMinutes);

  return { start, end };
}
// Helper function to calculate free time slots
exports.calculateFreeTimeSlots = function(
  tripStart,
  tripEnd,
  meetings,
  dailyStartTime,
  dailyEndTime,
  bufferInMinutes
) {
  let freeSlots = [];
  let dayStart = new Date(dailyStartTime);
  let dayEnd = new Date(dailyEndTime);

  // Apply buffer to meeting times
  let bufferedMeetings = meetings.map((meeting) =>
    addBufferToMeeting(meeting, bufferInMinutes)
  );

  // Sort meetings by start time
  bufferedMeetings.sort((a, b) => a.start - b.start);

  // Adjust daily start and end times based on the trip dates
  dayStart.setFullYear(
    tripStart.getFullYear(),
    tripStart.getMonth(),
    tripStart.getDate()
  );
  dayEnd.setFullYear(
    tripStart.getFullYear(),
    tripStart.getMonth(),
    tripStart.getDate()
  );

  let lastEndTime = dayStart;

  bufferedMeetings.forEach((meeting) => {
    let meetingStart = new Date(meeting.start);
    let meetingEnd = new Date(meeting.end);

    // Check for free slots within the daily time range
    if (
      lastEndTime < meetingStart &&
      meetingStart.getDay() === lastEndTime.getDay()
    ) {
      freeSlots.push({ start: lastEndTime, end: meetingStart });
    }

    lastEndTime = meetingEnd > dayEnd ? dayEnd : meetingEnd;

    // Move to the next day's start time if the meeting ends past the daily end time
    if (meetingEnd > dayEnd) {
      lastEndTime = new Date(dayStart);
      lastEndTime.setDate(lastEndTime.getDate() + 1);
    }
  });

  // Check for free time after the last meeting till the end of the trip
  while (lastEndTime < new Date(tripEnd)) {
    let nextDayEnd = new Date(dayEnd);
    nextDayEnd.setDate(nextDayEnd.getDate() + 1);

    let slotEnd =
      lastEndTime < dayEnd && dayEnd < new Date(tripEnd)
        ? dayEnd
        : new Date(tripEnd);
    freeSlots.push({ start: new Date(lastEndTime), end: new Date(slotEnd) });

    lastEndTime = new Date(nextDayEnd);
  }

  return freeSlots.map((slot) => ({
    start: slot.start.toISOString(),
    end: slot.end.toISOString(),
  }));
}
