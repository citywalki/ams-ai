# AMS-AI

Alert Management System with AI Analysis - A monolithic + cluster architecture for intelligent alert processing.

## Quick Start

### Prerequisites
- JDK 21
- Node.js 20+
- PostgreSQL 15+
- Docker (optional, for integration tests)

### Backend

```bash
# Start development server
./gradlew :app-boot:quarkusDev

# Run tests
./gradlew test
```

### Frontend

```bash
cd app-web
pnpm install
pnpm dev
```

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](./CLAUDE.md) | **Start here** - Project context, architecture rules, coding patterns |
| [docs/api-standards.md](./docs/api-standards.md) | API design standards (GraphQL + REST) |
| [docs/backend-patterns.md](./docs/backend-patterns.md) | Backend coding patterns and conventions |
| [docs/frontend-patterns.md](./docs/frontend-patterns.md) | Frontend architecture (FSD) patterns |
| [docs/ui-style-guide.md](./docs/ui-style-guide.md) | UI/UX design system and component usage |
| [docs/testing-guide.md](./docs/testing-guide.md) | Testing strategies and commands |

## Project Structure

```
├── app-boot/          # Quarkus application entry point
├── app-web/           # React + TypeScript frontend
├── feature-admin/     # System administration features
├── feature-core/      # Core alert processing
├── feature-ai-analysis/    # AI-powered alert analysis
├── feature-alert-ingestion/ # Alert ingestion from sources
├── feature-notification/    # Notification delivery
├── feature-graphql/    # GraphQL API layer
├── lib-common/        # Shared utilities
├── lib-cluster/       # Distributed cache (Hazelcast)
├── lib-persistence/   # Database access utilities
└── docs/              # Documentation
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Quarkus 3.31.2, JDK 21, Hibernate ORM |
| Frontend | React 19, TypeScript 5.9, Vite 7 |
| UI | shadcn/ui, Tailwind CSS 4 |
| State | Zustand 5 |
| Cache | Hazelcast 5.4.0 |
| Database | PostgreSQL + Liquibase |

## Contributing

See [CLAUDE.md](./CLAUDE.md) for:
- Multi-tenancy requirements
- API protocol selection (GraphQL for queries, REST for mutations)
- Code style and patterns
- Verification checklist

Format code before committing:
```bash
./gradlew spotlessApply    # Backend
cd app-web && pnpm lint    # Frontend
```
