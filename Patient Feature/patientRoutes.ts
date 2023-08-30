const express = require('express');
import {signup, PatientClass,  verifyMail} from "../controller/patientController"
const patientRouter = express.Router();
import {auth} from "../middleware/auth";
import multer from "../middleware/multer";
import {validateSignup,validateLogin,validateUpdatePatientProfile} from '../middleware/validate';

patientRouter.post("/signup",validateSignup, signup);
patientRouter.get('/verify', verifyMail);
patientRouter.post("/login",validateLogin, PatientClass.login);
patientRouter.get("/logout",auth, PatientClass.logout);
patientRouter.get("/getpatient", auth, PatientClass.getPatient);
patientRouter.put("/updatepatient", validateUpdatePatientProfile, auth, PatientClass.updatePatient);
patientRouter.post("/uploadprofile", auth, multer.upload.single('file'), PatientClass.uploadProfile);
patientRouter.delete("/deletepatient", auth, PatientClass.deletePatient);
patientRouter.post("/forgetpassword", auth, PatientClass.forgetPassword);

export default patientRouter;
