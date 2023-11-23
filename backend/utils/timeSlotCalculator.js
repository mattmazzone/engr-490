// Helper function to add buffer to meeting times
function addBufferToMeeting(meeting, bufferInMinutes) {
  let start = new Date(meeting.start);
  start.setMinutes(start.getMinutes() - bufferInMinutes);

  let end = new Date(meeting.end);
  end.setMinutes(end.getMinutes() + bufferInMinutes);

  return { start, end };
}

// Helper function to combine date and time
function combineDateTime(date, timeString) {
  const timeParts = timeString.split(":");
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    parseInt(timeParts[0]),
    parseInt(timeParts[1]),
    [parseInt(timeParts[2])]
  );
}

// Helper function to calculate free time slots
exports.calculateFreeTimeSlots = function (
  tripStart,
  tripEnd,
  meetings,
  dailyStartTime,
  dailyEndTime,
  bufferInMinutes
) {
  let freeSlots = [];
  tripStart = new Date(tripStart);
  tripEnd = new Date(tripEnd);

  let dayStart = combineDateTime(tripStart, dailyStartTime);
  let dayEnd = combineDateTime(tripStart, dailyEndTime);

  // Apply buffer to meeting times
  let bufferedMeetings = meetings.map((meeting) =>
    addBufferToMeeting(meeting, bufferInMinutes)
  );

  // Sort meetings by start time
  bufferedMeetings.sort((a, b) => a.start - b.start);

  let currentDay = new Date(tripStart);

  // Loop through each day of the trip
  while (currentDay <= tripEnd) {
    let adjustedDayStart = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate(),
      dayStart.getHours(),
      dayStart.getMinutes()
    );
    let adjustedDayEnd = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate(),
      dayEnd.getHours(),
      dayEnd.getMinutes()
    );

    let lastEndTime = adjustedDayStart;

    // Loop through each meeting
    bufferedMeetings.forEach((meeting) => {
      let meetingStart = new Date(meeting.start);
      let meetingEnd = new Date(meeting.end);

      // If meeting is within the current day
      if (meetingStart > adjustedDayStart || meetingEnd < adjustedDayEnd) {
        return;
      }

      if (lastEndTime < meetingStart) {
        freeSlots.push({
          start: new Date(lastEndTime),
          end: new Date(meetingStart),
        });
      }

      lastEndTime = new Date(meetingEnd);
    });

    if (lastEndTime < adjustedDayEnd) {
      freeSlots.push({
        start: new Date(lastEndTime),
        end: new Date(adjustedDayEnd),
      });
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  console.log(freeSlots);

  return freeSlots.map((slot) => ({
    start: slot.start.toISOString(),
    end: slot.end.toISOString(),
  }));
};
