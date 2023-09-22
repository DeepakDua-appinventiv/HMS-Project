import staffModel from '../models/staffModel';
import { Session } from '../models/sessionModel';
import patientModel from '../models/patientModel';
import { createClient } from 'redis';
import  { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE, RESPONSE_MESSAGES, SUCCESS_MESSAGES } from "../constants";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';


const SECRET_KEY = process.env.SECRET_KEY;


export class AdminServicesClass{

//Service to handle admin login
 static async loginAdmin(email: string, password: string) {
    try {
        const existingAdmin = await staffModel.findOne({ email: email });

        if (!existingAdmin) {
            return { status: 404, response: { message: 'Admin not found' } };
        }

        const matchPassword = existingAdmin.password === password;

        if (!matchPassword) {
            return { status: 400, response: { message: 'Invalid credentials' } };
        }

        const token = jwt.sign(
            { email: existingAdmin.email, id: existingAdmin._id, role: existingAdmin.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        const client = createClient();  client.on("error", (err) => console.log("redis Client Error", err));  
        await client.connect();         
        await client.set(`status:${existingAdmin._id}`, 'true');

        await Session.create({
            userId: existingAdmin._id,
            isUserActive: true
        });

        return { status: 201, response: { message: SUCCESS_MESSAGES.LOGIN_SUCCESS, token: token } };
    } catch (error) {
        throw error;
    }
}

//Service to handle add new staff by admin
 static async addNewStaff(staffData: any) {
    try {
        const existingStaff = await staffModel.findOne({ email: staffData.email });

        if (existingStaff) {
            return { status: 400, response: { message: 'Staff already exists' } };
        }

        const newStaff = new staffModel(staffData);
        newStaff.password = await bcrypt.hash(newStaff.password, 10);

        await newStaff.save();

        return { status: 201, response: { message: SUCCESS_MESSAGES.ADD_STAFF_SUCCESS, data: newStaff } };
    } catch (error) {
        throw error;
    }
}

//Service to handle remove existing staff by admin
 static async removeStaffProfile(email: string) {
    try {
        const removeStaff = await staffModel.findOne({ email: email });

        if (!removeStaff) {
            return { status: 404, response: { message: 'User/Staff profile not found' } };
        }

        await staffModel.findOneAndRemove({ email: email });

        return { status: 200, response: { message: SUCCESS_MESSAGES.DELETE_SUCCESS } };
    } catch (error) {
        throw error;
    }
}

//Service to handle update staff by admin
 static async updateStaffProfile(staffData: any) {
    try {
        const updateStaff = await staffModel.findOneAndUpdate(
            { email: staffData.email },
            { $set: staffData },
            { new: true }
        );

        if (!updateStaff) {
            return { status: 404, response: { message: 'User/Staff not found' } };
        }

        return { status: 200, response: updateStaff };
    } catch (error) {
        throw error;
    }
}

//Service to handle get all staff details
 static async fetchAllStaffProfiles(page: number, limit: number) {
    try {
        const skip = (page-1) * limit;
        const allStaffProfiles = await staffModel.find({}).skip(skip).limit(limit);
        
        if (!allStaffProfiles || allStaffProfiles.length === 0) {
            return { status: 404, response: { message: 'No staff profiles found' } };
        }
        
        return { status: 200, response: allStaffProfiles };
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

//Service to handle get all patient details
 static async fetchAllPatientProfiles(page: number, limit: number) {
    try {
        const skip = (page-1) * limit;
        const allPatientProfiles = await patientModel.find({}).skip(skip).limit(limit);
        if(!allPatientProfiles || allPatientProfiles.length === 0) {
            return { status: 404, response: { message: 'No patient profiles found' } };
        }
        return { status: 200, response: allPatientProfiles};
    } catch (error) {
        throw error;
    }
}

//Service to handle admin logout
static async logoutAdmin(adminId: ObjectId) {
    try {
      await Session.findOneAndUpdate(
        { userId: adminId, isUserActive: true },
        { isUserActive: false }
      );

      const client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();
      await client.set(`status:${adminId}`, 'false');
  
      return { status: 200, response: { message: SUCCESS_MESSAGES.LOGOUT_SUCCESS } };
    } catch (error) {
      throw error;
    }
  }
  
}