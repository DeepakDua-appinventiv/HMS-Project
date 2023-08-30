import mongoose, { Document, ObjectId, Schema } from "mongoose";

interface IDiagnosis {
  disease: string;
  Treated: boolean;
  date: Date;
  treatedBy: ObjectId;
  treatedDoctorName: string;
}

interface IMedicalHistory extends Document {
  patientId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  Medications: string;
  MedicalCondition: string;
  diagnozedWith: IDiagnosis;
}

const diagnosisSchema = new Schema<IDiagnosis>({
  disease: String,
  Treated: Boolean,
  date: Date,
  treatedBy: mongoose.Types.ObjectId,
  treatedDoctorName: String,
});

const medicalHistorySchema = new Schema<IMedicalHistory>({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
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
});

const MedicalHistoryModel = mongoose.model<IMedicalHistory>(
  "MedicalHistory",
  medicalHistorySchema
);

export default MedicalHistoryModel;
