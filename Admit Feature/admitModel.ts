const mongoose = require('mongoose');

// Create a schema for the Admit model
const admitSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Patient collection
    ref: 'Patient', // Name of the referenced model
    required: true,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Staff collection
    ref: 'Staff', // Name of the referenced model
    required: true,
  },
  bedType: {
    type: String, // You can customize this based on your "Hospital Utilities" collection structure
    ref: 'HospitalUtility',
    required: true,
  },
  admitDate: {
    type: Date,
    required: true,
  },
  dischargeDate: {
    type: Date,
  },
  totalAmount: {
    type: Number,
    // required: true,
  },
});

// Create the Admit model using the schema
const Admit = mongoose.model('Admit', admitSchema);

export default Admit;
