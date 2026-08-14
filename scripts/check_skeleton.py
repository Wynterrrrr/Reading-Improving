#!/usr/bin/env python3
"""Validate the documentation-only LReading project skeleton.

This script intentionally has no third-party dependencies and never mutates
project files. It is the LR-CHECK-00 proof that the repository contains a
reviewable plan rather than hidden implementation.

After LR-PHASE-01, pass --allow-toolchain so package/config/source shell files
are permitted. The phase/check pairing and required-document checks remain on.
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

REQUIRED_FILES = (
    "README.md",
    "AGENTS.md",
    "docs/CONSTRUCTION_PLAN.md",
    "docs/ARCHITECTURE.md",
    "docs/contracts/README.md",
    "docs/quality/ACCEPTANCE.md",
    "docs/STATUS.md",
    "src/README.md",
    "tests/README.md",
    "fixtures/README.md",
    "scripts/README.md",
)

PHASE_PATTERN = re.compile(r"(?m)^#\s+LR-PHASE-(\d{2})[：:]")
CHECK_PATTERN = re.compile(r"(?m)^##\s+LR-CHECK-(\d{2})\s*$")
ANCHOR_PATTERN = re.compile(r"<!--\s*(LR-(?:ANCHOR|DECISION|RISK|CONTRACT):[A-Z0-9_-]+)\s*-->")

# These files are allowed only once the user authorizes LR-PHASE-01.
TOOLCHAIN_FILES = {
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "esbuild.config.mjs",
    "vitest.config.mjs",
    "eslint.config.mjs",
    "manifest.json",
    "versions.json",
    "styles.css",
}

SOURCE_SUFFIXES = {".ts", ".js", ".mjs", ".cjs"}
ALLOWED_SCRIPT = Path("scripts/check_skeleton.py")
SKIP_PARTS = {".git", "node_modules", "coverage", ".vitest", "dist", "build"}


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def project_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or any(part in SKIP_PARTS for part in path.parts):
            continue
        files.append(path)
    return sorted(files)


def duplicate_values(values: list[str]) -> list[str]:
    return sorted(value for value, count in Counter(values).items() if count > 1)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--allow-toolchain",
        action="store_true",
        help="Allow LR-PHASE-01 toolchain/config/source files.",
    )
    args = parser.parse_args()

    errors: list[str] = []
    for relative in REQUIRED_FILES:
        if not (ROOT / relative).is_file():
            fail(errors, f"missing required file: {relative}")

    plan_path = ROOT / "docs/CONSTRUCTION_PLAN.md"
    if plan_path.is_file():
        plan = plan_path.read_text(encoding="utf-8")
        phases = PHASE_PATTERN.findall(plan)
        checks = CHECK_PATTERN.findall(plan)
        expected = [f"{number:02d}" for number in range(12)]

        if phases != expected:
            fail(errors, f"phase headings must be exactly {expected}; got {phases}")
        if checks != expected:
            fail(errors, f"check headings must be exactly {expected}; got {checks}")

        duplicated_phases = duplicate_values(phases)
        duplicated_checks = duplicate_values(checks)
        if duplicated_phases:
            fail(errors, f"duplicate phase headings: {duplicated_phases}")
        if duplicated_checks:
            fail(errors, f"duplicate check headings: {duplicated_checks}")

    anchor_values: list[str] = []
    for path in project_files():
        if path.suffix == ".md":
            anchor_values.extend(ANCHOR_PATTERN.findall(path.read_text(encoding="utf-8")))
    duplicate_anchors = duplicate_values(anchor_values)
    if duplicate_anchors:
        fail(errors, f"duplicate stable anchor definitions: {duplicate_anchors}")

    prohibited: list[str] = []
    for path in project_files():
        relative = path.relative_to(ROOT)
        relative_text = relative.as_posix()
        if relative in {ALLOWED_SCRIPT, Path("scripts/README.md")}:
            continue
        if not args.allow_toolchain and relative_text in TOOLCHAIN_FILES:
            prohibited.append(relative_text)
        if not args.allow_toolchain and path.suffix in SOURCE_SUFFIXES:
            prohibited.append(relative_text)
    if prohibited:
        fail(errors, "implementation/toolchain files present before PHASE-01: " + ", ".join(sorted(prohibited)))

    # Historical/negative references to 数据摘要.md are allowed because the
    # design explicitly records its removal. The real safeguard is structural:
    # no such artifact may exist in the repository or planned output layout.
    data_summary_artifacts = [
        str(path.relative_to(ROOT))
        for path in project_files()
        if path.name == "数据摘要.md"
    ]
    if data_summary_artifacts:
        fail(errors, "forbidden data-summary artifact exists: " + ", ".join(data_summary_artifacts))

    if errors:
        print("LR-CHECK-00 FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("LR-CHECK-00 PASSED")
    print(f"- root: {ROOT}")
    print("- required documents: 11/11")
    print("- phase/check pairs: 12/12 (00..11)")
    print(f"- stable anchors: {len(anchor_values)} unique")
    print(f"- toolchain allowed: {args.allow_toolchain}")
    print("- no implementation/toolchain files outside skeleton allowlist")
    print("- no planned 数据摘要.md artifact")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
