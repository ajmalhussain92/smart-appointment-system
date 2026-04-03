# Smart Doctor Appointment & Queue Management System

## Team
- **Ajmal** → Backend (`backend-feature` branch)
- **Mantra** → Frontend (`frontend-feature` branch)

---

## Folder Structure

```
smart-appointment-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # JWT auth guard
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   └── server.js        # Entry point
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/             # Axios instance + service calls
    │   ├── components/      # Navbar, AppointmentCard, DoctorList, TimeSlotPicker
    │   ├── context/         # AuthContext
    │   ├── pages/           # Home, Login, Dashboard, BookAppointment
    │   └── App.jsx
    └── package.json
```

---

## Backend Setup (Ajmal)

```bash
cd backend
npm install
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/doctors` | ✅ | List all doctors |
| PATCH | `/api/doctors/availability` | ✅ Doctor | Toggle availability |
| GET | `/api/appointments/slots?doctorId=&date=` | ✅ | Get available slots |
| POST | `/api/appointments` | ✅ Patient | Book appointment |
| GET | `/api/appointments/my` | ✅ | Get my appointments |
| PATCH | `/api/appointments/:id/status` | ✅ Doctor | Update status |
| PATCH | `/api/appointments/:id/cancel` | ✅ Patient | Cancel appointment |

---

## Frontend Setup (Mantra)

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` — proxies `/api` to `http://localhost:5000`

---

## MongoDB Schemas

### User
```js
{ name, email, password (hashed), role: 'doctor'|'patient', specialization, isAvailable }
```

### Appointment
```js
{ patient (ref), doctor (ref), date, timeSlot, status: 'waiting'|'completed'|'cancelled', queuePosition }
```

---

## Queue Logic
- On booking: `queuePosition = count of waiting appointments for that doctor on that date + 1`
- Unique index on `(doctor, date, timeSlot)` prevents double booking
