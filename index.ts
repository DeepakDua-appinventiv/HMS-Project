import express from 'express';
import {Request, Response} from "express";
import bodyParser from "body-parser";
import connectDatabase from './database/db.connection';
import patientRouter from './routes/patientRoutes';
import adminRouter from './routes/adminRoutes';
import staffRouter from './routes/staffRoutes';
import appRouter from './routes/appointmentRoutes';
import medRouter from './routes/medHistoryRoutes';
import invRouter from './routes/inventoryRoutes';
import medBillRouter from './routes/medBillRoutes';
require('dotenv').config();

const app = express();
connectDatabase();
const cron = require('node-cron');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/patient', patientRouter);  //patient route
app.use('/admin', adminRouter);      //admin route
app.use('/staff', staffRouter);      //staff route
app.use('/appointment', appRouter);  //appointment route
app.use('/medical', medRouter);      //medical History route
app.use('/inventory', invRouter);    //inventory route
app.use('/medbill', medBillRouter);  //medication bill route

const port = 5000;
app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
})