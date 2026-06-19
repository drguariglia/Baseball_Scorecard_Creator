const LINEUP_ROWS = 9;
const PITCHER_ROWS = 6;

const TEMPLATE_FILE_NAME = "Scorecard_20260615_blank_template.xlsx";
const DEFAULT_TEMPLATE_LABEL = "built-in blank scorecard";
let uploadedTemplateBuffer = null;
let uploadedTemplateName = "";
let scheduleRequestToken = 0;

const $ = (id) => document.getElementById(id);

// IMPORTANT: These are the visible cells in the real Scorecard_20260615 template.
// The browser form does not redraw the scorecard; it only writes values into these cells.
const TEMPLATE_MAP = {
  sheet: "Scorecard",
  cells: {
    topLine: "A2",
    weatherBroadcastBlock: "A3",
    replayTitle: "J3",
    awayReplay: "J4",
    homeReplay: "M4",
    awayScoreLabel: "A6",
    homeScoreLabel: "A7",
    awayLineupTitle: "A9",
    homeLineupTitle: "A21",
    awayPitchingTitle: "A33",
    homePitchingTitle: "A41",
    gameNotesBlock: "J33"
  },
  lists: {
    awayLineup: { start: "A11", rows: 9 },
    homeLineup: { start: "A23", rows: 9 },
    awayPitchers: { start: "A35", rows: 6 },
    homePitchers: { start: "A43", rows: 6 }
  }
};

const XML_MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const XML_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const XML_PACKAGE_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const XML_SPACE_NS = "http://www.w3.org/XML/1998/namespace";

function createLineupInputs(team) {
  const wrap = $(`${team}LineupInputs`);
  wrap.innerHTML = "";
  const caption = document.createElement("div");
  caption.className = "input-caption";
  caption.textContent = "# / Name / Pos / Bats / AVG / OBP";
  wrap.appendChild(caption);
  for (let i = 1; i <= LINEUP_ROWS; i++) {
    const row = document.createElement("div");
    row.className = "lineup-row";
    row.innerHTML = `
      <span class="row-number">${i}</span>
      <input id="${team}Num${i}" type="text" placeholder="#" autocomplete="off" />
      <input id="${team}Player${i}" type="text" placeholder="Player name" autocomplete="off" />
      <input id="${team}Pos${i}" type="text" placeholder="Pos" autocomplete="off" />
      <input id="${team}Bats${i}" type="text" placeholder="Bats" autocomplete="off" />
      <input id="${team}Avg${i}" type="text" placeholder="AVG" autocomplete="off" />
      <input id="${team}Obp${i}" type="text" placeholder="OBP" autocomplete="off" />
    `;
    wrap.appendChild(row);
  }
}

function createPitcherInputs(team) {
  const wrap = $(`${team}PitcherInputs`);
  wrap.innerHTML = "";
  const caption = document.createElement("div");
  caption.className = "input-caption";
  caption.textContent = "# / Name / Throws / Record / ERA / K";
  wrap.appendChild(caption);
  for (let i = 1; i <= PITCHER_ROWS; i++) {
    const row = document.createElement("div");
    row.className = "pitcher-row";
    row.innerHTML = `
      <span class="row-number">${i}</span>
      <input id="${team}PitcherNum${i}" type="text" placeholder="#" autocomplete="off" />
      <input id="${team}Pitcher${i}" type="text" placeholder="Pitcher name" autocomplete="off" />
      <input id="${team}PitcherThrows${i}" type="text" placeholder="Throws" autocomplete="off" />
      <input id="${team}PitcherRecord${i}" type="text" placeholder="Record" autocomplete="off" />
      <input id="${team}PitcherEra${i}" type="text" placeholder="ERA" autocomplete="off" />
      <input id="${team}PitcherK${i}" type="text" placeholder="K" autocomplete="off" />
    `;
    wrap.appendChild(row);
  }
}

function getField(id) {
  return $(id)?.value?.trim() || "";
}

function setField(id, value) {
  if ($(id)) $(id).value = value || "";
}

function collectTeam(team) {
  const lineup = [];
  for (let i = 1; i <= LINEUP_ROWS; i++) {
    lineup.push({
      num: getField(`${team}Num${i}`),
      name: getField(`${team}Player${i}`),
      pos: getField(`${team}Pos${i}`),
      bats: getField(`${team}Bats${i}`),
      avg: getField(`${team}Avg${i}`),
      obp: getField(`${team}Obp${i}`)
    });
  }
  const pitchers = [];
  for (let i = 1; i <= PITCHER_ROWS; i++) {
    pitchers.push({
      num: getField(`${team}PitcherNum${i}`),
      name: getField(`${team}Pitcher${i}`),
      throws: getField(`${team}PitcherThrows${i}`),
      record: getField(`${team}PitcherRecord${i}`),
      era: getField(`${team}PitcherEra${i}`),
      k: getField(`${team}PitcherK${i}`)
    });
  }
  return { lineup, pitchers };
}

function collectData() {
  return {
    awayTeam: getField("awayTeam"),
    homeTeam: getField("homeTeam"),
    awayRecord: getField("awayRecord"),
    homeRecord: getField("homeRecord"),
    gameDate: getField("gameDate"),
    gameDateFormatted: formatDate(getField("gameDate")),
    gameTime: getField("gameTime"),
    venue: getField("venue"),
    gameNumber: getField("gameNumber"),
    weather: getField("weather"),
    umpires: getField("umpires"),
    broadcast: getField("broadcast"),
    radio: getField("radio"),
    gameNotes: getField("gameNotes"),
    away: collectTeam("away"),
    home: collectTeam("home")
  };
}

