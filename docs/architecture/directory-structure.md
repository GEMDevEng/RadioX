# Directory Structure for RadioX Free Edition

This directory structure organizes the RadioX Free Edition project into logical components, ensuring a clean and maintainable codebase. It is designed to support a full-stack web application with a React frontend, Node.js/Express backend, MongoDB database, Redis caching, and AWS S3 storage. The structure follows best practices for scalability, testing, and deployment.

---

## Root Directory

The root directory contains configuration files, documentation, and scripts for the entire project.

```bash
radiox-free-edition/
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Project dependencies and scripts
├── README.md             # Project documentation
├── LICENSE               # License file
└── CONTRIBUTING.md       # Contribution guidelines
```

---

## Frontend Directory

The `frontend/` directory houses the React-based user interface, including components, pages, hooks, and assets.

```bash
frontend/
├── public/               # Static assets
│   ├── index.html        # Main HTML file
│   └── favicon.ico       # Favicon
├── src/                  # Source code
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   └── SearchBar.js
│   ├── contexts/         # React Context API for state management
│   │   ├── AuthContext.js
│   │   └── ApiUsageContext.js
│   ├── hooks/            # Custom React hooks
│   │   ├── useApi.js
│   │   └── useAudioPlayer.js
│   ├── pages/            # Screen-specific components
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   └── SearchPage.js
│   ├── services/         # API clients
│   │   └── api.js
│   ├── styles/           # Global styles and Tailwind config
│   │   └── tailwind.css
│   ├── utils/            # Helper functions
│   │   └── formatDate.js
│   └── App.js            # Main App component
├── tests/                # Frontend tests
│   ├── components/
│   ├── pages/
│   └── integration/
├── .babelrc              # Babel configuration
├── jest.config.js        # Jest configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

---

## Backend Directory

The `backend/` directory contains the Node.js/Express server, API routes, database models, and services.

```bash
backend/
├── config/               # Configuration files
│   ├── db.js             # Database connection
│   └── redis.js          # Redis connection
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── searchController.js
│   └── audioController.js
├── middleware/           # Express middleware
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/               # Mongoose models
│   ├── User.js
│   ├── AudioClip.js
│   └── Podcast.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── searchRoutes.js
│   └── audioRoutes.js
├── services/             # Business logic
│   ├── xApiService.js
│   ├── ttsService.js
│   └── s3Service.js
├── tests/                # Backend tests
│   ├── unit/
│   └── integration/
├── utils/                # Utility functions
│   └── logger.js
├── .env                  # Environment variables
├── app.js                # Express app setup
└── server.js             # Server entry point
```

---

## Processing Service Directory

The `processing/` directory manages asynchronous tasks like audio conversion, using Redis and Bull for job queues.

```bash
processing/
├── jobs/                 # Job definitions
│   └── audioConversion.js
├── utils/                # Helper functions
│   └── ffmpegUtils.js
├── .env                  # Environment variables
└── worker.js             # Worker process for job queues
```

---

## Shared Directory

The `shared/` directory contains code shared between frontend and backend, such as constants and types.

```bash
shared/
├── constants/
│   └── apiConstants.js
└── types/
    └── audioTypes.js
```

---

## Infrastructure Directory

The `infrastructure/` directory holds configuration files for deployment, monitoring, and orchestration.

```bash
infrastructure/
├── docker/
│   ├── Dockerfile.frontend
│   └── Dockerfile.backend
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
└── monitoring/
    ├── prometheus.yml
    └── grafana-dashboard.json
```

---

## Documentation Directory

The `docs/` directory contains project documentation, including API specs and architecture diagrams.

```bash
docs/
├── api/
│   └── swagger.yaml
└── architecture/
    └── system-diagram.png
```

---

## Scripts Directory

The `scripts/` directory includes automation scripts for tasks like database seeding and backups.

```bash
scripts/
├── seedDatabase.js
└── backupDatabase.sh
```

---

## Tests Directory

The `tests/` directory at the root level contains end-to-end tests and performance test scripts.

```bash
tests/
├── e2e/
│   └── cypress.json
└── performance/
    └── jmeter.jmx
```

---

## Root-Level Configuration Files

- **.github/workflows/**: GitHub Actions for CI/CD pipelines.
- **.dockerignore**: Files to ignore in Docker builds.
- **.eslintrc.js**: ESLint configuration for code quality.
- **.prettierrc**: Prettier configuration for code formatting.

---

This directory structure ensures a clean separation of concerns, making it easier to maintain, scale, and extend RadioX Free Edition. Each subdirectory is purpose-driven, supporting the application's architecture and development workflow.