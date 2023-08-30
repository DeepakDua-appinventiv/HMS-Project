import patientModel from "../models/patientModel";
import { Session } from "../models/sessionModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { PatientServicesClass } from "../services/patientServices";
import  { ERROR_MESSAGES, RESPONSE_MESSAGES, SUCCESS_MESSAGES } from "../constants";
const SECRET_KEY = process.env.SECRET_KEY;
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { sendVerifyMail } from "../services/emailService";


//Signup API
export async function signup(req: Request, res: Response) {
  const patientData = req.body;
  try {
    const result = await PatientServicesClass.signupPatient(patientData);
    res.status(result.status).json(result.response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// verify mail function
export async function verifyMail(req: any, res: any) {
  try {
    const findInfo = await patientModel.findOne({
      $and: [{ _id: req.query.id }, { verified: true }],
    });
    if (findInfo) {
      res
        .status(200)
        .json({
          message: " Your email has been already verified.",
          next: "Please Login! To the APP",
        });
    } else {
      const updateInfo = await patientModel.updateOne(
        { _id: req.query.id },
        { $set: { verified: true } }
      );
      console.log(updateInfo);
      res
        .status(200)
        .json({
          message: " Your email has been verified.",
          next: "Please Login! To the APP",
        });
    }
  } catch (error) {
    console.log(error.message);
  }
}

export class PatientClass{

//patient login API
 static async login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  try {
    const token = await PatientServicesClass.loginPatient(email, password);

    res.status(200).json({ message: SUCCESS_MESSAGES.LOGIN_SUCCESS, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//patient getProfile API
 static async getPatient(req: Request, res: Response): Promise<void> {
  try {
    const pId = req.userId;
    const patientProfile = await PatientServicesClass.getPatientProfile(pId);
    res.status(200).json(patientProfile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//patient updateProfile API
 static async updatePatient(
  req: Request,
  res: Response
): Promise<void> {
  const patientData = req.body;
  try {
    const pId = req.userId;
    const updateProfile = await PatientServicesClass.updatePatientProfile(pId, patientData);
    res.status(200).json(updateProfile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//delete patient profile API
static async deletePatient(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const pId = req.userId;
    const deleteProfile = await PatientServicesClass.deletePatientProfile(pId);

    res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.DELETE_SUCCESS });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//patient logout API
static async logout(req: Request, res: Response): Promise<void> {
  try {
    const pId = req.userId;
    const logout = await PatientServicesClass.logoutPatient(pId);
    // await redisSet(pId.toString(), JSON.stringify({ userId: pId, isUserActive: false }));
    res.status(200).json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

//upload patient profile api
static async uploadProfile(req: Request, res: Response): Promise<void> {
    try {
        const result = await PatientServicesClass.uploadPatientProfile(req);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
    res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}

//Forget Password API
static  async forgetPassword (req, res, next) {
  const pId = req.userId;
  try {
    const sendOTP = await PatientServicesClass.sendPasswordResetOTP(pId);
    if (sendOTP.success) {
      return res.status(200).json({ message: SUCCESS_MESSAGES.OTP_SUCCESS });
    } else {
      return res.status(401).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
  }
}

}