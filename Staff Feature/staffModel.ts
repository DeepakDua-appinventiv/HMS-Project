import mongoose, { Document, ObjectId, Schema } from "mongoose";

enum staffRoles {
  ADMIN = "Admin",
  DOCTOR = "Doctor",
  NURSE = "Nurse",
  INVENTORYMANAGER = 'Inventory Manager',
  PHARMACIST = 'Pharmacist'
}

interface IContactInfo {
  phoneNumber: string;
  address: string;
}

interface IStaff extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  gender: string;
  Profile: Buffer;
  role: string;
  specialization: string;
  Qualification: string;
  departmentId: Object;
  contactInfo: IContactInfo;
}

const contactInfoSchema = new Schema<IContactInfo>({
  phoneNumber: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
});

const staffSchema = new Schema<IStaff>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
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
    // required: true,
  },
  gender: {
    type: String,
    default: "",
    // required: true
  },
  Profile: {
    type: Buffer,
  },
  role: {
    type: String,
    enum: Object.values(staffRoles),
    required: true,
  },
  specialization: {
    type: String,
    required: true
  },
  Qualification: {
    type: String,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  contactInfo: {
    type: contactInfoSchema,
    default: {},
  },
});

const staffModel = mongoose.model<IStaff>("Staff", staffSchema);

export default staffModel;
