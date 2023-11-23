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
// Helper functions remain the same...

// Updated function to calculate free time slots
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

  // Apply buffer to meeting times
  let bufferedMeetings = meetings.map((meeting) =>
    addBufferToMeeting(meeting, bufferInMinutes)
  );

  // Sort meetings by start time
  bufferedMeetings.sort((a, b) => a.start - b.start);

  for (
    let currentDay = new Date(tripStart);
    currentDay <= tripEnd;
    currentDay.setDate(currentDay.getDate() + 1)
  ) {
    let dayStart = combineDateTime(currentDay, dailyStartTime);
    let dayEnd = combineDateTime(currentDay, dailyEndTime);

    // Initialize the last end time as the start of the day
    let lastEndTime = new Date(dayStart);

    // Process each meeting
    bufferedMeetings.forEach((meeting) => {
      let meetingStart = new Date(meeting.start);
      let meetingEnd = new Date(meeting.end);

      // Ensure the meeting falls within the current day
      if (meetingEnd < dayStart || meetingStart > dayEnd) {
        // Skip this meeting as it doesn't belong to the current day
        return;
      }

      // Adjust the meeting times if they go beyond the day's limits
      if (meetingStart < dayStart) meetingStart = new Date(dayStart);
      if (meetingEnd > dayEnd) meetingEnd = new Date(dayEnd);

      // If there's a free slot before this meeting starts
      if (lastEndTime < meetingStart) {
        freeSlots.push({
          start: lastEndTime.toISOString(),
          end: meetingStart.toISOString(),
        });
      }

      // Update the last end time to the end of the current meeting
      lastEndTime = meetingEnd > lastEndTime ? meetingEnd : lastEndTime;
    });

    // Check for a free slot at the end of the day
    if (lastEndTime < dayEnd) {
      freeSlots.push({
        start: lastEndTime.toISOString(),
        end: dayEnd.toISOString(),
      });
    }
  }

  console.log(freeSlots);

  return freeSlots;
};
