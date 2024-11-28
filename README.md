# doctor-appointment-booking-system

# How to start project

1. use command in powershell or gitbash: 
   git clone https://github.com/rahulkumar1907/doctor-appointment-booking-system.git
2. go to directory doctor-appointment-booking-system 
3. run command npm i 
4. run command npx nodemon index.mjs

# SCHEMA
 
# user or patient schema
userSchema Explanation:

# firstName:
Type: String
required: true: This field is mandatory; a value must be provided when creating a user.

# lastName:
Type: String
required: true: This field is mandatory; a value must be provided.

# email:
Type: String
required: true: This field is mandatory.
unique: true: Ensures that the email address must be unique across all users (no duplicates).

# password:
Type: String
required: true: This field is mandatory.

# isDeleted:
Type: Boolean
default: false: If not provided, the value will be false (indicating the user is not deleted by default).

# Timestamps:
The { timestamps: true } option automatically adds two fields to the schema: createdAt and updatedAt. These fields store the creation and last modification time of each document.

# doctor schema

doctorSchema Explanation:
# name:
Type: String
required: true: This field is mandatory; the name of the doctor must be provided when creating a doctor document.
unique: true: The doctor's name must be unique in the collection (no duplicate names allowed).

# specialization:
Type: String
required: true: This field is mandatory; the specialization of the doctor must be provided (e.g., cardiologist, pediatrician, etc.).

# isDeleted:
Type: Boolean
default: false: If not provided, the value will default to false, indicating that the doctor is not deleted by default. This field can be used for soft deletion (marking the doctor as deleted without actually removing the document from the database).

# Timestamps:
The { timestamps: true } option automatically adds two fields: createdAt and updatedAt. These fields store the creation and last modification times of each document.

# appointment schema

appointmentSchema Explanation:
# patientId:
Type: mongoose.Schema.Types.ObjectId
ref: "users": This establishes a reference to the users collection, linking the appointment to a specific patient.
required: true: This field is mandatory, meaning the appointment must have a linked patient.

# doctorId:
Type: mongoose.Schema.Types.ObjectId
ref: "doctors": This establishes a reference to the doctors collection, linking the appointment to a specific doctor.
required: true: This field is mandatory, meaning the appointment must have a linked doctor.

# appointmentStartTime:
Type: String
required: true: This field is mandatory, meaning the start time of the appointment must be provided in string format (e.g., "10:30AM").

# appointmentEndTime:
Type: String
required: true: This field is mandatory, meaning the end time of the appointment must be provided in string format (e.g., "11:30AM").

# status:
Type: String
enum: ["booked", "cancelled", "modified"]: The status of the appointment must be one of the three values: "booked", "cancelled", or "modified". This ensures that only valid status values are used.
default: "booked": If no value for status is provided, the default status will be "booked", meaning the appointment is initially considered booked.

# Timestamps:
The { timestamps: true } option adds two fields automatically: createdAt and updatedAt. These fields record the creation time and the last time the appointment was updated.

# Https Status Code Used
400 (Bad Request): Invalid input
404 (Not Found): User not found
401 (Unauthorized): Invalid credentials
403 (Forbidden): Invalid refresh token
500 (Internal Server Error): Server issue
201(Success) : Creation
200 (Success) : Success of response

# USER API'S

1. Register User API:
# Endpoint: api/register
# Method: POST
# Description:  Registers a new user by validating input fields (first name, last name, email, and password).
# Request Body:
{
    "firstName":"Vikas",
    "lastName":"Verma",
    "email":"Vikasverma@gmail.com",
    "password":"Vikasverma@123"
}
# Validation:
Validates and trims the input fields.
Checks if the email is in the correct format and if the password meets strength requirements.
Checks if the user already exists in the database.
Hashes the password using bcryptjs and creates a new user in the database.

# RESPONSE
{
    "status": true,
    "message": "user created successfully",
    "data": {
        "firstName": "Vikas",
        "lastName": "Verma",
        "email": "vikasverma@gmail.com",
        "password": "$2a$10$eJUp3y1TI8eXJlwqheM2Q.roQLJJCM8imilb3gs0UHdjciO2IOhti",
        "isDeleted": false,
        "_id": "673f53a7ae14092c26ae43de",
        "createdAt": "2024-11-21T15:37:11.997Z",
        "updatedAt": "2024-11-21T15:37:11.997Z",
        "__v": 0
    }
}

Success: Confirms registration with details.
Failure: Provides error message for invalid inputs or conflicts.

