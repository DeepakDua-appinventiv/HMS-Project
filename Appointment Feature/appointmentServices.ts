import appointmentModel from '../models/appointmentModel';
import patientModel from '../models/patientModel';
import { ERROR_MESSAGES,RESPONSE_MESSAGES,SUCCESS_MESSAGES } from '../constants';
import { ObjectId } from 'mongoose';

export class AppointmentServicesClass
{
 //Service to handle get appointment details
 static async  getAppointmentDetails(pId: ObjectId): Promise<any>{
    try {
        const getAppDetails = await appointmentModel.findOne({patientId: pId});
        console.log(getAppDetails);
        if(!getAppDetails){
            throw new Error(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND);
        }
        return getAppDetails;
    } catch (error) {
        throw error;
    }
}

//Service to handle update appointment details
 static async  updateAppointmentDetails(patientId: ObjectId, appointmentData): Promise<any>{
    try {
        const currentAppointment = await appointmentModel.findOne(patientId);
        if(!currentAppointment){
            throw new Error(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND);
        }
        if(currentAppointment.AppointmentStatus !== 'Pending'){
            throw new Error(ERROR_MESSAGES.APPOINTMENT_STATUS_NOT_PENDING);
        }
        const updateAppointment = await appointmentModel.findOneAndUpdate(patientId, {$set: appointmentData}, {new: true});
        console.log(updateAppointment);
        if(!updateAppointment){
            throw new Error(ERROR_MESSAGES.FAILED_TO_UPDATE_APPOINTMENT);
        }
        return updateAppointment;
    } catch (error) {
        throw error;
    }
}

//Service to handle cancel appointment
 static async  cancelAppointmentService(patientId: ObjectId, appId: ObjectId): Promise<any>{
    try {
        const currentAppointment = await appointmentModel.findOne(patientId);
        if(!currentAppointment){
            throw new Error(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND);
        }
        const cancelAppointment = await appointmentModel.findOneAndUpdate({_id: appId}, {$set: {AppointmentStatus: 'Canceled'}}, {new: true});
        if(!cancelAppointment){
            throw new Error(ERROR_MESSAGES.FAILED_TO_CANCEL_APPOINTMENT);
        }
        return cancelAppointment;
    } catch (error) {
        throw error;
    }
} 
}