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
      const {
        patientId,
        appointmentDate,
        selectedSlot,
        visitReason,
        departmentId,
      } = req.body;
      const result = await AppointmentServicesClass.bookAppointment(
        patientId,
        appointmentDate,
        selectedSlot,
        visitReason,
        departmentId
      );

      if (result.success) {
        res.status(201).json({ message: SUCCESS_MESSAGES.APPOINTMENT_BOOKED });
      } else {
        res.status(400).json({ message: result.message });
      }
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
