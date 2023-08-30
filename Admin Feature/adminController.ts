import staffModel from "../models/staffModel";
import { Session } from "../models/sessionModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import  { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE, RESPONSE_MESSAGES } from "../constants";
import { AdminServicesClass} from "../services/adminServices";
const SECRET_KEY = process.env.SECRET_KEY;

export class AdminClass{
//admin login API
  static async adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await AdminServicesClass.loginAdmin(email, password);
    res.status(result.status).json(result.response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//add staff API
  static async addStaff(req: Request, res: Response) {
  try {
    const staffData = req.body;
    const result = await AdminServicesClass.addNewStaff(staffData);
    res.status(result.status).json(result.response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//remove staff API
  static async removeStaff(req: Request, res: Response) {
  try {
    const staffToRemove = req.params.email;
    const result = await AdminServicesClass.removeStaffProfile(staffToRemove);
    res.status(result.status).json(result.response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//update staff API
  static async updateStaff(req: Request, res: Response) {
  const staffData = req.body;
  try {
    const result = await AdminServicesClass.updateStaffProfile(staffData);
    res.status(result.status).json(result.response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//get all staff details
  static async getAllStaffProfiles(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.itemsPerPage) || DEFAULT_ITEMS_PER_PAGE;
    const result = await AdminServicesClass.fetchAllStaffProfiles(page, limit);
    res.status(result.status).json(result.response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//get staff by role
 static async getStaffByRole(req: Request, res: Response) {
    try {
        const role = req.query.role as string; 
        const page = parseInt(req.query.page) || DEFAULT_PAGE;
        const limit = parseInt(req.query.itemsPerPage) || DEFAULT_ITEMS_PER_PAGE;
        if (!role) {
            res.status(400).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
            return;
        }
        const result = await AdminServicesClass.fetchAllStaffByRole(role, page, limit);
        console.log(result);
        res.status(result.status).json(result.response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
 }

//get staff by specialization
static async getStaffBySpecialization(req: Request, res: Response) {
    try {
        const role = req.query.role as string;
        const specialization = req.query.specialization as string;
        const page = parseInt(req.query.page) || DEFAULT_PAGE;
        const limit = parseInt(req.query.itemsPerPage) || DEFAULT_ITEMS_PER_PAGE;
        if (!role) {
            res.status(400).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
            return;
        }
        if (!specialization) {
            res.status(400).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
            return;
        }
        const result = await AdminServicesClass.fetchAllStaffBySpecialization(role, specialization, page, limit);
        res.status(result.status).json(result.response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}

//get all patient details
  static async getAllPatientProfiles(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.itemsPerPage) || DEFAULT_ITEMS_PER_PAGE;
    const result = await AdminServicesClass.fetchAllPatientProfiles(page, limit);
    res.status(result.status).json(result.response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//Admin Logout API
static async adminLogout(req: Request, res: Response) {
  try {
    const result = await AdminServicesClass.logoutAdmin(req.userId);
    res.status(result.status).json(result.response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}
  
}