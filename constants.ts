export const DEFAULT_PAGE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 5; 

export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    OTP_SUCCESS: 'OTP sent successfylly',
    ADD_STAFF_SUCCESS: 'Staff Added Successfully',
    DELETE_SUCCESS: 'profile deleted successfully',
    APPOINTMENT_BOOKED: 'Appointment booked successfully',
    APPOINTMENT_UPDATED: 'Appointment updated successfully',
    APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
    REGISTRATION_SUCCESS: 'Your registration has been successfull. Please verify your mail!',
    PROFILE_UPDATED: 'Profile updated successfully',
    PROFILE_DELETED: 'Profile deleted successfully',
    PROFILE_UPLOADED: 'Profile uploaded successfully',
};
  
export const ERROR_MESSAGES = {
    APPOINTMENT_NOT_FOUND: 'Appointment not found',
    APPOINTMENT_STATUS_NOT_PENDING: 'Appointment cannot be updated/cancelled as the status is not pending',
    FAILED_TO_UPDATE_APPOINTMENT: 'Failed to update appointment',
    FAILED_TO_CANCEL_APPOINTMENT: 'Failed to cancel appointment',
    PATIENT_NOT_FOUND: 'User/Patient not found',
    STAFF_NOT_FOUND: 'User/Staff not found',
    PROFILE_NOT_FOUND: 'Profile not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    REGISTRATION_FAILED: 'Your registration has been failed!'
};

export const REQUIRED_MESSAGES = {
    ROLE_REQUIRED: 'Role parameter is required',
    SPECIALIZATION_REQUIRED: 'Specialization parameter is required',
};

export const RESPONSE_MESSAGES = {
    SERVER_ERROR: 'Something went wrong',
    NOT_FOUND: 'Resource not found',
    DUPLICATE: 'Already exists',
};