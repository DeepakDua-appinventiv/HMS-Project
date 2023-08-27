import { Request, Response, NextFunction } from "express";
import Joi from "joi";

// Define validation schemas for each route
const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  dateOfBirth: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  contactInfo: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{6,15}$/)
      .required(),
    address: Joi.string(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const updatePatientProfileSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  dateOfBirth: Joi.string(),
  gender: Joi.string().valid("male", "female", "other"),
  bloodGroup: Joi.string(),
  insurance: Joi.object({
    effectiveDate: Joi.date(),
    expirationDate: Joi.date(),
    insuranceProvider: Joi.string(),
    insuranceType: Joi.string(),
    insuranceCoverage: Joi.string(),
    deductible: Joi.string(),
  }),
  contactInfo: Joi.object({
    phoneNumber: Joi.string().pattern(/^[0-9]{6,15}$/),
    address: Joi.string(),
  }),
});

const updateStaffProfileSchema = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    dateOfBirth: Joi.string(),
    gender: Joi.string().valid("male", "female", "other"),
    Profile: Joi.binary(),
    role: Joi.string().valid("Admin", "Doctor", "Nurse", "InventoryManager", "Pharmacist"),
    specialization: Joi.string(),
    Qualification: Joi.string(),
    departmentId: Joi.object(),
    contactInfo: Joi.object({
      phoneNumber: Joi.string().pattern(/^[0-9]{6,15}$/),
      address: Joi.string(),
    }),
  
})
// Middleware function to validate request body against the schema
const validateSchema = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

export const validateSignup = validateSchema(signupSchema);
export const validateLogin = validateSchema(loginSchema);
export const validateUpdatePatientProfile = validateSchema(
  updatePatientProfileSchema
);
export const validateUpdateStaffProfile = validateSchema(
  updateStaffProfileSchema
);
