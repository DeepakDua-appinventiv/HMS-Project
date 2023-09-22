// authServices.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import patientModel from "../models/patientModel";
import { Session } from "../models/sessionModel";
import { ObjectId } from "mongoose";
import { SetOptions, createClient } from "redis";
import { promises as fsPromises } from "fs";
import  { ERROR_MESSAGES, RESPONSE_MESSAGES, SUCCESS_MESSAGES } from "../constants";
import { sendVerifyMail } from "../services/emailService";
import nodemailer from 'nodemailer';
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const accountSid = 'AC971c22decfabc9d8362241f712808e43';
const authToken = '45eea03ea99364ab8cd9988372a0650f';
const TwilioClient = require('twilio')(accountSid, authToken);

const SECRET_KEY = process.env.SECRET_KEY;

export class PatientServicesClass {
  //Service to handle patient signup
  static async  signupPatient(patientData: any): Promise<{ status: number; response: any }> {
    try {
      const existingPatient = await patientModel.findOne({ email: patientData.email });
      if (existingPatient) {
        return { status: 400, response: { message: RESPONSE_MESSAGES.DUPLICATE } };
      }

      const newPatient = new patientModel(patientData);
      newPatient.password = await bcrypt.hash(newPatient.password, 10);

      const result = await newPatient.save();
      if (result) {
        sendVerifyMail(patientData.name, patientData.email, result._id);
        return { status: 200, response: { user: result, message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS } };
      } else {
        return { status: 500, response: { user: result, message: ERROR_MESSAGES.REGISTRATION_FAILED } };
      }
    } catch (error) {
      throw error;
    }
  }

