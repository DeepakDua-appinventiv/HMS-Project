import MedicalHistoryModel from "../models/medicalHistory";
import { Request, Response } from "express";
import { MedHistoryServicesClass} from "../services/medHistoryServices";
import  { RESPONSE_MESSAGES } from "../constants";
import appointmentModel from "../models/appointmentModel";
import patientModel from "../models/patientModel";
import staffModel from "../models/staffModel";

export class MedicalHistoryClass{
//add Medical history API
static async addHistory(req: Request, res: Response): Promise<void> {
    try {
        const medHistoryData = req.body;
        const appointment = await appointmentModel.findById(medHistoryData.appointmentId);

        if (!appointment) {
            res.status(400).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
            return;
        }

        if (appointment.AppointmentStatus == 'Scheduled' && appointment.Visited == false) {
            // Update appointment status to "Completed" if visited is true
            await appointmentModel.findByIdAndUpdate(
                medHistoryData.appointmentId,
                {
                    AppointmentStatus: 'Completed',
                    Visited: true
                }
            );
            const staffId = req.userId;
            const staff = await staffModel.findById(staffId);
            if (!staff) {
                res.status(400).json({ message: "Staff not found" });
                return;
            }
            medHistoryData.treatedBy = staffId;
            medHistoryData.treatedDoctorName = staff.firstName;
            
            const result = await MedHistoryServicesClass.addMedicalHistory(medHistoryData);
            res.status(result.status).json(result.response);
        } else {
            res.status(400).json({ message: 'Cannot add medical history for appointments with status other than Completed or if visited is false' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}

//get medical history for staff API
  static async getHistoryForStaff(req: Request, res: Response): Promise<void> {
    try {
        const { id: patientId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.itemsPerPage) || 5;
        if(!patientId){
            res.status(400).json({ message: "Patient Id is required in query params" });
        }
        const result = await MedHistoryServicesClass.getMedicalHistoryStaff(patientId, page, limit);
        console.log(result);
        if(result.status == 200){
            if(result.response.data.length == 0){
                res.status(404).json({ message: "No Medical History Found" });
            }else{
                res.status(200).json(result.response);
            }
        }else{
            res.status(result.status).json(result.response);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

//get medical history API
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
        const patientId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.itemsPerPage) || 5;
        console.log(patientId);
        const result = await MedHistoryServicesClass.getMedicalHistory(patientId, page, limit);
        if(result.status == 200){
            if(result.response.data.length == 0){
                res.status(400).json({message: "No Medical History Exist"});
            }else{
                res.status(200).json(result.response);
            }
        }   else {
                res.status(result.status).json(result.response);
            }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}

//update medical history of patient
  static async updateHistory(req: Request, res: Response): Promise<void> {
    try {
        const historyId = req.params.id;
        const updateMedHistory = req.body;

        const existingMedHistory = await MedicalHistoryModel.findById(historyId);
        if (!existingMedHistory) {
            res.status(400).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
            return;
        }

        const appointment = await appointmentModel.findOne(existingMedHistory.appointmentId);
        if(!appointment){
            res.status(400).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
            return;
        }
        if(appointment.AppointmentStatus !== 'Completed'){
            res.status(400).json({ message: 'Cannot update medical history for appointments with status other than Completed' });
            return;
        }

        const result = await MedHistoryServicesClass.updateMedicalHistory(historyId, updateMedHistory);
        res.status(result.status).json(result.response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}
}