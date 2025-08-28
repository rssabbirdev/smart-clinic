# 🏥 SmartClinic Queue Management System

A comprehensive digital queue management system designed specifically for school clinics with kiosk support. Built with Next.js, NextAuth, MongoDB, and real-time updates.

## ✨ Features

### 🎯 Student Portal
- **Dual Login Modes**:
  - Standard Login via School ID & Password (NextAuth)
  - Guest Mode for quick check-in without permanent accounts
- **Online Check-in** with symptom reporting
- **Real-time Queue Status** with position tracking
- **Emergency Alert Button** for urgent cases
- **Health History** (for registered students)
- **Auto Logout** after 2 minutes of inactivity

### 👩‍⚕️ Nurse/Admin Dashboard
- **Digital Queue Management** for all students
- **Smart Triage Display** highlighting emergency cases
- **Real-time Patient Updates** with Socket.IO
- **Emergency Alerts** and notifications
- **Data Analytics** and reporting tools

### 🔒 System Features
- **Role-Based Access Control** (students, nurses, admins)
- **Secure Authentication** with NextAuth
- **Auto Session Management** for kiosk environments
- **MongoDB Integration** with Mongoose
- **Real-time Updates** via RTK Query polling
- **Responsive Kiosk UI** with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartClinic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/smartclinic
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   JWT_SECRET=your-jwt-secret-key-here
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud service
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
SmartClinic/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Student dashboard
│   ├── kiosk/            # Kiosk login
│   ├── nurse/            # Nurse dashboard
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── kiosk/            # Kiosk components
│   ├── nurse/            # Nurse components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
├── models/                # MongoDB models
├── store/                 # Redux store & RTK Query
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## 🔧 Configuration

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `smartclinic`
3. Update `MONGODB_URI` in your `.env.local`

### NextAuth Configuration
- Update `NEXTAUTH_SECRET` with a strong secret key
- Modify `NEXTAUTH_URL` for production deployment
- Customize authentication providers in `app/api/auth/[...nextauth]/route.ts`

### Kiosk Settings
- Adjust auto-logout timeout in `hooks/useAutoLogout.ts` (default: 2 minutes)
- Modify polling intervals in `store/queueApi.ts`
- Customize UI components for your kiosk hardware

## 📱 Usage

### Student Check-in Process
1. **Access Kiosk**: Navigate to `/kiosk`
2. **Choose Login Mode**:
   - Standard: Use school credentials
   - Guest: Quick check-in without account
3. **Report Symptoms**: Select from categorized symptom menu
4. **Join Queue**: Get position and estimated wait time
5. **Monitor Status**: Real-time updates on queue position

### Nurse Queue Management
1. **Access Dashboard**: Navigate to `/nurse`
2. **View Queue**: See all patients with priority sorting
3. **Manage Patients**: Update status, add notes, mark complete
4. **Emergency Alerts**: Respond to urgent cases immediately
5. **Analytics**: View reports and trends

## 🎨 Customization

### UI Theming
- Modify colors in `tailwind.config.js`
- Update component styles in `components/`
- Customize kiosk-specific styles in `app/globals.css`

### Business Logic
- Adjust queue priority algorithms in API routes
- Modify auto-logout behavior in hooks
- Customize symptom categories and priorities

### Database Schema
- Extend models in `models/` directory
- Add new fields to User, Visit, or GuestSession
- Create additional collections as needed

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Build command: `npm run build`
- **Railway**: Use Node.js template
- **Docker**: Create custom Dockerfile

### Production Considerations
- Use strong, unique secrets for NextAuth and JWT
- Enable HTTPS in production
- Set up MongoDB Atlas for cloud database
- Configure proper CORS settings
- Set up monitoring and logging

## 🔒 Security Features

- **NextAuth.js** for secure authentication
- **JWT tokens** with configurable expiration
- **Role-based access control** for different user types
- **HTTP-only cookies** for session management
- **Input validation** and sanitization
- **MongoDB injection protection** via Mongoose

## 📊 Monitoring & Analytics

- **Real-time queue statistics**
- **Patient wait time tracking**
- **Symptom frequency analysis**
- **Emergency case monitoring**
- **User session analytics**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs` folder
- Review the API documentation in `/app/api` routes

## 🔮 Roadmap

- [ ] Mobile app for students
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-school support
- [ ] Integration with school management systems
- [ ] Offline mode support
- [ ] Multi-language support

---

**Built with ❤️ for better school healthcare management**
