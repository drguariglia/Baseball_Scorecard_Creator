(function attachBaseballData(global) {
  "use strict";

  const LEVELS = {
    mlb: [1],
    "all-pro": [1, 11, 12, 13, 14, 16],
    "all-milb": [11, 12, 13, 14, 16],
    "triple-a": [11],
    "double-a": [12],
    "high-a": [13],
    "single-a": [14],
    rookie: [16]
  };

  const MLB_ORIGIN = "https://statsapi.mlb.com";
  const LEGACY_RELAY = "https://baseballscorecardcreator.netlify.app/.netlify/functions/mlb";
  const REQUEST_TIMEOUT_MS = 15000;

  function localDateISO(timeZone = "America/New_York", date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function timeLabel(dateTime) {
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

  function record(team) {
    const candidate = team?.record || team?.leagueRecord;
    if (!candidate || candidate.wins == null || candidate.losses == null) return "";
    return `${candidate.wins}-${candidate.losses}`;
  }

  function normalizeScheduleGame(game, sportId) {
    const away = game?.teams?.away?.team?.name || "Away";
    const home = game?.teams?.home?.team?.name || "Home";
    const status = game?.status?.detailedState || game?.status?.abstractGameState || "Scheduled";
    const venue = game?.venue?.name || "Venue TBA";
    return {
      gamePk: game?.gamePk,
      sportId,
      officialDate: game?.officialDate || "",
      awayTeam: away,
      homeTeam: home,
      status,
      venue,
      dateTime: game?.gameDate || "",
      label: `${away} at ${home} — ${timeLabel(game?.gameDate)} — ${venue} (${status})`
    };
  }

  async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json", ...(options.headers || {}) },
        signal: controller.signal,
        cache: "no-store"
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error("The baseball data service returned an unreadable response.");
      }
      if (payload?.error) throw new Error(payload.detail || payload.error);
      return payload;
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("The baseball data request timed out.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function sameOriginAvailable() {
    return typeof location !== "undefined" && /^https?:$/.test(location.protocol);
  }

  function sameOriginUrl(params) {
    const query = new URLSearchParams(params);
    return `/api/mlb?${query.toString()}`;
  }

  function relayUrl(endpoint) {
    return `${LEGACY_RELAY}?endpoint=${encodeURIComponent(endpoint)}`;
  }

  async function rawMlb(endpoint) {
    const errors = [];
    try {
      return { payload: await fetchJson(relayUrl(endpoint)), source: "online relay" };
    } catch (error) {
      errors.push(error);
    }
    try {
      return { payload: await fetchJson(`${MLB_ORIGIN}${endpoint}`), source: "direct MLB connection" };
    } catch (error) {
      errors.push(error);
    }
    const message = errors.map(error => error?.message).filter(Boolean).join("; ");
    throw new Error(message || "Unable to reach the baseball data service.");
  }

  async function scheduleViaFallback(date, level) {
    const sports = LEVELS[level] || LEVELS.mlb;
    const settled = await Promise.allSettled(sports.map(async sportId => {
      const endpoint = `/api/v1/schedule?sportId=${sportId}&startDate=${encodeURIComponent(date)}&endDate=${encodeURIComponent(date)}&hydrate=team,venue,probablePitcher`;
      const result = await rawMlb(endpoint);
      const games = (result.payload?.dates || [])
        .flatMap(day => day?.games || [])
        .map(game => normalizeScheduleGame(game, sportId));
      return { games, source: result.source };
    }));

    const successful = settled.filter(result => result.status === "fulfilled").map(result => result.value);
    if (!successful.length) {
      const reasons = settled
        .filter(result => result.status === "rejected")
        .map(result => result.reason?.message)
        .filter(Boolean)
        .join("; ");
      throw new Error(reasons || "No schedule source responded.");
    }

    const games = successful
      .flatMap(result => result.games)
      .filter(game => game.gamePk)
      .sort((a, b) => String(a.dateTime).localeCompare(String(b.dateTime)) || a.awayTeam.localeCompare(b.awayTeam));
    const source = [...new Set(successful.map(result => result.source))].join(" + ");
    return { date, level, games, source };
  }

  async function getSchedule(date, level = "mlb") {
    const errors = [];
    if (sameOriginAvailable()) {
      try {
        const payload = await fetchJson(sameOriginUrl({ action: "schedule", date, level }));
        if (!Array.isArray(payload?.games)) throw new Error("The app service returned an incomplete schedule.");
        return { ...payload, source: payload.source || "app data service" };
      } catch (error) {
        errors.push(error);
      }
    }

    try {
      return await scheduleViaFallback(date, level);
    } catch (error) {
      errors.push(error);
    }

    const message = errors.map(error => error?.message).filter(Boolean).join("; ");
    throw new Error(message || "The online baseball schedule is unavailable.");
  }

  function playerFromBox(boxTeam, id) {
    return boxTeam?.players?.[`ID${id}`] || null;
  }

  function battingLineup(boxTeam) {
    const order = Array.isArray(boxTeam?.battingOrder) ? boxTeam.battingOrder : [];
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

  function probablePitcher(game, side) {
    const pitcher = game?.teams?.[side]?.probablePitcher;
    if (!pitcher?.fullName) return null;
    return { num: "", name: pitcher.fullName, throws: "", record: "", era: "", k: "" };
  }

  function pitcherList(boxTeam, scheduleGame, side) {
    const ids = Array.isArray(boxTeam?.pitchers) ? boxTeam.pitchers : [];
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

  function officialLabel(official) {
    const type = official?.officialType || "Official";
    const abbreviations = {
      "Home Plate": "HP",
      "First Base": "1B",
      "Second Base": "2B",
      "Third Base": "3B",
      "Left Field": "LF",
      "Right Field": "RF"
    };
    return `${abbreviations[type] || type}: ${official?.official?.fullName || "TBA"}`;
  }

  function broadcastLists(schedulePayload) {
    const game = schedulePayload?.dates?.[0]?.games?.[0] || {};
    const broadcasts = Array.isArray(game.broadcasts) ? game.broadcasts : [];
    const tv = broadcasts.filter(item => item?.type === "TV").map(item => item.name).filter(Boolean);
    const radio = broadcasts.filter(item => item?.type === "Radio").map(item => item.name).filter(Boolean);
    return { tv: [...new Set(tv)].join(" / "), radio: [...new Set(radio)].join(" / ") };
  }

  function buildGameData(feed, schedulePayload) {
    const gameData = feed?.gameData || {};
    const box = feed?.liveData?.boxscore || {};
    const scheduleGame = schedulePayload?.dates?.[0]?.games?.[0] || {};
    const awayTeam = gameData?.teams?.away || scheduleGame?.teams?.away?.team || {};
    const homeTeam = gameData?.teams?.home || scheduleGame?.teams?.home?.team || {};
    const weather = gameData?.weather || {};
    const broadcasts = broadcastLists(schedulePayload);
    const weatherParts = [
      weather.temp != null ? `${weather.temp}°F` : "",
      weather.condition || "",
      weather.wind || ""
    ].filter(Boolean);
    const officialDate = gameData?.datetime?.officialDate || scheduleGame?.officialDate || schedulePayload?.dates?.[0]?.date || "";
    const dateTime = gameData?.datetime?.dateTime || scheduleGame?.gameDate || "";

    return {
      awayTeam: awayTeam?.name || scheduleGame?.teams?.away?.team?.name || "",
      homeTeam: homeTeam?.name || scheduleGame?.teams?.home?.team?.name || "",
      awayRecord: record(awayTeam) || record(scheduleGame?.teams?.away),
      homeRecord: record(homeTeam) || record(scheduleGame?.teams?.home),
      gameDate: officialDate,
      gameTime: timeLabel(dateTime),
      venue: gameData?.venue?.name || scheduleGame?.venue?.name || "",
      gameNumber: "",
      weather: weatherParts.join(", "),
      umpires: (box?.officials || []).map(officialLabel).join("; "),
      broadcast: broadcasts.tv,
      radio: broadcasts.radio,
      gameNotes: "",
      away: {
        lineup: battingLineup(box?.teams?.away),
        pitchers: pitcherList(box?.teams?.away, scheduleGame, "away")
      },
      home: {
        lineup: battingLineup(box?.teams?.home),
        pitchers: pitcherList(box?.teams?.home, scheduleGame, "home")
      }
    };
  }

  async function gameViaFallback(gamePk) {
    const [feedResult, scheduleResult] = await Promise.all([
      rawMlb(`/api/v1.1/game/${encodeURIComponent(gamePk)}/feed/live`),
      rawMlb(`/api/v1/schedule?gamePk=${encodeURIComponent(gamePk)}&hydrate=broadcasts(all),team,venue,probablePitcher`)
    ]);
    return {
      gamePk,
      data: buildGameData(feedResult.payload, scheduleResult.payload),
      status: feedResult.payload?.gameData?.status?.detailedState || "",
      source: [...new Set([feedResult.source, scheduleResult.source])].join(" + ")
    };
  }

  async function getGame(gamePk) {
    const errors = [];
    if (sameOriginAvailable()) {
      try {
        const payload = await fetchJson(sameOriginUrl({ action: "game", gamePk }));
        if (!payload?.data) throw new Error("The app service returned incomplete game information.");
        return { ...payload, source: payload.source || "app data service" };
      } catch (error) {
        errors.push(error);
      }
    }

    try {
      return await gameViaFallback(gamePk);
    } catch (error) {
      errors.push(error);
    }

    const message = errors.map(error => error?.message).filter(Boolean).join("; ");
    throw new Error(message || "The selected game could not be loaded.");
  }

  const api = {
    LEVELS,
    localDateISO,
    timeLabel,
    normalizeScheduleGame,
    buildGameData,
    getSchedule,
    getGame
  };

  global.BaseballData = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
