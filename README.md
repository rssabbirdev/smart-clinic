# 🏥 SmartClinic - Student Health Management System

A comprehensive, modern web application for managing student health check-ins, nurse workflows, and administrative tasks in educational institutions. Built with Next.js 14, TypeScript, and MongoDB.

## ✨ Features Overview

### 🎯 **Student Check-in System**
- **Smart ID Lookup**: Students can check in using their student ID or manually enter information
- **Symptom Selection**: Pre-defined symptom categories with custom symptom input option
- **Priority Assessment**: Automatic priority assignment based on symptoms and emergency flags
- **Queue Management**: Real-time queue position tracking with estimated wait times
- **Re-check-in Logic**: Students can re-check-in after 1 hour for updated symptoms
- **Guest Check-in**: Support for non-registered students with manual information entry

### 👩‍⚕️ **Nurse Dashboard**
- **Todo-Style Interface**: Three-column Kanban board (Pending, Processing, Completed)
- **Smart Case Assignment**: Cases disappear from other nurses once picked up
- **Real-time Updates**: Intelligent background checking without page refresh
- **Advanced Filtering**: Search, status, priority, emergency, and date range filters
- **Multiple Tabs**:
  - **Today's Cases**: Current day's active cases with priority-based sorting
  - **All Cases**: Complete system overview with advanced filtering
  - **My Work History**: Personal case history and performance tracking
- **Case Management**: Start treatment, add notes, and complete cases
- **Responsive Design**: Mobile-friendly interface for all screen sizes

### 👨‍💼 **Admin Dashboard**
- **Student Management**: Full CRUD operations for student database
- **User Management**: Admin and nurse account administration
- **System Overview**: Real-time statistics and case monitoring
- **Data Export**: Comprehensive reporting and analytics

### 🔐 **Authentication & Security**
- **NextAuth.js Integration**: Secure authentication with JWT strategy
- **Role-Based Access Control**: Admin, Nurse, and Student role management
- **Session Management**: Secure session handling with automatic logout
- **Protected Routes**: Role-specific access to different dashboard sections

### 📱 **User Experience Features**
- **Modern UI/UX**: Clean, intuitive interface with Tailwind CSS
- **Responsive Design**: Mobile-first approach for all devices
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages and validation
- **Auto-redirect**: Smart navigation and return-to-home functionality

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Redux Toolkit**: Global state management
- **React Hooks**: Modern React patterns

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database with Mongoose ODM
- **NextAuth.js**: Authentication framework
- **JWT**: JSON Web Token authentication

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Git**: Version control
- **npm**: Package management

## 🚀 Setup Instructions

### **Prerequisites**
- Node.js 18+ 
- MongoDB database
- Git

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd SmartClinic
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Configuration**
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/smartclinic
# or your MongoDB Atlas connection string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Authentication
NEXTAUTH_JWT_SECRET=your-jwt-secret-here
```

### **4. Database Setup**
Ensure MongoDB is running and accessible. The application will automatically create necessary collections and indexes on first run.

### **5. Run the Application**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
SmartClinic/
├── app/                          # Next.js App Router
│   ├── api/                     # API endpoints
│   │   ├── admin/              # Admin-specific APIs
│   │   ├── auth/               # Authentication APIs
│   │   ├── check-in/           # Student check-in API
│   │   ├── nurse/              # Nurse-specific APIs
│   │   ├── queue/              # Queue management APIs
│   │   └── students/           # Student management APIs
│   ├── admin/                  # Admin dashboard pages
│   ├── login/                  # Authentication pages
│   ├── nurse/                  # Nurse dashboard pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                  # Reusable components
│   ├── admin/                  # Admin-specific components
│   ├── auth/                   # Authentication components
│   ├── nurse/                  # Nurse-specific components
│   ├── ui/                     # Common UI components
│   └── layout/                 # Layout components
├── lib/                        # Utility functions and configurations
├── models/                     # MongoDB schemas
├── types/                      # TypeScript type definitions
└── public/                     # Static assets
```

## 🔧 Key Features Explained

### **Smart Queue Management**
The system implements a priority-based queue system:
- **Emergency cases** are always processed first
- **High priority** cases follow emergency cases
- **Medium and low priority** cases are processed in arrival order
- **Real-time updates** ensure accurate queue positions

### **Intelligent Background Checking**
Instead of refreshing the entire page, the nurse dashboard:
- **Checks for updates every 10 seconds** in the background
- **Only updates state** when new cases arrive or existing ones change
- **Shows visual indicators** when new updates are detected
- **Maintains user experience** without interruptions

### **Custom Symptom Handling**
Students can:
- **Select from pre-defined symptoms** (fever, headache, etc.)
- **Add custom symptoms** with detailed descriptions
- **Combine multiple symptoms** for comprehensive reporting
- **Update symptoms** during re-check-ins

### **Case Assignment System**
- **Nurses can pick up cases** from the pending queue
- **Cases disappear from other nurses** once assigned
- **Personal case management** with notes and status updates
- **Work history tracking** for performance monitoring

### **Responsive Design Features**
- **Mobile-first approach** with responsive breakpoints
- **Touch-friendly interfaces** for tablet and mobile devices
- **Adaptive layouts** that work on all screen sizes
- **Optimized navigation** for different device types

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### **Student Management**
- `GET /api/students/search` - Search students by ID
- `POST /api/admin/students` - Create new student
- `PUT /api/admin/students/[id]` - Update student
- `DELETE /api/admin/students/[id]` - Delete student

### **Queue Management**
- `GET /api/queue` - Get queue data
- `PATCH /api/queue` - Update queue status
- `GET /api/queue/position` - Get student's queue position

### **Check-in System**
- `POST /api/check-in` - Process student check-in

## 🔒 Security Features

- **Input validation** on all forms and API endpoints
- **SQL injection prevention** through parameterized queries
- **XSS protection** with proper data sanitization
- **CSRF protection** through NextAuth.js
- **Role-based route protection** for sensitive areas

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Other Platforms**
- **Netlify**: Compatible with Next.js static export
- **AWS**: Deploy to EC2 or use AWS Amplify
- **Docker**: Containerize the application

### **Environment Variables for Production**
```env
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_SECRET=your-production-secret
```

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] Student check-in flow
- [ ] Nurse case assignment
- [ ] Admin student management
- [ ] Authentication flows
- [ ] Responsive design on different devices
- [ ] Error handling scenarios

### **API Testing**
Use tools like Postman or Insomnia to test API endpoints:
- Verify authentication requirements
- Test input validation
- Check response formats
- Validate error handling

## 🐛 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Error**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure network access

2. **Authentication Issues**
   - Verify environment variables
   - Check NextAuth configuration
   - Clear browser cookies

3. **Build Errors**
   - Run `npm run build` to identify issues
   - Check TypeScript errors
   - Verify all dependencies are installed

### **Performance Optimization**
- **Database indexing** for frequently queried fields
- **API response caching** for static data
- **Image optimization** for better loading times
- **Code splitting** for reduced bundle sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

## 🔮 Future Enhancements

- **Real-time notifications** using WebSockets
- **Mobile app** for students and nurses
- **Advanced analytics** and reporting
- **Integration** with school management systems
- **Multi-language support**
- **Offline capability** for critical functions

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
