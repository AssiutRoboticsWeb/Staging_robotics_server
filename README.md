# Assiut Robotics Server

A robust Node.js/Express server for managing the Assiut Robotics Team platform, featuring member management, task tracking, and committee organization.

## 🚀 Features

- **Member Management**: Registration, authentication, and role-based access control
- **Committee System**: Support for multiple committees (Software, Hardware, Media, HR, Marketing, Logistics)
- **Task Management**: Assignment, submission, and evaluation of member tasks
- **File Upload**: Cloudinary integration for profile images and file management
- **Email System**: Nodemailer integration for email verification and notifications
- **Security**: JWT authentication, password hashing, and input validation
- **Logging**: Comprehensive logging with Winston
- **Database**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Express-validator
- **Logging**: Winston
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account
- Gmail account for SMTP

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AssiutRoboticsServer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   MONGOURL=mongodb://localhost:27017/assiut_robotics
   
   # JWT Configuration
   SECRET=your-super-secret-jwt-key-here
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # SMTP Configuration for Email
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Application Configuration
   BASE_URL=https://assiut-robotics-zeta.vercel.app
   REGISTRATION_DEADLINE=2025-09-27
   ```

4. **Create logs directory**
   ```bash
   mkdir logs
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
AssiutRoboticsServer/
├── config/                 # Configuration files
│   ├── database.js        # Database connection
│   └── environment.js     # Environment variables
├── controller/            # Route controllers
├── middleware/            # Custom middleware
│   ├── asyncWrapper.js    # Async error handling
│   ├── authorizeRoles.js  # Role-based authorization
│   ├── jwt.js            # JWT authentication
│   └── validation.js     # Input validation
├── mongoose.models/       # Database models
├── routers/              # Route definitions
├── utils/                # Utility functions
│   ├── cloudinary.js     # File upload utilities
│   ├── createError.js    # Error creation
│   ├── logger.js         # Logging utilities
│   └── sendEmail.js      # Email utilities
├── logs/                 # Log files
├── public/               # Static files
└── index.js              # Main server file
```

## 🔐 API Endpoints

### Authentication
- `POST /members/register` - Member registration
- `POST /members/login` - Member login
- `GET /members/verifyEmail/:token` - Email verification
- `POST /members/changePassword` - Password change

### Member Management
- `GET /members/getAllMembers` - Get all members
- `GET /members/get/:committee` - Get committee members
- `POST /members/changeProfileImage` - Update profile image

### Task Management
- `POST /members/:memberId/addTask` - Add task to member
- `PUT /members/:memberId/editTask/:taskId` - Edit task
- `DELETE /members/:memberId/deleteTask/:taskId` - Delete task
- `POST /members/rate` - Rate member task

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive input validation using express-validator
- **Role-Based Access Control**: Different permission levels for different roles
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Cross-origin resource sharing protection

## 📊 Database Models

### Member
- Basic information (name, email, password)
- Committee assignment
- Role and permissions
- Task assignments and evaluations
- HR ratings and feedback

### Task
- Title and description
- Deadlines and submission dates
- Evaluation criteria
- Points and ratings

### Committee
- Committee information
- Member assignments
- Track management

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
Make sure all required environment variables are set in production:
- Database connection string
- JWT secret
- SMTP credentials
- Cloudinary credentials

## 📝 Logging

The application uses Winston for comprehensive logging:
- **Console logging** in development
- **File logging** in production
- **HTTP request logging**
- **Database operation logging**
- **Authentication logging**
- **File upload logging**

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 2.0.0
- Complete code refactoring and security improvements
- Environment-based configuration
- Enhanced error handling and logging
- Input validation middleware
- Improved file upload handling
- Better database connection management

### Version 1.0.0
- Initial release with basic functionality
