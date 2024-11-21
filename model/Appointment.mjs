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
    appointment_slot: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled", "modified"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("appointment", appointmentSchema);
export default Appointment;
