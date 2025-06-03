# 🏋️ Sport SuperApp

A comprehensive monorepo containing applications for fitness trainers and their clients, built with modern web technologies and designed for scalability.

## 🚀 Applications

### 📱 Client App (`apps/client-app/`)
Progressive Web App (PWA) for fitness clients with:
- **Personal Dashboard** - Overview of workouts, progress, and tasks
- **Interactive Calendar** - Schedule and track workouts
- **Progress Tracking** - Monitor fitness goals and achievements  
- **Payment Management** - Handle subscriptions and payments
- **AI Assistant** - Get personalized fitness guidance
- **Telegram Integration** - Seamless bot integration

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS, PWA

### 👨‍💼 Trainer App (`apps/trainer-app/`)
Management platform for fitness trainers with:
- **Client Management** - Track client progress and communications
- **Workout Planning** - Create and assign custom workout plans
- **Schedule Management** - Manage appointments and availability
- **Analytics Dashboard** - Monitor business metrics
- **Payment Tracking** - Handle client billing and subscriptions

**Tech Stack:** React, TypeScript, Express.js, PostgreSQL

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional)

### Local Development

```bash
# Clone repository
git clone https://github.com/spk364/sport-superapp.git
cd sport-superapp

# Install dependencies
npm install

# Start both applications
npm run dev
```

**Access:**
- Client App: http://localhost:3001
- Trainer App: http://localhost:3000

### Docker Development

```bash
# Build and start all services
docker-compose up --build

# Or start individual services
docker-compose up client-app
docker-compose up trainer-app
```

## 📦 Deployment

This monorepo supports multiple deployment strategies:

### 🌐 Netlify (Client App)
- Automatic deployments from `main` branch
- PWA optimization included
- Custom domain support

### ⚡ Vercel (Trainer App)  
- Zero-config Next.js deployment
- Edge functions support
- Preview deployments for PRs

### 🐳 Docker
- Multi-stage builds for production
- Health checks included
- Environment-based configuration

### 🔄 GitHub Actions
- Automated testing and deployment
- Multi-environment support (staging/production)
- Security scanning included

## 📚 Documentation

- [📖 Quick Start Guide](./QUICKSTART.md)
- [🚀 Deployment Guide](./DEPLOY.md)
- [🔧 Development Setup](./docs/development.md)
- [🏗️ Architecture Overview](./docs/architecture.md)

## 🧪 Available Scripts

```bash
# Development
npm run dev              # Start both apps in development
npm run dev:client       # Start client app only
npm run dev:trainer      # Start trainer app only

# Building
npm run build            # Build both applications
npm run build:client     # Build client app only
npm run build:trainer    # Build trainer app only

# Testing
npm run test             # Run all tests
npm run test:client      # Test client app only
npm run test:trainer     # Test trainer app only

# Deployment
npm run deploy:netlify   # Deploy client to Netlify
npm run deploy:vercel    # Deploy trainer to Vercel
```

## 🏗️ Project Structure

```
sport-superapp/
├── apps/
│   ├── client-app/          # PWA for fitness clients
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── pages/       # Application pages
│   │   │   ├── store/       # Zustand state management
│   │   │   └── types/       # TypeScript definitions
│   │   └── public/          # Static assets
│   └── trainer-app/         # Platform for trainers
│       ├── src/             # Source code
│       └── public/          # Static assets
├── docs/                    # Documentation
├── scripts/                 # Deployment scripts
└── .github/                 # GitHub Actions workflows
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced AI coaching features
- [ ] Integration with wearable devices
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Social features and community

## 📞 Support

For support and questions:
- 📧 Create an issue in this repository
- 💬 Join our Telegram channel
- 📖 Check the documentation

---

**Built with ❤️ for the fitness community**
