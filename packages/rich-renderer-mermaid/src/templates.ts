export const MERMAID_TEMPLATES: { label: string; code: string }[] = [
  {
    label: 'Flowchart',
    code: 'graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Action 1]\n  B -->|No| D[Action 2]\n  C --> E[End]\n  D --> E',
  },
  {
    label: 'Sequence',
    code: 'sequenceDiagram\n  participant A as Client\n  participant B as Server\n  A->>B: Request\n  B-->>A: Response',
  },
  {
    label: 'Class',
    code: 'classDiagram\n  class Animal {\n    +String name\n    +makeSound()\n  }\n  class Dog {\n    +bark()\n  }\n  Animal <|-- Dog',
  },
  {
    label: 'State',
    code: 'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Processing: Submit\n  Processing --> Success: Complete\n  Processing --> Error: Fail\n  Error --> Idle: Retry\n  Success --> [*]',
  },
];
