# Data Flow & Sequence Diagrams

This document illustrates the primary operational flows and data lifecycles across the client, server, database, and third-party services.

## 1. User Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant React as React Client
    participant API as Express API
    participant Google as Google Identity Services
    participant DB as MongoDB Atlas

    alt Local Credentials
        User->>React: Enters email and password
        React->>API: POST /api/auth/login (email, password)
        API->>DB: Query User by email
        DB-->>API: Return User document with passwordHash
        API->>API: Verify password with bcrypt
        alt Invalid Password
            API->>DB: Increment failedLoginAttempts
            API-->>React: 401 Unauthorized or 429 Locked
        else Valid Password
            API->>API: Generate signed JWT (userId, role)
            API-->>React: 200 OK (token, user)
        end
    else Google OAuth 2.0
        User->>React: Clicks Sign in with Google
        React->>Google: Trigger Google One-Tap or Popup
        Google-->>React: Return credential ID Token
        React->>API: POST /api/auth/google (credential)
        API->>Google: Verify ID Token signature
        Google-->>API: Return verified payload (email, name, sub)
        API->>DB: Upsert user by email or googleId
        DB-->>API: Return User document
        API->>API: Generate signed JWT
        API-->>React: 200 OK (token, user)
    end

    React->>React: Save token to localStorage and update AuthContext
```

## 2. Problem Solving & Progression Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client
    participant API as Express API
    participant DB as MongoDB Atlas
    participant Cache as Leaderboard Cache

    User->>Client: Clicks Solve checkbox on problem
    Client->>Client: Optimistically mark problem as solved in local state
    Client->>API: POST /api/problems/:id/solve (Bearer JWT)
    API->>API: Verify JWT token and extract userId
    API->>DB: Find User by userId
    alt Problem already in solvedProblems
        API->>DB: Pull problemId from solvedProblems
    else New Solution
        API->>DB: Add problemId to solvedProblems
        API->>API: Compute updated XP and progressive level
        API->>DB: Update user level, xp, and streak timestamps
    end
    DB-->>API: Return updated user stats
    API->>Cache: Invalidate leaderboard cache
    API-->>Client: 200 OK (solved, totalSolved, level, xp)
    Client->>Client: Reconcile AuthContext state with response
```

## 3. Admin Mutation & Cache Invalidation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AdminUI as Admin Control Center
    participant API as Express API
    participant Cache as In-Memory Problem Cache
    participant DB as MongoDB Atlas
    participant Audit as Audit Logging Service

    Admin->>AdminUI: Updates problem details or toggles soft-delete
    AdminUI->>API: PATCH /api/admin/problems/:id (Bearer JWT)
    API->>API: Verify auth and admin role
    API->>DB: Query original Problem snapshot
    API->>DB: Update Problem document by ID
    DB-->>API: Return updated Problem
    API->>Cache: Invalidate problems cache
    API->>Audit: Record UPDATE_PROBLEM audit event
    Audit->>DB: Insert AuditLog record
    API-->>AdminUI: 200 OK (Updated problem response)
    AdminUI->>AdminUI: Refresh local tab state and display toast
```

## 4. Sandboxed Visualizer Streaming Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as VisualizerFrame
    participant API as Express API
    participant R2 as Cloudflare R2 Storage

    User->>Client: Navigates to visualizer view
    Client->>API: GET /api/visualizers/:slug
    API-->>Client: Return visualizer metadata (r2Key, r2Url, sandbox)
    alt Direct R2 Streaming via Proxy
        Client->>API: GET /api/visualizers/serve/:slug
        API->>R2: Fetch visualizer asset by key
        R2-->>API: Stream HTML and JS asset
        API-->>Client: 200 OK with Content-Security-Policy
    else Direct CDN Embed
        Client->>R2: GET r2Url via sandboxed iframe
        R2-->>Client: Serve static visualizer application
    end
    Client->>Client: Render in sandboxed iframe (allow-scripts allow-same-origin)
```

