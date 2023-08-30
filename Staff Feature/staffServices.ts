import staffModel from '../models/staffModel';
import { Session } from '../models/sessionModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import { createClient } from "redis";
import fs from "fs";
import MedicalHistoryModel from '../models/medicalHistory';
import nodemailer from 'nodemailer';
import { promises as fsPromises } from "fs";
import patientModel from '../models/patientModel';

const SECRET_KEY = process.env.SECRET_KEY;

export class StaffServicesClass{

//Service to handle staff login
 static async loginStaff(email: string, password: string) {
    try {
        const existingStaff = await staffModel.findOne({ email: email });

        if (!existingStaff) {
            return { status: 404, response: { message: ERROR_MESSAGES.STAFF_NOT_FOUND } };
        }

        const matchPassword = await bcrypt.compare(password, existingStaff.password);

        if (!matchPassword) {
            return { status: 400, response: { message: ERROR_MESSAGES.INVALID_CREDENTIALS } };
        }

        const token = jwt.sign(
            { email: existingStaff.email, id: existingStaff._id, role: existingStaff.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        const client = createClient();  client.on("error", (err) => console.log("redis Client Error", err));  
        await client.connect();         
        await client.set(`status:${existingStaff._id}`, 'true');

        await Session.create({
            userId: existingStaff._id,
            isUserActive: true
        });

        return { status: 201, response: { message: SUCCESS_MESSAGES.LOGIN_SUCCESS, token: token } };
    } catch (error) {
        throw error;
    }
}


//Service to handle get staff profile
  static async getStaffProfile(sId: ObjectId): Promise<any>{
    try {
       const getStaffProfile = await staffModel.findOne({id: sId});
       if(!getStaffProfile){
        throw new Error(ERROR_MESSAGES.STAFF_NOT_FOUND);
       }
       return getStaffProfile;
    } catch (error) {
        throw error;
    }
}
  
//Service to handle get all staff details by there role
static async fetchAllStaffByRole(role: string, page: number, limit: number): Promise<any>{
    try {
        const skip = (page-1) * limit;
        const staffProfiles = await staffModel.find({role:role}).skip(skip).limit(limit);
        console.log(role)
        if (!staffProfiles || staffProfiles.length === 0) {
            return { status: 404, response: { message: `No staff profiles found with role: ${role}` } };
        }
        return { status:200, response: staffProfiles };
    } catch (error) {
        throw error;
    }
}

//Service to handle get all staff details by there specialization
static async fetchAllStaffBySpecialization(role: string, specialization: string, page: number, limit: number): Promise<any>{
    try {
        const skip = (page-1) * limit;
        const staffProfiles = await staffModel.find({role: role, specialization: specialization}).skip(skip).limit(limit);
        if (!staffProfiles || staffProfiles.length === 0) {
            return { status: 404, response: { message: `No staff profiles found with role: ${role}` } };
        }
        return { status:200, response: staffProfiles };
    } catch (error) {
        throw error;
    }
}

//Service to handle update staff profile
  static async updateStaffProfileByStaff(sId: ObjectId, staffData): Promise<any>{
    try {
        const updateStaffProfile = await staffModel.findByIdAndUpdate(sId, {$set: staffData}, {new: true});
        if(!updateStaffProfile) {
            throw new Error(ERROR_MESSAGES.STAFF_NOT_FOUND);
        }
        return updateStaffProfile;
    } catch (error) {
        throw error;
    }
}

//Service to handle upload staff profile
static async uploadStaffProfile(req: any): Promise<any>{
    try {
        const uploadedFile = req.file;

        if (!uploadedFile) {
            return { message: "No file uploaded", success: false };
        }

        const staffId = req.userId; 
        const staff = await staffModel.findById({_id: staffId});

        if (!staff) {
            return { message: ERROR_MESSAGES.STAFF_NOT_FOUND, success: false };
        }

        // If staff already has a profile, delete the old profile file
        if (staff.Profile) {
            await fsPromises.unlink(staff.Profile); 
        }

        // Update the staff's profile field in the database with the new profilePath
        const profilePath = uploadedFile.path; 
        staff.Profile = profilePath;
        await staff.save();

        return { message: "Profile uploaded successfully", success: true };
    } catch (error) {
        throw error;
    }
}

//Service to handle logout staff
  static async logoutStaff(sId: ObjectId): Promise<any>{
    try {
        // Delete the active session for the patient
        await Session.findOneAndUpdate(
            { userId: sId, isUserActive: true },
            { isUserActive: false }
        );
        //status = false in redis when user/staff logout
        const client = createClient();
        client.on("error", (err)=> console.log("Redis Cilent Error", err));
        await client.connect();
        await client.set(`status: ${sId}`, 'false');
    } catch (error) {
        throw error;
    }
}

static async sendPasswordResetOTP(sId: ObjectId): Promise<any> {
    try {
      const patient = await patientModel.findOne({ _id: sId });
      if (!patient) {
        return { success: false };
      }
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

      await  transporter.sendMail(mailOptions);
      const client = createClient();
      client.on("error", (err) => console.log("redis Client Error", err));
      await client.connect();
      await client.set(`status:${sId}`, `${otp}`);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}