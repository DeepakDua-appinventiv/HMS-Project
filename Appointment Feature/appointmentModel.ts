import mongoose, { Document, ObjectId, Schema } from "mongoose";

enum AppointmentStatus {
  SCHEDULED = "Scheduled",
  CANCELED = "Canceled",
  PENDING = "Pending",
  COMPLETED = "Completed",
}

enum AppointmentSlot {
  MORNING_9_9_30 = "Morning (9:00 AM - 9:30 AM)",
  MORNING_9_30_10 = "Morning (9:30 AM - 10:00 AM)",
  MORNING_10_10_30 = "Morning (10:00 AM - 10:30 AM)",
  MORNING_10_30_11 = "Morning (10:30 AM - 11:00 AM)",
  AFTERNOON_12_12_30 = "Afternoon (12:00 PM - 12:30 PM)",
  AFTERNOON_12_30_1 = "Afternoon (12:30 PM - 1:00 PM)",
  AFTERNOON_1_1_30 = "Afternoon (1:00 PM - 1:30 PM)",
  AFTERNOON_1_30_2 = "Afternoon (1:30 PM - 2:00 PM)",
  EVENING_6_6_30 = "Evening (6:00 PM - 6:30 PM)",
  EVENING_6_30_7 = "Evening (6:30 PM - 7:00 PM)",
  EVENING_7_7_30 = "Evening (7:00 PM - 7:30 PM)",
  EVENING_7_30_8 = "Evening (7:30 PM - 8:00 PM)",
}

interface IAppointment extends Document {
  patientId: ObjectId;
  patientEmail: string;
  staffId: ObjectId;
  doctorName: string;
  AppointmentDate: Date;
  AppointmentStatus: AppointmentStatus;
  visitReason: string;
  Visited: boolean;
  selectedSlot: AppointmentSlot;
  departmentId: Object;
}

const appointmentSchema = new Schema<IAppointment>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient", // Reference to the Patient model
    // required: true
  },
  patientEmail: {
    type: String,
    ref: "Patient", // Reference to the Patient model
    // required: true
  },
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Staff", // Reference to the Staff model
    // required: true
  },
  doctorName: {
    type: String,
    ref: "Staff",
  },
  AppointmentDate: {
    type: Date,
    // required: true
  },
  AppointmentStatus: {
    type: String,
    enum: Object.values(AppointmentStatus),
    // required: true
  },
  visitReason: {
    type: String,
    required: true,
  },
  Visited: {
    type: Boolean,
    default: false,
  },
  selectedSlot: {
    type: String,
    enum: Object.values(AppointmentSlot),
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
});

const appointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);

export default appointmentModel;
