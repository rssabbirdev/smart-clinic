# SmartClinic Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env.local` file in the root directory with:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smartclinic

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# App Configuration
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Seed the Database
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access the Application
- **Kiosk**: http://localhost:3000/kiosk
- **Student Dashboard**: http://localhost:3000/dashboard
- **Nurse Dashboard**: http://localhost:3000/nurse

## Sample Login Credentials

After running the seed script, you can use:

### Students
- **Student ID**: `STU001`, **Password**: `password123`
- **Student ID**: `STU002`, **Password**: `password123`

### Staff
- **Nurse ID**: `NUR001`, **Password**: `password123`
- **Admin ID**: `ADM001`, **Password**: `password123`

## Features

- ✅ Student & Guest Login
- ✅ Symptom Selection & Check-in
- ✅ Queue Management
- ✅ Emergency Alerts
- ✅ Auto-logout (2 minutes)
- ✅ Real-time Updates
- ✅ Responsive Kiosk UI

## Troubleshooting

If you encounter any issues:

1. **Check MongoDB connection** - Ensure MongoDB is running
2. **Verify environment variables** - Check `.env.local` file
3. **Clear Next.js cache** - Delete `.next` folder and restart
4. **Check console errors** - Look for import or API errors

## Support

For issues or questions, check the main README.md file or create an issue in the repository.
