import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    specialization: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("doctors", doctorSchema);
export default Doctor;
