#!/usr/bin/env python3
"""Live evidence-score gates. Always re-run the scorer; never read a decision file."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Mapping

sys.stdout.reconfigure(encoding="utf-8", newline="\n")
sys.stderr.reconfigure(encoding="utf-8", newline="\n")

REPO = Path(__file__).resolve().parents[2]
APPROVALS = REPO / ".test-artifacts" / "approvals"
SCORER = [
    "npx",
    "tsx",
    "scripts/score-evidence.ts",
    "--verify-only",
    ".test-artifacts/evidence/current.json",
]

GH_PR_CREATE = re.compile(r"\bgh(?:\.exe)?\s+pr\s+create\b", re.IGNORECASE)
PAGES_PATH = re.compile(r"(?:^|[/\\])pages[/\\]")
APPROVALS_PATH = re.compile(r"(?:^|[/\\])\.test-artifacts[/\\]approvals(?:[/\\]|$)")
CREATE_ISSUE = re.compile(r"(?:^|/)createJiraIssue$")


def allow() -> None:
    json.dump({"permission": "allow"}, sys.stdout)
    sys.stdout.write("\n")
    sys.stdout.flush()
    sys.exit(0)


def deny(message: str) -> None:
    json.dump(
        {
            "permission": "deny",
            "user_message": message,
            "agent_message": message,
        },
        sys.stdout,
    )
    sys.stdout.write("\n")
    sys.stdout.flush()
    print(message, file=sys.stderr)
    sys.exit(2)


def extract_json(text: str) -> object | None:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        return None
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None


def load_payload() -> dict:
    raw_bytes = sys.stdin.buffer.read()
    raw = raw_bytes.decode("utf-8", errors="replace").lstrip("\ufeff")
    parsed = extract_json(raw)
    if parsed is None and raw.strip():
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            preview = raw[:180].replace("\n", " ")
            deny(
                f"Blocked: score-gate received invalid JSON ({exc}). "
                f"preview={preview!r} "
                "decision=unavailable score=unavailable rule=unavailable "
                "missing=['hook payload'] contradictions=[]."
            )
    if not isinstance(parsed, dict):
        deny(
            "Blocked: score-gate payload is not an object. "
            f"preview={raw[:180]!r} "
            "decision=unavailable score=unavailable rule=unavailable "
            "missing=['hook payload'] contradictions=[]."
        )
    return parsed


def tool_input_map(payload: Mapping[str, object]) -> dict[str, object]:
    raw = payload.get("tool_input")
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str) and raw.strip():
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return {}
        if isinstance(parsed, dict):
            return parsed
    return {}


def write_path(payload: Mapping[str, object]) -> str | None:
    tool_input = tool_input_map(payload)
    for key in ("path", "file_path"):
        value = tool_input.get(key)
        if isinstance(value, str) and value.strip():
            return value
    return None


def git_cwd(payload: Mapping[str, object]) -> Path:
    cwd = payload.get("cwd")
    if isinstance(cwd, str) and cwd.strip():
        return Path(cwd)
    roots = payload.get("workspace_roots")
    if isinstance(roots, list) and roots and isinstance(roots[0], str) and roots[0].strip():
        return Path(roots[0])
    return REPO


def git_branch(cwd: Path) -> str:
    try:
        return subprocess.check_output(
            ["git", "-C", str(cwd), "rev-parse", "--abbrev-ref", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return ""


def run_scorer() -> dict[str, object] | None:
    if os.name == "nt":
        completed = subprocess.run(
            " ".join(SCORER),
            shell=True,
            cwd=str(REPO),
            capture_output=True,
            text=True,
        )
    else:
        completed = subprocess.run(
            SCORER,
            cwd=str(REPO),
            capture_output=True,
            text=True,
        )
    parsed = extract_json(completed.stdout or "")
    if not isinstance(parsed, dict):
        return None
    return parsed


def posix_path(value: str) -> str:
    return value.replace("\\", "/")


def decision_fields(result: Mapping[str, object] | None) -> str:
    if result is None:
        return (
            "decision=unavailable score=unavailable rule=unavailable "
            "missing=['.test-artifacts/evidence/current.json or scorer stdout'] "
            "contradictions=[]"
        )
    return (
        f"decision={result.get('decision')!s} score={result.get('score')!s} "
        f"rule={result.get('rule')!s} side={result.get('side')!s} "
        f"missing={result.get('missing', [])!s} "
        f"contradictions={result.get('contradictions', [])!s}"
    )


def has_human_approval(result: Mapping[str, object]) -> bool:
    decision_id = result.get("decisionId")
    if not isinstance(decision_id, str) or not decision_id:
        return False
    return (APPROVALS / f"{decision_id}.json").is_file()


def require_decision(result: Mapping[str, object] | None, allow_side: str, action: str) -> None:
    fields = decision_fields(result)
    if result is None:
        deny(
            f"Blocked: {action} requires a live evidence score. {fields}. "
            "Re-run npx tsx scripts/score-evidence.ts --verify-only "
            ".test-artifacts/evidence/current.json; do not trust a saved decision file."
        )
        return
    decision = result.get("decision")
    side = result.get("side")
    if decision == "act" and side == allow_side:
        allow()
    if decision == "escalate" and has_human_approval(result):
        allow()
    extra = "what's missing or contradicting is listed above."
    if decision == "escalate":
        extra = (
            f"escalate requires a human approval file at "
            f".test-artifacts/approvals/{result.get('decisionId')}.json "
            "(created by a human, by hand)."
        )
    elif decision == "act":
        extra = f"act on side {side!s} does not allow {action} (need side {allow_side})."
    elif decision == "inconclusive":
        extra = "inconclusive cannot authorize this action."
    deny(f"Blocked: {action} is not allowed. {fields}. {extra}")


def guard_heal(payload: dict) -> None:
    path = write_path(payload)
    if path is None or PAGES_PATH.search(posix_path(path)) is None:
        allow()
    branch = git_branch(git_cwd(payload))
    if not branch.startswith("heal/"):
        allow()
    require_decision(run_scorer(), "drift", "Write under pages/ on a heal/ branch")


def guard_pr(payload: dict) -> None:
    command = payload.get("command")
    if not isinstance(command, str) or GH_PR_CREATE.search(command) is None:
        allow()
    branch = git_branch(git_cwd(payload))
    if not branch.startswith("heal/"):
        allow()
    require_decision(run_scorer(), "drift", "gh pr create from a heal/ branch")


def guard_jira(payload: dict) -> None:
    tool_name = payload.get("tool_name")
    name = tool_name if isinstance(tool_name, str) else ""
    if CREATE_ISSUE.search(name) is None:
        allow()
    issue_type = tool_input_map(payload).get("issueType")
    if issue_type != "Bug":
        allow()
    require_decision(run_scorer(), "bug", "Atlassian createJiraIssue with issueType Bug")


def guard_approvals(payload: dict) -> None:
    path = write_path(payload)
    if path is None or APPROVALS_PATH.search(posix_path(path)) is None:
        allow()
    deny(
        "Blocked: agent writes under .test-artifacts/approvals/ are denied. "
        "Approval files are created by a human, by hand. "
        "decision=n/a score=n/a rule=n/a missing=[] contradictions=[]."
    )


HANDLERS = {
    "heal": guard_heal,
    "pr": guard_pr,
    "jira": guard_jira,
    "approvals": guard_approvals,
}


def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] not in HANDLERS:
        deny(
            "Blocked: score-gate usage is score_gate.py heal|pr|jira|approvals. "
            "decision=unavailable score=unavailable rule=unavailable "
            "missing=['mode'] contradictions=[]."
        )
    HANDLERS[sys.argv[1]](load_payload())


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:
        deny(
            "Blocked: score-gate crashed before a live score. "
            f"decision=unavailable score=unavailable rule=unavailable "
            f"missing=[] contradictions=[]. {exc}"
        )
