const express = require("express");
import { AdminClass } from "../controller/adminController";
const adminRouter = express.Router();
import { adminAuth } from "../middleware/auth";

adminRouter.post("/login", AdminClass.adminLogin);
adminRouter.post("/addstaff", adminAuth, AdminClass.addStaff);
adminRouter.put("/updatestaff", adminAuth, AdminClass.updateStaff);
adminRouter.get("/getallstaff", adminAuth, AdminClass.getAllStaffProfiles);
adminRouter.get("/getstaffbyrole", adminAuth, AdminClass.getStaffByRole);
adminRouter.get("/getstaffbyspecialization", adminAuth, AdminClass.getStaffBySpecialization);
adminRouter.get("/getallpatient", adminAuth, AdminClass.getAllPatientProfiles);
adminRouter.delete("/removestaff/:email", adminAuth, AdminClass.removeStaff);
adminRouter.get("/logout", adminAuth, AdminClass.adminLogout);

export default adminRouter;
