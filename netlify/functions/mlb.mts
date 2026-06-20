import type { Config, Context } from "@netlify/functions";

const MLB_ORIGIN = "https://statsapi.mlb.com";
const API = `${MLB_ORIGIN}/api`;
const REQUEST_TIMEOUT_MS = 12000;
const LEVELS: Record<string, number[]> = {
  mlb: [1],
  "all-pro": [1, 11, 12, 13, 14, 16],
  "all-milb": [11, 12, 13, 14, 16],
  "triple-a": [11],
  "double-a": [12],
  "high-a": [13],
  "single-a": [14],
  rookie: [16]
};

function json(body: unknown, status = 200, cacheControl = "public, max-age=60, s-maxage=300") {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": cacheControl }
  });
}

async function getJson(url: string, attempts = 2) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Guariglia-Baseball-Scorecard/15"
        },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`MLB data request failed (${response.status})`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 250 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  if (lastError instanceof Error && lastError.name === "AbortError") {
    throw new Error("MLB data request timed out");
  }
  throw lastError instanceof Error ? lastError : new Error("MLB data request failed");
}

function timeLabel(dateTime?: string) {
  if (!dateTime) return "Time TBA";
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return "Time TBA";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(parsed);
}

function record(team: any) {
  const r = team?.record || team?.leagueRecord;
  if (!r || r.wins == null || r.losses == null) return "";
  return `${r.wins}-${r.losses}`;
}

function normalizeScheduleGame(game: any, sportId: number) {
  const away = game?.teams?.away?.team?.name || "Away";
  const home = game?.teams?.home?.team?.name || "Home";
  const status = game?.status?.detailedState || game?.status?.abstractGameState || "Scheduled";
  const venue = game?.venue?.name || "Venue TBA";
  return {
    gamePk: game.gamePk,
    sportId,
    officialDate: game.officialDate,
    awayTeam: away,
    homeTeam: home,
    status,
    venue,
    dateTime: game.gameDate,
    label: `${away} at ${home} — ${timeLabel(game.gameDate)} — ${venue} (${status})`
  };
}

async function schedule(date: string, level: string) {
  const sports = LEVELS[level] || LEVELS.mlb;
  const settled = await Promise.allSettled(sports.map(async sportId => {
    const url = `${API}/v1/schedule?sportId=${sportId}&startDate=${encodeURIComponent(date)}&endDate=${encodeURIComponent(date)}&hydrate=team,venue,probablePitcher`;
    const payload = await getJson(url);
    const games = (payload.dates || [])
      .flatMap((day: any) => day.games || [])
      .map((game: any) => normalizeScheduleGame(game, sportId));
    return games;
  }));

  const fulfilled = settled.filter((result): result is PromiseFulfilledResult<any[]> => result.status === "fulfilled");
  if (!fulfilled.length) {
    const reasons = settled
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map(result => result.reason instanceof Error ? result.reason.message : String(result.reason))
      .join("; ");
    throw new Error(reasons || "No schedule source responded");
  }

  const games = fulfilled
    .flatMap(result => result.value)
    .filter(game => game.gamePk)
    .sort((a, b) => String(a.dateTime).localeCompare(String(b.dateTime)) || a.awayTeam.localeCompare(b.awayTeam));

  const failedLevels = settled.filter(result => result.status === "rejected").length;
  return { date, level, games, source: "app data service", partial: failedLevels > 0 };
}

function playerFromBox(boxTeam: any, id: number) {
  return boxTeam?.players?.[`ID${id}`] || null;
}

function battingLineup(boxTeam: any) {
  const order: number[] = boxTeam?.battingOrder || [];
  return order.slice(0, 9).map(id => {
    const entry = playerFromBox(boxTeam, id) || {};
    const person = entry.person || {};
    const batting = entry.seasonStats?.batting || {};
    return {
      num: entry.jerseyNumber || "",
      name: person.fullName || "",
      pos: entry.position?.abbreviation || "",
      bats: entry.batSide?.code || "",
      avg: batting.avg || "",
      obp: batting.obp || ""
    };
  });
}

function probablePitcher(game: any, side: "away" | "home") {
  const pitcher = game?.teams?.[side]?.probablePitcher;
  if (!pitcher?.fullName) return null;
  return { num: "", name: pitcher.fullName, throws: "", record: "", era: "", k: "" };
}

function pitcherList(boxTeam: any, scheduleGame: any, side: "away" | "home") {
  const ids: number[] = boxTeam?.pitchers || [];
  const pitchers = ids.slice(0, 6).map(id => {
    const entry = playerFromBox(boxTeam, id) || {};
    const person = entry.person || {};
    const pitching = entry.seasonStats?.pitching || {};
    const hand = entry.pitchHand?.code ? `${entry.pitchHand.code}HP` : "";
    const recordText = pitching.wins != null && pitching.losses != null ? `${pitching.wins}-${pitching.losses}` : "";
    return {
      num: entry.jerseyNumber || "",
      name: person.fullName || "",
      throws: hand,
      record: recordText,
      era: pitching.era || "",
      k: pitching.strikeOuts != null ? String(pitching.strikeOuts) : ""
    };
  });
  if (!pitchers.length) {
    const probable = probablePitcher(scheduleGame, side);
    if (probable) pitchers.push(probable);
  }
  return pitchers;
}

