# Workflow and agents

Status: working agreements and role descriptions; not a configuration of running agents.

## Proposed roles

| Role | Responsibility | Deliverable |
| --- | --- | --- |
| Lead / integrator | Scope, contracts, work sequence, documentation and code integration | A coherent, verified change |
| Audio/DSP | Microphone, detector, measurements, and limitations | Audio implementation and measurement report |
| Application / UX | Interface, permissions, session states | A working user flow |
| Reviewer | Independent assessment of correctness and documentation consistency | Findings with rationale and testing gaps |

Start with a lead agent; assign a specialist to a concrete audio problem and a reviewer to a completed change when useful. Each author updates documentation for their area. A separate documentation agent does not replace that responsibility.

AGENTS.md contains repository instructions; it does not automatically create a team. Subagents handle bounded tasks; persistent separate Codex tasks can be organized by area. Work in a shared directory requires non-overlapping edit scopes; use Git worktrees for independent branches once the repository exists.

## Assigning work

Each assignment should specify the goal, input documents, permitted change scope, contract, acceptance criteria, and expected report. Avoid parallel edits to the same file. The integrator is responsible for reviewing the combined result.

Example initial assignment:

> Build the experiment described in docs/audio-spike.md. First read AGENTS.md, docs/product.md, and docs/architecture.md. Add a minimal screen and detector tests, and document setup. Do not claim hardware measurements without performing them. Finally, record results and limitations, and provide a recommendation for ADR-0001.

Example explicit delegation:

> Use a subagent to compare pitch detection algorithms and their licenses without editing files. Meanwhile, prepare the prototype UI. After agreeing on the contract, integrate the result and update the documentation.

## Definition of done

1. Behavior meets the documented acceptance criteria.
2. Appropriate tests have been performed; missing hardware tests are explicit.
3. Documentation and setup instructions match the code.
4. Significant decisions have an ADR with status and rationale.
5. The report identifies limitations as well as completed work.

Use English for assignments, implementation, reviews, and documentation. Markdown documentation stays alongside code and should be versioned in Git. Avoid duplicating descriptions across files; link to the document responsible for each topic. Future CI can check links and formatting, but consistency with code requires review.

Sources: [AGENTS.md instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