function setFieldsFromData(data) {
  [
    "awayTeam", "homeTeam", "awayRecord", "homeRecord", "gameDate", "gameTime", "venue",
    "gameNumber", "weather", "umpires", "broadcast", "radio", "gameNotes"
  ].forEach((id) => setField(id, data[id] || ""));

  ["away", "home"].forEach((team) => {
    const teamData = data[team] || {};
    for (let index = 0; index < LINEUP_ROWS; index++) {
      const player = (teamData.lineup || [])[index] || {};
      const i = index + 1;
      setField(`${team}Num${i}`, player.num);
      setField(`${team}Player${i}`, player.name);
      setField(`${team}Pos${i}`, player.pos);
      setField(`${team}Bats${i}`, player.bats);
      setField(`${team}Avg${i}`, player.avg);
      setField(`${team}Obp${i}`, player.obp);
    }
    for (let index = 0; index < PITCHER_ROWS; index++) {
      const pitcher = (teamData.pitchers || [])[index] || {};
      const i = index + 1;
      setField(`${team}PitcherNum${i}`, pitcher.num);
      setField(`${team}Pitcher${i}`, pitcher.name);
      setField(`${team}PitcherThrows${i}`, pitcher.throws);
      setField(`${team}PitcherRecord${i}`, pitcher.record);
      setField(`${team}PitcherEra${i}`, pitcher.era);
      setField(`${team}PitcherK${i}`, pitcher.k);
    }
  });
}

function formatDate(value) {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function withRecord(team, record) {
  if (!team && !record) return "";
  if (!record) return team;
  if (!team) return record;
  return `${team} (${record})`;
}

function appendIf(arr, value) {
  if (value) arr.push(value);
}

function makeTopLine(data) {
  const pieces = [];
  const matchup = data.awayTeam || data.homeTeam ? `${data.awayTeam || "Away"} at ${data.homeTeam || "Home"}` : "";
  appendIf(pieces, matchup);
  appendIf(pieces, data.gameDateFormatted);
  appendIf(pieces, data.gameTime);
  appendIf(pieces, data.venue);
  const records = [data.awayRecord, data.homeRecord].filter(Boolean).join(" / ");
  appendIf(pieces, records);
  appendIf(pieces, data.gameNumber);
  return pieces.join(" • ");
}

function makeWeatherBroadcastBlock(data) {
  const lines = [];
  const weatherPieces = [];
  if (data.weather) weatherPieces.push(`Weather: ${data.weather}`);
  if (data.umpires) weatherPieces.push(`Umpires: ${data.umpires}`);
  if (weatherPieces.length) lines.push(weatherPieces.join(" • "));

  const broadcastPieces = [];
  if (data.broadcast) broadcastPieces.push(`TV: ${data.broadcast}`);
  if (data.radio) broadcastPieces.push(`Radio: ${data.radio}`);
  if (broadcastPieces.length) lines.push(broadcastPieces.join(" • "));

  return lines.join("\n");
}

function formatLineupPlayer(player) {
  const first = [];
  if (player.num) first.push(`#${player.num.replace(/^#/, "")}`);
  if (player.name) first.push(player.name);

  const details = [];
  if (player.pos) details.push(player.pos);
  if (player.bats) details.push(player.bats);
  const slash = [player.avg, player.obp].filter(Boolean).join("/");
  if (slash) details.push(slash);

  const left = first.join(" ").trim();
  if (!left && details.length === 0) return "";
  return [left, ...details].filter(Boolean).join(" — ");
}

function formatPitcher(pitcher) {
  const first = [];
  if (pitcher.num) first.push(`#${pitcher.num.replace(/^#/, "")}`);
  if (pitcher.name) first.push(pitcher.name);

  const details = [];
  if (pitcher.throws) details.push(pitcher.throws);
  if (pitcher.record) details.push(pitcher.record);
  if (pitcher.era) details.push(`${pitcher.era.replace(/\s*ERA$/i, "")} ERA`);
  if (pitcher.k) details.push(`${pitcher.k.replace(/\s*K$/i, "")} K`);

  const left = first.join(" ").trim();
  if (!left && details.length === 0) return "";
  return [left, ...details].filter(Boolean).join(" — ");
}

function buildTemplateValues(data) {
  const awayTitle = withRecord(data.awayTeam, data.awayRecord);
  const homeTitle = withRecord(data.homeTeam, data.homeRecord);
  const awayScore = data.awayTeam ? `Away: ${data.awayTeam}` : "";
  const homeScore = data.homeTeam ? `Home: ${data.homeTeam}` : "";

  return {
    flat: {
      topLine: makeTopLine(data),
      weatherBroadcastBlock: makeWeatherBroadcastBlock(data),
      replayTitle: "□ Replay Challenge □",
      awayReplay: data.awayTeam ? `Away: ${data.awayTeam} □ □ EI□` : "",
      homeReplay: data.homeTeam ? `Home: ${data.homeTeam} □ □ EI□` : "",
      awayScoreLabel: awayScore,
      homeScoreLabel: homeScore,
      awayLineupTitle: awayTitle ? `Away: ${awayTitle}` : "",
      homeLineupTitle: homeTitle ? `Home: ${homeTitle}` : "",
      awayPitchingTitle: awayTitle ? `Away: ${awayTitle} Pitching` : "",
      homePitchingTitle: homeTitle ? `Home: ${homeTitle} Pitching` : "",
      gameNotesBlock: data.gameNotes ? `Game Notes\n${data.gameNotes}` : "Game Notes"
    },
    lists: {
      awayLineup: data.away.lineup.map(formatLineupPlayer),
      homeLineup: data.home.lineup.map(formatLineupPlayer),
      awayPitchers: data.away.pitchers.map(formatPitcher),
      homePitchers: data.home.pitchers.map(formatPitcher)
    }
  };
}

function hasAnyUserData(data) {
  const copy = JSON.parse(JSON.stringify(data));
  delete copy.gameDateFormatted;
  return JSON.stringify(copy).replace(/[\[\]{}":,]/g, "").trim().length > 0;
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function getTemplateArrayBuffer() {
  if (uploadedTemplateBuffer) return uploadedTemplateBuffer.slice(0);
  if (typeof EMBEDDED_SCORECARD_TEMPLATE_BASE64 === "undefined") {
    throw new Error("The built-in blank scorecard is missing.");
  }
  return base64ToArrayBuffer(EMBEDDED_SCORECARD_TEMPLATE_BASE64);
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadArrayBuffer(buffer, fileName, mimeType) {
  const blob = new Blob([buffer], { type: mimeType || "application/octet-stream" });
  downloadBlob(blob, fileName);
}

function makeExportFileName(data, blank = false) {
  const date = data.gameDate || new Date().toISOString().slice(0, 10);
  const away = cleanFilePart(data.awayTeam || "Away");
  const home = cleanFilePart(data.homeTeam || "Home");
  if (blank || !hasAnyUserData(data)) return "Blank_Baseball_Scorecard.xlsx";
  return `${date}_${away}_at_${home}_Baseball_Scorecard.xlsx`;
}

function cleanFilePart(value) {
  return String(value || "").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "Team";
}

function makePdfFileName(data, blank = false) {
  const date = data.gameDate || new Date().toISOString().slice(0, 10);
  const away = cleanFilePart(data.awayTeam || "Away");
  const home = cleanFilePart(data.homeTeam || "Home");
  if (blank || !hasAnyUserData(data)) return "Blank_Baseball_Scorecard.pdf";
  return `${date}_${away}_at_${home}_Baseball_Scorecard.pdf`;
}

const PDF_PAGE_WIDTH = 612;
const PDF_PAGE_HEIGHT = 792;
let pdfMeasureContext = null;

function getPdfMeasureContext() {
  if (!pdfMeasureContext) {
    const canvas = document.createElement("canvas");
    pdfMeasureContext = canvas.getContext("2d");
  }
  return pdfMeasureContext;
}

function sanitizePdfText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, " - ")
    .replace(/\u2022/g, " - ")
    .replace(/\u2026/g, "...")
    .replace(/[\u25a1\u2610]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, "?");
}

function measurePdfText(text, size, bold = false) {
  const ctx = getPdfMeasureContext();
  ctx.font = `${bold ? 700 : 400} ${size}px Arial, Helvetica, sans-serif`;
  return ctx.measureText(sanitizePdfText(text)).width;
}

function fitPdfFontSize(text, maxWidth, preferredSize, minSize, bold = false) {
  let size = preferredSize;
  while (size > minSize && measurePdfText(text, size, bold) > maxWidth) size -= 0.25;
  return Math.max(minSize, size);
}

function pdfHexString(value) {
  const text = sanitizePdfText(value);
  let hex = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    hex += (code <= 255 ? code : 63).toString(16).padStart(2, "0").toUpperCase();
  }
  return `<${hex}>`;
}

function pdfColor(color) {
  if (color === "white") return "1 1 1";
  if (color === "blue") return "0.122 0.306 0.471";
  return "0.067 0.067 0.067";
}

function addPdfText(commands, value, x, top, maxWidth, preferredSize, options = {}) {
  const text = sanitizePdfText(value).trim();
  if (!text) return;
  const bold = options.bold !== false;
  const size = fitPdfFontSize(text, maxWidth, preferredSize, options.minSize || 4.5, bold);
  const width = measurePdfText(text, size, bold);
  let drawX = x;
  if (options.align === "center") drawX = x + Math.max(0, (maxWidth - width) / 2);
  if (options.align === "right") drawX = x + Math.max(0, maxWidth - width);
  const baselineY = PDF_PAGE_HEIGHT - top - size * 0.95;
  commands.push(
    `BT /${bold ? "F2" : "F1"} ${size.toFixed(2)} Tf ${pdfColor(options.color)} rg 1 0 0 1 ${drawX.toFixed(2)} ${baselineY.toFixed(2)} Tm ${pdfHexString(text)} Tj ET`
  );
}

function addPdfRectangle(commands, x, top, width, height, color = "blue", lineWidth = 0.7) {
  const y = PDF_PAGE_HEIGHT - top - height;
  commands.push(`${pdfColor(color)} RG ${lineWidth.toFixed(2)} w ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`);
}

function wrapPdfText(text, maxWidth, size, bold = false) {
  const lines = [];
  const paragraphs = sanitizePdfText(text).split(/\r?\n/);
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      if (paragraphIndex < paragraphs.length - 1) lines.push("");
      return;
    }
    let current = "";
    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (!current || measurePdfText(candidate, size, bold) <= maxWidth) current = candidate;
      else {
        lines.push(current);
        current = word;
      }
    });
    if (current) lines.push(current);
  });
  return lines;
}