2. Login User API:
# Endpoint: api/login
# Method: POST
# Description:  Logs in a user by validating email and password.
# Validation:
Validates and trims the email and password fields.
Checks if the email format is valid and password meets requirements.
Checks if the user exists in the database.
Compares the entered password with the hashed password in the database using bcryptjs.
If correct, generates an accessToken and refreshToken (JWT tokens) for authentication.

# Request Body:
{
    "email":"Ravindersaini@gmail.com",
    "password":"Ravindersaini@123"
}

# RESPONSE
{
    "status": true,
    "message": "user logged in successfully",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNmNDBiZjFhMjMyNjEyZjYwYTVjZjciLCJpYXQiOjE3MzIyNTQ4MzYsImV4cCI6MTczMjI1ODQzNn0.pJ_LfWsv1wdns1mS9F88dN2vvKeEAAI4Y0D25iYUNjw"
}
Success: Confirms log in with details.
Failure: Provides error message for invalid inputs or conflicts.

3. Regenerate Access Token API:
# Endpoint: api/regenerate-access
# Method: POST
# Description:  Regenerates a new accessToken using a valid refreshToken.
# Request Cookie:
refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNmNDBiZjFhMjMyNjEyZjYwYTVjZjciLCJpYXQiOjE3MzIyNTQ4MzYsImV4cCI6MTczMjg1OTYzNn0.n_emspYL6kKAbe7DRE-cZ8z3GTtRgZ6RlpsqNe04low
# Validation:
Retrieves the refreshToken from cookies.
Verifies the refreshToken using JWT_REFRESH_SECRET.
If valid, generates a new accessToken.

# RESPONSE
{
    "status": true,
    "message": "access token generated successfully",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNmNDBiZjFhMjMyNjEyZjYwYTVjZjciLCJpYXQiOjE3MzIyNzA3NjAsImV4cCI6MTczMjI3NDM2MH0.SoNjtyp9DtusIsZrE98G55Q5h7idSN77OK7892RBIJw"
}
Success: Confirms generation of access token with details.
Failure: Provides error message for invalid inputs or conflicts.

# DOCTOR LIST CREATION API 
Create Doctor API:
# Endpoint: add-doctor
# Method: POST
# Description:  Registers a new doctor by validating and saving the doctor’s name and specialization.
# Request body:

{
  "name": "Dr. Anjali Mathur",
  "specialization": "Psychiatry"
}
# Validation:
Trims the name and specialization fields to remove unnecessary spaces.
Validates that both name and specialization are provided and are not empty.
Checks if a doctor with the same name already exists in the database to prevent duplicates.
Creates a new doctor object with the provided name and specialization.
Saves the new doctor record to the database 

# RESPONSE
{
    "status": true,
    "message": "doctor created successfully",
    "data": {
        "name": "Dr. Anjali Mathur",
        "specialization": "Psychiatry",
        "isDeleted": false,
        "_id": "673f53b4ae14092c26ae43e1",
        "createdAt": "2024-11-21T15:37:24.402Z",
        "updatedAt": "2024-11-21T15:37:24.402Z",
        "__v": 0
    }
}
Success: Confirms creation of doctor with details.
Failure: Provides error message for invalid inputs or conflicts.
# APPOINMENT API'S

