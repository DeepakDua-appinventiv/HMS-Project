import mongoose, { Document } from "mongoose";

interface IInsurance {
  effectiveDate: Date;
  expirationDate: Date;
  insuranceProvider: string;
  insuranceType: string;
  insuranceCoverage: string;
  deductible: string;
}

interface IContactInfo {
  phoneNumber: string;
  address: string;
}

interface IPatient extends Document {
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup: string;
  profile: Buffer; // You might want to use GridFS for storing large blobs in MongoDB
  insurance: IInsurance;
  contactInfo: IContactInfo;
  verified: boolean;
}

const InsuranceSchema = new mongoose.Schema<IInsurance>({
  effectiveDate: {
    type: Date,
  },
  expirationDate: {
    type: Date,
  },
  insuranceProvider: {
    type: String,
    default: "",
  },
  insuranceType: {
    type: String,
    default: "",
  },
  insuranceCoverage: {
    type: String,
    default: "",
  },
  deductible: {
    type: String,
    default: "",
  },
});

const ContactInfoSchema = new mongoose.Schema<IContactInfo>({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    default: "",
  },
});

const PatientSchema = new mongoose.Schema<IPatient>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    default: "",
  },
  profile: {
    type: Buffer,
  },
  insurance: {
    type: InsuranceSchema,
    default: {},
  },
  contactInfo: {
    type: ContactInfoSchema,
    default: {},
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const patientModel = mongoose.model<IPatient>("Patient", PatientSchema);

export default patientModel;
