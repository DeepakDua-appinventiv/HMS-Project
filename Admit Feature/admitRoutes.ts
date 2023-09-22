const express = require('express');
const admitRouter = express.Router();
import { AdmitClass } from "../controller/admitController";
import { recAuth } from "../middleware/auth";

admitRouter.post("/patient",recAuth, AdmitClass.admitPatient);
admitRouter.put("/dischargepatient", recAuth, AdmitClass.dischargePatient);

export default admitRouter;
