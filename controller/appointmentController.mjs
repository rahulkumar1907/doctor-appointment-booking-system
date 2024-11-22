import appointmentModel from "../model/appointments.mjs";
import doctorModel from "../model/doctor.mjs";
import userModel from "../model/user.mjs";
import checkAppointmentTimes from "../middleware/timeCheck.mjs";

const bookAppointment = async (req, res) => {
  try {
    let {
      doctorName,
      userId,
      email,
      appointmentStartTime,
      appointmentEndTime,
    } = req.body;

    // trim whitespace from input fields
    doctorName = doctorName ? doctorName.trim() : "";
    email = email ? email.trim().toLowerCase() : "";
    appointmentStartTime = appointmentStartTime
      ? appointmentStartTime.trim()
      : "";
    appointmentEndTime = appointmentEndTime ? appointmentEndTime.trim() : "";

    // validation checks
    if (!doctorName) {
      return res
        .status(400)
        .send({ status: false, message: "doctor name is required" });
    }
    if (!appointmentStartTime || !appointmentEndTime) {
      return res.status(400).send({
        status: false,
        message: "appointment start and end times are required",
      });
    }
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }

    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid email format" });
    }

    // validate time format 12 hour format
    const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/i;
    if (
      !timeRegex.test(appointmentStartTime) ||
      !timeRegex.test(appointmentEndTime)
    ) {
      return res.status(400).send({
        status: false,
        message:
          "invalid time format. expected format: HH:MM AM/PM in 12 hours clock format",
      });
    }

    // time validation for appointment
    const timedata = checkAppointmentTimes(
      appointmentStartTime,
      appointmentEndTime
    );

    if (timedata.status === false) {
      return res.status(400).send(timedata);
    }
    // find the user and authorization check
    const user = await userModel.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: "patient not found" });
    }
    if (user.email !== email) {
      return res
        .status(401)
        .send({ status: false, message: "user not authorized" });
    }

    // find the doctor
    const doctor = await doctorModel.findOne({
      name: doctorName,
      isDeleted: false,
    });
    if (!doctor) {
      return res
        .status(404)
        .send({ status: false, message: "doctor not found" });
    }

    // check for overlapping appointments with the doctor
    const conflictingDoctorAppointment = await appointmentModel.findOne({
      doctorId: doctor._id,
      $or: [
        {
          appointmentStartTime: { $lt: appointmentEndTime },
          appointmentEndTime: { $gt: appointmentStartTime },
        },
      ],
      status: { $in: ["booked", "modified"] },
    });

    if (conflictingDoctorAppointment) {
      return res.status(400).send({
        status: false,
        message:
          "appointment time slot conflicts with another booking for the doctor",
      });
    }

    // check for overlapping appointments with other doctors for the patient
    const conflictingPatientAppointment = await appointmentModel.findOne({
      patientId: userId,
      $or: [
        {
          appointmentStartTime: { $lt: appointmentEndTime },
          appointmentEndTime: { $gt: appointmentStartTime },
        },
      ],
      status: { $in: ["booked", "modified"] },
    });

    if (conflictingPatientAppointment) {
      return res.status(409).send({
        status: false,
        message:
          "you already have an appointment with another doctor in the given time slot",
      });
    }

    // create the appointment
    const appointment = {
      patientId: userId,
      doctorId: doctor._id,
      appointmentStartTime,
      appointmentEndTime,
      status: "booked",
    };

    const appointmentData = await appointmentModel.create(appointment);
    const responseData = {
      _id: appointmentData._id,
      patientFirstName: user.firstName,
      patientLastName: user.lastName,
      email: user.email,
      doctorName: doctor.name,
      appointmentSlot: `${appointmentData.appointmentStartTime} - ${appointmentData.appointmentEndTime}`,
      status: appointmentData.status,
      createdAt: appointmentData.createdAt,
    };

    return res.status(201).send({
      status: true,
      message: "appointment created successfully",
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "internal server error" });
  }
};