function addPdfNotes(commands, notes) {
  const clean = sanitizePdfText(notes).trim();
  if (!clean) return;
  const x = 423.2;
  const top = 601.3;
  const maxWidth = 166.2;
  const maxHeight = 166.0;
  let size = 8.4;
  let lineHeight = 10.1;
  let lines = wrapPdfText(clean, maxWidth, size, false);
  while (lines.length * lineHeight > maxHeight && size > 6.2) {
    size -= 0.25;
    lineHeight = size * 1.2;
    lines = wrapPdfText(clean, maxWidth, size, false);
  }
  const maxLines = Math.floor(maxHeight / lineHeight);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines.length - 1;
    lines[last] = `${lines[last].replace(/[. ]+$/, "")}...`;
  }
  lines.forEach((line, index) => {
    if (!line) return;
    addPdfText(commands, line, x, top + index * lineHeight, maxWidth, size, {
      bold: false,
      minSize: size,
      color: "black"
    });
  });
}

function addReplayRow(commands, label, team, x, rightEdge) {
  if (!team) return;
  const textWidth = Math.max(34, rightEdge - x - 28);
  addPdfText(commands, `${label}: ${team}`, x, 65.0, textWidth, 6.4, {
    bold: true,
    minSize: 4.3,
    color: "blue"
  });
  const boxTop = 65.4;
  const boxSize = 5.2;
  [rightEdge - 23.0, rightEdge - 15.0, rightEdge - 7.0].forEach((boxX) => {
    addPdfRectangle(commands, boxX, boxTop, boxSize, boxSize, "blue", 0.6);
  });
}

