const express = require("express");
import { StaffClass } from "../controller/staffController";
import { auth, staffAuth } from "../middleware/auth";
import multer from "../middleware/multer";
import { validateLogin, validateUpdateStaffProfile } from "../middleware/validate";
const staffRouter = express.Router();

staffRouter.post("/login", validateLogin, StaffClass.staffLogin);
staffRouter.get("/getstaff", auth, StaffClass.getStaff);
staffRouter.get("/getmypatient/:patientId", staffAuth, StaffClass.getMyPatient);
staffRouter.get("/getmyallpatients", staffAuth, StaffClass.getMyAllPatients);
staffRouter.get("/getstaffbyrole", staffAuth, StaffClass.getStaffByRole);
staffRouter.get("/getstaffbyspecialization", staffAuth, StaffClass.getStaffBySpecialization);
staffRouter.put("/updatestaff",validateUpdateStaffProfile, auth, StaffClass.updateStaff);
staffRouter.post("/uploadprofile", auth , multer.upload.single('file'), StaffClass.uploadProfile);
staffRouter.get("/logout", auth, StaffClass.staffLogout);

export default staffRouter;
