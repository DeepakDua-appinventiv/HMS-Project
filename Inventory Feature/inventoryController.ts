import inventoryModel from "../models/inventoryModel";
import { Request, Response } from "express";
import  { RESPONSE_MESSAGES } from "../constants";
import { InventoryServiceClass } from "../services/inventoryServices";

export class InventoryClass{
//add inventory item API
 static async addItem(req: Request, res:Response): Promise<void> {
    try {
        const inventoryData = req.body;
        const result = await InventoryServiceClass.addNewItem(inventoryData);
        res.status(result.status).json(result.response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}

//get inventory item API
static async getItem(req: Request, res: Response): Promise<void> {
    try {
        const itemName = req.params.itemName;
        const result = await InventoryServiceClass.getInventoryItem(itemName);
        res.status(result.status).json(result.response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}


// //get all inventory items API
 static async getAllItems(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 5;
        const result = await InventoryServiceClass.getAllItems(page, itemsPerPage);
        res.status(result.status).json(result.response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}

// update inventory item API
static async updateItem(req:Request, res:Response): Promise<void> {
    try {
        const inventoryData = req.body;
        const result = await InventoryServiceClass.updateInventoryItem(inventoryData);
        res.status(result.status).json(result.response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: RESPONSE_MESSAGES.SERVER_ERROR });
    }
}

}