  //Service to handle verfiy email
  static async verifyMail(patientId) {
    try {
      const findInfo = await patientModel.findOne({
        $and: [{ _id: patientId }, { verified: true }],
      });
      
      if (findInfo) {
        return {
          message: 'Your email has already been verified.',
          next: 'Please login to the APP.',
        };
      } else {
        const updateInfo = await patientModel.updateOne(
          { _id: patientId },
          { $set: { verified: true } }
        );
        console.log(updateInfo);
        return {
          message: 'Your email has been verified.',
          next: 'Please login to the APP.',
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Service function to handle patient login
  static async loginPatient(
    email: string,
    password: string
  ): Promise<string | null> {
    try {
      const existingPatient = await patientModel.findOne({ email });

      if (!existingPatient) {
        throw new Error(ERROR_MESSAGES.PATIENT_NOT_FOUND);
      }

      const matchPassword = await bcrypt.compare(
        password,
        existingPatient.password
      );
      if (!matchPassword) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      const token = jwt.sign(
        { email: existingPatient.email, id: existingPatient._id },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      const client = createClient();
      client.on("error", (err) => console.log("redis Client Error", err));
      await client.connect();
      await client.set(`status:${existingPatient._id}`, "true");

      // Create and save session logic goes here
      await Session.create({
        userId: existingPatient._id,
        isUserActive: true,
      });

      return token;
    } catch (error) {
      throw error;
    }
  }

  //Service to handle get patient profile
  static async getPatientProfile(pId: ObjectId): Promise<any> {
    try {
      const getPatientProfile = await patientModel.findOne({ _id: pId });
      if (!getPatientProfile) {
        throw new Error(ERROR_MESSAGES.PATIENT_NOT_FOUND);
      }
      return getPatientProfile;
    } catch (error) {
      throw error;
    }
  }

  //Service to handle update patient profile
  static async updatePatientProfile(pId: ObjectId, patientData): Promise<any> {
    try {
      const updatePatientProfile = await patientModel.findByIdAndUpdate(
        pId,
        { $set: patientData },
        { new: true }
      );
      if (!updatePatientProfile) {
        throw new Error(ERROR_MESSAGES.PATIENT_NOT_FOUND);
      }
      return updatePatientProfile;
    } catch (error) {
      throw error;
    }
  }

  //Service to handle delete patient profile
  static async deletePatientProfile(pId: ObjectId): Promise<any> {
    try {
      const deletePatientProfile = await patientModel.findOne({ _id: pId });
      if (!deletePatientProfile) {
        throw ERROR_MESSAGES.PATIENT_NOT_FOUND;
      }
      await patientModel.findByIdAndRemove(pId);
    } catch (error) {
      throw error;
    }
  }

  //Service to handle logout patient
  static async logoutPatient(pId: ObjectId): Promise<any> {
    try {
      // Delete the active session for the patient
      await Session.findOneAndUpdate(
        { userId: pId, isUserActive: true },
        { isUserActive: false }
      );

      //status = false in redis when user/patient logout
      const client = createClient();
      client.on("error", (err) => console.log("Redis Cilent Error", err));
      await client.connect();
      await client.set(`status: ${pId}`, "false");
    } catch (error) {
      throw error;
    }
  }

  //Service to handle upload patient profile
  static async uploadPatientProfile(req: any): Promise<any> {
    try {
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return { message: "No file uploaded", success: false };
      }

      const patientId = req.userId; 

      // Find the patient in the database
      const patient = await patientModel.findById({ _id: patientId });

      if (!patient) {
        return { message: ERROR_MESSAGES.PATIENT_NOT_FOUND, success: false };
      }

      // If patient already has a profile, delete the old profile file
      if (patient.profile) {
        await fsPromises.unlink(patient.profile); // Remove the old profile file
      }

      // Update the patient's profile field in the database with the new profilePath
      const profilePath = uploadedFile.path; 
      patient.profile = profilePath;
      await patient.save();

      return { message: "Profile uploaded successfully", success: true };
    } catch (error) {
      throw error;
    }
  }

  static async sendPasswordResetOTP(pId: ObjectId): Promise<any> {
    try {
      const patient = await patientModel.findOne({ _id: pId });
      if (!patient) {
        return { success: false };
      }
      const client = createClient();
      client.on("error", (err) => console.log("redis Client Error", err));
      await client.connect();
      const template = fs.readFileSync('/home/admin446/Desktop/Hospital Mang Project/src/templates/OTP_Email.html', 'utf-8');
      const generateOTP = async (length) => {
        const charset = '0123456789';
        let otp = '';
      
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          otp += charset[randomIndex];
        }
      
        return otp;
      };
      const otp = await generateOTP(6);
      const options: SetOptions = { EX: 120 };
      await client.set(`otp:${pId}`, otp);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: patient.email, 
        subject: "Password Reset OTP",
        html: template
          .replace("{{ name }}", patient.name) 
          .replace("{{ otp }}", otp),
      };
      
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      throw error;
        }
    }

    static async sendPasswordResetOTPSMS(pId: ObjectId): Promise<any> {
      try {
        const patient = await patientModel.findOne({ _id: pId });
        if (!patient) {
          return { success: false };
        }
        const client = createClient();
        client.on("error", (err) => console.log("redis Client Error", err));
        await client.connect();
        const generateOTP = async (length) => {
          const charset = '0123456789';
          let otp = '';
          for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            otp += charset[randomIndex];
          }
          return otp;
        };
        const otp = await generateOTP(6);
        const options: SetOptions = { EX: 120 };
        await client.set(`otp:${pId}`, otp);
  
        TwilioClient.messages
        .create({
          body: `Hi, ${patient.name}, Please use ${otp} as OTP for password reset on your HMS Account. OTP valid for 2 minutes`,
          from: '+16592014852',
          to: '+919650949873'
      })
      .then(message => console.log(message.sid))
      .done();
        
        return { success: true };
      } catch (error) {
        throw error;
      }
    }

    //Service to handle reset password functionality
    static async resetPassword(pId, enteredOtp, newPassword){
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const client = createClient();
        client.on("error", (err) => console.log("redis Client Error", err));
        await client.connect();
        const storedOtp = await client.get(`otp: ${pId}`);
        if(!storedOtp) {
          return { success: false };
        }
        if(enteredOtp == storedOtp){
          const patient = await patientModel.findOne({ _id:pId });
          patient.password = hashedPassword;
          await patient.save();
          await client.del(`otp: ${pId}`);
          return { success: true };
        }
      } catch (error) {
          return { invalidOtp: true };
      }
    }
}
