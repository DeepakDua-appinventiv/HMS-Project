import mongoose, { Document, ObjectId, Schema } from "mongoose";

interface IDiagnosis {
  disease: string;
  Treated: boolean;
  date: Date;
}

interface IMedicalHistory extends Document {
  patientId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  Medications: string;
  MedicalCondition: string;
  diagnozedWith: IDiagnosis;
  treatedBy: mongoose.Types.ObjectId;
  treatedDoctorName: string;
}

const diagnosisSchema = new Schema<IDiagnosis>({
  disease: String,
  Treated: Boolean,
  date: Date,
});

const medicalHistorySchema = new Schema<IMedicalHistory>({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  Medications: {
    type: String,
  },
  MedicalCondition: {
    type: String,
  },
  diagnozedWith: {
    type: diagnosisSchema,
    default: {},
  },
  treatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  treatedDoctorName: {
    type: String,
    required: true,
  },
});

const MedicalHistoryModel = mongoose.model<IMedicalHistory>(
  "MedicalHistory",
  medicalHistorySchema
);

export default MedicalHistoryModel;
