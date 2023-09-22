const express = require("express");
const appRouter = express.Router();
import { AppointmentClass } from "../controller/appointmentController";
import { auth } from "../middleware/auth";

appRouter.post("/book", auth, AppointmentClass.bookAppointment);
appRouter.get("/getApp", auth, AppointmentClass.getAppDetails);
appRouter.put("/updateapp", auth, AppointmentClass.updateAppDetails);
appRouter.patch("/cancelapp", auth, AppointmentClass.cancelAppointment);

export default appRouter;
