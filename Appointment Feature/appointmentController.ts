import appointmentModel from "../models/appointmentModel";
import { Request, Response } from "express";
import { sendConfirmationEmail } from "../services/emailService";
import { AppointmentServicesClass } from "../services/appointmentServices";
import { RESPONSE_MESSAGES, SUCCESS_MESSAGES } from "../constants";
import departmentModel from "../models/departmentModel";
import { CronJob } from "node-cron";
import nodemailer from "nodemailer";
import patientModel from "../models/patientModel";
import staffModel from "../models/staffModel";

export class AppointmentClass {
  //book appointment
  static async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
        const { patientId, appointmentDate, selectedSlot, visitReason, departmentId } = req.body;

        // Check if the patient already booked the same slot on the same date
        const existingAppointment = await appointmentModel.findOne({
            patientId: patientId,
            AppointmentDate: appointmentDate,
            selectedSlot: selectedSlot
        });

        if (existingAppointment) {
            res.status(400).json({ message: "You've already booked this appointment slot on the same date." });
            return;
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
            res.status(400).json({ message: "No available doctor found for the selected slot." });
            return;
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

        const department = await departmentModel.findById(departmentId);
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

        res.status(201).json({ message: SUCCESS_MESSAGES.APPOINTMENT_BOOKED });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}

  //get appointment details API
  static async getAppDetails(req: Request, res: Response): Promise<void> {
    try {
      const pId = req.userId;
      const result = await AppointmentServicesClass.getAppointmentDetails(pId);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //update appointment details by patient API
  static async updateAppDetails(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.userId;
      const appointmentData = req.body;
      const result = await AppointmentServicesClass.updateAppointmentDetails(
        patientId,
        appointmentData
      );
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //Cancel appointment by patient API
  static async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.userId;
      const appId = req.query._id;
      const result = await AppointmentServicesClass.cancelAppointmentService(
        patientId,
        appId
      );
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }
}

// availability: true
// { patientId, appointmentDate, selectedSlot, visitReason, departmentId }