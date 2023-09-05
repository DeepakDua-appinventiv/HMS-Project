import { Request, Response } from "express";
import {
  DEFAULT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
  RESPONSE_MESSAGES,
} from "../constants";
import { AdmitServicesClass } from "../services/admitServices";
const SECRET_KEY = process.env.SECRET_KEY;

export class AdmitClass {
  //Admit patient API
  static async admitPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, staffId, bedType } = req.body;
      const result = await AdmitServicesClass.admitPatient(
        patientId,
        staffId,
        bedType
      );
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }

  //Discharge patient API
  static async dischargePatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.body;
      const result = await AdmitServicesClass.dischargePatient(patientId);
      console.log(result);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  }
}
