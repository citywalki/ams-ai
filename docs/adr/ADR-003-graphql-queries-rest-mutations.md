# ADR-003: Use GraphQL for Queries and REST for Mutations

## Status

**Accepted**

## Date

2026-03-08

## Context

The AMS-AI project exposes APIs to frontend applications for alert management operations. We need to define a consistent approach for client-server communication that optimizes for:

1. **Read operations**: Need flexible data fetching, field selection, and nested resource loading
2. **Write operations**: Need clear resource semantics, proper HTTP caching, and idempotency
3. **Developer experience**: Clear patterns that reduce decision fatigue
4. **Maintainability**: Consistent patterns across the entire codebase

Our existing codebase (documented in [CLAUDE.md](../../CLAUDE.md)) already follows this pattern at approximately 90% compliance:
- 6 GraphQL APIs handle read-only operations
- 8 REST controllers handle write operations
- Frontend uses `urql` for GraphQL queries and `axios` for REST mutations

However, the pattern is not formally documented as an architecture decision, which creates risk of regression and inconsistency in future development.

## Decision

We will adopt a **hybrid API architecture** with clear protocol separation:

| Operation Type | Protocol | Rationale |
|----------------|----------|-----------|
| **Queries (Read)** | GraphQL | Flexible field selection, reduce network round trips, nested data fetching |
| **Mutations (Write)** | REST | Clear resource semantics, better HTTP caching, standard status codes |

**Core Principles:**

1. **GraphQL is for reading only** - All list, detail, and search operations use GraphQL
2. **REST is for writing only** - All create, update, delete operations use REST
3. **No exceptions** - Existing working endpoints can remain until modified; new code must follow this pattern
4. **Layer separation** - Read logic in `*Query` classes, write logic in `*Service` classes

## Options Considered

### Option 1: GraphQL-Only Architecture (Rejected)

**Approach**: Use GraphQL for all operations including mutations.

**Pros**:
- Single endpoint and protocol
- Unified type system
- Strong introspection capabilities

**Cons**:
- GraphQL mutations lack standard HTTP semantics (POST/PUT/PATCH/DELETE)
- Harder to implement HTTP caching for mutations
- Overkill for simple CRUD operations
- File uploads require non-standard extensions
- Authentication/authorization patterns less mature than REST

**Rejection Reason**: While GraphQL excels at queries, it introduces unnecessary complexity for mutations. Standard HTTP methods provide clearer semantics for write operations.

### Option 2: REST-Only Architecture (Rejected)

**Approach**: Use REST for all operations including complex queries.

**Pros**:
- Mature ecosystem and tooling
- Excellent HTTP caching support
- Simple to understand and implement
- Great for resource-based operations

**Cons**:
- Over-fetching: Clients receive more data than needed
- Under-fetching: Multiple requests needed for related data
- Versioning complexity as APIs evolve
- Difficult to support flexible field selection

**Rejection Reason**: REST requires multiple endpoints and round trips for complex data fetching. Frontend components often need data from multiple resources, leading to N+1 request problems.

### Option 3: Hybrid Architecture - GraphQL Queries, REST Mutations (Accepted)

**Approach**: Use GraphQL for read operations, REST for write operations.

**Pros**:
- Best of both worlds: GraphQL flexibility for reads, REST clarity for writes
- Optimal HTTP caching for mutations
- Clear separation of concerns
- Reduced network round trips with precise field selection
- Standard security patterns work for both

**Cons**:
- Two client libraries to maintain (urql + axios)
- Developers must remember which protocol to use
- Slightly steeper learning curve for new team members
- Potential inconsistency if pattern not enforced

**Acceptance Reason**: This approach optimizes each protocol for its strength. GraphQL's flexible querying reduces over-fetching and network round trips. REST's standard HTTP semantics provide clear resource operations and optimal caching. The pattern is already established in our codebase and working well.

## Consequences

### Positive Consequences

1. **Performance**: GraphQL queries reduce network round trips by allowing clients to fetch exactly the fields they need in a single request
2. **HTTP Caching**: REST mutations work optimally with HTTP caching mechanisms (ETags, cache headers)
3. **Clear Semantics**: Standard HTTP methods (POST/PUT/PATCH/DELETE) provide unambiguous resource operations
4. **Idempotency**: REST makes it easier to implement idempotent operations (e.g., PUT for full replacement, PATCH for partial updates)
5. **Reduced Over-fetching**: GraphQL field selection eliminates unnecessary data transfer
6. **Developer Clarity**: Clear protocol boundaries reduce decision fatigue - "If I'm reading, use GraphQL. If I'm writing, use REST."

### Negative Consequences

1. **Multiple Clients**: Frontend must maintain both GraphQL (urql) and REST (axios) client configurations
2. **Learning Overhead**: New developers must understand both protocols and when to use each
3. **Potential Inconsistency**: Without strict enforcement, developers might use GraphQL mutations or REST queries
4. **Code Duplication**: Some validation logic may need to exist in both GraphQL resolvers and REST controllers
5. **Testing Complexity**: Integration tests must handle both protocol types
6. **Documentation**: Must maintain documentation for both API styles

## Implementation Guidelines

### Backend

**GraphQL Layer** (`feature-graphql` module):
- Expose only `@Query` methods
- Use Filter input classes for complex criteria
- Connection types for cursor-based pagination
- Delegate to `*Query` classes for data access

**REST Layer** (JAX-RS controllers):
- Standard HTTP methods with proper status codes
- Resource-based URL patterns (`/api/resource/{id}`)
- Delegate to `*Service` classes with `@Transactional`

### Frontend

**GraphQL (urql)**:
- Use exclusively for read operations
- Custom hooks follow naming: `use{Feature}{Action}`
- TypeScript types via codegen from schema

**REST (axios)**:
- Use exclusively for mutations
- TanStack Query mutations for server state
- Proper error message extraction from HTTP responses

## References

- [CLAUDE.md](../../CLAUDE.md) - API Protocol Selection guidelines
- [GraphQL Specification](https://spec.graphql.org/)
- [REST API Best Practices](https://restfulapi.net/)

## Notes

This ADR formalizes an existing pattern established in the codebase. For the rationale behind choosing this specific hybrid approach over alternatives, see the Options Considered section above.

---

**Author**: Architecture Team  
**Reviewers**: Tech Lead, Senior Developers  
**Last Updated**: 2026-03-08
