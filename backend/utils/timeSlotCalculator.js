const moment = require("moment");

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
// Function to get timezone offset from date string
function getTimezoneOffset(dateString) {
  const regex = /([+-][0-9]{2}:[0-9]{2})$/;
  const match = dateString.match(regex);
  return match ? match[0] : "+00:00"; // Default to UTC if no timezone info
}

// Function to format date in the same timezone as the original input
function formatDateInSameTimezone(date, originalDateString) {
  const timezoneOffset = getTimezoneOffset(originalDateString);

  // Extract hours and minutes from the timezone offset
  const offsetHours = parseInt(timezoneOffset.substring(1, 3));
  const offsetMinutes = parseInt(timezoneOffset.substring(4));
  const totalOffset =
    (offsetHours * 60 + offsetMinutes) *
    60000 *
    (timezoneOffset[0] === "+" ? 1 : -1);

  // Apply the offset to the date
  const adjustedDate = new Date(date.getTime() + totalOffset);

  // Format the date as an ISO string and append the timezone offset
  return adjustedDate.toISOString().replace("Z", timezoneOffset);
}

// Updated function to calculate free time slots
function calculateFreeTimeSlots(
  originalTripStart,
  tripEnd,
  meetings,
  dailyStartTime,
  dailyEndTime,
  bufferInMinutes
) {
  let freeSlots = [];
  let tripStart = new Date(originalTripStart);
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
          start: formatDateInSameTimezone(lastEndTime, originalTripStart),
          end: formatDateInSameTimezone(meetingStart, originalTripStart),
        });
      }

      // Update the last end time to the end of the current meeting
      lastEndTime = meetingEnd > lastEndTime ? meetingEnd : lastEndTime;
    });

    // Check for a free slot at the end of the day
    if (lastEndTime < dayEnd) {
      freeSlots.push({
        start: formatDateInSameTimezone(lastEndTime, originalTripStart),
        end: formatDateInSameTimezone(dayEnd, originalTripStart),
      });
    }
  }

  return freeSlots;
}

function calculateNumberOfDays(tripStart, tripEnd) {
  const start = new Date(tripStart);
  const end = new Date(tripEnd);
  const timeDifference = end.getTime() - start.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

function findClosestMeetingToTargetDate(targetDate, meetings) {
  let closestMeeting = null;
  let minDiff = Infinity; // Initialize with the largest possible difference
  const targetDateTime = targetDate.getTime();

  meetings.forEach((meeting) => {
    const meetingTime = new Date(meeting.start).getTime();
    const diff = Math.abs(targetDateTime - meetingTime); // Use absolute difference

    if (diff < minDiff) {
      closestMeeting = meeting;
      minDiff = diff;
    }
  });

  return closestMeeting;
}

function findClosestMeetingToMealTime(mealTime, meetings) {
  if (!meetings || meetings.length === 0) return null;

  // Convert mealTime to moment for easier manipulation and comparison
  const mealTimeMoment = moment.utc(mealTime);

  let closestMeeting = null;
  let smallestDiff = Number.MAX_SAFE_INTEGER;

  meetings.forEach((meeting) => {
    const meetingStartMoment = moment(meeting.start);
    const meetingEndMoment = moment(meeting.end);
    const startsBeforeMeal = meetingStartMoment.isBefore(mealTimeMoment);
    const endsAfterMeal = meetingEndMoment.isAfter(mealTimeMoment);

    // If the meeting encompasses the meal time, it's the closest by default
    if (startsBeforeMeal && endsAfterMeal) {
      closestMeeting = meeting;
      smallestDiff = 0; // No need to look further as this is the closest possible scenario
      return;
    }

    // Otherwise, find the meeting with the start or end time closest to the meal time
    const diffStart = Math.abs(meetingStartMoment.diff(mealTimeMoment));
    const diffEnd = Math.abs(meetingEndMoment.diff(mealTimeMoment));
    const diff = Math.min(diffStart, diffEnd); // Consider the closest of the start/end times

    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestMeeting = meeting;
    }
  });

  return closestMeeting;
}

module.exports = {
  calculateNumberOfDays,
  calculateFreeTimeSlots,
  findClosestMeetingToTargetDate,
  findClosestMeetingToMealTime,
};
