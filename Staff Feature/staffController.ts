import staffModel from "../models/staffModel";
import { Session } from "../models/sessionModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { StaffServicesClass } from "../services/staffServices";
import { Request, Response } from "express";
const SECRET_KEY = process.env.SECRET_KEY;
import {
  RESPONSE_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REQUIRED_MESSAGES,
} from "../constants";
import dotenv from "dotenv";
import patientModel from "../models/patientModel";
import MedicalHistoryModel from "../models/medicalHistory";
dotenv.config();

export class StaffClass {
  //staff login API
  static async staffLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await StaffServicesClass.loginStaff(email, password);
      res.status(result.status).json(result.response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //get staff details
  static async getStaff(req: Request, res: Response) {
    try {
      const sId = req.userId;
      const result = await StaffServicesClass.getStaffProfile(sId);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //get my patient
  static async getMyPatient(req: Request, res: Response): Promise<void> {
    try {
      const patientId = req.params.patientId;
      const patient = await await patientModel.findById(patientId);

      if (!patient) {
        res.status(404).json({ message: ERROR_MESSAGES.PATIENT_NOT_FOUND });
        return;
      }

      const medicalHistoryWithDoctor = await StaffServicesClass.getMyPatient(
        patientId
      );

      res
        .status(200)
        .json({ patient, medicalHistory: medicalHistoryWithDoctor });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //get all my patients
  static async getMyAllPatients(req: Request, res: Response): Promise<void> {
    try {
      const patientsWithMedicalHistory =
        await StaffServicesClass.getAllPatientsWithMedicalHistory();
      res.status(200).json(patientsWithMedicalHistory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //get staff by role
  static async getStaffByRole(req: Request, res: Response) {
    try {
      const role = req.query.role as string;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.itemsPerPage) || 5;
      if (!role) {
        res.status(400).json({ message: REQUIRED_MESSAGES.ROLE_REQUIRED });
        return;
      }
      const result = await StaffServicesClass.fetchAllStaffByRole(
        role,
        page,
        limit
      );
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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.itemsPerPage) || 5;
      if (!role) {
        res.status(400).json({ message: REQUIRED_MESSAGES.ROLE_REQUIRED });
        return;
      }
      if (!specialization) {
        res
          .status(400)
          .json({ message: REQUIRED_MESSAGES.SPECIALIZATION_REQUIRED });
        return;
      }
      const result = await StaffServicesClass.fetchAllStaffBySpecialization(
        role,
        specialization,
        page,
        limit
      );
      res.status(result.status).json(result.response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //updateStaff by staff member
  static async updateStaff(req: Request, res: Response): Promise<void> {
    try {
      const staffData = req.body;
      const sId = req.userId;
      const result = await StaffServicesClass.updateStaffProfileByStaff(
        sId,
        staffData
      );
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //upload staff profile api
  static async uploadProfile(req: Request, res: Response): Promise<void> {
    try {
      const result = await StaffServicesClass.uploadStaffProfile(req);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //Staff logout API
  static async staffLogout(req: Request, res: Response): Promise<void> {
    try {
      const sId = req.userId;
      const logout = await StaffServicesClass.logoutStaff(sId);
      res.status(200).json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //Forget Password API
  static async forgetPassword(req, res, next) {
    const sId = req.userId;
    try {
      const sendOTP = await StaffServicesClass.sendPasswordResetOTP(sId);
      if (sendOTP.success) {
        return res.status(200).json({ message: SUCCESS_MESSAGES.OTP_SUCCESS });
      } else {
        return res
          .status(401)
          .json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
      }
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //Reset Password API
  static async resetPassword(req: Request, res: Response): Promise<void> {
    const sId = req.userId;
    try {
      const { otp, newPassword, confirmPassword } = req.body;
      if (newPassword != confirmPassword) {
        res.status(400).json({ message: ERROR_MESSAGES.PASSWORD_MISMATCH });
      }
      const result = await StaffServicesClass.resetPassword(
        sId,
        otp,
        newPassword
      );
      if (result.success) {
        res.status(200).json({ message: SUCCESS_MESSAGES.RESET_SUCCESS });
      } else if (result.invalidOtp) {
        res.status(400).json({ message: ERROR_MESSAGES.INVALID_OTP });
      } else {
        return res
          .status(401)
          .json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
      }
    } catch (error) {
      return res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }
}
