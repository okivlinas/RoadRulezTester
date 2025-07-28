# 🚗 RoadRulezTester

Web application for testing knowledge of traffic rules.

## 🚀 Quick Start

### With Docker (recommended)
```bash
git clone https://github.com/okivlinas/RoadRulezTester.git
cd RoadRulezTester
docker-compose up --build
```

Open: http://localhost:80

### Local Development
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend  
cd my-nest-project && npm install && npm run start:dev
```

## 🏗️ Structure

```
RoadRulezTester/
├── frontend/          # React + TypeScript + Vite
├── my-nest-project/   # NestJS API + MongoDB
└── docker-compose.yml # Docker configuration
```

## 🎯 Features

### For Users
- ✅ Registration and authentication
- ✅ Taking traffic rules tests
- ✅ Viewing results and statistics
- ✅ Responsive design

### For Administrators
- ✅ Managing question database
- ✅ Creating and configuring tests
- ✅ User management
- ✅ Image upload

## 🛠️ Technologies

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit  
**Backend:** NestJS, MongoDB, JWT, Multer  
**DevOps:** Docker, Docker Compose, Nginx

## 📚 API

- `POST /auth/register` - Registration
- `POST /auth/login` - Login
- `GET /questions` - Get questions
- `POST /tests` - Create test (admin)
- `POST /results` - Save result

## 🔧 Configuration

Create `.env` file:
```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
SENDER=your-email@example.com
PASS_MAIL=your-email-password
PORT=3001
```

## 👥 Roles

**User:** Taking tests, viewing results  
**Administrator:** Managing questions, tests, users

## 👨‍💻 Creator

**Oleg Kivlinas** - [GitHub](https://github.com/okivlinas)

## 🤝 Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

---

⭐ If you like the project, give it a star! 