import moment from "moment";

function checkAppointmentTimes(appointmentStartTime, appointmentEndTime) {
  // parse start and end times using Moment.js in 12-hour format with AM/PM
  const startTime = moment(appointmentStartTime, "hh:mma");
  const endTime = moment(appointmentEndTime, "hh:mma");

  console.log("startTime", startTime.format("hh:mmA"));
  console.log("endTime", endTime.format("hh:mmA"));

  // define the allowed time ranges in 24-hour format
  const allowedMorningStart = moment("10:00AM", "hh:mma");
  const allowedMorningEnd = moment("01:00PM", "hh:mma");
  const allowedAfternoonStart = moment("04:00PM", "hh:mma");
  const allowedAfternoonEnd = moment("07:00PM", "hh:mma");

  // check if start and end time are within the allowed ranges
  if (
    !(
      startTime.isBetween(allowedMorningStart, allowedMorningEnd, null, "[)") ||
      startTime.isBetween(
        allowedAfternoonStart,
        allowedAfternoonEnd,
        null,
        "[)"
      )
    ) ||
    !(
      endTime.isBetween(allowedMorningStart, allowedMorningEnd, null, "[)") ||
      endTime.isBetween(allowedAfternoonStart, allowedAfternoonEnd, null, "[)")
    )
  ) {
    return {
      status: false,
      message:
        "appointment times must be between 10 AM to 1 PM or 4 PM to 7 PM.",
    };
  }

  // check if start time is greater than or equal to end time
  if (startTime.isSameOrAfter(endTime)) {
    return {
      status: false,
      message: "appointment end time must be after the start time",
    };
  }

  // calculate the time difference in minutes
  const timeDifference = endTime.diff(startTime, "minutes");

  // check if the time gap is more than 10 minutes
  if (timeDifference > 10) {
    return {
      status: false,
      message: "time gap must not be more than 10 minutes",
    };
  }

  // if everything is valid
  return {
    status: true,
    message: "appointment times are valid",
  };
}

export default checkAppointmentTimes;
