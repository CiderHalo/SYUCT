#!/usr/bin/env python3
"""Build local PDF previews for Office files in docs/ using LibreOffice.

Supported sources: .doc, .docx, .xls, .xlsx
Outputs: docs/previews/<stem>.pdf and assets/office-preview-manifest.json
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PREVIEWS = DOCS / "previews"
MANIFEST = ROOT / "assets" / "office-preview-manifest.json"
SUPPORTED = {".doc", ".docx", ".xls", ".xlsx"}


def find_office() -> str:
    configured = os.environ.get("LIBREOFFICE_BIN")
    candidates = [configured, shutil.which("libreoffice"), shutil.which("soffice")]
    for candidate in candidates:
        if candidate:
            return candidate
    raise SystemExit("LibreOffice 未安装。请安装 LibreOffice，或设置 LIBREOFFICE_BIN。")


def page_count(pdf: Path) -> int | None:
    pdfinfo = shutil.which("pdfinfo")
    if not pdfinfo:
        return None
    try:
        result = subprocess.run(
            [pdfinfo, str(pdf)], check=True, capture_output=True, text=True
        )
        for line in result.stdout.splitlines():
            if line.startswith("Pages:"):
                return int(line.split(":", 1)[1].strip())
    except Exception:
        return None
    return None


def output_name(source: Path, duplicate_stems: set[str]) -> str:
    stem = source.stem
    if stem in duplicate_stems:
        stem = f"{stem}-{source.suffix.lower().lstrip('.')}"
    return f"{stem}.pdf"


def main() -> int:
    office = find_office()
    sources = sorted(
        (path for path in DOCS.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED),
        key=lambda path: path.name.lower(),
    )
    if not sources:
        print("没有找到 Office 文件。")
        return 0

    stem_counts: dict[str, int] = {}
    for source in sources:
        stem_counts[source.stem] = stem_counts.get(source.stem, 0) + 1
    duplicate_stems = {stem for stem, count in stem_counts.items() if count > 1}

    PREVIEWS.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)

    entries: dict[str, dict[str, object]] = {}
    expected_outputs: set[Path] = set()

    with tempfile.TemporaryDirectory(prefix="syuct-office-") as temporary:
        temp_root = Path(temporary)
        output_dir = temp_root / "output"
        profile_dir = temp_root / "profile"
        output_dir.mkdir()
        profile_dir.mkdir()
        profile_uri = profile_dir.resolve().as_uri()

        for index, source in enumerate(sources, start=1):
            name = output_name(source, duplicate_stems)
            expected = output_dir / f"{source.stem}.pdf"
            destination = PREVIEWS / name
            print(f"[{index}/{len(sources)}] 转换 {source.name}")
            result = subprocess.run(
                [
                    office,
                    "--headless",
                    "--nologo",
                    "--nodefault",
                    "--nolockcheck",
                    "--nofirststartwizard",
                    f"-env:UserInstallation={profile_uri}",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    str(output_dir),
                    str(source),
                ],
                capture_output=True,
                text=True,
            )
            if result.stdout.strip():
                print(result.stdout.strip())
            if result.stderr.strip():
                print(result.stderr.strip(), file=sys.stderr)
            if result.returncode != 0 or not expected.exists():
                raise RuntimeError(f"转换失败：{source.name}")

            shutil.move(str(expected), str(destination))
            expected_outputs.add(destination.resolve())
            source_key = source.relative_to(ROOT).as_posix()
            preview_key = destination.relative_to(ROOT).as_posix()
            entry = {
                "preview": preview_key,
                "format": source.suffix.lower().lstrip("."),
                "sourceBytes": source.stat().st_size,
                "previewBytes": destination.stat().st_size,
            }
            pages = page_count(destination)
            if pages is not None:
                entry["pages"] = pages
            entries[source_key] = entry

    for stale in PREVIEWS.glob("*.pdf"):
        if stale.resolve() not in expected_outputs:
            stale.unlink()
            print(f"删除旧预览：{stale.name}")

    manifest = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "generator": "LibreOffice PDF export",
        "supportedSourceFormats": sorted(ext.lstrip(".") for ext in SUPPORTED),
        "entries": entries,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已生成 {len(entries)} 份本地预览。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
