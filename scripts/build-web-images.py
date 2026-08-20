#!/usr/bin/env python3
"""Build bandwidth-friendly WebP display assets while preserving all originals.

Rules:
- Maps/diagrams/QR/landmarks: lossless WebP (pixel-preserving).
- Campus gallery: 960px max display preview, WebP quality 82.
- Original gallery/map files remain the lightbox/full-resolution source.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT = ASSETS / "optimized"
MAGICK = shutil.which("magick") or "/opt/imagemagick/bin/magick"

LOSSLESS = [
    ASSETS / "syuct-community-icon.png",
    ASSETS / "syuct-mini-qr-poster.png",
    ASSETS / "delivery-pickup-overview.png",
    ASSETS / "delivery-haochijie-layout.png",
    ASSETS / "sports-map.png",
    *sorted(ASSETS.glob("landmark-*.png")),
]
PHOTO_PREVIEWS = [*sorted(ASSETS.glob("gallery-*.jpg")), ASSETS / "hero-campus.jpg"]


def run(args: list[str]) -> None:
    subprocess.run(args, check=True)


def main() -> None:
    if not Path(MAGICK).exists() and not shutil.which("magick"):
        raise SystemExit("ImageMagick 7 is required. On macOS: brew install imagemagick")
    OUT.mkdir(parents=True, exist_ok=True)

    for src in LOSSLESS:
        if not src.exists():
            raise SystemExit(f"Missing source: {src.relative_to(ROOT)}")
        dest = OUT / f"{src.stem}.webp"
        run([MAGICK, str(src), "-define", "webp:lossless=true", "-define", "webp:method=6", str(dest)])
        print(f"lossless  {src.name} -> {dest.relative_to(ROOT)}")

    for src in PHOTO_PREVIEWS:
        if not src.exists():
            raise SystemExit(f"Missing source: {src.relative_to(ROOT)}")
        dest = OUT / f"{src.stem}-preview.webp"
        run([
            MAGICK, str(src), "-resize", "960x960>", "-strip",
            "-quality", "82", "-define", "webp:method=6", str(dest)
        ])
        print(f"preview   {src.name} -> {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
