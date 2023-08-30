import inventoryModel from "../models/inventoryModel";
import { ObjectId } from "mongoose";

export class InventoryServiceClass{
//Service to handle add new item in the inventory
 static async addNewItem(inventoryData: any): Promise<any> {
    try {
        const existingItem = await inventoryModel.findOne( {} );

        if(!existingItem){
            const newInventory = new inventoryModel(inventoryData);
            await newInventory.save();
            return { status: 201, response: { message: 'Item Added Successfully', data: newInventory } };
        }

        if (inventoryData.Equipment) {
            for (const newEquipment of inventoryData.Equipment) {
                const existingEquipment = existingItem.Equipment.find(e => e.EquipName === newEquipment.EquipName);
                if (existingEquipment) {
                    existingEquipment.Quantity += newEquipment.Quantity;
                } else {
                    existingItem.Equipment.push(newEquipment);
                }
            }
        }

        if (inventoryData.Medications) {
            for (const newMedication of inventoryData.Medications) {
                const existingMedication = existingItem.Medications.find(m => m.MedName === newMedication.MedName);
                if (existingMedication) {
                    existingMedication.Quantity += newMedication.Quantity;
                } else {
                    existingItem.Medications.push(newMedication);
                }
            }
        }

        await existingItem.save();

        return { status: 200, response: { message: 'Item Added Successfully', data: existingItem } };
    } catch (error) {
        throw error;
    }
}

//Service to handle get an item from the inventory
 static async getInventoryItem(itemName: string): Promise<any> {
    try {
        const existingItem = await inventoryModel.findOne({});

        if (!existingItem) {
            return { status: 404, response: { message: 'Inventory not found' } };
        }

        let itemDetails = null;

        // Check if the item exists in equipment
        const existingEquipment = existingItem.Equipment.find(e => e.EquipName === itemName);
        if (existingEquipment) {
            itemDetails = existingEquipment;
        }

        // Check if the item exists in medications
        const existingMedication = existingItem.Medications.find(m => m.MedName === itemName);
        if (existingMedication) {
            itemDetails = existingMedication;
        }

        if (!itemDetails) {
            return { status: 404, response: { message: 'Item not found in inventory' } };
        }

        return { status: 200, response: { data: itemDetails } };
    } catch (error) {
        throw error;
    }
}

//Service to handle get all items from the inventory
static async getAllItems(page, itemsPerPage): Promise<any> {
    try {
        const skipItems = (page-1) * itemsPerPage;
        const allItems = await inventoryModel.find({}).skip(skipItems).limit(itemsPerPage);
        
        if (!allItems|| allItems.length === 0) {
            return { status: 404, response: { message: 'No staff profiles found' } };
        }
        
        return { status: 200, response: allItems };
    } catch (error) {
        
    }
}

//Service to handle update an item in the inventory
 static async updateInventoryItem(inventoryData: any): Promise<any> {
    try {
        const existingItem = await inventoryModel.findOne({});

        if (!existingItem) {
            return { status: 404, response: { message: 'Inventory not found' } };
        }

        // Update equipment and medications arrays
        if (inventoryData.Equipment) {
            for (const removeEquipment of inventoryData.Equipment) {
                const existingEquipment = existingItem.Equipment.find(e => e.EquipName === removeEquipment.EquipName);
                if (existingEquipment) {
                    if (existingEquipment.Quantity > 0) {
                        existingEquipment.Quantity -= 1;
                    }
                }
            }
        }

        if (inventoryData.Medications) {
            for (const removeMedication of inventoryData.Medications) {
                const existingMedication = existingItem.Medications.find(m => m.MedName === removeMedication.MedName);
                if (existingMedication) {
                    if (existingMedication.Quantity > 0) {
                        existingMedication.Quantity -= 1;
                    }
                }
            }
        }

        await existingItem.save();

        return { status: 200, response: { message: 'Item Updated Successfully', data: existingItem } };
    } catch (error) {
        throw error;
    }
}

}

