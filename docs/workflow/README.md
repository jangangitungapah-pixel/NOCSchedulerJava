# NOCScheduler Workflow Index

Canonical development workflow:

- `WORKFLOW_Generator_CJS_GitHub_Sync_v2.md` — **ACTIVE / CANONICAL**
- `PHASE_CONTROL.md` — active phase ledger
- `WORKFLOW_Chat_GitHub_Full_Automation_v1.md` — historical / superseded by V2

Always read the canonical V2 workflow and `PHASE_CONTROL.md` before implementation or repair.

Current execution model:

```text
GitHub audit
→ downloadable .cjs generator
→ local generator execution
→ git commit + git push
→ npm quality gates
→ user PASS/FAIL
→ GitHub-based repair or next phase
```
