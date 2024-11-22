import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
      required: true,
    },
    appointmentStartTime: { type: String, required: true },
    appointmentEndTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled", "modified"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("appointments", appointmentSchema);
export default Appointment;