1. Book Appointment
# Endpoint: api/book-appointment
# Method: POST
# Description: Allows a patient to book an appointment with a doctor.
# Request Body:
doctorName: Name of the doctor.
userId: Patient's user ID (from access token).
email: Patient's email address.
appointmentStartTime: Appointment start time (12-hour format).
appointmentEndTime: Appointment end time (12-hour format).
{
    "doctorName":"Dr. Ravi Mehta",
    "appointmentStartTime":"03:40PM",
    "email":"rkrahulkv143@gmail.com",
    "appointmentEndTime":"04:50PM"
}
# Validation:
Validates email format, time format, and appointment time range.
Checks for conflicting appointments with the same doctor or other doctors.
# Response:
{
    "status": true,
    "message": "appointment created successfully",
    "data": {
        "_id": "67401b12b38d8d5b2d6eb96c",
        "patientFirstName": "Rahul",
        "patientLastName": "Kumar",
        "email": "rkrahulkv143@gmail.com",
        "doctorName": "Dr. Ravi Mehta",
        "appointmentSlot": "03:40PM - 04:50PM",
        "status": "booked",
        "createdAt": "2024-11-22T05:48:03.006Z"
    }
}
Success: Confirms appointment creation with details.
Failure: Provides error message for invalid inputs or conflicts.
2. Get Appointment Details
# Endpoint: api/get-appointments?email=ravindersaini@gmail.com
# Method: GET
# Description: Retrieves all appointment details for a given patient.
# Request Query:
email: Patient's email address.
# Validation:
Checks for valid email format.
# Response:
{
    "status": true,
    "message": "appointment details retrieved successfully",
    "data": {
        "patient": {
            "firstName": "Ravinder",
            "lastName": "Saini",
            "email": "ravindersaini@gmail.com"
        },
        "appointments": [
            {
                "appointmentSlot": "11:30AM - 12:30PM",
                "doctorName": "Dr. Anjali Kapoor",
                "specialization": "Neurology"
            },
            {
                "appointmentSlot": "11:40AM - 01:00PM",
                "doctorName": "Dr. Ravi Mehta",
                "specialization": "Pediatrics"
            }
        ]
    }
}
Success: Returns the list of appointments along with doctor details.
Failure: Error if no patient or appointments found.
3. Cancel Appointment
# Endpoint: api/cancel-appointment
# Method: PUT
# Description: Allows a patient to cancel an appointment.
# Request Body:
email: Patient's email address.
appointmentStartTime: Original appointment start time.
appointmentEndTime: Original appointment end time.
{
    "email": "ravindersaini@gmail.com",
   "appointmentStartTime":"11:30AM",
   "appointmentEndTime":"12:30PM"
}
# Validation:
Ensures the patient exists and is authorized.
Checks if the appointment exists and is not already cancelled.
# Response:
{
    "status": true,
    "message": "appointment cancelled successfully",
    "data": {
        "_id": "6740197be83a6bb461543fcc",
        "patientId": "673f40bf1a232612f60a5cf7",
        "doctorId": "673f45cd9066a39d6787b726",
        "appointmentStartTime": "11:30AM",
        "appointmentEndTime": "12:30PM",
        "status": "cancelled",
        "createdAt": "2024-11-22T05:41:15.071Z",
        "updatedAt": "2024-11-22T05:59:52.207Z",
        "__v": 0
    }
}
Success: Confirms appointment cancellation.
Failure: Error if no appointment found or cancellation fails.
4. View Appointments by Doctor
# Endpoint: api/get-all-appointments-of-doctor?doctorName=Dr. Ravi Mehta
# Method: GET
# Description: Retrieves all booked appointments for a specific doctor.
# Request Query:
doctorName: Name of the doctor.
# Validation:
Verifies if the doctor exists.
# Response:
{
    "status": true,
    "message": "appointments retrieved successfully",
    "data": [
        {
            "appointmentSlot": "01:40PM - 02:50PM",
            "patient": {
                "firstName": "Ravinder",
                "lastName": "Saini",
                "email": "ravindersaini@gmail.com"
            },
            "status": "booked"
        },
        {
            "appointmentSlot": "03:40PM - 04:50PM",
            "patient": {
                "firstName": "Rahul",
                "lastName": "Kumar",
                "email": "rkrahulkv143@gmail.com"
            },
            "status": "booked"
        }
    ]
}
Success: Returns a list of appointments for the doctor.
Failure: Error if no appointments found.
5. Modify Appointment
# Endpoint: api/modify-appointment
# Method: PUT
# Description: Allows a patient to modify an existing appointment.
# Request Body:
email: Patient's email.
originalStartTime: Original appointment start time.
originalEndTime: Original appointment end time.
newStartTime: New appointment start time.
newEndTime: New appointment end time.
{
    "email": "Ravindersaini@gmail.com",
    "originalStartTime": "01:40PM",
    "originalEndTime": "02:00PM",
    "newStartTime": "11:40AM",
    "newEndTime": "01:00PM"
}
# Validation:
Checks if the original appointment exists.
Verifies that the new time does not conflict with other appointments.
# Response:
{
    "status": true,
    "message": "appointment modified successfully",
    "data": {
        "appointmentId": "67401a86e83a6bb461543fd8",
        "appointmentStartTime": "11:40AM",
        "appointmentEndTime": "01:00PM",
        "status": "modified",
        "doctor": {
            "name": "Dr. Ravi Mehta",
            "specialization": "Pediatrics"
        },
        "patient": {
            "firstName": "Ravinder",
            "lastName": "Saini",
            "email": "ravindersaini@gmail.com"
        }
    }
}
Success: Confirms appointment modification with updated details.
Failure: Error if modification conflicts with other appointments.