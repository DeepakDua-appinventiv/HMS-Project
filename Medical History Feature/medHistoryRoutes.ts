const express = require('express');
const medRouter = express.Router();
import { auth, staffAuth } from "../middleware/auth";
import { MedicalHistoryClass } from "../controller/medHistoryController";

medRouter.post('/addhistory', staffAuth, MedicalHistoryClass.addHistory);
medRouter.get('/gethistory', auth, MedicalHistoryClass.getHistory);
medRouter.put('/updatehistory/:id', staffAuth , MedicalHistoryClass.updateHistory);

export default medRouter;

