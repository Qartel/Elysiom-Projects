# backend/app/utils/batch_parser.py
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import re

PLATFORM_ALIASES: Dict[str, str] = {
    "insta": "instagram",
    "instagram": "instagram",
    "ig": "instagram",
    "fb": "facebook",
    "facebook": "facebook",
    "tiktok": "tiktok",
    "tt": "tiktok",
    "yt": "youtube",
    "youtube": "youtube",
    "li": "linkedin",
    "linkedin": "linkedin",
    "threads": "threads",
}

TYPE_ALIASES: Dict[str, str] = {
    "post": "post",
    "reel": "reel",
    "story": "story",
    "carousel": "carousel",
    "short": "short",
    "shorts": "short",
    "video": "video",
    "image": "image",
}

MEDIA_EXTS = {"jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "m4v", "webm"}

def normalize_platform(raw: str) -> Optional[str]:
    key = (raw or "").strip().lower()
    return PLATFORM_ALIASES.get(key) or (key or None)

def normalize_type(raw: str) -> Optional[str]:
    key = (raw or "").strip().lower()
    return TYPE_ALIASES.get(key) or (key or None)

def get_ext(filename: str) -> str:
    m = re.search(r"\.([a-z0-9]+)$", filename or "", re.IGNORECASE)
    return m.group(1).lower() if m else ""

def strip_ext(filename: str) -> str:
    return re.sub(r"\.[^/.]+$", "", filename or "")

@dataclass
class ParsedName:
    ok: bool
    order: Optional[int]
    platform: Optional[str]
    type: Optional[str]
    label: str
    ext: str
    issues: List[str]
    rawName: str

def parse_filename(name: str, allow_unknown_platform: bool = False, allow_unknown_type: bool = True) -> ParsedName:
    raw_name = name or ""
    ext = get_ext(raw_name)
    base = strip_ext(raw_name)

    issues: List[str] = []
    if not ext:
        issues.append("Missing file extension")
    if ext and ext not in MEDIA_EXTS:
        issues.append(f"Unsupported file type: .{ext}")

    parts = [p.strip() for p in base.split("_") if p.strip()]

    if len(parts) < 3:
        issues.append("Filename must be <order>_<platform>_<type>_<optionalLabel>.<ext>")
        return ParsedName(False, None, None, None, "", ext, issues, raw_name)

    order_raw, platform_raw, type_raw = parts[0], parts[1], parts[2]
    label = "_".join(parts[3:]) if len(parts) > 3 else ""

    try:
        order = int(order_raw, 10)
        if order <= 0:
            issues.append(f'Invalid order: "{order_raw}"')
            order = None
    except Exception:
        issues.append(f'Invalid order: "{order_raw}"')
        order = None

    platform = normalize_platform(platform_raw)
    if not platform:
        issues.append(f'Invalid platform: "{platform_raw}"')
    elif (not allow_unknown_platform) and (platform not in set(PLATFORM_ALIASES.values())):
        issues.append(f'Unknown platform: "{platform_raw}"')

    ctype = normalize_type(type_raw)
    if not ctype and (not allow_unknown_type):
        issues.append(f'Invalid type: "{type_raw}"')

    ok = len(issues) == 0
    return ParsedName(ok, order, platform, ctype, label, ext, issues, raw_name)

def build_candidates(entries: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    entries: [{name, size, mime, storedKey, assetId}]
    groups by parsed.order
    returns (candidates, invalid)
    """
    by_order: Dict[int, Dict[str, Any]] = {}
    invalid: List[Dict[str, Any]] = []

    for e in entries:
        name = e.get("name", "")
        parsed = parse_filename(name)

        if (not parsed.ok) or (not parsed.order):
            invalid.append({"name": name, "issues": parsed.issues})
            continue

        o = parsed.order
        if o not in by_order:
            by_order[o] = {
                "order": o,
                "items": [],
                "platforms": set(),
                "types": set(),
                "issues": [],
            }

        bucket = by_order[o]
        bucket["items"].append({
            "assetId": e.get("assetId"),
            "name": parsed.rawName,
            "ext": parsed.ext,
            "platform": parsed.platform,
            "type": parsed.type,
            "label": parsed.label,
            "size": e.get("size") or 0,
            "mime": e.get("mime"),
            "storedKey": e.get("storedKey"),
        })

        if parsed.platform:
            bucket["platforms"].add(parsed.platform)
        if parsed.type:
            bucket["types"].add(parsed.type)

    candidates: List[Dict[str, Any]] = []
    for o in sorted(by_order.keys()):
        g = by_order[o]
        platforms = sorted(list(g["platforms"]))
        types = sorted(list(g["types"]))
        title = f'{str(o).zfill(3)} • {", ".join(platforms)} • {", ".join(types)}'

        candidates.append({
            "order": o,
            "title": title,
            "caption": "",
            "platforms": platforms,
            "types": types,
            "assetIds": [x["assetId"] for x in g["items"] if x.get("assetId")],
            "issues": g["issues"],
            "status": "draft",
            "scheduledAt": None,
        })

    return candidates, invalid

def _parse_hm(hm: str) -> Tuple[int, int]:
    parts = (hm or "09:00").split(":")
    h = int(parts[0]) if len(parts) > 0 and parts[0].isdigit() else 9
    m = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    return h, m

def generate_schedule_slots(
    *,
    start_at_iso: Optional[str],
    weeks: int,
    days_of_week: List[int],
    times_of_day: List[str],
) -> List[datetime]:
    start = datetime.fromisoformat(start_at_iso) if start_at_iso else datetime.utcnow()
    start = start.replace(second=0, microsecond=0)

    # anchor (midnight of start day)
    anchor = start.replace(hour=0, minute=0, second=0, microsecond=0)

    slots: List[datetime] = []
    for w in range(weeks):
        week_anchor = anchor + timedelta(days=w * 7)
        week_anchor_dow = week_anchor.weekday()  # Mon=0..Sun=6

        for dow in days_of_week:
            # Convert JS-style 0=Sun..6=Sat into Python weekday Mon=0..Sun=6
            # JS: 0 Sun,1 Mon,2 Tue,3 Wed,4 Thu,5 Fri,6 Sat
            # Python weekday: 0 Mon..6 Sun
            target_py = 6 if dow == 0 else dow - 1

            delta = (target_py - week_anchor_dow) % 7
            day = week_anchor + timedelta(days=delta)

            for hm in times_of_day:
                h, m = _parse_hm(hm)
                dt = day.replace(hour=h, minute=m, second=0, microsecond=0)
                if dt >= start:
                    slots.append(dt)

    slots.sort()
    return slots

def schedule_candidates(
    candidates: List[Dict[str, Any]],
    *,
    start_at_iso: Optional[str] = None,
    days_of_week: Optional[List[int]] = None,
    times_of_day: Optional[List[str]] = None,
    weeks: Optional[int] = None,
) -> List[Dict[str, Any]]:
    days = days_of_week or [1, 3, 5, 0]
    times = times_of_day or ["09:00"]

    capacity_per_week = max(1, len(days) * len(times))
    weeks_needed = (len(candidates) // capacity_per_week) + 3
    w = weeks or weeks_needed

    slots = generate_schedule_slots(
        start_at_iso=start_at_iso,
        weeks=w,
        days_of_week=days,
        times_of_day=times,
    )

    if len(slots) < len(candidates):
        raise ValueError("Not enough schedule slots generated. Increase weeks/days/times.")

    ordered = sorted(candidates, key=lambda x: int(x.get("order") or 0))
    out: List[Dict[str, Any]] = []
    for idx, c in enumerate(ordered):
        d = slots[idx]
        out.append({**c, "scheduledAt": d.isoformat(), "status": "scheduled"})
    return out