const getAppointmentDetails = async (req, res) => {
  try {
    const { email } = req.query;

    // validate the email
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid email format" });
    }

    // find the patient by email
    const patient = await userModel.findOne({ email: email, isDeleted: false });
    if (!patient) {
      return res
        .status(404)
        .send({ status: false, message: "patient not found" });
    }

    // authorization check
    if (patient._id.toString() !== req.body.userId) {
      return res
        .status(401)
        .send({ status: false, message: "user not authorized" });
    }

    // find all appointments for the patient
    const appointments = await appointmentModel
      .find({
        patientId: patient._id,
        status: { $in: ["booked", "modified"] },
      })
      .populate({
        path: "doctorId",
        select: "name specialization",
      });

    if (!appointments.length) {
      return res.status(404).send({
        status: false,
        message: "no appointment found for this patient",
      });
    }

    // response data with details of all appointments
    const responseData = appointments.map((appointment) => ({
      appointmentSlot: `${appointment.appointmentStartTime} - ${appointment.appointmentEndTime}`,
      doctorName: appointment.doctorId ? appointment.doctorId.name : "unknown",
      specialization: appointment.doctorId
        ? appointment.doctorId.specialization
        : "unknown",
    }));

    return res.status(200).send({
      status: true,
      message: "appointment details retrieved successfully",
      data: {
        patient: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
        },
        appointments: responseData,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: "internal server error" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { email, appointmentStartTime, appointmentEndTime } = req.body;

    // validate the email
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid email format" });
    }

    // validate appointment start and end times
    if (!appointmentStartTime || !appointmentEndTime) {
      return res.status(400).send({
        status: false,
        message: "appointment start time and end time are required",
      });
    }
    // validate time format 12 hour format
    const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/i;
    if (
      !timeRegex.test(appointmentStartTime) ||
      !timeRegex.test(appointmentEndTime)
    ) {
      return res.status(400).send({
        status: false,
        message:
          "invalid time format. expected format: HH:MM AM/PM in 12 hours clock format",
      });
    }
    // time validation for appointment
    const timedata = checkAppointmentTimes(
      appointmentStartTime,
      appointmentEndTime
    );

    if (timedata.status === false) {
      return res.status(400).send(timedata);
    }
    // find the patient by email
    const patient = await userModel.findOne({ email: email, isDeleted: false });
    if (!patient) {
      return res
        .status(404)
        .send({ status: false, message: "patient not found" });
    }

    // authorization check
    if (patient._id.toString() !== req.body.userId) {
      return res
        .status(401)
        .send({ status: false, message: "user not authorized" });
    }

    // find the appointment to cancel using start and end time
    const appointment = await appointmentModel.findOne({
      patientId: patient._id,
      appointmentStartTime: appointmentStartTime,
      appointmentEndTime: appointmentEndTime,
      status: { $in: ["booked", "modified"] },
    });

    if (!appointment) {
      return res.status(404).send({
        status: false,
        message: "appointment not found or already cancelled",
      });
    }

    // update appointment status to cancelled
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointment._id,
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(400).send({
        status: false,
        message: "failed to cancel the appointment",
      });
    }

    // return the updated appointment data
    return res.status(200).send({
      status: true,
      message: "appointment cancelled successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: "internal server error" });
  }
};

const viewAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorName } = req.query;

    // validate the doctor name
    if (!doctorName) {
      return res.status(400).send({
        status: false,
        message: "doctor name is required",
      });
    }

    // find the doctor by name
    const doctor = await doctorModel.findOne({
      name: doctorName,
      isDeleted: false,
    });
    if (!doctor) {
      return res.status(404).send({
        status: false,
        message: "doctor not found",
      });
    }

    // find all booked appointments for doctor
    const appointments = await appointmentModel
      .find({
        doctorId: doctor._id,
        status: { $in: ["booked", "modified"] },
      })
      .populate({
        path: "patientId",
        select: "firstName lastName email",
      });

    // if no appointments are found
    if (appointments.length === 0) {
      return res.status(404).send({
        status: false,
        message: "no booked appointments found for doctor",
      });
    }

    // response data with appointment start and end times
    const responseData = appointments.map((appointment) => ({
      appointmentSlot: `${appointment.appointmentStartTime} - ${appointment.appointmentEndTime}`,
      patient: {
        firstName: appointment.patientId.firstName,
        lastName: appointment.patientId.lastName,
        email: appointment.patientId.email,
      },
      status: appointment.status,
    }));

    // send the response
    return res.status(200).send({
      status: true,
      message: "appointments retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      status: false,
      message: "internal server error",
    });
  }
};

