# Repository Directory Structure

This document details the layout and organization of all directories and critical files across the DSA Sheet repository.

```text
DSA Sheet/
├── .agents/                    # AI Agent instructions, modular rules, and skills
│   ├── rules/                  # Modular scoped development rules
│   │   ├── api-design.md       # REST API contracts, status codes, query rules
│   │   ├── backend.md          # Node.js/Express guidelines, caching, controllers
│   │   ├── code-quality.md     # Code style, typing, clean code standards
│   │   ├── database.md         # Mongoose schema, soft deletion, indexing
│   │   ├── frontend.md         # React 18, Vite, UI state management
│   │   ├── performance.md      # Caching, memoization, payload optimization
│   │   ├── security.md         # Auth, RBAC, input sanitization, token handling
│   │   ├── testing.md          # Node native test runner and test safety
│   │   └── ui-ux.md            # Dark theme, emerald accents, accessibility
│   └── skills/                 # Reusable agent workflows and runbooks
│       ├── code-review/        # Automated code review against project standards
│       ├── debugging/          # Systematic reproduction and triage procedure
│       ├── documentation-update/ # Doc keeping and instruction alignment
│       ├── feature-development/# End-to-end full-stack feature delivery
│       ├── refactoring/        # Safe component and controller refactoring
│       └── testing/            # Native test runner execution and authoring
│
├── client/                     # Frontend SPA (React 18, Vite, TypeScript)
│   ├── public/                 # Static web assets (favicons, icons)
│   │   └── visualizers/        # Standalone HTML animation assets & local fallbacks
│   ├── src/                    # Frontend source code
│   │   ├── components/         # Reusable UI components (Navbar, Modal, VisualizerFrame)
│   │   ├── contexts/           # React context providers (AuthContext.tsx)
│   │   ├── data/               # Static initial configurations and defaults
│   │   ├── pages/              # Top-level route pages (Topics, POTD, Profile)
│   │   │   ├── admin/          # Admin Control Center tabs and primitives
│   │   │   │   ├── modals/     # Admin creation and editing dialog modals
│   │   │   │   ├── AdminAuditTab.tsx
│   │   │   │   ├── AdminLeaderboardTab.tsx
│   │   │   │   ├── AdminOverviewTab.tsx
│   │   │   │   ├── AdminPOTDTab.tsx
│   │   │   │   ├── AdminProblemsTab.tsx
│   │   │   │   ├── AdminTopicsTab.tsx
│   │   │   │   ├── AdminUIPrimitives.tsx
│   │   │   │   ├── AdminUsersTab.tsx
│   │   │   │   └── AdminVisualizersTab.tsx
│   │   │   └── AdminPage.tsx   # Parent admin layout shell and tab router
│   │   ├── utils/              # Client utility functions (slug normalization, level)
│   │   ├── App.tsx             # Main routing and provider root
│   │   ├── index.css           # Tailwind CSS directives and custom styling tokens
│   │   └── main.tsx            # DOM mounting and bootstrap
│   ├── tests/                  # Client-side unit tests (`node --test`)
│   ├── AGENTS.md               # Scoped client development rules
│   ├── package.json            # Client dependencies and build scripts
│   ├── tailwind.config.js      # Tailwind design system configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── vite.config.ts          # Vite build and proxy configuration
│
├── docs/                       # Comprehensive project documentation
│   ├── api-reference.md        # Complete REST API endpoint reference
│   ├── architecture.md         # System architecture and layer boundaries
│   ├── authentication.md       # Auth lifecycle, JWT, lockout, and RBAC
│   ├── build-and-deployment.md # Build procedures, environment configs, deploy
│   ├── data-flow.md            # Sequence diagrams and business transaction flows
│   ├── database-schema.md      # Mongoose models, indexes, and relationships
│   ├── directory-structure.md  # Detailed tree structure and file locations (this doc)
│   ├── integrations.md         # Cloudflare R2, Resend, and Google OAuth setup
│   └── modules.md              # Client and server modular component breakdown
│
├── server/                     # Backend API Server (Node.js, Express 5, CommonJS)
│   ├── config/                 # Database connection and environment initializers
│   ├── data/                   # Seed files and initial data fixtures
│   ├── middleware/             # Express middlewares (auth.js, admin.js)
│   ├── models/                 # Mongoose models (User, Problem, Topic, Visualizer, etc.)
│   ├── routes/                 # Express route definitions (admin, auth, problems, etc.)
│   ├── scripts/                # Database migrations and administrative scripts
│   ├── tests/                  # Server unit and integration tests (`node --test`)
│   ├── utils/                  # Server utilities (cache, audit, rate limiter, email)
│   ├── AGENTS.md               # Scoped server development rules
│   ├── index.js                # Server entry point and HTTP listener
│   └── package.json            # Server dependencies and test scripts
│
└── AGENTS.md                   # Repository root agent guidelines and quick navigation
```

