const express = require("express");
import { StaffClass } from "../controller/staffController";
import { auth, commonStaffAuth, staffAuth } from "../middleware/auth";
import multer from "../middleware/multer";
import { validateLogin, validateUpdateStaffProfile } from "../middleware/validate";
const staffRouter = express.Router();

staffRouter.post("/login", validateLogin, StaffClass.staffLogin);
staffRouter.get("/getstaff", staffAuth, StaffClass.getStaff);
staffRouter.get("/getmypatient/:patientId", staffAuth, StaffClass.getMyPatient);
staffRouter.get("/getmyallpatients", staffAuth, StaffClass.getMyAllPatients);
staffRouter.get("/getstaffbyrole", staffAuth, StaffClass.getStaffByRole);
staffRouter.get("/getstaffbyspecialization", staffAuth, StaffClass.getStaffBySpecialization);
staffRouter.put("/updatestaff",validateUpdateStaffProfile, commonStaffAuth, StaffClass.updateStaff);
staffRouter.post("/uploadprofile", commonStaffAuth, multer.upload.single('file'), StaffClass.uploadProfile);
staffRouter.get("/logout", commonStaffAuth, StaffClass.staffLogout);
staffRouter.get("/forgetpassword", commonStaffAuth, StaffClass.forgetPassword);
staffRouter.post("/resetpassword", commonStaffAuth, StaffClass.resetPassword);

export default staffRouter;
