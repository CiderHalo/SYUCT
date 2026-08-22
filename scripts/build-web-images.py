#!/usr/bin/env python3
"""Build bandwidth-friendly WebP display assets while preserving all originals.

Rules:
- Maps/diagrams/QR/landmarks: lossless WebP (pixel-preserving).
- Campus gallery: 960px max display preview, WebP quality 82.
- Brand icon: 96px WebP quality 88 plus small favicon / apple-touch-icon PNGs.
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
    ASSETS / "syuct-mini-qr-poster.png",
    ASSETS / "delivery-pickup-overview.png",
    ASSETS / "delivery-haochijie-layout.png",
    ASSETS / "sports-map.png",
    *sorted(ASSETS.glob("landmark-*.png")),
]
PHOTO_PREVIEWS = [*sorted(ASSETS.glob("gallery-*.jpg")), ASSETS / "hero-campus.jpg"]

# 品牌图标最大只显示 38px，全站每页都要加载，所以只保留 96px（覆盖 2 倍屏）。
BRAND_ICON = ASSETS / "syuct-community-icon.png"
BRAND_ICON_SIZE = 96
ICON_PNGS = [("favicon-32.png", 32), ("apple-touch-icon.png", 180)]

# 首页主视觉是 CSS 背景图，上面盖着很重的深色渐变，压得比相册更狠也看不出差别。
HERO_BG_SOURCE = ASSETS / "hero-campus.jpg"
HERO_BG_DEST = "hero-campus-bg.webp"
HERO_BG_WIDTH = 1280
HERO_BG_QUALITY = 58


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

    if not BRAND_ICON.exists():
        raise SystemExit(f"Missing source: {BRAND_ICON.relative_to(ROOT)}")
    brand_dest = OUT / f"{BRAND_ICON.stem}.webp"
    run([
        MAGICK, str(BRAND_ICON), "-resize", f"{BRAND_ICON_SIZE}x{BRAND_ICON_SIZE}>", "-strip",
        "-quality", "88", "-define", "webp:method=6", str(brand_dest)
    ])
    print(f"brand     {BRAND_ICON.name} -> {brand_dest.relative_to(ROOT)}")

    for name, size in ICON_PNGS:
        dest = ASSETS / name
        run([MAGICK, str(BRAND_ICON), "-resize", f"{size}x{size}>", "-strip", str(dest)])
        print(f"icon      {BRAND_ICON.name} -> {dest.relative_to(ROOT)}")

    if not HERO_BG_SOURCE.exists():
        raise SystemExit(f"Missing source: {HERO_BG_SOURCE.relative_to(ROOT)}")
    hero_dest = OUT / HERO_BG_DEST
    run([
        MAGICK, str(HERO_BG_SOURCE), "-resize", f"{HERO_BG_WIDTH}x{HERO_BG_WIDTH}>", "-strip",
        "-quality", str(HERO_BG_QUALITY), "-define", "webp:method=6", str(hero_dest)
    ])
    print(f"hero bg   {HERO_BG_SOURCE.name} -> {hero_dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
