const jwt = require("jsonwebtoken");
const SECRET_KEY = "patient_api";
import { Request, Response } from "express";
import { Session } from "../models/sessionModel";

//Common Auth Middleware
export const auth = async (req: any, res: any, next: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      let user = jwt.verify(token, SECRET_KEY);
      const session = await Session.findOne({
        userId: user.id,
        isUserActive: true,
      });
      if (!session) {
        res.status(401).json({ message: "User not logged In" });
      }
      req.userId = user.id;
      req.userEmail = user.email;
    } else {
      res.status(401).json({ message: "Missing Token" });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "unauthorized user" });
  }
};

//Staff Auth Middleware where role is Doctor
export const staffAuth = async (req: any, res: any, next: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      let user = jwt.verify(token, SECRET_KEY);

      const session = await Session.findOne({
        userId: user.id,
        isUserActive: true,
      });
      if (!session) {
        res.status(401).json({ message: "User not logged In" });
      }
      
      if (user.role !== "Doctor") {
        res.status(401).json({ message: "Access denied. Only Doctors can perform this action" });
      }

      req.userId = user.id;
      next();
    } else {
      res.status(401).json({ message: "Missing Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized user" });
  }
};

//Staff Auth Middleware where role is Pharmacist
export const pharmaAuth = async (req: any, res: any, next: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      let user = jwt.verify(token, SECRET_KEY);

      const session = await Session.findOne({
        userId: user.id,
        isUserActive: true,
      });
      if (!session) {
        res.status(401).json({ message: "User not logged In" });
      }
      
      if (user.role !== "Pharmacist") {
        res.status(401).json({ message: "Access denied. Only Pharmacist can perform this action" });
      }

      req.userId = user.id;
      next();
    } else {
      res.status(401).json({ message: "Missing Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized user" });
  }
};

//Staff Auth Middleware where role is Inventory Manager
export const invAuth = async (req: any, res: any, next: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      let user = jwt.verify(token, SECRET_KEY);

      const session = await Session.findOne({
        userId: user.id,
        isUserActive: true,
      });
      if (!session) {
        res.status(401).json({ message: "User not logged In" });
      }
      
      if (user.role !== "Inventory Manager") {
        res.status(401).json({ message: "Access denied. Only Inventory Manager can perform this action" });
      }

      req.userId = user.id;
      next();
    } else {
      res.status(401).json({ message: "Missing Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized user" });
  }
};

//Admin Auth Middleware
export const adminAuth = async (req: any, res: any, next: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      let user = jwt.verify(token, SECRET_KEY);

      const session = await Session.findOne({
        userId: user.id,
        isUserActive: true,
      });
      if (!session) {
        res.status(401).json({ message: "User not logged In" });
      }
      console.log("===============", user);
      if (user.role != "Admin")
        res
          .status(401)
          .json({
            message: "Access denied. Only admin can perform this action",
          });

      req.userId = user.id;
      next();
    } else {
      res.status(401).json({ message: "Missing Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "unauthorized user" });
  }
};
