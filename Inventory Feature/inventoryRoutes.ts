const express = require('express');
const invRouter = express.Router();
import { auth } from "../middleware/auth";
import { InventoryClass } from "../controller/inventoryController";

invRouter.post('/additem', auth, InventoryClass.addItem);
invRouter.get('/getitem/:itemName', auth, InventoryClass.getItem);
invRouter.get('/getallitems', auth, InventoryClass.getAllItems);
invRouter.patch('/updateitem', auth, InventoryClass.updateItem);

export default invRouter;