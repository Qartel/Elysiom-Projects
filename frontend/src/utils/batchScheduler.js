// frontend/src/utils/batchScheduler.js

/**
 * SocialFlow Batch Parser + Scheduler (pure JS)
 *
 * Goal:
 * - Parse filenames like: 001_instagram_post_launch.mp4
 * - Extract: order, platform(s), type, label, ext
 * - Build "candidates" (draft posts) grouped by order (1 = post #1)
 * - Optionally schedule into weekly cadence with spillover
 *
 * Best practice:
 * - All items land in Draft by default
 * - Scheduling is a separate action (modal "Schedule all?")
 */

// Allowed tokens (extend anytime)
export const PLATFORM_ALIASES = {
  insta: "instagram",
  instagram: "instagram",
  ig: "instagram",

  fb: "facebook",
  facebook: "facebook",

  tiktok: "tiktok",
  tt: "tiktok",

  yt: "youtube",
  youtube: "youtube",

  li: "linkedin",
  linkedin: "linkedin",

  threads: "threads",
};

export const TYPE_ALIASES = {
  post: "post",
  reel: "reel",
  story: "story",
  carousel: "carousel",
  short: "short",
  shorts: "short",
  video: "video",
  image: "image",
};

export function normalizePlatform(raw) {
  const key = String(raw || "").toLowerCase().trim();
  return PLATFORM_ALIASES[key] || key || null;
}

export function normalizeType(raw) {
  const key = String(raw || "").toLowerCase().trim();
  return TYPE_ALIASES[key] || key || null;
}

export function stripExt(filename) {
  return String(filename || "").replace(/\.[^/.]+$/, "");
}

export function getExt(filename) {
  const m = String(filename || "").match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "";
}

export function isMediaExt(ext) {
  const e = String(ext || "").toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "m4v", "webm"].includes(e);
}

/**
 * Split base filename into tokens using:
 * - underscore, hyphen, whitespace
 * Example:
 *   "001_instagram_post_launch" -> ["001","instagram","post","launch"]
 *   "1-insta-post" -> ["1","insta","post"]
 */
