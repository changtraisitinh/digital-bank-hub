``` mermaid

graph TB
    A[GitHub Repository] --> B[Webhook Events]
    B --> C[Agent Server]
    C --> D[Event Processor]
    D --> E[AI Analysis Engine]
    E --> F[Banking Compliance Checker]
    E --> G[Security Scanner]
    E --> H[Code Quality Analyzer]
    F --> I[Compliance Report]
    G --> J[Security Alert]
    H --> K[Code Review]
    I --> L[GitHub Issues/Comments]
    J --> L
    K --> L
    C --> M[Scheduler]
    M --> N[Daily Tasks]
    M --> O[Weekly Reports]
    M --> P[Monthly Audits]
    N --> Q[PR Monitoring]
    N --> R[Issue Triage]
    O --> S[Compliance Dashboard]
    P --> T[Audit Reports]