const modifyAppointment = async (req, res) => {
  try {
    let {
      email,
      originalStartTime,
      originalEndTime,
      newStartTime,
      newEndTime,
    } = req.body;
    email = req.body.email ? req.body.email.trim().toLowerCase() : "";
    originalStartTime = req.body.originalStartTime
      ? req.body.originalStartTime.trim()
      : "";
    originalEndTime = req.body.originalEndTime
      ? req.body.originalEndTime.trim()
      : "";
    newStartTime = req.body.newStartTime ? req.body.newStartTime.trim() : "";
    newEndTime = req.body.newEndTime ? req.body.newEndTime.trim() : "";
    // validate inputs
    if (
      !email ||
      !originalStartTime ||
      !originalEndTime ||
      !newStartTime ||
      !newEndTime
    ) {
      return res.status(400).send({
        status: false,
        message:
          "email, original start time, original end time, new start time, and new end time are required",
      });
    }
    const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/i;
    if (
      !timeRegex.test(originalStartTime) ||
      !timeRegex.test(originalEndTime) ||
      !timeRegex.test(newStartTime) ||
      !timeRegex.test(newEndTime)
    ) {
      return res.status(400).send({
        status: false,
        message:
          "invalid time format. expected format: HH:MM AM/PM in 12 hours clock format",
      });
    }
    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        status: false,
        message: "invalid email format",
      });
    }
    // time validation for appointment
    const timedataOriginal = checkAppointmentTimes(
      originalStartTime,
      originalEndTime
    );

    if (timedataOriginal.status === false) {
      return res.status(400).send(timedataOriginal);
    }
    const timedataNew = checkAppointmentTimes(newStartTime, newEndTime);

    if (timedataNew.status === false) {
      return res.status(400).send(timedataNew);
    }
    // find patient by email
    const patient = await userModel.findOne({ email: email, isDeleted: false });
    if (!patient) {
      return res.status(404).send({
        status: false,
        message: "patient not found",
      });
    }

    // authorization check
    if (patient._id.toString() !== req.body.userId) {
      return res
        .status(401)
        .send({ status: false, message: "user not authorized" });
    }

    // find the existing appointment based on patient ID and original start and end times
    const appointment = await appointmentModel.findOne({
      patientId: patient._id,
      appointmentStartTime: originalStartTime,
      appointmentEndTime: originalEndTime,
      status: { $in: ["booked", "modified"] },
    });

    if (!appointment) {
      return res.status(404).send({
        status: false,
        message: "appointment not found with given time range",
      });
    }

    // check if the new time range is already booked for the doctor by any patient
    const conflictingDoctorAppointment = await appointmentModel.findOne({
      doctorId: appointment.doctorId,
      status: { $in: ["booked", "modified"] },
      _id: { $ne: appointment._id },
      $or: [
        {
          appointmentStartTime: { $lte: newEndTime },
          appointmentEndTime: { $gte: newStartTime },
        },
      ],
    });

    if (conflictingDoctorAppointment) {
      return res.status(400).send({
        status: false,
        message:
          "new time range conflicts with another booking for the same doctor",
      });
    }

    // update the appointment with the new time range
    const updatedAppointment = await appointmentModel
      .findByIdAndUpdate(
        appointment._id,
        {
          appointmentStartTime: newStartTime,
          appointmentEndTime: newEndTime,
          status: "modified",
        },
        { new: true }
      )
      .populate("doctorId", "name specialization");

    // response with updated appointment details
    return res.status(200).send({
      status: true,
      message: "appointment modified successfully",
      data: {
        appointmentId: updatedAppointment._id,
        appointmentStartTime: updatedAppointment.appointmentStartTime,
        appointmentEndTime: updatedAppointment.appointmentEndTime,
        status: updatedAppointment.status,
        doctor: {
          name: updatedAppointment.doctorId.name,
          specialization: updatedAppointment.doctorId.specialization,
        },
        patient: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
        },
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "internal server error",
    });
  }
};

export {
  bookAppointment,
  getAppointmentDetails,
  cancelAppointment,
  viewAppointmentsByDoctor,
  modifyAppointment,
};
