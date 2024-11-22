import express from "express";
import {
  bookAppointment,
  getAppointmentDetails,
  cancelAppointment,
  viewAppointmentsByDoctor,
  modifyAppointment,
} from "../controller/appointmentController.mjs";
import auth from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.post("/book-appointment", auth.authentication, bookAppointment);
router.get("/get-appointments", auth.authentication, getAppointmentDetails);
router.get("/get-all-appointments-of-doctor", viewAppointmentsByDoctor);
router.put("/cancel-appointment", auth.authentication, cancelAppointment);
router.put("/modify-appointment", auth.authentication, modifyAppointment);

export default router;
