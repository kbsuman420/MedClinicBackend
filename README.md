src/
│
├── config/
│   ├── db.js
│   ├── env.js
│   └── logger.js
│
├── modules/
│   │
│   ├── auth/
│   ├── users/
│   ├── hospitals/
│   ├── clinics/
│   ├── doctors/
│   ├── patients/
│   ├── appointments/
│   ├── departments/
│   ├── prescriptions/
│   ├── medical-records/
│   ├── lab-tests/
│   ├── pharmacy/
│   ├── billing/
│   ├── payments/
│   ├── notifications/
│   └── dashboard/
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validate.middleware.js
│   └── error.middleware.js
│
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── generateToken.js
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── schema.sql
│
├── app.js
└── server.js