export function splitTokens(baseName) {
  return String(baseName || "")
    .split(/[_\-\s]+/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Parse platform token that may contain:
 * - single: insta
 * - multi: insta+fb
 * Returns array of normalized platforms (unique)
 */
export function parsePlatformsToken(rawToken) {
  const token = String(rawToken || "").trim();
  if (!token) return [];

  const parts = token
    .split("+")
    .map((x) => x.trim())
    .filter(Boolean);

  const platforms = parts
    .map(normalizePlatform)
    .filter(Boolean);

  return Array.from(new Set(platforms));
}

/**
 * Parse formats:
 *  - 001_instagram_post_launch.mp4
 *  - 1_insta_reel.mp4
 *  - 12_fb_reel_teaser.mov
 *  - 4_linkedin_post.png
 *  - 1-insta-post-launch.mp4
 *  - 1_insta+fb_post_launch.mp4
 *
 * Returns:
 *  {
 *    ok: boolean,
 *    order: number|null,
 *    platforms: string[],   // <— NEW (supports multi)
 *    platform: string|null, // <— kept for backwards compatibility (first platform)
 *    type: string|null,
 *    label: string,
 *    ext: string,
 *    issues: string[],
 *    rawName: string
 *  }
 */
export function parseFilename(name, opts = {}) {
  const allowUnknownPlatform = opts.allowUnknownPlatform ?? false;
  const allowUnknownType = opts.allowUnknownType ?? true;

  const rawName = String(name || "");
  const ext = getExt(rawName);
  const base = stripExt(rawName);

  const issues = [];
  if (!ext) issues.push("Missing file extension");
  if (ext && !isMediaExt(ext)) issues.push(`Unsupported file type: .${ext}`);

  const parts = splitTokens(base);

  // Minimum: order + platform + type
  if (parts.length < 3) {
    issues.push("Filename must be <order>_<platform>_<type>_<optionalLabel>.<ext>");
    return {
      ok: false,
      order: null,
      platforms: [],
      platform: null,
      type: null,
      label: "",
      ext,
      issues,
      rawName,
    };
  }

  const orderRaw = parts[0];
  const platformRaw = parts[1];
  const typeRaw = parts[2];
  const label = parts.slice(3).join("_");

  const order = Number.parseInt(orderRaw, 10);
  if (!Number.isFinite(order) || order <= 0) issues.push(`Invalid order: "${orderRaw}"`);

  const platforms = parsePlatformsToken(platformRaw);

  // Strict platform check (per platform in list)
  if (!platforms.length) {
    issues.push(`Invalid platform: "${platformRaw}"`);
  } else if (!allowUnknownPlatform) {
    const known = new Set(Object.values(PLATFORM_ALIASES));
    const unknowns = platforms.filter((p) => !known.has(p));
    if (unknowns.length) {
      issues.push(`Unknown platform(s): "${unknowns.join(", ")}"`);
    }
  }

  const type = normalizeType(typeRaw);
  if (!type && !allowUnknownType) issues.push(`Invalid type: "${typeRaw}"`);

  return {
    ok: issues.length === 0,
    order: Number.isFinite(order) ? order : null,
    platforms,
    platform: platforms[0] || null, // backward compatible
    type: type || null,
    label,
    ext,
    issues,
    rawName,
  };
}

/**
 * Turn a list of files/zip entries into "candidates" grouped by order.
 *
 * Input items may be:
 * - File (browser) with {name,type,size}
 * - JSZip entry with {name} (and maybe {dir})
 *
 * Returns:
 * {
 *   candidates: [ ... ],
 *   invalid: [ ... ],
 *   unsorted: [ ... ] // optional if enabled
 * }
 */
export function buildCandidatesFromList(fileList, opts = {}) {
  const allowUnsorted = opts.allowUnsorted ?? false;

  const items = Array.from(fileList || [])
    .map((x) => {
      // JSZip entries sometimes have .dir true
      if (x && typeof x === "object" && x.dir) return null;
      return x;
    })
    .filter(Boolean);

  const byOrder = new Map();
  const invalid = [];
  const unsorted = [];

  for (const f of items) {
    const name = f?.name || "";
    const parsed = parseFilename(name, opts);

    // If it parsed but no order: treat as unsorted (optional)
    if (parsed.ok && !parsed.order) {
      if (allowUnsorted) unsorted.push({ f, parsed });
      else invalid.push({ name, issues: ["Missing/invalid order prefix"] });
      continue;
    }

    if (!parsed.ok || !parsed.order) {
      // if allowUnsorted and it ONLY failed due to format (no order/platform/type),
      // we still treat it as invalid (better UX).
      invalid.push({ name, issues: parsed.issues });
      continue;
    }

    const key = parsed.order;
    if (!byOrder.has(key)) {
      byOrder.set(key, {
        order: key,
        items: [],
        issues: [],
        platforms: new Set(),
        types: new Set(),
      });
    }

    const bucket = byOrder.get(key);

    // store one item per file
    bucket.items.push({
      name: parsed.rawName,
      ext: parsed.ext,
      platforms: parsed.platforms,     // <— NEW
      platform: parsed.platform,       // kept
      type: parsed.type,
      label: parsed.label,
      size: typeof f?.size === "number" ? f.size : null,
      mime: f?.type || null,
    });

    // add all platforms
    for (const p of parsed.platforms) bucket.platforms.add(p);
    if (parsed.type) bucket.types.add(parsed.type);
  }

  const candidates = Array.from(byOrder.values())
    .sort((a, b) => a.order - b.order)
    .map((g) => {
      const platformsArr = Array.from(g.platforms);
      const typesArr = Array.from(g.types);
      const title = `${String(g.order).padStart(3, "0")} • ${platformsArr.join(", ")} • ${typesArr.join(", ")}`;

      return {
        id: `cand-${g.order}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        order: g.order,
        title,
        items: g.items,               // each item now has platforms[]
        platforms: platformsArr,       // UI defaults
        types: typesArr,
        issues: g.issues,
        status: "draft",
        caption: "",
        scheduledAt: null,
      };
    });

  // Optional: convert unsorted into their own candidates at end
  const unsortedCandidates = allowUnsorted
    ? unsorted.map((u, idx) => ({
        id: `cand-unsorted-${Date.now()}-${idx}-${Math.random().toString(16).slice(2)}`,
        order: null,
        title: `Unsorted • ${u.parsed.platforms.join(", ") || "unknown"} • ${u.parsed.type || "unknown"}`,
        items: [
          {
            name: u.parsed.rawName,
            ext: u.parsed.ext,
            platforms: u.parsed.platforms,
            platform: u.parsed.platform,
            type: u.parsed.type,
            label: u.parsed.label,
            size: typeof u.f?.size === "number" ? u.f.size : null,
            mime: u.f?.type || null,
          },
        ],
        platforms: u.parsed.platforms || [],
        types: u.parsed.type ? [u.parsed.type] : [],
        issues: ["Unsorted (no order prefix)"],
        status: "draft",
        caption: "",
        scheduledAt: null,
      }))
    : [];

  return { candidates: [...candidates, ...unsortedCandidates], invalid, unsorted: unsortedCandidates };
}

/**
 * Scheduling engine with spillover.
 *
 * Policy:
 * - timezone is handled by using local Date arithmetic by default
 * - schedules into weekly slots (daysOfWeek + timesOfDay)
 * - spills into following weeks when candidate count exceeds weekly capacity
 *
 * daysOfWeek: array of 0-6 (0=Sun .. 6=Sat)
 * timesOfDay: array of "HH:MM" local time strings
 *
 * Example:
 * daysOfWeek: [1,3,5,0]  // Mon Wed Fri Sun
 * timesOfDay: ["09:00"]  // single daily slot
 * -> 4 posts/week capacity
 */
export function generateScheduleSlots({
  startAt, // Date or ISO string
  weeks = 12,
  daysOfWeek = [1, 3, 5, 0],
  timesOfDay = ["09:00"],
} = {}) {
  const start = startAt ? new Date(startAt) : new Date();
  if (Number.isNaN(start.getTime())) throw new Error("Invalid startAt");

  const slots = [];
  const startWeekAnchor = new Date(start);
  startWeekAnchor.setHours(0, 0, 0, 0);

  const parseHM = (hm) => {
    const [h, m] = String(hm).split(":").map((n) => Number.parseInt(n, 10));
    return { h: Number.isFinite(h) ? h : 9, m: Number.isFinite(m) ? m : 0 };
  };

  for (let w = 0; w < weeks; w++) {
    for (const dow of daysOfWeek) {
      for (const hm of timesOfDay) {
        const { h, m } = parseHM(hm);

        const d = new Date(startWeekAnchor);
        d.setDate(d.getDate() + w * 7);

        const currentDow = d.getDay();
        const delta = (dow - currentDow + 7) % 7;
        d.setDate(d.getDate() + delta);

        d.setHours(h, m, 0, 0);

        if (d.getTime() >= start.getTime()) {
          slots.push(d);
        }
      }
    }
  }

  slots.sort((a, b) => a.getTime() - b.getTime());
  return slots;
}

/**
 * Assign schedule slots to candidates in order, with spillover.
 *
 * Returns updated candidates array (new objects).
 *
 * NOTE:
 * - This is your "Schedule All" action.
 * - Import stays Draft; this sets status="scheduled".
 */
export function scheduleCandidates(candidates, policy) {
  const list = Array.from(candidates || [])
    .slice()
    .filter((c) => c && (c.order == null || Number.isFinite(c.order)))
    .sort((a, b) => {
      if (a.order == null && b.order == null) return 0;
      if (a.order == null) return 1;
      if (b.order == null) return -1;
      return a.order - b.order;
    });

  const days = policy?.daysOfWeek?.length || 4;
  const times = policy?.timesOfDay?.length || 1;
  const capacityPerWeek = Math.max(1, days * times);
  const weeksNeeded = Math.ceil(list.length / capacityPerWeek) + 2;

  const slots = generateScheduleSlots({
    startAt: policy?.startAt,
    weeks: policy?.weeks ?? weeksNeeded,
    daysOfWeek: policy?.daysOfWeek ?? [1, 3, 5, 0],
    timesOfDay: policy?.timesOfDay ?? ["09:00"],
  });

  if (slots.length < list.length) {
    throw new Error("Not enough schedule slots generated. Increase weeks/days/times.");
  }

  return list.map((c, idx) => ({
    ...c,
    scheduledAt: slots[idx].toISOString(),
    status: "scheduled",
  }));
}
