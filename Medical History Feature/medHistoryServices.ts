import MedicalHistoryModel from "../models/medicalHistory";
import { ObjectId } from "mongoose";
import medicationBillModel from "../models/medicationBill";

export class MedHistoryServicesClass{
//Service to handle add medical history of patient
 static async addMedicalHistory(medHistoryData: any): Promise<any> {
    try {
        const newMedHistory = new MedicalHistoryModel(medHistoryData);
        await newMedHistory.save();

        return { status: 201, response: { message: 'Medical History Added Successfully', data: newMedHistory}};
    } catch (error) {
        throw error;
    }
}

//Service to handle get medical history of patient by staff
static async getMedicalHistoryStaff(patientId: ObjectId, page: number, limit: number): Promise<any>{
    try {
        const skip = (page-1) * limit;
        const getMedHistory = await MedicalHistoryModel.find({ patientId: patientId }).skip(skip).limit(limit);
        console.log(getMedHistory);
        if(getMedHistory.length == 0){
            return { status: 404, response: { msg: 'No Medical History Found' } };
        }else{
            return { status: 200, response: { data: getMedHistory } };
        }
    } catch (error) {
        throw error;
    }
}

//Service to handle get medical hsitory of patient
static async getMedicalHistory(patientId: ObjectId, page: number, limit: number): Promise<any> {
    try {
        const skip = (page-1) * limit;
        const getMedHistory = await MedicalHistoryModel.find({patientId: patientId}).skip(skip).limit(limit);
        console.log(getMedHistory);
        if(getMedHistory.length == 0){
            return { status:400, response: {msg: "No Medical History exist"}};
        }else{
            return { status:200, response: {data: getMedHistory }};
        }
    } catch (error) {
        throw error;
    }
}

//Service to handle update medical history of patient
static async updateMedicalHistory(historyId: ObjectId, updateMedHistory): Promise<any> {
    try {
        const updatedMedHistory = await MedicalHistoryModel.findOneAndUpdate({_id: historyId}, {$set: updateMedHistory}, {new: true});
        if (!updatedMedHistory) {
            return { status: 404, response: { message: "Medical history not found" } };
        }
        return { status: 200, response: { message: "Medical History updated successfully", data: updatedMedHistory } };
    } catch (error) {
        throw error;
    }
}
}