function buildPdfOverlayCommands(data) {
  const values = buildTemplateValues(data);
  const commands = ["q 612 0 0 792 0 0 cm /Im0 Do Q"];

  addPdfText(commands, values.flat.topLine, 21.4, 21.1, 568.5, 9.9, { bold: true, minSize: 6.2, color: "black" });

  const infoLines = sanitizePdfText(values.flat.weatherBroadcastBlock).split(/\r?\n/).filter(Boolean);
  infoLines.slice(0, 2).forEach((line, index) => {
    addPdfText(commands, line, 21.4, 47.5 + index * 11.6, 395.0, 9.7, { bold: true, minSize: 5.5, color: "black" });
  });

  addReplayRow(commands, "Away", data.awayTeam, 423.0, 503.2);
  addReplayRow(commands, "Home", data.homeTeam, 506.0, 591.2);

  addPdfText(commands, values.flat.awayScoreLabel, 21.4, 101.0, 180.0, 11.7, { bold: true, minSize: 7.0, color: "blue" });
  addPdfText(commands, values.flat.homeScoreLabel, 21.4, 117.2, 180.0, 11.7, { bold: true, minSize: 7.0, color: "blue" });

  addPdfText(commands, values.flat.awayLineupTitle, 21.4, 138.2, 395.0, 11.6, { bold: true, minSize: 6.0, color: "white" });
  addPdfText(commands, values.flat.homeLineupTitle, 21.4, 362.8, 395.0, 11.6, { bold: true, minSize: 6.0, color: "white" });

  const awayLineupTops = [170.6, 191.4, 212.2, 233.0, 253.8, 274.7, 295.5, 316.3, 337.1];
  const homeLineupTops = [395.2, 416.0, 436.8, 457.6, 478.4, 499.2, 520.1, 540.9, 561.7];
  values.lists.awayLineup.forEach((text, index) => addPdfText(commands, text, 21.4, awayLineupTops[index], 180.0, 9.7, { bold: true, minSize: 5.2, color: "black" }));
  values.lists.homeLineup.forEach((text, index) => addPdfText(commands, text, 21.4, homeLineupTops[index], 180.0, 9.7, { bold: true, minSize: 5.2, color: "black" }));

  addPdfText(commands, values.flat.awayPitchingTitle, 21.4, 585.7, 395.0, 10.6, { bold: true, minSize: 4.8, color: "white" });
  addPdfText(commands, values.flat.homePitchingTitle, 21.4, 678.5, 395.0, 10.6, { bold: true, minSize: 4.8, color: "white" });

  const awayPitcherTops = [612.0, 623.4, 634.8, 646.2, 657.5, 668.9];
  const homePitcherTops = [704.8, 716.2, 727.6, 738.9, 750.3, 761.7];
  values.lists.awayPitchers.forEach((text, index) => addPdfText(commands, text, 21.4, awayPitcherTops[index], 180.0, 7.8, { bold: true, minSize: 4.4, color: "black" }));
  values.lists.homePitchers.forEach((text, index) => addPdfText(commands, text, 21.4, homePitcherTops[index], 180.0, 7.8, { bold: true, minSize: 4.4, color: "black" }));

  addPdfNotes(commands, data.gameNotes);
  return `${commands.join("\n")}\n`;
}

function stringToPdfBytes(value) {
  return new TextEncoder().encode(value);
}

function concatPdfBytes(chunks) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });
  return merged;
}

