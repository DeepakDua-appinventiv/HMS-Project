import mongoose, { Document, Schema } from "mongoose";

interface IMedication {
  MedName: string;
  description: string;
  Expiry: Date;
  Quantity: number;
  MRP: number;
}

interface IEquipment {
  EquipName: string;
  Quantity: number;
}

interface IInventory extends Document {
  Equipment: IEquipment[];
  Medications: IMedication[];
}

const medicationSchema = new Schema<IMedication>({
  MedName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  Expiry: {
    type: Date,
    required: true,
  },
  Quantity: {
    type: Number,
    required: true,
  },
  MRP: {
    type: Number,
    required: true,
  },
});

const equipmentSchema = new Schema<IEquipment>({
  EquipName: {
    type: String
  },
  Quantity: {
    type: Number
  }
})

const inventorySchema = new Schema<IInventory>({
  Equipment: [equipmentSchema],
  Medications: [medicationSchema],
});

const inventoryModel = mongoose.model<IInventory>("Inventory", inventorySchema);

export default inventoryModel;
