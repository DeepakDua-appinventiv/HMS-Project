import staffModel from '../models/staffModel';
import { Session } from '../models/sessionModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose, { ObjectId } from 'mongoose';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import { SetOptions, createClient } from "redis";
import fs from "fs";
import MedicalHistoryModel from '../models/medicalHistory';
import nodemailer from 'nodemailer';
import { promises as fsPromises } from "fs";
import patientModel from '../models/patientModel';
const accountSid = 'AC971c22decfabc9d8362241f712808e43';
const authToken = '45eea03ea99364ab8cd9988372a0650f';
const Tclient = require('twilio')(accountSid, authToken);

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
  
//Service to handle get my patient medical history
  static async getMyPatient(patientId: string) {
  try {
    const medicalHistory = await MedicalHistoryModel.find({ patientId })
      .populate('appointmentId')
      .exec();

    if (!medicalHistory || medicalHistory.length === 0) {
      return [];
    }

    const medicalHistoryWithDoctor = await MedicalHistoryModel.aggregate([
      {
        $match: { patientId: new mongoose.Types.ObjectId(patientId) },
      },
      {
        $lookup: {
          from: 'staff',
          localField: 'diagnozedWith.treatedBy',
          foreignField: '_id',
          as: 'diagnozedWith.treatedDoctorName',
        },
      },
      {
        $unwind: '$diagnozedWith.treatedDoctorName',
      },
    ]);

    return medicalHistoryWithDoctor;
  } catch (error) {
    throw error;
  }
}

//Service to handle get all my patient with medical history
static async getAllPatientsWithMedicalHistory() {
  try {
    const patients = await patientModel.find();

    if (!patients || patients.length === 0) {
      return [];
    }

    const patientsWithMedicalHistory = [];

    for (const patient of patients) {
      const patientId = patient._id;

      const medicalHistoryWithDoctor = await MedicalHistoryModel.aggregate([
        {
          $match: { patientId: new mongoose.Types.ObjectId(patientId) },
        },
        {
          $lookup: {
            from: 'staff', 
            localField: 'diagnozedWith.treatedBy',
            foreignField: '_id',
            as: 'diagnozedWith.treatedDoctorName',
          },
        },
        {
          $unwind: '$diagnozedWith.treatedDoctorName',
        },
      ]);

      patientsWithMedicalHistory.push({
        patient,
        medicalHistory: medicalHistoryWithDoctor,
      });
    }

    return patientsWithMedicalHistory;
  } catch (error) {
    console.error(error);
    throw new Error('Server error');
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
      const staff = await patientModel.findOne({ _id: sId });
      if (!staff) {
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
      await client.set(`otp:${sId}`, otp);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: staff.email, 
        subject: "Password Reset OTP",
        html: template
          .replace("{{ name }}", staff.name) 
          .replace("{{ otp }}", otp),
      };

      await  transporter.sendMail(mailOptions);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static async sendPasswordResetOTPSMS(sId: ObjectId): Promise<any> {
    try {
      const staff = await staffModel.findOne({ _id: sId });
      if (!staff) {
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
      await client.set(`otp:${sId}`, otp);

      Tclient.messages
      .create({
        body: `Hi, ${staff.firstName}, Please use ${otp} as OTP for password reset on your HMS Account. OTP valid for 2 minutes`,
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
  static async resetPassword(sId, enteredOtp, newPassword){
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const client = createClient();
      client.on("error", (err) => console.log("redis Client Error", err));
      await client.connect();
      const storedOtp = await client.get(`otp: ${sId}`);
      if(!storedOtp) {
        return { success: false };
      }
      if(enteredOtp == storedOtp){
        const staff = await staffModel.findOne({ _id:sId });
        staff.password = hashedPassword;
        await staff.save();
        await client.del(`otp: ${sId}`);
        return { success: true };
      }
    } catch (error) {
        return { invalidOtp: true };
    }
  }

}