function buildScorecardPdfBytes(data) {
  if (typeof EMBEDDED_SCORECARD_BACKGROUND_JPEG_BASE64 === "undefined") {
    throw new Error("The built-in PDF scorecard background is missing.");
  }

  const imageBytes = new Uint8Array(base64ToArrayBuffer(EMBEDDED_SCORECARD_BACKGROUND_JPEG_BASE64));
  const contentBytes = stringToPdfBytes(buildPdfOverlayCommands(data));
  const objectCount = 7;
  const chunks = [];
  const offsets = new Array(objectCount + 1).fill(0);
  let length = 0;

  const push = (chunk) => {
    chunks.push(chunk);
    length += chunk.length;
  };
  const pushText = (text) => push(stringToPdfBytes(text));
  const addObject = (number, bodyChunks) => {
    offsets[number] = length;
    pushText(`${number} 0 obj\n`);
    bodyChunks.forEach(push);
    pushText("\nendobj\n");
  };

  pushText("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  addObject(1, [stringToPdfBytes("<< /Type /Catalog /Pages 2 0 R >>")]);
  addObject(2, [stringToPdfBytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")]);
  addObject(3, [stringToPdfBytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im0 6 0 R >> >> /Contents 7 0 R >>")]);
  addObject(4, [stringToPdfBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")]);
  addObject(5, [stringToPdfBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")]);

  offsets[6] = length;
  pushText(`6 0 obj\n<< /Type /XObject /Subtype /Image /Width ${EMBEDDED_SCORECARD_BACKGROUND_WIDTH} /Height ${EMBEDDED_SCORECARD_BACKGROUND_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);
  push(imageBytes);
  pushText("\nendstream\nendobj\n");

  offsets[7] = length;
  pushText(`7 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
  push(contentBytes);
  pushText("endstream\nendobj\n");

  const xrefOffset = length;
  pushText(`xref\n0 ${objectCount + 1}\n`);
  pushText("0000000000 65535 f \n");
  for (let i = 1; i <= objectCount; i++) {
    pushText(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
  return concatPdfBytes(chunks);
}

async function exportFilledPdf() {
  setStatus("Creating a one-page PDF scorecard...");
  try {
    const data = collectData();
    const bytes = buildScorecardPdfBytes(data);
    const fileName = makePdfFileName(data);
    downloadBlob(new Blob([bytes], { type: "application/pdf" }), fileName);
    logExport("Created a one-page Letter PDF with 0.25-inch margins.");
    setStatus("PDF created. It is formatted for one 8.5 × 11 sheet with quarter-inch margins.");
  } catch (error) {
    console.error(error);
    logExport(`PDF export error: ${error.message}`);
    setStatus(error.message, true);
    alert(error.message);
  }
}


function offsetAddress(startAddr, rowOffset) {
  const match = /^([A-Z]+)(\d+)$/.exec(startAddr);
  if (!match) throw new Error(`Bad cell address: ${startAddr}`);
  return `${match[1]}${Number(match[2]) + rowOffset}`;
}

function columnIndexFromAddress(address) {
  const letters = /^([A-Z]+)/.exec(address)?.[1] || "A";
  let index = 0;
  for (const ch of letters) index = index * 26 + (ch.charCodeAt(0) - 64);
  return index;
}

function rowNumberFromAddress(address) {
  return Number(/(\d+)$/.exec(address)?.[1] || 1);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const parseError = doc.getElementsByTagName("parsererror")[0];
  if (parseError) throw new Error(`Could not parse template XML: ${parseError.textContent}`);
  return doc;
}

function serializeXml(doc) {
  return new XMLSerializer().serializeToString(doc);
}

function getAttrNSorPlain(element, ns, name) {
  return element.getAttributeNS(ns, name) || element.getAttribute(name);
}

function getSheetPathFromWorkbook(zip, sheetName) {
  const workbookXml = zip.file("xl/workbook.xml");
  const relsXml = zip.file("xl/_rels/workbook.xml.rels");
  if (!workbookXml || !relsXml) throw new Error("The blank scorecard file is missing required workbook information.");

  return Promise.all([workbookXml.async("text"), relsXml.async("text")]).then(([workbookText, relsText]) => {
    const workbook = parseXml(workbookText);
    const rels = parseXml(relsText);
    const sheets = Array.from(workbook.getElementsByTagNameNS(XML_MAIN_NS, "sheet"));
    const targetSheet = sheets.find((sheet) => sheet.getAttribute("name") === sheetName) || sheets[0];
    if (!targetSheet) throw new Error("The blank scorecard has no worksheets.");

    const relationshipId = getAttrNSorPlain(targetSheet, XML_REL_NS, "id");
    const relationships = Array.from(rels.getElementsByTagNameNS(XML_PACKAGE_REL_NS, "Relationship"));
    const relationship = relationships.find((rel) => rel.getAttribute("Id") === relationshipId);
    if (!relationship) throw new Error("Could not find the scorecard worksheet file.");

    let target = relationship.getAttribute("Target") || "";
    if (target.startsWith("/")) target = target.slice(1);
    if (!target.startsWith("xl/")) target = `xl/${target}`;
    return target.replace(/\/+/g, "/");
  });
}

function findRow(sheetDoc, rowNumber) {
  const rows = Array.from(sheetDoc.getElementsByTagNameNS(XML_MAIN_NS, "row"));
  return rows.find((row) => Number(row.getAttribute("r")) === rowNumber) || null;
}

function ensureRow(sheetDoc, rowNumber) {
  const existing = findRow(sheetDoc, rowNumber);
  if (existing) return existing;

  const sheetData = sheetDoc.getElementsByTagNameNS(XML_MAIN_NS, "sheetData")[0];
  if (!sheetData) throw new Error("The worksheet is missing sheetData.");

  const row = sheetDoc.createElementNS(XML_MAIN_NS, "x:row");
  row.setAttribute("r", String(rowNumber));

  const rows = Array.from(sheetData.getElementsByTagNameNS(XML_MAIN_NS, "row"));
  const nextRow = rows.find((candidate) => Number(candidate.getAttribute("r")) > rowNumber);
  if (nextRow) sheetData.insertBefore(row, nextRow);
  else sheetData.appendChild(row);
  return row;
}

function findCell(row, address) {
  const cells = Array.from(row.getElementsByTagNameNS(XML_MAIN_NS, "c"));
  return cells.find((cell) => cell.getAttribute("r") === address) || null;
}

function ensureCell(sheetDoc, address) {
  const rowNumber = rowNumberFromAddress(address);
  const row = ensureRow(sheetDoc, rowNumber);
  const existing = findCell(row, address);
  if (existing) return existing;

  const cell = sheetDoc.createElementNS(XML_MAIN_NS, "x:c");
  cell.setAttribute("r", address);

  const targetCol = columnIndexFromAddress(address);
  const cells = Array.from(row.getElementsByTagNameNS(XML_MAIN_NS, "c"));
  const nextCell = cells.find((candidate) => columnIndexFromAddress(candidate.getAttribute("r")) > targetCol);
  if (nextCell) row.insertBefore(cell, nextCell);
  else row.appendChild(cell);
  return cell;
}

function setCellInlineString(sheetDoc, address, value) {
  const cell = ensureCell(sheetDoc, address);
  while (cell.firstChild) cell.removeChild(cell.firstChild);

  const text = value === undefined || value === null ? "" : String(value);
  if (text === "") {
    cell.removeAttribute("t");
    return;
  }

  cell.setAttribute("t", "inlineStr");
  const inlineString = sheetDoc.createElementNS(XML_MAIN_NS, "x:is");
  const textNode = sheetDoc.createElementNS(XML_MAIN_NS, "x:t");
  textNode.setAttributeNS(XML_SPACE_NS, "xml:space", "preserve");
  textNode.textContent = text;
  inlineString.appendChild(textNode);
  cell.appendChild(inlineString);
}

function writeListToSheet(sheetDoc, listMap, values) {
  for (let i = 0; i < listMap.rows; i++) {
    setCellInlineString(sheetDoc, offsetAddress(listMap.start, i), values[i] || "");
  }
}

async function buildWorkbookBlobFromTemplate(data) {
  if (!window.JSZip) throw new Error("The local ZIP writer library did not load. Make sure vendor/jszip.min.js is included beside index.html.");

  const buffer = getTemplateArrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const sheetPath = await getSheetPathFromWorkbook(zip, TEMPLATE_MAP.sheet);
  const sheetFile = zip.file(sheetPath);
  if (!sheetFile) throw new Error(`Could not find worksheet XML at ${sheetPath}.`);

  const sheetText = await sheetFile.async("text");
  const sheetDoc = parseXml(sheetText);
  const values = buildTemplateValues(data);

  Object.entries(TEMPLATE_MAP.cells).forEach(([key, address]) => {
    setCellInlineString(sheetDoc, address, values.flat[key] || "");
  });
  writeListToSheet(sheetDoc, TEMPLATE_MAP.lists.awayLineup, values.lists.awayLineup);
  writeListToSheet(sheetDoc, TEMPLATE_MAP.lists.homeLineup, values.lists.homeLineup);
  writeListToSheet(sheetDoc, TEMPLATE_MAP.lists.awayPitchers, values.lists.awayPitchers);
  writeListToSheet(sheetDoc, TEMPLATE_MAP.lists.homePitchers, values.lists.homePitchers);

  zip.file(sheetPath, serializeXml(sheetDoc));
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

async function exportFilledExcel() {
  setStatus("Creating your scorecard...");
  try {
    const data = collectData();

    if (!hasAnyUserData(data)) {
      const buffer = getTemplateArrayBuffer();
      downloadArrayBuffer(buffer, TEMPLATE_FILE_NAME, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      logExport("Downloaded a blank scorecard.");
      setStatus("Downloaded a blank scorecard.");
      return;
    }

    const blob = await buildWorkbookBlobFromTemplate(data);
    const fileName = makeExportFileName(data);
    downloadBlob(blob, fileName);
    const source = uploadedTemplateName || DEFAULT_TEMPLATE_LABEL;
    logExport(`Created scorecard workbook using ${source}. Layout and print settings were preserved.`);
    setStatus("Excel scorecard created. Open the workbook to print or continue editing.");
  } catch (error) {
    console.error(error);
    logExport(`Export error: ${error.message}`);
    setStatus(error.message, true);
    alert(error.message);
  }
}

function downloadBlankTemplate() {
  try {
    const buffer = getTemplateArrayBuffer();
    const fileName = uploadedTemplateName || TEMPLATE_FILE_NAME;
    downloadArrayBuffer(buffer, fileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    logExport("Downloaded a blank scorecard.");
  } catch (error) {
    setStatus(error.message, true);
    alert(error.message);
  }
}

async function handleTemplateUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    uploadedTemplateBuffer = await file.arrayBuffer();
    uploadedTemplateName = file.name;
    $("templateStatus").textContent = "Using your uploaded blank scorecard.";
    logExport("Loaded an uploaded blank scorecard.");
  } catch (error) {
    uploadedTemplateBuffer = null;
    uploadedTemplateName = "";
    $("templateStatus").textContent = "Could not load that file. Using the built-in blank scorecard.";
    logExport(`Template upload error: ${error.message}`);
  }
}

async function validateTemplate() {
  try {
    if (!window.JSZip) throw new Error("A required local export file did not load.");
    const buffer = getTemplateArrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const sheetPath = await getSheetPathFromWorkbook(zip, TEMPLATE_MAP.sheet);
    const sheetText = await zip.file(sheetPath).async("text");

    const expectedAddresses = ["A2", "A3", "J3", "J4", "M4", "A6", "A7", "A9", "A11", "A21", "A23", "A33", "A35", "A41", "A43", "J33"];
    const missing = expectedAddresses.filter((addr) => !new RegExp(`<[^>]*c[^>]*\\sr=[\"']${escapeRegex(addr)}[\"']`).test(sheetText));
    if (missing.length) {
      throw new Error("Scorecard check found missing mapped areas. The uploaded file may not match this app.");
    }

    logExport("Scorecard check passed. Required areas are present.");
    setStatus("Scorecard check passed. The required areas are present.");
  } catch (error) {
    logExport(`Template check failed: ${error.message}`);
    setStatus(error.message, true);
    alert(error.message);
  }
}


function baseballDataApi() {
  return window.BaseballData || window.MLBData || null;
}

function selectedScheduleLevel() {
  const api = baseballDataApi();
  const key = $("scheduleLevel")?.value || "mlb";
  return api?.getLevelConfig ? api.getLevelConfig(key) : { key, label: "Baseball", shortLabel: "baseball", sportIds: [1] };
}

function setLookupStatus(message, isError = false) {
  const status = $("lookupStatus");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
  status.classList.toggle("success", !isError && !/^Loading|^Select|^Ready/.test(message));
}

function formatScheduleDateLabel(dateValue) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue || "");
  if (!parts) return dateValue || "the selected date";
  const date = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function setScheduleLoading(isLoading) {
  const select = $("dailyGameSelect");
  const lookupButton = $("lookupGameBtn");
  const refreshButton = $("refreshGamesBtn");
  if (select) select.disabled = isLoading;
  if (lookupButton) lookupButton.disabled = isLoading || !select?.value;
  if (refreshButton) refreshButton.disabled = isLoading;
}

async function loadDailyGames() {
  const select = $("dailyGameSelect");
  const dateInput = $("lookupDate");
  const levelInput = $("scheduleLevel");
  if (!select || !dateInput || !levelInput) return;

  const api = baseballDataApi();
  if (!api) {
    select.innerHTML = '<option value="">Online schedule unavailable</option>';
    select.disabled = true;
    setLookupStatus("The online lookup component did not load. Manual entry is still available.", true);
    return;
  }

  const requestToken = ++scheduleRequestToken;
  const today = api.easternToday();
  dateInput.min = today;
  if (!dateInput.value || dateInput.value < today) dateInput.value = today;
  const date = dateInput.value;
  const levelKey = levelInput.value || "mlb";
  const level = api.getLevelConfig(levelKey);
  const dateLabel = formatScheduleDateLabel(date);

  select.innerHTML = '<option value="">Loading scheduled games…</option>';
  select.value = "";
  setScheduleLoading(true);
  levelInput.disabled = true;
  setLookupStatus(`Loading ${level.label} games for ${dateLabel}…`);

  try {
    const games = await api.listGames(date, levelKey);
    if (requestToken !== scheduleRequestToken) return;

    select.innerHTML = "";
    if (!games.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = `No ${level.label} games scheduled`;
      select.appendChild(option);
      select.disabled = true;
      $("lookupGameBtn").disabled = true;
      setLookupStatus(`No ${level.label} games are scheduled for ${dateLabel}. Choose another date or level, or use manual entry.`);
      return;
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = `Select one of ${games.length} scheduled game${games.length === 1 ? "" : "s"}`;
    select.appendChild(placeholder);

    const addGameOption = (parent, game) => {
      const option = document.createElement("option");
      option.value = String(game.gamePk);
      option.textContent = game.label;
      option.dataset.awayTeam = game.awayTeam;
      option.dataset.homeTeam = game.homeTeam;
      option.dataset.status = game.status;
      option.dataset.sportId = String(game.sportId || "");
      option.dataset.levelName = game.levelName || "Baseball";
      option.dataset.sourceName = game.sourceName || game.levelName || "Baseball";
      parent.appendChild(option);
    };

    if (level.sportIds.length > 1) {
      const groups = new Map();
      games.forEach((game) => {
        const groupName = game.levelName || "Baseball";
        if (!groups.has(groupName)) {
          const group = document.createElement("optgroup");
          group.label = `${groupName} — ${games.filter((item) => item.levelName === groupName).length} game${games.filter((item) => item.levelName === groupName).length === 1 ? "" : "s"}`;
          groups.set(groupName, group);
          select.appendChild(group);
        }
        addGameOption(groups.get(groupName), game);
      });
    } else {
      games.forEach((game) => addGameOption(select, game));
    }

    select.disabled = false;
    $("lookupGameBtn").disabled = true;
    setLookupStatus(`${games.length} ${level.shortLabel} game${games.length === 1 ? "" : "s"} found for ${dateLabel}. Select a matchup from the list.`);
  } catch (error) {
    if (requestToken !== scheduleRequestToken) return;
    console.error(error);
    select.innerHTML = '<option value="">Could not load schedule</option>';
    select.disabled = true;
    $("lookupGameBtn").disabled = true;
    setLookupStatus(`${error.message} Manual entry is still available.`, true);
    setStatus(error.message, true);
    logExport(`Schedule lookup error: ${error.message}`);
  } finally {
    if (requestToken === scheduleRequestToken) {
      $("refreshGamesBtn").disabled = false;
      levelInput.disabled = false;
    }
  }
}

function handleGameSelection() {
  const select = $("dailyGameSelect");
  const button = $("lookupGameBtn");
  if (!select || !button) return;

  button.disabled = !select.value;
  if (!select.value) {
    setLookupStatus("Select a game from the schedule.");
    return;
  }

  const option = select.options[select.selectedIndex];
  const matchup = `${option.dataset.awayTeam || "Away Team"} at ${option.dataset.homeTeam || "Home Team"}`;
  const level = option.dataset.levelName ? `${option.dataset.levelName}: ` : "";
  const status = option.dataset.status && option.dataset.status !== "Scheduled" ? ` (${option.dataset.status})` : "";
  setLookupStatus(`${level}${matchup}${status} selected. Choose Fill Scorecard to load the available game information.`);
}

function showImportBanner(meta, data) {
  const banner = $("importBanner");
  if (!banner) return;
  if (!meta) {
    banner.hidden = true;
    return;
  }

  const lineupText = meta.lineupCount === 18
    ? "Both starting lineups were loaded."
    : `${meta.lineupCount} of 18 lineup positions were available.`;
  const warningText = meta.warnings?.length ? ` ${meta.warnings.join(" ")}` : "";
  $("importBannerTitle").textContent = `${data.awayTeam} at ${data.homeTeam} loaded from ${meta.sourceName || "online baseball data"}`;
  $("importBannerText").textContent = `${lineupText} Review and edit every field before creating the scorecard.${warningText}`;
  banner.hidden = false;
}

function startManualEntry() {
  clearForm(false);
  if ($("importBanner")) $("importBanner").hidden = true;
  setStatus("Manual entry mode. Enter the game information, lineups, pitchers, and notes.");
  showStep("game");
}

async function lookupSelectedGame() {
  const select = $("dailyGameSelect");
  const gamePk = select?.value;
  const button = $("lookupGameBtn");

  const api = baseballDataApi();
  if (!api) {
    setLookupStatus("The online lookup component did not load.", true);
    return;
  }
  if (!gamePk) {
    setLookupStatus("Select a game from the schedule.", true);
    return;
  }

  const selectedOption = select.options[select.selectedIndex];
  const matchup = `${selectedOption.dataset.awayTeam || "Away Team"} at ${selectedOption.dataset.homeTeam || "Home Team"}`;
  const sportId = selectedOption.dataset.sportId || "";
  const sourceName = selectedOption.dataset.sourceName || selectedOption.dataset.levelName || "baseball";

  button.disabled = true;
  button.textContent = "Loading Selected Game…";
  select.disabled = true;
  $("refreshGamesBtn").disabled = true;
  setLookupStatus(`Loading ${matchup}…`);
  setStatus(`Loading official ${sourceName} game information…`);

  try {
    const result = await api.lookupGameByPk(gamePk, sportId);
    setFieldsFromData(result.data);
    showImportBanner(result.meta, result.data);

    const missingText = result.meta.warnings.length
      ? ` ${result.meta.warnings.join(" ")}`
      : " All commonly available pregame fields were loaded.";
    setLookupStatus(`${result.data.awayTeam} at ${result.data.homeTeam} was loaded.${missingText}`);
    setStatus("Online game information loaded. Review each section and add or correct anything needed.");
    logExport(`Loaded ${result.meta.sourceName || sourceName} game ${result.meta.gamePk}: ${result.data.awayTeam} at ${result.data.homeTeam}.`);
    showStep("game");
  } catch (error) {
    console.error(error);
    setLookupStatus(error.message, true);
    setStatus(error.message, true);
    logExport(`Online lookup error: ${error.message}`);
  } finally {
    button.textContent = "Fill Scorecard from Selected Game";
    select.disabled = false;
    $("refreshGamesBtn").disabled = false;
    button.disabled = !select.value;
  }
}

function saveDraft() {
  localStorage.setItem("scorecard20260615Draft", JSON.stringify(collectData()));
  setStatus("Draft saved in this browser. The app will still open blank unless you choose Load Draft.");
  logExport("Draft saved locally.");
}

function loadDraft() {
  const raw = localStorage.getItem("scorecard20260615Draft");
  if (!raw) {
    setStatus("No saved draft found.", true);
    return;
  }
  try {
    clearForm(false);
    setFieldsFromData(JSON.parse(raw));
    setStatus("Draft loaded.");
    logExport("Draft loaded locally.");
  } catch (error) {
    setStatus("Could not load draft.", true);
    logExport(`Draft load error: ${error.message}`);
  }
}

function clearForm(confirmFirst = true) {
  if (confirmFirst && !confirm("Clear every scorecard field?")) return;
  const scorecardIds = [
    "awayTeam", "homeTeam", "awayRecord", "homeRecord", "gameDate", "gameTime", "venue",
    "gameNumber", "weather", "umpires", "broadcast", "radio", "gameNotes"
  ];
  scorecardIds.forEach((id) => setField(id, ""));
  ["away", "home"].forEach((team) => {
    for (let i = 1; i <= LINEUP_ROWS; i++) {
      ["Num", "Player", "Pos", "Bats", "Avg", "Obp"].forEach((field) => setField(`${team}${field}${i}`, ""));
    }
    for (let i = 1; i <= PITCHER_ROWS; i++) {
      ["PitcherNum", "Pitcher", "PitcherThrows", "PitcherRecord", "PitcherEra", "PitcherK"].forEach((field) => setField(`${team}${field}${i}`, ""));
    }
  });
  if ($("importBanner")) $("importBanner").hidden = true;
  setStatus("Form cleared. Creating now would download a blank scorecard.");
}

function logExport(message) {
  const now = new Date().toLocaleTimeString();
  if ($("exportLog")) $("exportLog").textContent = `[${now}] ${message}\n\n${$("exportLog").textContent}`;
}

function setStatus(message, isError = false) {
  const status = $("statusBox");
  if (!status) return;
  status.textContent = message;
  status.style.borderColor = isError ? "#b91c1c" : "#cbd5e1";
  status.style.background = isError ? "#fef2f2" : "#f8fafc";
}

function showStep(stepId) {
  document.querySelectorAll(".panel:not(.notice-panel)").forEach((panel) => panel.classList.remove("active"));
  const target = $(stepId);
  if (!target) return;
  target.classList.add("active");
  document.querySelectorAll(".step").forEach((step) => step.classList.toggle("active", step.dataset.step === stepId));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function init() {
  createLineupInputs("away");
  createLineupInputs("home");
  createPitcherInputs("away");
  createPitcherInputs("home");

  const api = baseballDataApi();
  if ($("lookupDate") && api) {
    const today = api.easternToday();
    $("lookupDate").value = today;
    $("lookupDate").min = today;
  }

  document.querySelectorAll(".step").forEach((button) => button.addEventListener("click", () => showStep(button.dataset.step)));
  document.querySelectorAll(".nextBtn").forEach((button) => button.addEventListener("click", () => showStep(button.dataset.next)));
  $("lookupGameBtn")?.addEventListener("click", lookupSelectedGame);
  $("dailyGameSelect")?.addEventListener("change", handleGameSelection);
  $("lookupDate")?.addEventListener("change", loadDailyGames);
  $("scheduleLevel")?.addEventListener("change", loadDailyGames);
  $("refreshGamesBtn")?.addEventListener("click", loadDailyGames);
  $("manualEntryBtn")?.addEventListener("click", startManualEntry);
  $("downloadBlankBtn").addEventListener("click", downloadBlankTemplate);
  $("downloadBlankBtn2")?.addEventListener("click", downloadBlankTemplate);
  $("exportExcelBtn").addEventListener("click", exportFilledExcel);
  $("exportExcelBtn2").addEventListener("click", exportFilledExcel);
  $("exportPdfBtn")?.addEventListener("click", exportFilledPdf);
  $("exportPdfBtn2")?.addEventListener("click", exportFilledPdf);
  $("saveDraftBtn").addEventListener("click", saveDraft);
  $("loadDraftBtn").addEventListener("click", loadDraft);
  $("clearBtn").addEventListener("click", () => clearForm(true));
  $("templateFile").addEventListener("change", handleTemplateUpload);
  $("validateTemplateBtn").addEventListener("click", validateTemplate);

  // Important: do not auto-load old localStorage drafts. The app always opens at the choice screen.
  clearForm(false);
  setStatus("Ready. Choose a scheduled MLB or MiLB game, or use manual entry. Download as Excel or a one-page PDF.");
  setLookupStatus("Loading today’s official MLB schedule…");
  showStep("start");
  loadDailyGames();
}

document.addEventListener("DOMContentLoaded", init);