function officialLabel(official: any) {
  const type = official.officialType || "Official";
  const abbreviations: Record<string, string> = {
    "Home Plate": "HP",
    "First Base": "1B",
    "Second Base": "2B",
    "Third Base": "3B",
    "Left Field": "LF",
    "Right Field": "RF"
  };
  return `${abbreviations[type] || type}: ${official.official?.fullName || "TBA"}`;
}

function broadcastLists(schedulePayload: any) {
  const game = schedulePayload?.dates?.[0]?.games?.[0] || {};
  const broadcasts = game.broadcasts || [];
  const tv = broadcasts.filter((item: any) => item.type === "TV").map((item: any) => item.name).filter(Boolean);
  const radio = broadcasts.filter((item: any) => item.type === "Radio").map((item: any) => item.name).filter(Boolean);
  return { tv: [...new Set(tv)].join(" / "), radio: [...new Set(radio)].join(" / ") };
}

async function gameDetails(gamePk: string) {
  const [feed, schedulePayload] = await Promise.all([
    getJson(`${API}/v1.1/game/${encodeURIComponent(gamePk)}/feed/live`),
    getJson(`${API}/v1/schedule?gamePk=${encodeURIComponent(gamePk)}&hydrate=broadcasts(all),team,venue,probablePitcher`)
  ]);
  const gd = feed.gameData || {};
  const box = feed.liveData?.boxscore || {};
  const scheduleGame = schedulePayload?.dates?.[0]?.games?.[0] || {};
  const awayTeam = gd.teams?.away || scheduleGame?.teams?.away?.team || {};
  const homeTeam = gd.teams?.home || scheduleGame?.teams?.home?.team || {};
  const weather = gd.weather || {};
  const broadcasts = broadcastLists(schedulePayload);
  const weatherParts = [weather.temp != null ? `${weather.temp}°F` : "", weather.condition, weather.wind].filter(Boolean);
  const officialDate = gd.datetime?.officialDate || scheduleGame?.officialDate || schedulePayload?.dates?.[0]?.date || "";
  const dateTime = gd.datetime?.dateTime || scheduleGame?.gameDate;
  const data = {
    awayTeam: awayTeam.name || scheduleGame?.teams?.away?.team?.name || "",
    homeTeam: homeTeam.name || scheduleGame?.teams?.home?.team?.name || "",
    awayRecord: record(awayTeam) || record(scheduleGame?.teams?.away),
    homeRecord: record(homeTeam) || record(scheduleGame?.teams?.home),
    gameDate: officialDate,
    gameTime: timeLabel(dateTime),
    venue: gd.venue?.name || scheduleGame?.venue?.name || "",
    gameNumber: "",
    weather: weatherParts.join(", "),
    umpires: (box.officials || []).map(officialLabel).join("; "),
    broadcast: broadcasts.tv,
    radio: broadcasts.radio,
    gameNotes: "",
    away: {
      lineup: battingLineup(box.teams?.away),
      pitchers: pitcherList(box.teams?.away, scheduleGame, "away")
    },
    home: {
      lineup: battingLineup(box.teams?.home),
      pitchers: pitcherList(box.teams?.home, scheduleGame, "home")
    }
  };
  return { gamePk, data, status: gd.status?.detailedState || "", source: "app data service" };
}

async function legacyProxy(endpoint: string) {
  if (!endpoint.startsWith("/api/")) return json({ error: "A valid MLB API endpoint is required." }, 400);
  const target = new URL(endpoint, MLB_ORIGIN);
  if (target.origin !== MLB_ORIGIN || !target.pathname.startsWith("/api/")) {
    return json({ error: "Invalid endpoint" }, 400);
  }
  const payload = await getJson(target.toString());
  return json(payload);
}

export default async (req: Request, _context: Context) => {
  try {
    if (req.method !== "GET") return json({ error: "GET requests only" }, 405, "no-store");
    const url = new URL(req.url);

    const endpoint = url.searchParams.get("endpoint");
    if (endpoint) return await legacyProxy(endpoint);

    const action = url.searchParams.get("action") || "schedule";
    if (action === "health") return json({ ok: true, version: 15, source: "app data service" }, 200, "no-store");
    if (action === "schedule") {
      const date = url.searchParams.get("date");
      if (!date) return json({ error: "A date is required" }, 400, "no-store");
      return json(await schedule(date, url.searchParams.get("level") || "mlb"));
    }
    if (action === "game") {
      const gamePk = url.searchParams.get("gamePk");
      if (!gamePk) return json({ error: "A gamePk is required" }, 400, "no-store");
      return json(await gameDetails(gamePk));
    }
    return json({ error: "Unknown action" }, 400, "no-store");
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Unknown server error" }, 500, "no-store");
  }
};

export const config: Config = { path: "/api/mlb" };
