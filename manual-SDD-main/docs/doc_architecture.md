# Agent Architecture Guide

## Purpose

This document is the canonical architecture guide for AI agents working in this repository.

Use it to decide:

1. where a new file belongs,
2. how modules should be structured,
3. how the main runtime flows are organized,
4. what contracts and boundaries should not be changed by mistake.

For concrete verification paths, recommended commands, smoke/debug workflows, and test selection by risk, use:

- [`docs/agent_verification_guide.md`](./agent_verification_guide.md)

Use that document when:

- you need to decide which tests to run for a change,
- you need the recommended command for a verification task,
- you need to inspect routing, streaming, retrieval, or API behavior,
- you are debugging a regression and want the cheapest reliable verification path.

## Project layout (source of truth)

Code lives under `src/flexo_app` with a `src/` layout.

- `api/`: HTTP layer (FastAPI routes + schemas)
- `services/`: application use cases and orchestration
- `domain/`: pure domain transformations and business rules
- `repositories/`: app-level storage/query operations (business meaning)
- `integrations/`: low-level SDK/client adapters
- `core/`: shared cross-cutting concerns (config, errors, logging)
- `utils/`: utility helpers with no business orchestration

Operational scripts live in `scripts/`.

Experiment inputs/outputs for evaluation workflows live under top-level `evals/`.

Test layout guidance:

- `tests/unit/`: pure logic, fast tests, doubles/fakes allowed
- `tests/integration/`: repository/service/API integration with controlled dependencies
- `tests/e2e/`: real external dependencies and near-production behavior validation (for example real LLM calls, real vector DB, real indexing flow)

## Main flows and starting points

Use these paths to orient quickly in the current runtime:

- `POST /query`: start with `api/routes/query.py`, `api/schemas.py`, and `services/qa/answer_service.py`; main flow is retrieval -> prompt rendering -> LLM completion -> structured answer parsing -> API response
- `POST /query-stream`: start with `api/routes/query.py` and `services/qa/stream_service.py`; main flow is retrieval -> prompt rendering -> streamed LLM output -> structured stream extraction/finalization -> SSE events
- indexing and document ingestion: start with `services/ingestion/indexing_service.py`, `domain/indexing/`, and `chunker.py`
- evaluation pipeline: start with `src/flexo_app/evals/pipeline.py`, `src/flexo_app/evals/run.py`, and top-level `evals/`; main flow is document-id-first orchestration -> optional reindex path -> retrieval evaluation -> outputs in `evals/results/`
- vector backend behavior: start with `repositories/vector_store_contract.py`, `repositories/vector_store_backend.py`, `repositories/vector_store_factory.py`, `repositories/`, and `integrations/vector_store/`

## Layer responsibilities

### `api/`

Contains transport concerns only:

- request/response models,
- endpoint wiring,
- calling a service method.

Do not place business logic in routes.

### `services/`

Contains use-case orchestration:

- coordinates repository + integration calls,
- validates use-case inputs,
- maps domain outputs to response shape.

Use semantic class APIs (example: `AnswerService.answer(...)`).

### `domain/`

Contains pure logic:

- parsers/normalizers,
- context/prompt transformation logic,
- deterministic rules.

Should be independent from HTTP and SDK clients whenever possible.

### `repositories/`

Contains storage operations with application meaning:

- retrieve chunks for query,
- fetch chunk ranges by document,
- delete/upsert domain-relevant records.

Repository methods should express business intent, not raw SDK details.

### `integrations/`

Contains low-level external clients:

- provider initialization,
- auth/config wiring,
- direct SDK setup.

Do not place app-level query semantics here.

## Vector store backend architecture

This codebase supports multiple vector store backends:

- `pinecone`: production baseline and default application path
- `qdrant`: local experimentation, integration testing, and evaluation path

Use these repository-level abstractions:

- `VectorStoreContract` defines service-facing behavior
- `VectorStoreBackend` is the supported backend enum
- `get_vector_store_repository(...)` is the canonical selection/wiring entrypoint

Placement rules:

- backend-specific business-aware operations belong in `repositories/`
- backend-specific low-level client setup belongs in `integrations/vector_store/`
- new backend support should update contract, enum, factory, repository implementation, and client setup together

Current policy:

- Any integration or end-to-end test that requires a real vector database should use `qdrant`
- Those tests should create or use an isolated Qdrant collection and avoid shared production-like indexes
- Normal application behavior, including default `/query` usage, should keep `pinecone` unless the task is explicitly about `qdrant` behavior or real-vector-db evaluation/integration work

Avoid partial implementations that bypass the contract/factory path or hardcode ad-hoc backend strings when the enum/factory already cover the case.

## File placement rules (decision guide)

When adding code, decide by intent:

1. New endpoint -> `api/routes/` (+ schema in `api/schemas.py`)
2. New use case -> `services/<bounded_context>/`
3. New pure transformation/rule -> `domain/<subdomain>/`
4. New app-level persistence/query behavior -> `repositories/`
5. New external provider adapter/client -> `integrations/<provider_or_kind>/`
6. New reusable helper (non-domain, non-use-case) -> `utils/`

If a module needs both SDK setup and business-aware queries, split it:

- SDK setup in `integrations/`
- business-aware operations in `repositories/`

## Eval architecture

Evaluation runtime code belongs under `src/flexo_app/evals/`.
Experiment assets and outputs belong under top-level `evals/`.

Current eval pipeline contract is document-id first:

- manual input: `evals/manuals/<document_id>.md`
- question dataset: `evals/datasets/<document_id>.csv`
- result outputs: `evals/results/`

Do not add alternate input modes (`--md`, `--csv`, mixed path inputs) unless the task explicitly changes the contract.

Do not move eval orchestration into `tests/`; tests validate the workflow, but runtime eval commands live in `src/flexo_app/evals/`.

## Naming conventions

- Class names: `PascalCase` (`AnswerService`, `ParsingService`)
- Methods/functions: `snake_case`
- Files: `snake_case.py`
- Error codes: uppercase with underscores (`PARSE_DOCUMENT_FAILED`)

Use semantic names that describe behavior:

- prefer `answer(...)` over `do_query(...)`
- prefer `browse(...)` over generic `run(...)` when behavior is specific

## API and output contracts

Preserve existing response contracts unless task explicitly requires changes.

Examples:

- Query result shape must keep keys expected by callers (`answer`, `answered`, `answered_from`, `citations`)
- Streaming responses must keep event semantics (`delta`, `done`, `error`)

Breaking these contracts requires explicit task scope.

## Error handling rules

Use typed application errors from `core/errors`:

- `ValidationError` for invalid input,
- `DomainError` for domain-level invalid data or rule failures,
- `UseCaseError` for use-case failures,
- `InfrastructureError` for provider/storage failures,
- `ExternalServiceError` for external dependency failures when the distinction matters.

HTTP transport mapping is defined in `api/error_handlers.py`:

- `ValidationError` -> `400`
- `DomainError` -> `422`
- `InfrastructureError` / `ExternalServiceError` -> `500` or `503` depending on failure type

Avoid leaking raw SDK exceptions across layer boundaries.

## Configuration and runtime environment

- Python managed with Poetry
- Required Python: `>=3.10,<4.0`
- Runtime configuration is centralized in `core/config.py`
- Prefer existing settings and environment wiring over new ad-hoc constants
- Install/setup and verification commands live in [`docs/agent_verification_guide.md`](./agent_verification_guide.md).

## Anti-patterns (do not introduce)

- business logic inside `api/routes`
- app-specific query semantics inside `integrations`
- raw SDK exceptions returned directly to upper layers
- duplicate implementations of same responsibility across layers
- creating new compatibility wrappers unless task explicitly asks for them
