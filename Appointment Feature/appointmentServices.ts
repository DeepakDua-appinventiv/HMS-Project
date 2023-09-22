import appointmentModel from '../models/appointmentModel';
import patientModel from '../models/patientModel';
import DepartmentModel from '../models/departmentModel';
import staffModel from '../models/staffModel';
import { ERROR_MESSAGES,RESPONSE_MESSAGES,SUCCESS_MESSAGES } from '../constants';
import { sendConfirmationEmail } from "../services/emailService";
import { ObjectId } from 'mongoose';

export class AppointmentServicesClass
{
 //Service to handle book appointment
 static async bookAppointment(patientId: string, appointmentDate: Date, selectedSlot: string, visitReason: string, departmentId: string) {
    try {
        // Check if the patient already booked the same slot on the same date
        const existingAppointment = await appointmentModel.findOne({
            patientId: patientId,
            AppointmentDate: appointmentDate,
            selectedSlot: selectedSlot
        });

        if (existingAppointment) {
            return { success: false, message: "You've already booked this appointment slot on the same date." };
        }

        // Find all doctors within the department from the staff collection
        const doctorsInDepartment = await staffModel.find({
            departmentId: departmentId,
            role: "Doctor"
        });

        let availableDoctor = null;

        // Check doctor availability for the given slot and date
        for (const doctor of doctorsInDepartment) {
            const existingDoctorAppointment = await appointmentModel.findOne({
                staffId: doctor._id,
                AppointmentDate: appointmentDate,
                selectedSlot: selectedSlot
            });

            if (!existingDoctorAppointment) {
                availableDoctor = doctor;
                break;
            }
        }

        if (!availableDoctor) {
            return { success: false, message: "No available doctor found for the selected slot." };
        }

        // Slot is available and doctor is available, create a new appointment
        const newAppointment = new appointmentModel({
            patientId: patientId,
            AppointmentDate: appointmentDate,
            selectedSlot: selectedSlot,
            AppointmentStatus: "Scheduled",
            visitReason: visitReason,
            departmentId: departmentId,
            doctorName: `${availableDoctor.firstName} ${availableDoctor.lastName}`,
            staffId: availableDoctor._id 
        });

        await newAppointment.save();

        const department = await DepartmentModel.findById(departmentId);
        const departmentName = department ? department.name : '';

        const data = {
            appointmentDate: newAppointment.AppointmentDate,
            selectedSlot: newAppointment.selectedSlot,
            doctorName: newAppointment.doctorName,
            visitReason: newAppointment.visitReason,
        };

        await sendConfirmationEmail(
            "deepak.dua@appinventiv.com",
            "Appointment Booking Success",
            appointmentDate,
            selectedSlot,
            newAppointment.doctorName,
            departmentName,
            visitReason
        );

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "An error occurred while booking the appointment." };
    }
}
 
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
