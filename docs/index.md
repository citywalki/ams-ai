# AMS-AI Documentation

Documentation for the Alert Management System with AI Analysis.

## Getting Started

New to the project? Start here:

1. **[Onboarding Guide](./onboarding.md)** - API protocol selection, code examples, and troubleshooting
2. **[Project Context](../CLAUDE.md)** - Architecture, tech stack, coding patterns, and rules
3. **[Testing Guide](./testing-guide.md)** - How to run tests and testing strategies

## Development Guides

### API Design
- **[API Standards](./api-standards.md)** - GraphQL and REST API design patterns
- Protocol selection: GraphQL for queries, REST for mutations

### Backend
- **[Backend Patterns](./backend-patterns.md)** - Java/Quarkus coding conventions
- Multi-tenancy via `tenant_id` + Hibernate Filter
- Panache Next repository pattern
- CQRS: Query/Command Handler separation

### Frontend
- **[Frontend Patterns](./frontend-patterns.md)** - FSD (Feature-Sliced Design) architecture
- **[UI Style Guide](./ui-style-guide.md)** - shadcn/ui components and design system
- React 19 + TypeScript 5.9 + Vite 7

## Quick Reference

### Common Commands

**Backend:**
```bash
./gradlew spotlessApply              # Format code
./gradlew :app-boot:quarkusDev       # Dev mode
./gradlew test                       # Run tests
```

**Frontend:**
```bash
cd app-web
pnpm dev                             # Dev server
pnpm build                           # Production build
pnpm test:run                        # Unit tests
```

### Module Overview

| Module | Purpose |
|--------|---------|
| `app-boot` | Application entry point |
| `app-web` | React frontend |
| `feature-admin` | User/role/permission management |
| `feature-core` | Alert processing, deduplication, routing |
| `feature-ai-analysis` | AI-powered alert insights |
| `feature-alert-ingestion` | Alert ingestion from sources |
| `feature-notification` | Notification delivery |
| `feature-graphql` | GraphQL API layer |
| `lib-common` | Shared utilities |
| `lib-cluster` | Hazelcast distributed cache |
| `lib-persistence` | Database utilities |

## Documentation Maintenance

This documentation is **living** - update it when:
- Adding new features that change patterns
- Modifying API standards
- Changing project structure

See [CLAUDE.md](../CLAUDE.md) for full context on coding patterns and constraints.
