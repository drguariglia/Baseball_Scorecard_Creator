(function () {
  "use strict";

  const MLB_BASE_URL = "https://statsapi.mlb.com";
  const EASTERN_TIME_ZONE = "America/New_York";
  const GAME_CACHE = new Map();

  const SPORT_LEVELS = {
    mlb: { key: "mlb", label: "MLB", shortLabel: "MLB", sportIds: [1] },
    "all-pro": { key: "all-pro", label: "MLB + All MiLB", shortLabel: "MLB and MiLB", sportIds: [1, 11, 12, 13, 14, 16] },
    "all-milb": { key: "all-milb", label: "All MiLB", shortLabel: "MiLB", sportIds: [11, 12, 13, 14, 16] },
    "triple-a": { key: "triple-a", label: "Triple-A", shortLabel: "Triple-A", sportIds: [11] },
    "double-a": { key: "double-a", label: "Double-A", shortLabel: "Double-A", sportIds: [12] },
    "high-a": { key: "high-a", label: "High-A", shortLabel: "High-A", sportIds: [13] },
    "single-a": { key: "single-a", label: "Single-A", shortLabel: "Single-A", sportIds: [14] },
    rookie: { key: "rookie", label: "Rookie", shortLabel: "Rookie", sportIds: [16] }
  };

  const SPORT_NAMES_BY_ID = {
    1: "MLB",
    11: "Triple-A",
    12: "Double-A",
    13: "High-A",
    14: "Single-A",
    16: "Rookie"
  };

  function getLevelConfig(levelKey) {
    return SPORT_LEVELS[levelKey] || SPORT_LEVELS.mlb;
  }

  function sourceNameForSport(sportId) {
    return Number(sportId) === 1 ? "MLB" : `MiLB — ${SPORT_NAMES_BY_ID[sportId] || "Minor League"}`;
  }

  const TEAMS = [
    { id: 108, name: "Los Angeles Angels", abbreviation: "LAA", aliases: ["angels", "la angels", "los angeles angels", "anaheim angels"] },
    { id: 109, name: "Arizona Diamondbacks", abbreviation: "AZ", aliases: ["diamondbacks", "dbacks", "d-backs", "arizona", "arizona diamondbacks"] },
    { id: 110, name: "Baltimore Orioles", abbreviation: "BAL", aliases: ["orioles", "baltimore", "baltimore orioles", "o's"] },
    { id: 111, name: "Boston Red Sox", abbreviation: "BOS", aliases: ["red sox", "boston", "boston red sox"] },
    { id: 112, name: "Chicago Cubs", abbreviation: "CHC", aliases: ["cubs", "chicago cubs"] },
    { id: 113, name: "Cincinnati Reds", abbreviation: "CIN", aliases: ["reds", "cincinnati", "cincinnati reds"] },
    { id: 114, name: "Cleveland Guardians", abbreviation: "CLE", aliases: ["guardians", "cleveland", "cleveland guardians", "indians"] },
    { id: 115, name: "Colorado Rockies", abbreviation: "COL", aliases: ["rockies", "colorado", "colorado rockies"] },
    { id: 116, name: "Detroit Tigers", abbreviation: "DET", aliases: ["tigers", "detroit", "detroit tigers"] },
    { id: 117, name: "Houston Astros", abbreviation: "HOU", aliases: ["astros", "houston", "houston astros"] },
    { id: 118, name: "Kansas City Royals", abbreviation: "KC", aliases: ["royals", "kansas city", "kansas city royals", "kc royals"] },
    { id: 119, name: "Los Angeles Dodgers", abbreviation: "LAD", aliases: ["dodgers", "la dodgers", "los angeles dodgers"] },
    { id: 120, name: "Washington Nationals", abbreviation: "WSH", aliases: ["nationals", "nats", "washington", "washington nationals"] },
    { id: 121, name: "New York Mets", abbreviation: "NYM", aliases: ["mets", "ny mets", "new york mets"] },
    { id: 133, name: "Athletics", abbreviation: "ATH", aliases: ["athletics", "a's", "as", "oakland athletics", "sacramento athletics"] },
    { id: 134, name: "Pittsburgh Pirates", abbreviation: "PIT", aliases: ["pirates", "pittsburgh", "pittsburgh pirates"] },
    { id: 135, name: "San Diego Padres", abbreviation: "SD", aliases: ["padres", "san diego", "san diego padres"] },
    { id: 136, name: "Seattle Mariners", abbreviation: "SEA", aliases: ["mariners", "seattle", "seattle mariners"] },
    { id: 137, name: "San Francisco Giants", abbreviation: "SF", aliases: ["giants", "sf giants", "san francisco giants"] },
    { id: 138, name: "St. Louis Cardinals", abbreviation: "STL", aliases: ["cardinals", "cards", "st louis", "st. louis", "st louis cardinals", "st. louis cardinals"] },
    { id: 139, name: "Tampa Bay Rays", abbreviation: "TB", aliases: ["rays", "tampa", "tampa bay", "tampa bay rays"] },
    { id: 140, name: "Texas Rangers", abbreviation: "TEX", aliases: ["rangers", "texas", "texas rangers"] },
    { id: 141, name: "Toronto Blue Jays", abbreviation: "TOR", aliases: ["blue jays", "jays", "toronto", "toronto blue jays"] },
    { id: 142, name: "Minnesota Twins", abbreviation: "MIN", aliases: ["twins", "minnesota", "minnesota twins"] },
    { id: 143, name: "Philadelphia Phillies", abbreviation: "PHI", aliases: ["phillies", "philadelphia", "philadelphia phillies", "phils"] },
    { id: 144, name: "Atlanta Braves", abbreviation: "ATL", aliases: ["braves", "atlanta", "atlanta braves"] },
    { id: 145, name: "Chicago White Sox", abbreviation: "CWS", aliases: ["white sox", "chicago white sox", "chisox"] },
    { id: 146, name: "Miami Marlins", abbreviation: "MIA", aliases: ["marlins", "miami", "miami marlins"] },
    { id: 147, name: "New York Yankees", abbreviation: "NYY", aliases: ["yankees", "ny yankees", "new york yankees", "yanks"] },
    { id: 158, name: "Milwaukee Brewers", abbreviation: "MIL", aliases: ["brewers", "milwaukee", "milwaukee brewers"] }
  ];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function resolveTeam(value) {
    const needle = normalize(value);
    if (!needle) throw new Error("Enter both team names.");

    const exact = TEAMS.filter((team) => {
      const names = [team.name, team.abbreviation, ...team.aliases].map(normalize);
      return names.includes(needle);
    });
    if (exact.length === 1) return exact[0];

    const partial = TEAMS.filter((team) => {
      const names = [team.name, ...team.aliases].map(normalize);
      return names.some((name) => name.includes(needle) || needle.includes(name));
    });
    if (partial.length === 1) return partial[0];
    if (partial.length > 1) {
      throw new Error(`“${value}” matches more than one team. Enter a city and nickname, such as New York Mets.`);
    }
    throw new Error(`Could not match “${value}” to a current MLB team.`);
  }

  function easternToday() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: EASTERN_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${map.year}-${map.month}-${map.day}`;
  }

  function parseDateOnly(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    if (!match) return null;
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  }

  function formatDateOnly(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(date, amount) {
    const copy = new Date(date.getTime());
    copy.setUTCDate(copy.getUTCDate() + amount);
    return copy;
  }

  function buildUrl(path, params) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return `${path}${suffix}`;
  }

  async function fetchJson(path, params) {
    const endpoint = buildUrl(path, params);
    const officialUrl = `${MLB_BASE_URL}${endpoint}`;
    const proxyUrl = `/api/mlb?endpoint=${encodeURIComponent(endpoint)}`;
    const candidates = window.location.protocol === "file:" ? [officialUrl] : [proxyUrl, officialUrl];
    let lastError = null;

    for (const url of candidates) {
      try {
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`MLB data request returned ${response.status}.`);
        return await response.json();
      } catch (error) {
        lastError = error;
      }
    }

    const deploymentHint = window.location.protocol === "file:"
      ? " Online lookup is most reliable after the app is deployed to Netlify."
      : "";
    throw new Error(`Could not reach the MLB data service.${deploymentHint} ${lastError?.message || ""}`.trim());
  }

  function flattenSchedule(schedule) {
    return (schedule?.dates || []).flatMap((date) => date.games || []);
  }

  function gameTeamIds(game) {
    return [game?.teams?.away?.team?.id, game?.teams?.home?.team?.id].filter(Boolean);
  }

  function selectClosestGame(games, teamOne, teamTwo, preferredDate) {
    const matching = games.filter((game) => {
      const ids = gameTeamIds(game);
      return ids.includes(teamOne.id) && ids.includes(teamTwo.id);
    });
    if (!matching.length) return null;

    const preferred = parseDateOnly(preferredDate || easternToday());
    matching.sort((a, b) => {
      const aDate = new Date(a.gameDate || `${a.officialDate}T12:00:00Z`);
      const bDate = new Date(b.gameDate || `${b.officialDate}T12:00:00Z`);
      const aDistance = Math.abs(aDate - preferred);
      const bDistance = Math.abs(bDate - preferred);
      if (aDistance !== bDistance) return aDistance - bDistance;
      const aFuture = aDate >= preferred ? 0 : 1;
      const bFuture = bDate >= preferred ? 0 : 1;
      if (aFuture !== bFuture) return aFuture - bFuture;
      return aDate - bDate;
    });
    return matching[0];
  }

  function recordString(teamEntry) {
    const record = teamEntry?.leagueRecord || teamEntry?.record?.leagueRecord;
    if (!record) return "";
    if (record.wins === undefined || record.losses === undefined) return "";
    return `${record.wins}-${record.losses}`;
  }

  function gamesPlayedFromRecord(teamEntry) {
    const record = teamEntry?.leagueRecord || teamEntry?.record?.leagueRecord;
    if (!record) return null;
    const wins = Number(record.wins || 0);
    const losses = Number(record.losses || 0);
    const ties = Number(record.ties || 0);
    return wins + losses + ties;
  }

  function formatGameTime(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: EASTERN_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(date);
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function formatBroadcasts(game, type) {
    const target = String(type).toLowerCase();
    return unique((game?.broadcasts || [])
      .filter((item) => String(item.type || "").toLowerCase() === target)
      .map((item) => item.name))
      .join(" / ");
  }

  function formatWeather(feed) {
    const weather = feed?.gameData?.weather;
    if (!weather) return "";
    const pieces = [];
    if (weather.temp !== undefined && weather.temp !== null) pieces.push(`${weather.temp}°F`);
    if (weather.condition) pieces.push(weather.condition);
    if (weather.wind) pieces.push(`Wind ${weather.wind}`);
    return pieces.join(", ");
  }

  function formatUmpires(feed) {
    const preferredOrder = ["Home Plate", "First Base", "Second Base", "Third Base", "Left Field", "Right Field"];
    const officials = feed?.liveData?.boxscore?.officials || [];
    return officials
      .slice()
      .sort((a, b) => preferredOrder.indexOf(a.officialType) - preferredOrder.indexOf(b.officialType))
      .map((item) => {
        const label = {
          "Home Plate": "HP",
          "First Base": "1B",
          "Second Base": "2B",
          "Third Base": "3B",
          "Left Field": "LF",
          "Right Field": "RF"
        }[item.officialType] || item.officialType;
        return `${label}: ${item.official?.fullName || ""}`.trim();
      })
      .filter(Boolean)
      .join(" • ");
  }

  function playerKey(id) {
    return `ID${id}`;
  }

  function getPerson(feed, id) {
    return feed?.gameData?.players?.[playerKey(id)] || null;
  }

  function getBoxPlayer(teamBox, id) {
    return teamBox?.players?.[playerKey(id)] || null;
  }

  function lineupIds(teamBox) {
    if (Array.isArray(teamBox?.battingOrder) && teamBox.battingOrder.length) return teamBox.battingOrder;
    return Object.values(teamBox?.players || {})
      .filter((player) => player?.battingOrder)
      .sort((a, b) => Number(a.battingOrder) - Number(b.battingOrder))
      .map((player) => player.person?.id)
      .filter(Boolean);
  }

  function statText(value) {
    if (value === undefined || value === null || value === "-.--") return "";
    return String(value);
  }

  function buildLineup(feed, side) {
    const teamBox = feed?.liveData?.boxscore?.teams?.[side];
    if (!teamBox) return [];
    return lineupIds(teamBox).slice(0, 9).map((id) => {
      const boxPlayer = getBoxPlayer(teamBox, id) || {};
      const person = getPerson(feed, id) || boxPlayer.person || {};
      const batting = boxPlayer?.seasonStats?.batting || {};
      return {
        num: person.primaryNumber || boxPlayer.jerseyNumber || "",
        name: person.fullName || boxPlayer.person?.fullName || "",
        pos: boxPlayer.position?.abbreviation || boxPlayer.allPositions?.[0]?.abbreviation || person.primaryPosition?.abbreviation || "",
        bats: person.batSide?.code || "",
        avg: statText(batting.avg),
        obp: statText(batting.obp)
      };
    });
  }

  function pitcherRecord(stats) {
    if (stats?.wins === undefined || stats?.losses === undefined) return "";
    return `${stats.wins}-${stats.losses}`;
  }

  function buildPitcherFromFeed(feed, teamBox, id) {
    const boxPlayer = getBoxPlayer(teamBox, id) || {};
    const person = getPerson(feed, id) || boxPlayer.person || {};
    const pitching = boxPlayer?.seasonStats?.pitching || {};
    return {
      id,
      num: person.primaryNumber || boxPlayer.jerseyNumber || "",
      name: person.fullName || boxPlayer.person?.fullName || "",
      throws: person.pitchHand?.code || "",
      record: pitcherRecord(pitching),
      era: statText(pitching.era),
      k: statText(pitching.strikeOuts)
    };
  }

  function probablePitcher(game, feed, side) {
    return feed?.gameData?.probablePitchers?.[side] || game?.teams?.[side]?.probablePitcher || null;
  }

  function buildPitchers(game, feed, side) {
    const teamBox = feed?.liveData?.boxscore?.teams?.[side];
    const ids = Array.isArray(teamBox?.pitchers) ? teamBox.pitchers : [];
    const probable = probablePitcher(game, feed, side);
    const orderedIds = unique([probable?.id, ...ids]).slice(0, 6);
    if (orderedIds.length) {
      const pitchers = orderedIds.map((id) => buildPitcherFromFeed(feed, teamBox, id));
      const probableRow = pitchers.find((pitcher) => pitcher.id === probable?.id);
      if (probableRow && !probableRow.name) probableRow.name = probable?.fullName || "";
      return pitchers;
    }
    if (!probable) return [];
    return [{ id: probable.id, num: "", name: probable.fullName || "", throws: "", record: "", era: "", k: "" }];
  }

  function findHydratedPitchingStats(personPayload) {
    const person = personPayload?.people?.[0];
    const groups = person?.stats || [];
    for (const group of groups) {
      const split = group?.splits?.[0];
      if (split?.stat) return { person, stats: split.stat };
    }
    return { person, stats: null };
  }

  async function enrichPitcher(pitcher, season) {
    if (!pitcher?.id) return pitcher;
    if (pitcher.num && pitcher.throws && pitcher.record && pitcher.era && pitcher.k) return pitcher;
    try {
      const payload = await fetchJson(`/api/v1/people/${pitcher.id}`, {
        hydrate: `stats(group=[pitching],type=[season],season=${season})`
      });
      const { person, stats } = findHydratedPitchingStats(payload);
      return {
        ...pitcher,
        num: pitcher.num || person?.primaryNumber || "",
        name: pitcher.name || person?.fullName || "",
        throws: pitcher.throws || person?.pitchHand?.code || "",
        record: pitcher.record || pitcherRecord(stats),
        era: pitcher.era || statText(stats?.era),
        k: pitcher.k || statText(stats?.strikeOuts)
      };
    } catch (_error) {
      return pitcher;
    }
  }

  function gameNumberText(game) {
    const pieces = [];
    ["away", "home"].forEach((side) => {
      const entry = game?.teams?.[side];
      const played = gamesPlayedFromRecord(entry);
      const abbr = entry?.team?.abbreviation || entry?.team?.name || side;
      if (played !== null) pieces.push(`${abbr} Game ${played + 1}`);
    });
    if (game?.doubleHeader === "Y" || Number(game?.gameNumber) > 1) pieces.push(`DH Game ${game.gameNumber || ""}`.trim());
    return pieces.join(" / ");
  }

  function statusIsComplete(game) {
    const code = game?.status?.statusCode;
    const state = String(game?.status?.abstractGameState || "").toLowerCase();
    return code === "F" || state === "final";
  }

  function importSummary(data, game, feed) {
    const lineupCount = data.away.lineup.length + data.home.lineup.length;
    const pitcherCount = data.away.pitchers.filter((p) => p.name).length + data.home.pitchers.filter((p) => p.name).length;
    const warnings = [];
    if (lineupCount < 18) warnings.push("One or both starting lineups have not yet been posted.");
    if (!data.umpires) warnings.push("Umpire assignments were not available yet.");
    if (!data.weather) warnings.push("Ballpark weather was not available yet.");
    if (!feed) warnings.push("Detailed game feed was not available; schedule information was still imported.");
    const sportId = Number(game?.__sportId || game?.sport?.id || 1);
    return {
      gamePk: game.gamePk,
      sportId,
      levelName: game?.__levelName || SPORT_NAMES_BY_ID[sportId] || "Baseball",
      status: game?.status?.detailedState || "Scheduled",
      sourceName: game?.__sourceName || sourceNameForSport(sportId),
      lineupCount,
      pitcherCount,
      warnings,
      complete: statusIsComplete(game),
      loadedAt: new Date().toISOString()
    };
  }

  async function buildScorecardData(game, feed) {
    const season = Number((game.officialDate || easternToday()).slice(0, 4));
    const awayPitchers = buildPitchers(game, feed, "away");
    const homePitchers = buildPitchers(game, feed, "home");
    const enriched = await Promise.all([
      ...awayPitchers.map((pitcher) => enrichPitcher(pitcher, season)),
      ...homePitchers.map((pitcher) => enrichPitcher(pitcher, season))
    ]);
    const awayPitcherCount = awayPitchers.length;

    const data = {
      awayTeam: game?.teams?.away?.team?.name || feed?.gameData?.teams?.away?.name || "",
      homeTeam: game?.teams?.home?.team?.name || feed?.gameData?.teams?.home?.name || "",
      awayRecord: recordString(game?.teams?.away),
      homeRecord: recordString(game?.teams?.home),
      gameDate: game?.officialDate || feed?.gameData?.datetime?.officialDate || "",
      gameTime: formatGameTime(game?.gameDate || feed?.gameData?.datetime?.dateTime),
      venue: game?.venue?.name || feed?.gameData?.venue?.name || "",
      gameNumber: gameNumberText(game),
      weather: formatWeather(feed),
      umpires: formatUmpires(feed),
      broadcast: formatBroadcasts(game, "TV"),
      radio: formatBroadcasts(game, "Radio"),
      gameNotes: "",
      away: {
        lineup: buildLineup(feed, "away"),
        pitchers: enriched.slice(0, awayPitcherCount).map(({ id, ...pitcher }) => pitcher)
      },
      home: {
        lineup: buildLineup(feed, "home"),
        pitchers: enriched.slice(awayPitcherCount).map(({ id, ...pitcher }) => pitcher)
      }
    };

    return { data, meta: importSummary(data, game, feed) };
  }

  async function fetchScheduleForDate(dateValue, sportId) {
    const date = parseDateOnly(dateValue) ? dateValue : easternToday();
    try {
      return await fetchJson("/api/v1/schedule", {
        sportId,
        date,
        hydrate: "team,venue"
      });
    } catch (_hydrateError) {
      return fetchJson("/api/v1/schedule", { sportId, date });
    }
  }

  function scheduleGameLabel(game) {
    const away = game?.teams?.away?.team?.name || "Away Team";
    const home = game?.teams?.home?.team?.name || "Home Team";
    const time = formatGameTime(game?.gameDate) || "Time TBD";
    const venue = game?.venue?.name || "";
    const status = game?.status?.detailedState || "Scheduled";
    const gameNumber = Number(game?.gameNumber) > 1 ? ` — Game ${game.gameNumber}` : "";
    const statusText = status.toLowerCase() === "scheduled" ? "" : ` — ${status}`;
    const venueText = venue ? ` — ${venue}` : "";
    return `${time} — ${away} at ${home}${gameNumber}${statusText}${venueText}`;
  }

  async function listGames(dateValue, levelKey = "mlb") {
    const date = parseDateOnly(dateValue) ? dateValue : easternToday();
    const level = getLevelConfig(levelKey);
    const results = await Promise.allSettled(
      level.sportIds.map(async (sportId) => {
        const schedule = await fetchScheduleForDate(date, sportId);
        return flattenSchedule(schedule).map((game) => ({
          ...game,
          __sportId: sportId,
          __levelName: SPORT_NAMES_BY_ID[sportId] || "Baseball",
          __sourceName: sourceNameForSport(sportId)
        }));
      })
    );

    const games = results
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value || []);
    const failures = results.filter((result) => result.status === "rejected");
    if (!games.length && failures.length === results.length && failures[0]) {
      throw failures[0].reason || new Error("Could not load the selected baseball schedule.");
    }

    const sportOrder = new Map(level.sportIds.map((sportId, index) => [sportId, index]));
    games.sort((a, b) => {
      const levelDifference = (sportOrder.get(a.__sportId) ?? 99) - (sportOrder.get(b.__sportId) ?? 99);
      if (levelDifference !== 0) return levelDifference;
      return new Date(a.gameDate || 0) - new Date(b.gameDate || 0);
    });

    games.forEach((game) => GAME_CACHE.set(String(game.gamePk), game));

    return games.map((game) => ({
      gamePk: game.gamePk,
      sportId: game.__sportId,
      levelName: game.__levelName,
      sourceName: game.__sourceName,
      officialDate: game.officialDate || date,
      gameDate: game.gameDate || "",
      awayTeam: game?.teams?.away?.team?.name || "Away Team",
      homeTeam: game?.teams?.home?.team?.name || "Home Team",
      venue: game?.venue?.name || "",
      status: game?.status?.detailedState || "Scheduled",
      label: scheduleGameLabel(game)
    }));
  }

  async function fetchScheduledGameByPk(gamePk, requestedSportId) {
    const cached = GAME_CACHE.get(String(gamePk));
    const sportId = Number(requestedSportId || cached?.__sportId || cached?.sport?.id || 0) || undefined;
    let schedule = null;

    try {
      schedule = await fetchJson("/api/v1/schedule", {
        sportId,
        gamePk,
        hydrate: "team,venue,probablePitcher,broadcasts"
      });
    } catch (_hydrateError) {
      try {
        schedule = await fetchJson("/api/v1/schedule", { sportId, gamePk });
      } catch (_scheduleError) {
        return cached || null;
      }
    }

    const game = flattenSchedule(schedule).find((item) => String(item.gamePk) === String(gamePk));
    if (!game) return cached || null;
    const tagged = {
      ...game,
      __sportId: sportId || cached?.__sportId || game?.sport?.id || 1,
      __levelName: cached?.__levelName || SPORT_NAMES_BY_ID[sportId || game?.sport?.id || 1] || "Baseball",
      __sourceName: cached?.__sourceName || sourceNameForSport(sportId || game?.sport?.id || 1)
    };
    GAME_CACHE.set(String(gamePk), tagged);
    return tagged;
  }

  function scheduleGameFromFeed(gamePk, feed, sportId = 1) {
    return {
      gamePk: Number(gamePk),
      __sportId: Number(sportId) || 1,
      __levelName: SPORT_NAMES_BY_ID[Number(sportId) || 1] || "Baseball",
      __sourceName: sourceNameForSport(Number(sportId) || 1),
      officialDate: feed?.gameData?.datetime?.officialDate || easternToday(),
      gameDate: feed?.gameData?.datetime?.dateTime || "",
      venue: feed?.gameData?.venue || {},
      status: feed?.gameData?.status || {},
      teams: {
        away: {
          team: feed?.gameData?.teams?.away || {},
          probablePitcher: feed?.gameData?.probablePitchers?.away || null
        },
        home: {
          team: feed?.gameData?.teams?.home || {},
          probablePitcher: feed?.gameData?.probablePitchers?.home || null
        }
      },
      broadcasts: []
    };
  }

  async function lookupGameByPk(gamePk, sportId) {
    if (!gamePk) throw new Error("Select a game from the schedule.");

    let game = null;
    try {
      game = await fetchScheduledGameByPk(gamePk, sportId);
    } catch (_error) {
      game = null;
    }

    let feed = null;
    try {
      feed = await fetchJson(`/api/v1.1/game/${gamePk}/feed/live`);
    } catch (_error) {
      feed = null;
    }

    if (!game && feed) game = scheduleGameFromFeed(gamePk, feed, sportId);
    if (!game) throw new Error("The selected game could not be loaded. Refresh the schedule and try again.");

    const result = await buildScorecardData(game, feed);
    return { ...result, game };
  }

  async function lookupGame(teamOneText, teamTwoText, preferredDate) {
    const teamOne = resolveTeam(teamOneText);
    const teamTwo = resolveTeam(teamTwoText);
    if (teamOne.id === teamTwo.id) throw new Error("Choose two different teams.");

    const center = parseDateOnly(preferredDate || easternToday()) || parseDateOnly(easternToday());
    const startDate = formatDateOnly(addDays(center, -7));
    const endDate = formatDateOnly(addDays(center, 14));
    let schedule;
    try {
      schedule = await fetchJson("/api/v1/schedule", {
        sportId: 1,
        startDate,
        endDate,
        hydrate: "team,venue,probablePitcher,broadcasts"
      });
    } catch (_hydrateError) {
      schedule = await fetchJson("/api/v1/schedule", { sportId: 1, startDate, endDate });
    }
    const game = selectClosestGame(flattenSchedule(schedule), teamOne, teamTwo, preferredDate);
    if (!game) {
      throw new Error(`No ${teamOne.name}–${teamTwo.name} game was found from ${startDate} through ${endDate}. Change the date and try again.`);
    }

    let feed = null;
    try {
      feed = await fetchJson(`/api/v1.1/game/${game.gamePk}/feed/live`);
    } catch (_error) {
      feed = null;
    }

    const result = await buildScorecardData(game, feed);
    return {
      ...result,
      matchedTeams: [teamOne, teamTwo],
      game
    };
  }

  const publicApi = {
    teams: TEAMS.map(({ id, name, abbreviation }) => ({ id, name, abbreviation })),
    levels: Object.values(SPORT_LEVELS).map(({ key, label, shortLabel, sportIds }) => ({ key, label, shortLabel, sportIds: [...sportIds] })),
    easternToday,
    resolveTeam,
    getLevelConfig,
    listGames,
    lookupGameByPk,
    lookupGame,
    _test: { buildScorecardData, selectClosestGame, scheduleGameLabel, normalize, sourceNameForSport }
  };

  window.BaseballData = publicApi;
  window.MLBData = publicApi;
})();
