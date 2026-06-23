const LINEUP_ROWS = 9;
const PITCHER_ROWS = 6;
const PA_SLOTS = 10;
const LEGACY_STORAGE_PREFIXES = ["guariglia-scorecard", "scorecard20260615"];
const TEMPLATE_FILE_NAME = "Scorecard_20260615_blank_template.xlsx";
const VERSION_NUMBER = 23;
const DEFAULT_SCORECARD_COLORS = {primary:"#3D2519",secondary:"#9B4D1F",accent:"#D9A441"};
const MLB_TEAM_COLOR_RECORDS = [
  {aliases:["arizona diamondbacks","diamondbacks","ari"],primary:"#A71930",secondary:"#000000",accent:"#E3D4AD"},
  {aliases:["atlanta braves","braves","atl"],primary:"#13274F",secondary:"#CE1141",accent:"#EAAA00"},
  {aliases:["baltimore orioles","orioles","bal"],primary:"#000000",secondary:"#DF4601",accent:"#FFFFFF"},
  {aliases:["boston red sox","red sox","bos"],primary:"#0C2340",secondary:"#BD3039",accent:"#FFFFFF"},
  {aliases:["chicago cubs","cubs","chc"],primary:"#0E3386",secondary:"#CC3433",accent:"#FFFFFF"},
  {aliases:["chicago white sox","white sox","chw","cws"],primary:"#27251F",secondary:"#C4CED4",accent:"#FFFFFF"},
  {aliases:["cincinnati reds","reds","cin"],primary:"#C6011F",secondary:"#000000",accent:"#FFFFFF"},
  {aliases:["cleveland guardians","guardians","cle"],primary:"#00385D",secondary:"#E50022",accent:"#FFFFFF"},
  {aliases:["colorado rockies","rockies","col"],primary:"#33006F",secondary:"#C4CED4",accent:"#000000"},
  {aliases:["detroit tigers","tigers","det"],primary:"#0C2340",secondary:"#FA4616",accent:"#FFFFFF"},
  {aliases:["houston astros","astros","hou"],primary:"#002D62",secondary:"#EB6E1F",accent:"#F4911E"},
  {aliases:["kansas city royals","royals","kc","kcr"],primary:"#004687",secondary:"#BD9B60",accent:"#FFFFFF"},
  {aliases:["los angeles angels","la angels","angels","laa"],primary:"#BA0021",secondary:"#003263",accent:"#C4CED4"},
  {aliases:["los angeles dodgers","la dodgers","dodgers","lad"],primary:"#005A9C",secondary:"#EF3E42",accent:"#FFFFFF"},
  {aliases:["miami marlins","marlins","mia"],primary:"#00A3E0",secondary:"#EF3340",accent:"#000000"},
  {aliases:["milwaukee brewers","brewers","mil"],primary:"#12284B",secondary:"#FFC52F",accent:"#FFFFFF"},
  {aliases:["minnesota twins","twins","min"],primary:"#002B5C",secondary:"#D31145",accent:"#B9975B"},
  {aliases:["new york mets","ny mets","mets","nym"],primary:"#002D72",secondary:"#FF5910",accent:"#FFFFFF"},
  {aliases:["new york yankees","ny yankees","yankees","nyy"],primary:"#0C2340",secondary:"#C4CED4",accent:"#FFFFFF"},
  {aliases:["athletics","a's","as","oakland athletics","sacramento athletics","ath","oak"],primary:"#003831",secondary:"#EFB21E",accent:"#FFFFFF"},
  {aliases:["philadelphia phillies","phillies","phi"],primary:"#E81828",secondary:"#002D72",accent:"#FFFFFF"},
  {aliases:["pittsburgh pirates","pirates","pit"],primary:"#27251F",secondary:"#FDB827",accent:"#FFFFFF"},
  {aliases:["san diego padres","padres","sd","sdp"],primary:"#2F241D",secondary:"#FFC425",accent:"#FFFFFF"},
  {aliases:["san francisco giants","sf giants","giants","sf","sfg"],primary:"#27251F",secondary:"#FD5A1E",accent:"#EFD19F"},
  {aliases:["seattle mariners","mariners","sea"],primary:"#0C2C56",secondary:"#005C5C",accent:"#C4CED4"},
  {aliases:["st louis cardinals","st. louis cardinals","cardinals","stl"],primary:"#0C2340",secondary:"#C41E3A",accent:"#FEDB00"},
  {aliases:["tampa bay rays","rays","tb","tbr"],primary:"#092C5C",secondary:"#8FBCE6",accent:"#F5D130"},
  {aliases:["texas rangers","rangers","tex"],primary:"#003278",secondary:"#C0111F",accent:"#FFFFFF"},
  {aliases:["toronto blue jays","blue jays","tor"],primary:"#134A8E",secondary:"#E8291C",accent:"#FFFFFF"},
  {aliases:["washington nationals","nationals","wsh","was"],primary:"#14225A",secondary:"#AB0003",accent:"#FFFFFF"}
];

const OUTCOMES = [
  {id:"1B", label:"Single", code:"1B", hit:1, bases:1, ab:true},
  {id:"2B", label:"Double", code:"2B", hit:1, bases:2, ab:true},
  {id:"3B", label:"Triple", code:"3B", hit:1, bases:3, ab:true},
  {id:"HR", label:"Home Run", code:"HR", hit:1, bases:4, ab:true, hr:1},
  {id:"BB", label:"Walk", code:"BB", bb:1, ab:false},
  {id:"IBB", label:"Intentional Walk", code:"IBB", bb:1, ab:false},
  {id:"HBP", label:"Hit by Pitch", code:"HBP", ab:false},
  {id:"ROE", label:"Reached on Error", code:"E", ab:true},
  {id:"FC", label:"Fielder’s Choice", code:"FC", ab:true},
  {id:"CI", label:"Catcher Interference", code:"CI", ab:false},
  {id:"D3K", label:"Third Strike Not Caught", code:"K+", k:1, ab:true},
  {id:"K", label:"Strikeout Swinging", code:"K", k:1, ab:true, out:true},
  {id:"KL", label:"Strikeout Looking", code:"ꓘ", k:1, ab:true, out:true},
  {id:"GO", label:"Groundout", code:"GO", ab:true, out:true},
  {id:"FO", label:"Flyout", code:"FO", ab:true, out:true},
  {id:"LO", label:"Lineout", code:"LO", ab:true, out:true},
  {id:"PO", label:"Popout", code:"PO", ab:true, out:true},
  {id:"SF", label:"Sacrifice Fly", code:"SF", ab:false, out:true},
  {id:"SH", label:"Sacrifice Bunt", code:"SAC", ab:false, out:true},
  {id:"DP", label:"Double Play", code:"DP", ab:true, out:true},
  {id:"TP", label:"Triple Play", code:"TP", ab:true, out:true},
  {id:"OBS", label:"Reached on Obstruction", code:"OBS", ab:false},
  {id:"OTHER", label:"Other / Custom Play", code:"OTH", ab:false}
];
const OUTCOME_MAP = Object.fromEntries(OUTCOMES.map(o => [o.id, o]));
const QUICK_RESULTS = [
  ["1B","Single"],["2B","Double"],["3B","Triple"],["HR","Home Run"],
  ["BB","Walk"],["HBP","Hit by Pitch"],["K","Strikeout"],["KL","Looking K"],
  ["GO","Groundout"],["FO","Flyout"],["LO","Lineout"],["PO","Popout"],
  ["ROE","Error"],["FC","Fielder’s Choice"],["SF","Sac Fly"],["SH","Sac Bunt"],
  ["DP","Double Play"],["IBB","Intentional Walk"],["OTHER","Other / Details"]
];
const DESTINATIONS = [
  ["empty","No runner"], ["hold","Stayed"], ["1","First base"], ["2","Second base"], ["3","Third base"], ["home","Scored"], ["out","Out"]
];
const BATTER_DESTINATIONS = [["out","Out"],["1","First base"],["2","Second base"],["3","Third base"],["home","Home / scored"]];
const PITCH_TYPE_INFO = {
  ball:{code:"B",label:"Ball",ball:true},
  strike:{code:"S",label:"Strike",strike:true},
  swingingStrike:{code:"SW",label:"Swinging Strike",strike:true},
  calledStrike:{code:"C",label:"Called Strike",strike:true},
  foul:{code:"F",label:"Foul",strike:true},
  inplay:{code:"IP",label:"In Play",strike:true},
  hitByPitch:{code:"HBP",label:"Hit By Pitch",hbp:true}
};
const BALL_IN_PLAY_OUTCOMES = new Set(["1B","2B","3B","HR","ROE","FC","GO","FO","LO","PO","SF","SH","DP","TP"]);
const $ = id => document.getElementById(id);
const deepClone = obj => JSON.parse(JSON.stringify(obj));
const makeId = () => globalThis.crypto?.randomUUID?.() || `play-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const sum = values => values.reduce((a,b)=>a+num(b),0);
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
function normalizeTeamColorName(value){return String(value||"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim();}
function hexToRgb(hex){const clean=String(hex||"").replace("#","");return {r:parseInt(clean.slice(0,2),16)||0,g:parseInt(clean.slice(2,4),16)||0,b:parseInt(clean.slice(4,6),16)||0};}
function rgbToHex({r,g,b}){return `#${[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("")}`.toUpperCase();}
function mixHex(a,b,amount){const x=hexToRgb(a),y=hexToRgb(b),t=Math.max(0,Math.min(1,amount));return rgbToHex({r:x.r+(y.r-x.r)*t,g:x.g+(y.g-x.g)*t,b:x.b+(y.b-x.b)*t});}
function colorLuminance(hex){const {r,g,b}=hexToRgb(hex),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(r)+.7152*f(g)+.0722*f(b);}
function contrastText(hex){return colorLuminance(hex)>.48?"#241B16":"#FFFFFF";}
function scorecardPaletteForHomeTeam(teamName){
  const key=normalizeTeamColorName(teamName),matched=MLB_TEAM_COLOR_RECORDS.find(item=>item.aliases.some(alias=>normalizeTeamColorName(alias)===key)),record=matched||DEFAULT_SCORECARD_COLORS;
  const primary=record.primary,secondary=record.secondary,accent=record.accent;
  return {team:matched?String(teamName):"Default",primary,secondary,accent,onPrimary:contrastText(primary),onSecondary:contrastText(secondary),text:colorLuminance(primary)<.5?primary:"#241B16",cream:mixHex(accent,"#FFFFFF",.91),light:mixHex(secondary,"#FFFFFF",.89),alternate:mixHex(primary,"#FFFFFF",.93),yellow:mixHex(accent,"#FFFFFF",.78),grid:mixHex(primary,"#FFFFFF",.63),gridDark:mixHex(primary,"#FFFFFF",.38)};
}
function paletteStatusText(teamName){const palette=scorecardPaletteForHomeTeam(teamName);return palette.team==="Default"?"Default Guariglia palette":`${teamName} home-team palette`;}

let uploadedTemplateBuffer = null;
let uploadedTemplateName = "";
let scheduleGames = [];
let scheduleRequestToken = 0;
let autosaveTimer = null;
let deferredInstallPrompt = null;

function emptyBases(){ return {1:null,2:null,3:null}; }
function initialCount(){ return {balls:0,strikes:0,pitches:0,history:[],pendingStrikeout:false,inPlay:false,sessionId:""}; }
function normalizeCount(value={}){
  const count=initialCount();
  count.balls=Math.max(0,Math.min(4,num(value.balls)));
  count.strikes=Math.max(0,Math.min(3,num(value.strikes)));
  count.pitches=Math.max(0,num(value.pitches));
  count.history=Array.isArray(value.history)?value.history.map(item=>String(item)):[];
  count.pendingStrikeout=Boolean(value.pendingStrikeout);
  count.inPlay=Boolean(value.inPlay);
  count.sessionId=String(value.sessionId||"");
  return count;
}
function initialScoring(){
  return {inning:1,half:"top",outs:0,bases:emptyBases(),battingIndexes:{away:0,home:0},plays:[],nextSeq:1,count:initialCount(),pitchLog:[],nextPitchSeq:1,pitchLogVersion:1,activePitchers:{away:0,home:0},lastAutoStrikeoutPlayId:""};
}
function ensureScoringState(){
  if(!scoring||typeof scoring!=="object")scoring=initialScoring();
  const needsLegacyPitchImport=!Array.isArray(scoring.pitchLog)&&!scoring.pitchLogVersion;
  scoring.count=normalizeCount(scoring.count||{});
  scoring.bases=scoring.bases||emptyBases();
  scoring.battingIndexes=scoring.battingIndexes||{away:0,home:0};
  scoring.plays=Array.isArray(scoring.plays)?scoring.plays:[];
  scoring.pitchLog=Array.isArray(scoring.pitchLog)?scoring.pitchLog:[];
  scoring.nextPitchSeq=Math.max(1,num(scoring.nextPitchSeq)||1,...scoring.pitchLog.map(event=>num(event.seq)+1));
  scoring.pitchLogVersion=1;
  scoring.activePitchers={away:Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.away))),home:Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.home)))};
  scoring.lastAutoStrikeoutPlayId=String(scoring.lastAutoStrikeoutPlayId||"");
  if(needsLegacyPitchImport)reconstructLegacyPitchLog();
}
let scoring = initialScoring();

function createLineupInputs(team){
  const wrap = $(`${team}LineupInputs`); wrap.innerHTML="";
  const caption=document.createElement("div"); caption.className="input-caption"; caption.textContent="# / Name / Pos / Bats / AVG / OBP"; wrap.appendChild(caption);
  for(let i=1;i<=LINEUP_ROWS;i++){
    const row=document.createElement("div"); row.className="lineup-row responsive-entry-row";
    row.innerHTML=`
      <span class="row-number" aria-label="Batting order ${i}">${i}</span>
      <label class="mini-field number-field"><span>No.</span><input id="${team}Num${i}" placeholder="#" aria-label="${team} player ${i} number" autocomplete="off"></label>
      <label class="mini-field name-field"><span>Player name</span><input id="${team}Player${i}" placeholder="Player name" aria-label="${team} player ${i} name" autocomplete="off"></label>
      <label class="mini-field"><span>Position</span><input id="${team}Pos${i}" placeholder="Pos" aria-label="${team} player ${i} position" autocomplete="off"></label>
      <label class="mini-field"><span>Bats</span><input id="${team}Bats${i}" placeholder="Bats" aria-label="${team} player ${i} bats" autocomplete="off"></label>
      <label class="mini-field"><span>AVG</span><input id="${team}Avg${i}" placeholder="AVG" aria-label="${team} player ${i} average" autocomplete="off"></label>
      <label class="mini-field"><span>OBP</span><input id="${team}Obp${i}" placeholder="OBP" aria-label="${team} player ${i} on base percentage" autocomplete="off"></label>`;
    wrap.appendChild(row);
  }
}
function createPitcherInputs(team){
  const wrap=$(`${team}PitcherInputs`); wrap.innerHTML="";
  const caption=document.createElement("div"); caption.className="input-caption"; caption.textContent="# / Name / Throws / Record / ERA / K"; wrap.appendChild(caption);
  for(let i=1;i<=PITCHER_ROWS;i++){
    const row=document.createElement("div"); row.className="pitcher-row responsive-entry-row";
    row.innerHTML=`
      <span class="row-number" aria-label="Pitcher row ${i}">${i}</span>
      <label class="mini-field number-field"><span>No.</span><input id="${team}PitcherNum${i}" placeholder="#" aria-label="${team} pitcher ${i} number" autocomplete="off"></label>
      <label class="mini-field name-field"><span>Pitcher name</span><input id="${team}Pitcher${i}" placeholder="Pitcher name" aria-label="${team} pitcher ${i} name" autocomplete="off"></label>
      <label class="mini-field"><span>Throws</span><input id="${team}PitcherThrows${i}" placeholder="Throws" aria-label="${team} pitcher ${i} throws" autocomplete="off"></label>
      <label class="mini-field"><span>Record</span><input id="${team}PitcherRecord${i}" placeholder="Record" aria-label="${team} pitcher ${i} record" autocomplete="off"></label>
      <label class="mini-field"><span>ERA</span><input id="${team}PitcherEra${i}" placeholder="ERA" aria-label="${team} pitcher ${i} ERA" autocomplete="off"></label>
      <label class="mini-field"><span>K</span><input id="${team}PitcherK${i}" placeholder="K" aria-label="${team} pitcher ${i} strikeouts" autocomplete="off"></label>`;
    wrap.appendChild(row);
  }
}
function getField(id){ return $(id)?.value?.trim() || ""; }
function setField(id,value){ if($(id)) $(id).value=value ?? ""; }
function collectTeam(team){
  const lineup=[]; const pitchers=[];
  for(let i=1;i<=LINEUP_ROWS;i++) lineup.push({num:getField(`${team}Num${i}`),name:getField(`${team}Player${i}`),pos:getField(`${team}Pos${i}`),bats:getField(`${team}Bats${i}`),avg:getField(`${team}Avg${i}`),obp:getField(`${team}Obp${i}`)});
  for(let i=1;i<=PITCHER_ROWS;i++) pitchers.push({num:getField(`${team}PitcherNum${i}`),name:getField(`${team}Pitcher${i}`),throws:getField(`${team}PitcherThrows${i}`),record:getField(`${team}PitcherRecord${i}`),era:getField(`${team}PitcherEra${i}`),k:getField(`${team}PitcherK${i}`)});
  return {lineup,pitchers};
}
function collectData(){
  return {awayTeam:getField("awayTeam"),homeTeam:getField("homeTeam"),awayRecord:getField("awayRecord"),homeRecord:getField("homeRecord"),gameDate:getField("gameDate"),gameTime:getField("gameTime"),venue:getField("venue"),gameNumber:getField("gameNumber"),weather:getField("weather"),umpires:getField("umpires"),broadcast:getField("broadcast"),radio:getField("radio"),gameNotes:getField("gameNotes"),away:collectTeam("away"),home:collectTeam("home")};
}
function setFieldsFromData(data={}){
  ["awayTeam","homeTeam","awayRecord","homeRecord","gameDate","gameTime","venue","gameNumber","weather","umpires","broadcast","radio","gameNotes"].forEach(id=>setField(id,data[id]||""));
  ["away","home"].forEach(team=>{
    const t=data[team]||{};
    for(let x=0;x<LINEUP_ROWS;x++){const p=(t.lineup||[])[x]||{},i=x+1;setField(`${team}Num${i}`,p.num);setField(`${team}Player${i}`,p.name);setField(`${team}Pos${i}`,p.pos);setField(`${team}Bats${i}`,p.bats);setField(`${team}Avg${i}`,p.avg);setField(`${team}Obp${i}`,p.obp);}
    for(let x=0;x<PITCHER_ROWS;x++){const p=(t.pitchers||[])[x]||{},i=x+1;setField(`${team}PitcherNum${i}`,p.num);setField(`${team}Pitcher${i}`,p.name);setField(`${team}PitcherThrows${i}`,p.throws);setField(`${team}PitcherRecord${i}`,p.record);setField(`${team}PitcherEra${i}`,p.era);setField(`${team}PitcherK${i}`,p.k);}
  });
  refreshAll();
}
function formatPlayer(player,index){
  const name=player.name||`Batter ${index+1}`; const detail=[player.num?`#${String(player.num).replace(/^#/,"")}`:"",player.pos,player.bats].filter(Boolean).join(" • ");
  return {name,detail};
}
function formatLineupPlayer(p){
  const left=[p.num?`#${String(p.num).replace(/^#/,"")}`:"",p.name].filter(Boolean).join(" ");
  const details=[p.pos,p.bats,[p.avg,p.obp].filter(Boolean).join("/")].filter(Boolean);
  return [left,...details].filter(Boolean).join(" — ");
}
function formatPitcher(p){
  const left=[p.num?`#${String(p.num).replace(/^#/,"")}`:"",p.name].filter(Boolean).join(" ");
  const details=[p.throws,p.record,p.era?`${String(p.era).replace(/\s*ERA$/i,"")} ERA`:"",p.k?`${String(p.k).replace(/\s*K$/i,"")} K`:""].filter(Boolean);
  return [left,...details].filter(Boolean).join(" — ");
}
function setPanel(id,{preserveScroll=false}={}){
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===id));
  document.querySelectorAll(".step").forEach(b=>b.classList.toggle("active",b.dataset.panel===id));
  if(id==="summary") renderSummary();
  if(id==="pitchTracking") renderPitchTracking();
  if(id==="scoring") renderScoring();
  if(!preserveScroll) window.scrollTo({top:0,behavior:"smooth"});
}
function teamName(team){ const d=collectData(); return d[`${team}Team`] || (team==="away"?"Away":"Home"); }
function battingTeamForHalf(half){ return half==="top"?"away":"home"; }
function currentBattingTeam(){ return battingTeamForHalf(scoring.half); }
function runnerFor(team,index){ const d=collectData(),p=d[team].lineup[index]||{}; return {id:`${team}-${index}`,team,playerIndex:index,name:p.name||`Batter ${index+1}`}; }
function playsForSlot(team,playerIndex,paIndex){ return scoring.plays.find(p=>p.team===team&&p.playerIndex===playerIndex&&p.paIndex===paIndex); }
function outcomeOptions(selected="",compact=false,displayText=""){
  return `<option value=""></option>`+OUTCOMES.map(o=>{const text=o.id===selected&&displayText?displayText:(compact?o.code:`${o.code} - ${o.label}`);return `<option value="${o.id}" ${o.id===selected?"selected":""}>${escapeHtml(text)}</option>`;}).join("");
}
function defensiveTeamForBattingTeam(battingTeam){ return battingTeam==="away"?"home":"away"; }
function pitcherKey(team,row,name=""){
  const clean=String(name||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  return Number.isInteger(row)&&row>=0?`${team}:row:${row}`:`${team}:name:${clean||"unknown"}`;
}
function pitcherInfoFromRow(team,row){
  const data=collectData(),pitcher=data[team]?.pitchers?.[row]||{};
  return {team,row,key:pitcherKey(team,row,pitcher.name),name:pitcher.name||`${teamName(team)} Pitcher ${row+1}`,number:pitcher.num||"",throws:pitcher.throws||""};
}
function resolvePitcherInfo(team,name=""){
  const target=String(name||"").trim().toLowerCase(),data=collectData();
  const row=(data[team]?.pitchers||[]).findIndex(p=>String(p.name||"").trim().toLowerCase()===target&&target);
  if(row>=0)return pitcherInfoFromRow(team,row);
  const fallbackRow=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.[team])));
  if(!target)return pitcherInfoFromRow(team,fallbackRow);
  return {team,row:-1,key:pitcherKey(team,-1,name),name:String(name).trim(),number:"",throws:""};
}
function activePitcherInfo(battingTeam=currentBattingTeam()){
  ensureScoringState();
  const team=defensiveTeamForBattingTeam(battingTeam),row=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers[team])));
  return pitcherInfoFromRow(team,row);
}
function pitchCountAfter(history=[]){
  const out={balls:0,strikes:0,pitches:0,inPlay:false,pendingStrikeout:false};
  history.forEach(type=>{
    out.pitches++;
    if(type==="ball")out.balls=Math.min(4,out.balls+1);
    else if(["strike","swingingStrike","calledStrike"].includes(type))out.strikes=Math.min(3,out.strikes+1);
    else if(type==="foul"&&out.strikes<2)out.strikes++;
    else if(type==="inplay")out.inPlay=true;
  });
  out.pendingStrikeout=out.strikes>=3;
  return out;
}
function pitchEventFrom(type,before,after,overrides={}){
  const battingTeam=overrides.battingTeam||currentBattingTeam();
  const pitching=overrides.pitcherInfo||activePitcherInfo(battingTeam);
  const batterIndex=Number.isInteger(overrides.batterIndex)?overrides.batterIndex:(scoring.battingIndexes[battingTeam]||0);
  const batter=collectData()[battingTeam]?.lineup?.[batterIndex]||{};
  return {id:makeId(),seq:scoring.nextPitchSeq++,sessionId:overrides.sessionId||scoring.count.sessionId||"",type,code:PITCH_TYPE_INFO[type]?.code||String(type).toUpperCase(),label:PITCH_TYPE_INFO[type]?.label||String(type),inning:overrides.inning||scoring.inning,half:overrides.half||scoring.half,battingTeam,pitchingTeam:pitching.team,pitcherKey:pitching.key,pitcherRow:pitching.row,pitcherName:pitching.name,pitcherNumber:pitching.number||"",batterTeam:battingTeam,batterIndex,batterName:overrides.batterName||batter.name||`Batter ${batterIndex+1}`,countBefore:{balls:num(before?.balls),strikes:num(before?.strikes)},countAfter:{balls:num(after?.balls),strikes:num(after?.strikes)},recordedAt:overrides.recordedAt||new Date().toISOString()};
}
function appendPitchLogEvent(type,before,after,overrides={}){
  ensureScoringState();
  const event=pitchEventFrom(type,before,after,overrides);
  scoring.pitchLog.push(event);
  return event;
}
function removeCurrentPitchSessionEvents(){
  ensureScoringState();
  const sessionId=scoring.count.sessionId;
  if(sessionId)scoring.pitchLog=scoring.pitchLog.filter(event=>event.sessionId!==sessionId);
}
function reconstructLegacyPitchLog(){
  if(!Array.isArray(scoring.pitchLog))scoring.pitchLog=[];
  let seq=1;
  const data=collectData();
  const addHistory=(history,meta)=>{
    let before={balls:0,strikes:0};
    for(const type of history||[]){
      const after=pitchCountAfter([...(meta.processed||[]),type]);
      const pitcherTeam=defensiveTeamForBattingTeam(meta.battingTeam),pitcher=resolvePitcherInfo(pitcherTeam,meta.pitcherName||"");
      scoring.nextPitchSeq=seq;
      const event=pitchEventFrom(type,before,after,{sessionId:meta.sessionId,battingTeam:meta.battingTeam,batterIndex:meta.batterIndex,batterName:meta.batterName,pitcherInfo:pitcher,inning:meta.inning,half:meta.half,recordedAt:meta.recordedAt});
      scoring.pitchLog.push(event);seq=event.seq+1;before={balls:after.balls,strikes:after.strikes};meta.processed=(meta.processed||[]).concat(type);
    }
  };
  [...scoring.plays].sort((a,b)=>a.seq-b.seq).forEach(play=>{const sessionId=play.pitchCount?.sessionId||`legacy-play-${play.id}`;play.pitchSessionId=sessionId;play.pitchCount={...(play.pitchCount||{}),sessionId};const pitchingTeam=defensiveTeamForBattingTeam(play.team),resolved=resolvePitcherInfo(pitchingTeam,play.pitcher||"");play.pitchingTeam=pitchingTeam;play.pitcherKey=resolved.key;play.pitcherRow=resolved.row;addHistory(play.pitchCount?.history||[],{sessionId,battingTeam:play.team,batterIndex:play.playerIndex,batterName:play.playerName,pitcherName:play.pitcher,inning:play.inning,half:play.half,recordedAt:play.recordedAt||new Date(0).toISOString()});});
  if(scoring.count.history.length){const sessionId=scoring.count.sessionId||`legacy-current-${Date.now()}`;scoring.count.sessionId=sessionId;addHistory(scoring.count.history,{sessionId,battingTeam:currentBattingTeam(),batterIndex:scoring.battingIndexes[currentBattingTeam()]||0,batterName:data[currentBattingTeam()]?.lineup?.[scoring.battingIndexes[currentBattingTeam()]||0]?.name||"",pitcherName:activePitcherInfo().name,inning:scoring.inning,half:scoring.half,recordedAt:new Date().toISOString()});}
  scoring.nextPitchSeq=Math.max(seq,1);
}
function currentPaIndex(team,playerIndex){
  for(let i=0;i<PA_SLOTS;i++)if(!playsForSlot(team,playerIndex,i))return i;
  return PA_SLOTS-1;
}
function countSnapshot(){
  ensureScoringState();
  return {balls:scoring.count.balls,strikes:scoring.count.strikes,pitches:scoring.count.pitches,history:[...scoring.count.history],sessionId:scoring.count.sessionId||""};
}
function countLabel(count=scoring.count){ return `${num(count?.balls)}-${num(count?.strikes)}`; }
function pitchSequenceLabel(history=[]){
  const labels={ball:"B",strike:"S",swingingStrike:"SW",calledStrike:"C",foul:"F",inplay:"IP",hitByPitch:"HBP"};
  return history.map(item=>labels[item]||String(item).toUpperCase()).join(" ");
}
function renderQuickResults(){
  const wrap=$("quickResultGrid");
  if(!wrap)return;
  wrap.innerHTML=QUICK_RESULTS.map(([id,label])=>`<button type="button" class="quick-result-button" data-quick-outcome="${id}"><strong>${escapeHtml(OUTCOME_MAP[id]?.code||id)}</strong><span>${escapeHtml(label)}</span></button>`).join("");
}
function renderPitchConsole(message=""){
  ensureScoringState();
  const count=scoring.count;
  const correctionPlay=scoring.lastAutoStrikeoutPlayId?scoring.plays.find(play=>play.id===scoring.lastAutoStrikeoutPlayId):null;
  if(scoring.lastAutoStrikeoutPlayId&&!correctionPlay)scoring.lastAutoStrikeoutPlayId="";
  renderActivePitcherSelect();
  if($("ballCount"))$("ballCount").textContent=count.balls;
  if($("strikeCount"))$("strikeCount").textContent=count.strikes;
  if($("pitchTotalLabel"))$("pitchTotalLabel").textContent=`${count.pitches} pitch${count.pitches===1?"":"es"} this plate appearance`;
  const status=$("pitchStatus");
  if(status){
    const sequence=pitchSequenceLabel(count.history);
    const correctionMessage=correctionPlay?`${correctionPlay.outcome==="KL"?"Looking":"Swinging"} strikeout recorded. Use “Third strike not caught” only if the catcher did not legally catch strike three.`:"";
    status.textContent=message || correctionMessage || (count.inPlay?"Ball is in play. Choose the result code below.":sequence?`Pitch sequence: ${sequence}`:"Ready for the first pitch.");
  }
  if($("strikeoutChooser"))$("strikeoutChooser").hidden=!correctionPlay;
  if($("undoPitchBtn"))$("undoPitchBtn").disabled=!count.history.length;
  if($("resetCountBtn"))$("resetCountBtn").disabled=!(count.history.length||count.balls||count.strikes||count.inPlay);
  document.querySelectorAll("[data-pitch]").forEach(button=>button.disabled=false);
}
function resetCurrentCount(message="Count reset to 0-0."){
  removeCurrentPitchSessionEvents();
  scoring.lastAutoStrikeoutPlayId="";
  scoring.count=initialCount();
  renderScoreboard();
  renderPitchConsole(message);
  renderPitchTracking();
  scheduleAutosave("Pitch count reset");
}
function undoPitch(){
  ensureScoringState();
  if(!scoring.count.history.length)return;
  const sessionId=scoring.count.sessionId;
  scoring.count.history.pop();
  for(let i=scoring.pitchLog.length-1;i>=0;i--){if(scoring.pitchLog[i].sessionId===sessionId){scoring.pitchLog.splice(i,1);break;}}
  const recalculated=pitchCountAfter(scoring.count.history);
  scoring.count.balls=recalculated.balls;scoring.count.strikes=recalculated.strikes;scoring.count.pitches=recalculated.pitches;scoring.count.pendingStrikeout=recalculated.pendingStrikeout;scoring.count.inPlay=recalculated.inPlay;
  if(!scoring.count.history.length)scoring.count.sessionId="";
  renderScoreboard();
  renderPitchConsole("Last pitch removed.");
  renderPitchTracking();
  scheduleAutosave("Pitch removed");
}
function appendPitch(type,{allowAutomaticOutcome=true}={}){
  ensureScoringState();
  const count=scoring.count;
  if(!count.history.length&&scoring.lastAutoStrikeoutPlayId)scoring.lastAutoStrikeoutPlayId="";
  if(count.pendingStrikeout&&allowAutomaticOutcome)return false;
  if(!count.sessionId)count.sessionId=makeId();
  const before={balls:count.balls,strikes:count.strikes};
  count.history.push(type);count.pitches++;count.inPlay=false;
  if(type==="ball")count.balls=Math.min(4,count.balls+1);
  else if(["strike","swingingStrike","calledStrike"].includes(type))count.strikes=Math.min(3,count.strikes+1);
  else if(type==="foul"&&count.strikes<2)count.strikes++;
  else if(type==="inplay")count.inPlay=true;
  const after={balls:count.balls,strikes:count.strikes};
  appendPitchLogEvent(type,before,after,{sessionId:count.sessionId});
  if(count.strikes>=3)count.pendingStrikeout=true;
  renderPitchTracking();
  return true;
}
function addPitch(type){
  if(!appendPitch(type))return;
  const count=scoring.count;
  if(type==="ball"&&count.balls>=4){recordQuickOutcome("BB",true,true);return;}
  if(["strike","swingingStrike","calledStrike"].includes(type)&&count.strikes>=3){
    const outcomeId=type==="calledStrike"?"KL":"K";
    const play=recordQuickOutcome(outcomeId,true,true);
    if(play){scoring.lastAutoStrikeoutPlayId=play.id;renderPitchConsole(`${outcomeId==="KL"?"Looking":"Swinging"} strikeout recorded automatically.`);scheduleAutosave("Automatic strikeout recorded");}
    return;
  }
  if(type==="inplay")setQuickResultsVisible(true);
  renderScoreboard();
  renderPitchConsole();
  scheduleAutosave("Pitch recorded");
}
function prepareTerminalPitch(outcomeId){
  ensureScoringState();
  const last=scoring.count.history.at(-1);
  if(outcomeId==="HBP"&&last!=="hitByPitch")appendPitch("hitByPitch",{allowAutomaticOutcome:false});
  else if(BALL_IN_PLAY_OUTCOMES.has(outcomeId)&&last!=="inplay")appendPitch("inplay",{allowAutomaticOutcome:false});
  else if(outcomeId==="K"&&scoring.count.strikes===2&&!scoring.count.pendingStrikeout)appendPitch("swingingStrike",{allowAutomaticOutcome:false});
  else if(outcomeId==="KL"&&scoring.count.strikes===2&&!scoring.count.pendingStrikeout)appendPitch("calledStrike",{allowAutomaticOutcome:false});
  else if(outcomeId==="BB"&&scoring.count.balls===3)appendPitch("ball",{allowAutomaticOutcome:false});
}
function outcomeCanQuickSave(outcomeId){
  const basesOccupied=Boolean(scoring.bases[1]||scoring.bases[2]||scoring.bases[3]);
  if(["BB","IBB","HBP","K","KL"].includes(outcomeId))return true;
  return !basesOccupied&&["1B","2B","3B","HR","GO","FO","LO","PO"].includes(outcomeId);
}
function recordQuickOutcome(outcomeId,forceDirect=false,skipPitchPreparation=false){
  ensureScoringState();
  if(outcomeId!=="D3K")scoring.lastAutoStrikeoutPlayId="";
  if(!skipPitchPreparation)prepareTerminalPitch(outcomeId);
  const team=currentBattingTeam(),playerIndex=scoring.battingIndexes[team]||0,paIndex=currentPaIndex(team,playerIndex);
  if(outcomeId==="D3K"||outcomeId==="OTHER"||(!forceDirect&&!outcomeCanQuickSave(outcomeId))){
    openPlayDialog(team,playerIndex,paIndex,outcomeId);
    return null;
  }
  const defaults=defaultDetails(outcomeId,team,playerIndex).d;
  const incoming={team,playerIndex,paIndex,outcome:outcomeId,pitcher:currentPitcherName(team),inning:scoring.inning,half:scoring.half,runs:defaults.runs,rbi:defaults.rbi,outsOnPlay:defaults.outs,errors:defaults.errors,destinations:{batter:defaults.batter,r1:defaults.r1,r2:defaults.r2,r3:defaults.r3},notes:""};
  return commitPlay(incoming,"");
}
function handleQuickOutcome(outcomeId){
  recordQuickOutcome(outcomeId,false);
}
function openDroppedThirdStrikeCorrection(play){
  const defaults=defaultDetails("D3K",play.team,play.playerIndex,play.beforeState?.bases||emptyBases(),play.beforeState?.outs??0).d;
  const replacement={...play,outcome:"D3K",outcomeCode:OUTCOME_MAP.D3K.code,runs:defaults.runs,rbi:defaults.rbi,outsOnPlay:defaults.outs,errors:defaults.errors,destinations:{batter:defaults.batter,r1:defaults.r1,r2:defaults.r2,r3:defaults.r3},notes:[play.notes,"Third strike not caught"].filter(Boolean).join("; ")};
  openPlayDialog(play.team,play.playerIndex,play.paIndex,"D3K",replacement);
}
function handleTerminalStrikeout(outcomeId){
  if(outcomeId==="dismiss"){scoring.lastAutoStrikeoutPlayId="";renderPitchConsole("Strikeout confirmed.");scheduleAutosave("Strikeout confirmed");return;}
  if(outcomeId==="D3K"){
    const play=scoring.plays.find(item=>item.id===scoring.lastAutoStrikeoutPlayId);
    if(play)openDroppedThirdStrikeCorrection(play);
    return;
  }
  recordQuickOutcome(outcomeId,true);
}
function setQuickResultsVisible(visible){
  const grid=$("quickResultGrid"),button=$("toggleQuickResultsBtn");
  if(!grid||!button)return;
  const show=Boolean(visible);
  grid.hidden=!show;
  grid.classList.toggle("is-collapsed",!show);
  grid.setAttribute("aria-hidden",String(!show));
  if("inert" in grid)grid.inert=!show;
  button.setAttribute("aria-expanded",String(show));
  button.textContent=show?"Hide Codes":"Show Codes";
}
function toggleQuickResults(){
  const grid=$("quickResultGrid");
  if(!grid)return;
  const isVisible=!grid.hidden&&!grid.classList.contains("is-collapsed");
  setQuickResultsVisible(!isVisible);
}
function scoringPanelActive(){ return $("scoring")?.classList.contains("active"); }
function handleScoringKeyboard(event){
  if(!scoringPanelActive()||$("playDialog")?.open)return;
  const target=event.target;if(target&&target.closest&&target.closest("input,textarea,select,[contenteditable=true]"))return;
  const key=event.key.toLowerCase();
  if(scoring.lastAutoStrikeoutPlayId&&key==="d"){event.preventDefault();handleTerminalStrikeout("D3K");return;}
  const pitchKeys={b:"ball",s:"swingingStrike",c:"calledStrike",f:"foul",i:"inplay"};
  const resultKeys={"1":"1B","2":"2B","3":"3B","4":"HR",w:"BB",h:"HBP",k:"K",g:"GO",o:"FO",l:"LO",p:"PO",e:"ROE",x:"FC"};
  if(key==="backspace"){event.preventDefault();undoPitch();return;}
  if(pitchKeys[key]){event.preventDefault();addPitch(pitchKeys[key]);return;}
  if(resultKeys[key]){event.preventDefault();handleQuickOutcome(resultKeys[key]);}
}
function renderScoringGrid(team){
  const d=collectData(), stats=computeTeamStats(team); let html=`<table class="scoring-table"><thead><tr><th>Batter</th>`;
  for(let p=0;p<PA_SLOTS;p++) html+=`<th>PA ${p+1}</th>`;
  html+=`<th class="stat-cell">AB</th><th class="stat-cell">R</th><th class="stat-cell">H</th><th class="stat-cell">RBI</th></tr></thead><tbody>`;
  d[team].lineup.forEach((player,i)=>{
    const f=formatPlayer(player,i); html+=`<tr><td class="player-cell"><strong>${escapeHtml(f.name)}</strong><span>${escapeHtml(f.detail)}</span></td>`;
    for(let p=0;p<PA_SLOTS;p++){
      const play=playsForSlot(team,i,p),notation=play?playNotation(play):"",sizeClass=notation.length>7?"long-code":""; html+=`<td><select class="pa-select ${play?"has-play":""} ${sizeClass}" data-team="${team}" data-player="${i}" data-pa="${p}" aria-label="${escapeHtml(f.name)} plate appearance ${p+1}" title="${escapeHtml(notation||`Record plate appearance ${p+1}`)}">${outcomeOptions(play?.outcome||"",true,notation)}</select></td>`;
    }
    const s=stats[i]; html+=`<td class="stat-cell">${s.ab}</td><td class="stat-cell">${s.r}</td><td class="stat-cell">${s.h}</td><td class="stat-cell">${s.rbi}</td></tr>`;
  });
  html+=`</tbody></table>`; $(`${team}ScoringGrid`).innerHTML=html;
}
function renderScoring(){
  renderScoringGrid("away"); renderScoringGrid("home");
  document.querySelectorAll(".pa-select").forEach(select=>{
    select.addEventListener("change",e=>{ if(e.target.value) openPlayDialog(e.target.dataset.team,num(e.target.dataset.player),num(e.target.dataset.pa),e.target.value); else {const play=playsForSlot(e.target.dataset.team,num(e.target.dataset.player),num(e.target.dataset.pa));if(play&&confirm("Delete this recorded play?")) deletePlay(play.id);else renderScoring();} });
    select.addEventListener("pointerdown",e=>{const play=playsForSlot(e.currentTarget.dataset.team,num(e.currentTarget.dataset.player),num(e.currentTarget.dataset.pa));if(play){e.preventDefault();openPlayDialog(play.team,play.playerIndex,play.paIndex,play.outcome,play);}});
  });
  renderScoreboard();
  renderPitchConsole();
}
function renderScoreboard(){
  const totals=computeGameTotals();
  $("scoreAwayName").textContent=teamName("away"); $("scoreHomeName").textContent=teamName("home");
  $("scoreAwayRuns").textContent=totals.away.runs; $("scoreHomeRuns").textContent=totals.home.runs;
  $("inningLabel").textContent=`${scoring.half==="top"?"Top":"Bottom"} ${scoring.inning}`; $("outsLabel").textContent=`${scoring.outs} ${scoring.outs===1?"out":"outs"}`;
  [1,2,3].forEach(base=>$(base===1?"base1":base===2?"base2":"base3").classList.toggle("occupied",Boolean(scoring.bases[base])));
  const team=currentBattingTeam(), index=scoring.battingIndexes[team]||0, p=collectData()[team].lineup[index]||{};
  $("currentBatterName").textContent=p.name||`${teamName(team)} batter ${index+1}`;
  const paCount=scoring.plays.filter(x=>x.team===team&&x.playerIndex===index).length;
  ensureScoringState();
  $("currentBatterMeta").textContent=`${scoring.half==="top"?"Top":"Bottom"} ${scoring.inning} • batting ${index+1} • plate appearance ${paCount+1} • count ${countLabel()}`;
}
function fillDestinationSelect(id,options){ $(id).innerHTML=options.map(([v,l])=>`<option value="${v}">${l}</option>`).join(""); }
function defaultDetails(outcomeId,team,playerIndex,beforeBasesOverride=null,beforeOutsOverride=null){
  const o=OUTCOME_MAP[outcomeId]||OUTCOME_MAP.OTHER; const currentTeam=currentBattingTeam();
  const before=beforeBasesOverride?deepClone(beforeBasesOverride):(team===currentTeam?deepClone(scoring.bases):emptyBases());
  const outsBefore=beforeOutsOverride===null?num(scoring.outs):Math.max(0,num(beforeOutsOverride));
  const d={batter:"out",r1:before[1]?"hold":"empty",r2:before[2]?"hold":"empty",r3:before[3]?"hold":"empty",outs:o.out?1:0,runs:0,rbi:0,errors:0};
  if(o.bases===1){d.batter="1";if(before[1])d.r1="2";if(before[2])d.r2="3";if(before[3]){d.r3="home";d.runs++;d.rbi++;}}
  else if(o.bases===2){d.batter="2";if(before[1])d.r1="3";if(before[2]){d.r2="home";d.runs++;d.rbi++;}if(before[3]){d.r3="home";d.runs++;d.rbi++;}}
  else if(o.bases===3){d.batter="3";[1,2,3].forEach(b=>{if(before[b]){d[`r${b}`]="home";d.runs++;d.rbi++;}});}
  else if(o.bases===4){d.batter="home";d.runs=1;d.rbi=1;[1,2,3].forEach(b=>{if(before[b]){d[`r${b}`]="home";d.runs++;d.rbi++;}});}
  else if(["BB","IBB","HBP","CI","OBS"].includes(outcomeId)){
    d.batter="1";
    if(before[1]){d.r1="2";if(before[2]){d.r2="3";if(before[3]){d.r3="home";d.runs++;d.rbi++;}}}
  } else if(outcomeId==="D3K"){
    const batterMayRun=!before[1]||outsBefore>=2;
    if(!batterMayRun){d.batter="out";d.outs=1;}
    else{
      d.batter="1";d.outs=0;
      if(before[1]){d.r1="2";if(before[2]){d.r2="3";if(before[3]){d.r3="home";d.runs++;}}}
    }
  } else if(outcomeId==="ROE"){d.batter="1";d.errors=1;if(before[1])d.r1="2";if(before[2])d.r2="3";if(before[3])d.r3="home",d.runs++;}
  else if(outcomeId==="FC"){d.batter="1";if(before[1])d.r1="out";else if(before[2])d.r2="out";else if(before[3])d.r3="out";d.outs=1;}
  else if(outcomeId==="SF"){d.batter="out";d.outs=1;if(before[3]){d.r3="home";d.runs=1;d.rbi=1;}}
  else if(outcomeId==="SH"){d.batter="out";d.outs=1;if(before[3])d.r3="home",d.runs++;if(before[2])d.r2="3";if(before[1])d.r1="2";}
  else if(outcomeId==="DP"){d.batter="out";d.outs=2;if(before[1])d.r1="out";else if(before[2])d.r2="out";else if(before[3])d.r3="out";}
  else if(outcomeId==="TP"){d.batter="out";d.outs=3;[1,2,3].forEach(b=>{if(before[b])d[`r${b}`]="out";});}
  return {before,d};
}
function openPlayDialog(team,playerIndex,paIndex,outcomeId,existing=null){
  const data=collectData(),player=data[team].lineup[playerIndex]||{};
  $("dialogTeam").value=team;$("dialogPlayerIndex").value=playerIndex;$("dialogPaIndex").value=paIndex;$("dialogPlayId").value=existing?.id||"";
  ensureScoringState();
  $("dialogTitle").textContent=`${player.name||`Batter ${playerIndex+1}`} — PA ${paIndex+1} — ${existing?.pitchCount?countLabel(existing.pitchCount):countLabel()}`;
  $("playOutcome").innerHTML=OUTCOMES.map(o=>`<option value="${o.id}">${escapeHtml(o.code)} — ${escapeHtml(o.label)}</option>`).join("");
  fillDestinationSelect("batterDestination",BATTER_DESTINATIONS); ["runner1Destination","runner2Destination","runner3Destination"].forEach(id=>fillDestinationSelect(id,DESTINATIONS));
  const defaults=defaultDetails(outcomeId,team,playerIndex,existing?.beforeState?.bases||null,existing?.beforeState?.outs??null); const v=existing||{};
  $("playOutcome").value=v.outcome||outcomeId; $("playPitcher").value=v.pitcher||currentPitcherName(team); $("playInning").value=v.inning||scoring.inning; $("playHalf").value=v.half||(team==="away"?"top":"bottom");
  $("playRuns").value=v.runs??defaults.d.runs; $("playRbi").value=v.rbi??defaults.d.rbi; $("playOuts").value=v.outsOnPlay??defaults.d.outs; $("playErrors").value=v.errors??defaults.d.errors;
  $("batterDestination").value=v.destinations?.batter||defaults.d.batter; $("runner1Destination").value=v.destinations?.r1||defaults.d.r1; $("runner2Destination").value=v.destinations?.r2||defaults.d.r2; $("runner3Destination").value=v.destinations?.r3||defaults.d.r3; $("playNotes").value=v.notes||"";
  $("deletePlayBtn").hidden=!existing; $("playDialog").showModal();
}
function currentPitcherName(battingTeam){ return activePitcherInfo(battingTeam).name; }
function renderActivePitcherSelect(){
  const select=$("activePitcherSelect");if(!select)return;
  ensureScoringState();
  const battingTeam=currentBattingTeam(),pitchingTeam=defensiveTeamForBattingTeam(battingTeam),data=collectData();
  const selected=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers[pitchingTeam])));
  select.innerHTML=(data[pitchingTeam]?.pitchers||[]).map((p,index)=>`<option value="${index}">${escapeHtml([p.num?`#${String(p.num).replace(/^#/,"")}`:"",p.name||`Pitcher ${index+1}`].filter(Boolean).join(" "))}</option>`).join("");
  select.value=String(selected);
  if($("activePitcherTeamLabel"))$("activePitcherTeamLabel").textContent=`${teamName(pitchingTeam)} pitcher`;
}
function changeActivePitcher(){
  const pitchingTeam=defensiveTeamForBattingTeam(currentBattingTeam());
  scoring.activePitchers[pitchingTeam]=Math.max(0,Math.min(PITCHER_ROWS-1,num($("activePitcherSelect").value)));
  renderPitchConsole("Active pitcher changed. New pitches will be credited to this pitcher.");
  renderPitchTracking();
  scheduleAutosave("Active pitcher changed");
}

function getPlayFromDialog(){
  return {team:$("dialogTeam").value,playerIndex:num($("dialogPlayerIndex").value),paIndex:num($("dialogPaIndex").value),outcome:$("playOutcome").value,pitcher:getField("playPitcher"),inning:Math.max(1,num($("playInning").value)),half:$("playHalf").value,runs:Math.max(0,num($("playRuns").value)),rbi:Math.max(0,num($("playRbi").value)),outsOnPlay:Math.max(0,num($("playOuts").value)),errors:Math.max(0,num($("playErrors").value)),destinations:{batter:$("batterDestination").value,r1:$("runner1Destination").value,r2:$("runner2Destination").value,r3:$("runner3Destination").value},notes:getField("playNotes")};
}
function applyDestinations(beforeBases,team,playerIndex,destinations){
  const post=emptyBases(); const batter=runnerFor(team,playerIndex); const runners={r1:beforeBases[1],r2:beforeBases[2],r3:beforeBases[3],batter};
  const originalBase={r1:"1",r2:"2",r3:"3"};
  for(const [key,runner] of Object.entries(runners)){
    if(!runner) continue;
    const dest=destinations[key];
    if(dest==="hold"&&originalBase[key])post[originalBase[key]]=runner;
    else if(["1","2","3"].includes(dest))post[dest]=runner;
  }
  return post;
}
function nextHalfState(inning,half){ return half==="top"?{inning,half:"bottom"}:{inning:inning+1,half:"top"}; }
function buildAfterState(play,beforeState){
  const outs=beforeState.outs+play.outsOnPlay; let after={inning:play.inning,half:play.half,outs,bases:applyDestinations(beforeState.bases,play.team,play.playerIndex,play.destinations),battingIndexes:deepClone(beforeState.battingIndexes)};
  after.battingIndexes[play.team]=(play.playerIndex+1)%LINEUP_ROWS;
  if(outs>=3){const n=nextHalfState(play.inning,play.half);after={...after,...n,outs:0,bases:emptyBases()};}
  return after;
}
function commitPlay(incoming,existingId=""){
  ensureScoringState();
  const existing=scoring.plays.find(p=>p.id===existingId);
  let beforeState;
  if(existing) beforeState=deepClone(existing.beforeState);
  else {
    const chosenTeam=battingTeamForHalf(incoming.half);
    beforeState={inning:incoming.inning,half:incoming.half,outs:(incoming.inning===scoring.inning&&incoming.half===scoring.half)?scoring.outs:0,bases:(incoming.inning===scoring.inning&&incoming.half===scoring.half&&incoming.team===chosenTeam)?deepClone(scoring.bases):emptyBases(),battingIndexes:deepClone(scoring.battingIndexes)};
  }
  const pitchCount=existing?.pitchCount||countSnapshot();
  const pitchingTeam=defensiveTeamForBattingTeam(incoming.team),resolvedPitcher=resolvePitcherInfo(pitchingTeam,incoming.pitcher);
  const pitchSessionId=existing?.pitchSessionId||pitchCount.sessionId||"";
  const play={...incoming,id:existing?.id||makeId(),seq:existing?.seq||scoring.nextSeq++,beforeState,pitchCount,pitchSessionId,pitchingTeam,pitcherKey:resolvedPitcher.key,pitcherRow:resolvedPitcher.row,pitchSequence:existing?.pitchSequence||pitchSequenceLabel(pitchCount.history),playerName:collectData()[incoming.team].lineup[incoming.playerIndex]?.name||`Batter ${incoming.playerIndex+1}`,outcomeCode:OUTCOME_MAP[incoming.outcome]?.code||incoming.outcome,recordedAt:existing?.recordedAt||new Date().toISOString()};
  if(pitchSessionId)scoring.pitchLog.filter(event=>event.sessionId===pitchSessionId).forEach(event=>{event.pitchingTeam=pitchingTeam;event.pitcherKey=resolvedPitcher.key;event.pitcherRow=resolvedPitcher.row;event.pitcherName=resolvedPitcher.name;event.pitcherNumber=resolvedPitcher.number||"";});
  play.afterState=buildAfterState(play,beforeState);
  if(existing){const idx=scoring.plays.findIndex(p=>p.id===existing.id);scoring.plays[idx]=play;} else scoring.plays.push(play);
  scoring.plays.sort((a,b)=>a.seq-b.seq);
  if(!existing)scoring.count=initialCount();
  rebuildDerivedGameState();refreshAll();scheduleAutosave(existing?"Play updated and all game counters rebuilt":"Play saved");
  return play;
}
function recordPlay(event){
  event.preventDefault();
  const existingId=$("dialogPlayId").value;
  commitPlay(getPlayFromDialog(),existingId);
  if(existingId&&scoring.lastAutoStrikeoutPlayId===existingId)scoring.lastAutoStrikeoutPlayId="";
  $("playDialog").close();
  renderPitchConsole();
}
function synchronizeCurrentPitchSession(){
  ensureScoringState();
  const sessionId=scoring.count.sessionId;
  if(!sessionId)return;
  const battingTeam=currentBattingTeam();
  const batterIndex=Math.max(0,Math.min(LINEUP_ROWS-1,num(scoring.battingIndexes[battingTeam])));
  const batter=collectData()[battingTeam]?.lineup?.[batterIndex]||{};
  const pitcher=activePitcherInfo(battingTeam);
  scoring.pitchLog.filter(event=>event.sessionId===sessionId).forEach(event=>{
    event.inning=scoring.inning;
    event.half=scoring.half;
    event.battingTeam=battingTeam;
    event.batterTeam=battingTeam;
    event.batterIndex=batterIndex;
    event.batterName=batter.name||`Batter ${batterIndex+1}`;
    event.pitchingTeam=pitcher.team;
    event.pitcherKey=pitcher.key;
    event.pitcherRow=pitcher.row;
    event.pitcherName=pitcher.name;
    event.pitcherNumber=pitcher.number||"";
  });
}
function rebuildDerivedGameState(){
  ensureScoringState();
  const ordered=[...scoring.plays].sort((a,b)=>a.seq-b.seq);
  let state={inning:1,half:"top",outs:0,bases:emptyBases(),battingIndexes:{away:0,home:0}};
  for(const play of ordered){
    const inning=Math.max(1,num(play.inning)||state.inning);
    const half=play.half==="bottom"?"bottom":"top";
    const team=play.team==="home"?"home":"away";
    if(state.inning!==inning||state.half!==half){
      state={...state,inning,half,outs:0,bases:emptyBases()};
    }
    state.battingIndexes[team]=Math.max(0,Math.min(LINEUP_ROWS-1,num(play.playerIndex)));
    play.inning=inning;
    play.half=half;
    play.team=team;
    play.beforeState={inning:state.inning,half:state.half,outs:state.outs,bases:deepClone(state.bases),battingIndexes:deepClone(state.battingIndexes)};
    play.afterState=buildAfterState(play,play.beforeState);
    state={inning:play.afterState.inning,half:play.afterState.half,outs:play.afterState.outs,bases:deepClone(play.afterState.bases),battingIndexes:deepClone(play.afterState.battingIndexes)};
  }
  scoring.plays=ordered;
  scoring.inning=state.inning;
  scoring.half=state.half;
  scoring.outs=state.outs;
  scoring.bases=deepClone(state.bases);
  scoring.battingIndexes=deepClone(state.battingIndexes);
  scoring.nextSeq=Math.max(1,...ordered.map(play=>num(play.seq)+1));
  if(scoring.lastAutoStrikeoutPlayId&&!ordered.some(play=>play.id===scoring.lastAutoStrikeoutPlayId))scoring.lastAutoStrikeoutPlayId="";
  synchronizeCurrentPitchSession();
  ensureScoringState();
}
function syncCurrentToLastPlay(){ rebuildDerivedGameState(); }
function deletePlay(id){
  const idx=scoring.plays.findIndex(p=>p.id===id);
  if(idx<0)return;
  const removed=scoring.plays[idx];
  scoring.plays.splice(idx,1);
  if(scoring.lastAutoStrikeoutPlayId===removed.id)scoring.lastAutoStrikeoutPlayId="";
  if(removed.pitchSessionId)scoring.pitchLog=scoring.pitchLog.filter(event=>event.sessionId!==removed.pitchSessionId);
  rebuildDerivedGameState();
  refreshAll();
  scheduleAutosave("Play deleted and all game counters rebuilt");
}
function undoLastPlay(){ const last=[...scoring.plays].sort((a,b)=>a.seq-b.seq).at(-1); if(!last)return; deletePlay(last.id); }
function manualChangeHalf(){
  if(scoring.outs<3&&!confirm("Under MLB rules, a half-inning normally ends after three outs. Use this override only to correct the recorded game state. Change half-inning now?"))return;
  const n=nextHalfState(scoring.inning,scoring.half); scoring.inning=n.inning;scoring.half=n.half;scoring.outs=0;scoring.bases=emptyBases();scoring.count=initialCount();scoring.lastAutoStrikeoutPlayId="";refreshAll();scheduleAutosave("Half-inning changed by manual correction");
}
function clearPersistentGameData(){
  clearTimeout(autosaveTimer);
  try{
    for(let i=localStorage.length-1;i>=0;i--){
      const key=localStorage.key(i)||"";
      if(LEGACY_STORAGE_PREFIXES.some(prefix=>key.startsWith(prefix))) localStorage.removeItem(key);
    }
  }catch(err){ console.warn("Stored game data could not be cleared.",err); }
}
function blankEntireGame(message="Blank game ready. Choose a scheduled game or enter one manually.",returnToSetup=true){
  clearPersistentGameData();
  scoring=initialScoring();
  setFieldsFromData({});
  refreshAll();
  if(returnToSetup) setPanel("setup");
  if($("autosaveBar")) $("autosaveBar").textContent=message;
}
function resetScoring(){
  if(!confirm("Reset the entire game? This clears every team, lineup, pitcher, note, and recorded play."))return;
  blankEntireGame("Game reset. All scorecard fields and scoring totals are blank.");
}

function computeTeamStats(team){
  const rows=Array.from({length:LINEUP_ROWS},()=>({pa:0,ab:0,r:0,h:0,rbi:0,bb:0,k:0,hr:0}));
  scoring.plays.filter(p=>p.team===team).forEach(p=>{const s=rows[p.playerIndex]||rows[0],o=OUTCOME_MAP[p.outcome]||{};s.pa++;if(o.ab)s.ab++;s.h+=o.hit||0;s.rbi+=p.rbi||0;s.bb+=o.bb||0;s.k+=o.k||0;s.hr+=o.hr||0;});
  scoring.plays.forEach(p=>{
    const before=p.beforeState?.bases||{}; const sources={batter:runnerFor(p.team,p.playerIndex),r1:before[1],r2:before[2],r3:before[3]};
    Object.entries(p.destinations||{}).forEach(([k,d])=>{const r=sources[k];if(d==="home"&&r?.team===team&&rows[r.playerIndex])rows[r.playerIndex].r++;});
  });
  return rows;
}
function emptyPitcherStats(info){return {...info,pitches:0,strikes:0,balls:0,swingingStrikes:0,calledStrikes:0,fouls:0,inPlay:0,hbpPitches:0,battersFaced:0,hits:0,walks:0,intentionalWalks:0,hitBatters:0,strikeouts:0};}
function computePitcherTracking(){
  ensureScoringState();
  const data=collectData(),map=new Map();
  const ensure=(info)=>{if(!map.has(info.key))map.set(info.key,emptyPitcherStats(info));return map.get(info.key);};
  for(const team of ["away","home"])(data[team]?.pitchers||[]).forEach((p,row)=>{if(p.name||p.num)ensure(pitcherInfoFromRow(team,row));});
  scoring.pitchLog.forEach(event=>{
    const info={team:event.pitchingTeam||defensiveTeamForBattingTeam(event.battingTeam),row:Number.isInteger(event.pitcherRow)?event.pitcherRow:-1,key:event.pitcherKey||pitcherKey(event.pitchingTeam||"away",event.pitcherRow,event.pitcherName),name:event.pitcherName||"Unknown Pitcher",number:event.pitcherNumber||"",throws:""},s=ensure(info),type=event.type;
    s.pitches++;
    if(type==="ball")s.balls++;
    if(PITCH_TYPE_INFO[type]?.strike)s.strikes++;
    if(type==="swingingStrike"||type==="strike")s.swingingStrikes++;
    if(type==="calledStrike")s.calledStrikes++;
    if(type==="foul")s.fouls++;
    if(type==="inplay")s.inPlay++;
    if(type==="hitByPitch")s.hbpPitches++;
  });
  scoring.plays.forEach(play=>{
    const team=play.pitchingTeam||defensiveTeamForBattingTeam(play.team),resolved=play.pitcherKey?{team,row:Number.isInteger(play.pitcherRow)?play.pitcherRow:-1,key:play.pitcherKey,name:play.pitcher||"Unknown Pitcher",number:"",throws:""}:resolvePitcherInfo(team,play.pitcher),s=ensure(resolved),o=OUTCOME_MAP[play.outcome]||{};
    s.battersFaced++;s.hits+=o.hit||0;s.strikeouts+=o.k||0;
    if(play.outcome==="BB")s.walks++;
    if(play.outcome==="IBB")s.intentionalWalks++;
    if(play.outcome==="HBP")s.hitBatters++;
  });
  return {away:[...map.values()].filter(s=>s.team==="away").sort((a,b)=>(a.row<0?99:a.row)-(b.row<0?99:b.row)||a.name.localeCompare(b.name)),home:[...map.values()].filter(s=>s.team==="home").sort((a,b)=>(a.row<0?99:a.row)-(b.row<0?99:b.row)||a.name.localeCompare(b.name))};
}
function pitcherStatsTable(team,rows){
  const title=teamName(team),body=rows.length?rows.map(s=>`<tr><td><strong>${escapeHtml([s.number?`#${String(s.number).replace(/^#/,"")}`:"",s.name].filter(Boolean).join(" "))}</strong></td><td>${s.pitches}</td><td>${s.strikes}</td><td>${s.balls}</td><td>${s.pitches?Math.round(s.strikes/s.pitches*100):0}%</td><td>${s.swingingStrikes}</td><td>${s.calledStrikes}</td><td>${s.fouls}</td><td>${s.inPlay}</td><td>${s.battersFaced}</td><td>${s.hits}</td><td>${s.walks}</td><td>${s.intentionalWalks}</td><td>${s.hitBatters}</td><td>${s.strikeouts}</td></tr>`).join(""):`<tr><td colspan="15">No pitcher or pitch data recorded yet.</td></tr>`;
  return `<article class="pitcher-tracking-card"><h3>${escapeHtml(title)} Pitchers</h3><div class="pitcher-table-wrap"><table class="pitcher-tracking-table"><thead><tr><th>Pitcher</th><th>P</th><th>Str</th><th>Ball</th><th>Str%</th><th>SW</th><th>C</th><th>F</th><th>IP</th><th>BF</th><th>H</th><th>BB</th><th>IBB</th><th>HBP</th><th>K</th></tr></thead><tbody>${body}</tbody></table></div></article>`;
}
function renderPitchTracking(){
  const summary=$("pitcherTrackingSummary"),log=$("pitchEventLog");if(!summary||!log)return;
  const stats=computePitcherTracking();summary.innerHTML=pitcherStatsTable("away",stats.away)+pitcherStatsTable("home",stats.home);
  const events=[...scoring.pitchLog].sort((a,b)=>b.seq-a.seq);
  if($("pitchLogCount"))$("pitchLogCount").textContent=`${events.length} recorded pitch${events.length===1?"":"es"}`;
  log.innerHTML=events.length?`<div class="pitcher-table-wrap"><table class="pitch-log-table"><thead><tr><th>#</th><th>Inning</th><th>Pitcher</th><th>Batter</th><th>Pitch</th><th>Count</th></tr></thead><tbody>${events.map(event=>`<tr><td>${event.seq}</td><td>${event.half==="top"?"Top":"Bottom"} ${event.inning}</td><td>${escapeHtml(event.pitcherName||"Unknown")}</td><td>${escapeHtml(event.batterName||"Unknown")}</td><td><strong>${escapeHtml(event.code||PITCH_TYPE_INFO[event.type]?.code||event.type)}</strong> ${escapeHtml(event.label||PITCH_TYPE_INFO[event.type]?.label||"")}</td><td>${num(event.countBefore?.balls)}-${num(event.countBefore?.strikes)} → ${num(event.countAfter?.balls)}-${num(event.countAfter?.strikes)}</td></tr>`).join("")}</tbody></table></div>`:`<p class="empty-tracking-note">No pitches recorded yet. Every Ball, Swinging Strike, Called Strike, Foul, In Play, and Hit By Pitch will appear here.</p>`;
}
function csvCell(value){const text=String(value??"");return /[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;}
function downloadPitchLogCsv(){
  ensureScoringState();
  const headers=["Pitch #","Inning","Half","Pitching Team","Pitcher #","Pitcher","Batting Team","Batter","Pitch Code","Pitch Type","Count Before","Count After","Recorded At"];
  const rows=[headers,...[...scoring.pitchLog].sort((a,b)=>a.seq-b.seq).map(e=>[e.seq,e.inning,e.half,e.pitchingTeam,e.pitcherNumber,e.pitcherName,e.battingTeam,e.batterName,e.code,e.label,`${num(e.countBefore?.balls)}-${num(e.countBefore?.strikes)}`,`${num(e.countAfter?.balls)}-${num(e.countAfter?.strikes)}`,e.recordedAt])];
  const data=collectData(),name=safeFileName(`${data.awayTeam||"Away"}_at_${data.homeTeam||"Home"}_${data.gameDate||"pitch-log"}`);
  downloadBlob(new Blob([rows.map(row=>row.map(csvCell).join(",")).join("\n")],{type:"text/csv;charset=utf-8"}),`${name}_pitch_log.csv`);
}
function computeGameTotals(){
  const result={away:{runs:0,hits:0,errors:0,innings:Array(30).fill(0)},home:{runs:0,hits:0,errors:0,innings:Array(30).fill(0)}};
  for(const team of ["away","home"]){const stats=computeTeamStats(team);result[team].runs=sum(scoring.plays.filter(p=>p.team===team).map(p=>p.runs));result[team].hits=sum(stats.map(s=>s.h));result[team].errors=sum(scoring.plays.filter(p=>p.team!==team).map(p=>p.errors));scoring.plays.filter(p=>p.team===team).forEach(p=>{result[team].innings[p.inning-1]+=p.runs||0;});}
  return result;
}
function playNotation(play){
  let text=play.outcomeCode||play.outcome; const extras=[]; if(play.rbi)extras.push(`${play.rbi} RBI`);if(play.runs)extras.push(`${play.runs} R`);if(play.errors)extras.push(`${play.errors} E`);return extras.length?`${text} ${extras.join("/")}`:text;
}
function playsByBatterInning(team,playerIndex,inning){ return scoring.plays.filter(p=>p.team===team&&p.playerIndex===playerIndex&&p.inning===inning).sort((a,b)=>a.seq-b.seq); }
function renderLineScoreTable(){
  const d=collectData(),t=computeGameTotals(),maxInning=Math.max(9,Math.min(12,scoring.inning)); let h=`<table class="line-score-table"><thead><tr><th>Team</th>`;for(let i=1;i<=maxInning;i++)h+=`<th>${i}</th>`;h+=`<th>R</th><th>H</th><th>E</th></tr></thead><tbody>`;
  for(const team of ["away","home"]){h+=`<tr><th>${escapeHtml(d[`${team}Team`]||team)}</th>`;for(let i=0;i<maxInning;i++)h+=`<td>${t[team].innings[i]||0}</td>`;h+=`<td><strong>${t[team].runs}</strong></td><td>${t[team].hits}</td><td>${t[team].errors}</td></tr>`;}return h+`</tbody></table>`;
}
function renderBattingTable(team){
  const d=collectData(),stats=computeTeamStats(team);let h=`<h4>${escapeHtml(d[`${team}Team`]||team)}</h4><table class="batting-table"><thead><tr><th>Player</th><th>PA</th><th>AB</th><th>R</th><th>H</th><th>RBI</th><th>BB</th><th>K</th><th>HR</th></tr></thead><tbody>`;
  d[team].lineup.forEach((p,i)=>{const s=stats[i];h+=`<tr><td>${escapeHtml(p.name||`Batter ${i+1}`)}</td><td>${s.pa}</td><td>${s.ab}</td><td>${s.r}</td><td>${s.h}</td><td>${s.rbi}</td><td>${s.bb}</td><td>${s.k}</td><td>${s.hr}</td></tr>`;});return h+`</tbody></table>`;
}
function renderSummary(){
  $("lineScoreSummary").innerHTML=renderLineScoreTable(); $("battingSummary").innerHTML=renderBattingTable("away")+renderBattingTable("home");
  const log=[...scoring.plays].sort((a,b)=>b.seq-a.seq);$("playLog").innerHTML=log.length?log.map(p=>{const count=p.pitchCount?`Count ${countLabel(p.pitchCount)}`:"Count not recorded";const sequence=p.pitchSequence?` • Pitches: ${p.pitchSequence}`:"";return `<div class="play-log-item"><strong>${p.half==="top"?"Top":"Bottom"} ${p.inning} — ${escapeHtml(p.playerName)}: ${escapeHtml(playNotation(p))}</strong><p>${escapeHtml(`${count}${sequence}${p.notes?` • ${p.notes}`:` • ${p.outsOnPlay} out(s), ${p.runs} run(s)`}`)}</p></div>`;}).join(""):`<p>No plays recorded yet.</p>`;
}
function refreshHeadings(){ const a=teamName("away"),h=teamName("home");$("awayLineupHeading").textContent=`${a} Lineup`;$("homeLineupHeading").textContent=`${h} Lineup`;$("awayPitcherHeading").textContent=`${a} Pitchers`;$("homePitcherHeading").textContent=`${h} Pitchers`;$("awayScoringHeading").textContent=`${a} Batters`;$("homeScoringHeading").textContent=`${h} Batters`; }
function refreshAll(){ refreshHeadings();renderScoring();renderSummary();renderPitchTracking(); }

function serializeApp(){ return {app:"Guariglia Baseball Scorecard Builder",version:VERSION_NUMBER,savedAt:new Date().toISOString(),data:collectData(),scoring}; }
function scheduleAutosave(message="Current session updated"){
  clearTimeout(autosaveTimer);
  if($("autosaveBar")) $("autosaveBar").textContent=`${message}…`;
  autosaveTimer=setTimeout(()=>{
    if($("autosaveBar")) $("autosaveBar").textContent=`Current session updated ${new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}. Use Save Game File to keep it.`;
  },350);
}
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);}
function safeFileName(value){return String(value||"baseball-game").replace(/[^a-z0-9._-]+/gi,"_").replace(/^_+|_+$/g,"");}
function saveGameFile(){const d=collectData(),name=safeFileName(`${d.awayTeam||"Away"}_at_${d.homeTeam||"Home"}_${d.gameDate||"game"}`);downloadBlob(new Blob([JSON.stringify(serializeApp(),null,2)],{type:"application/json"}),`${name}.scoregame.json`);}
async function openGameFile(file){
  try{const saved=JSON.parse(await file.text());if(!saved.data||!saved.scoring)throw new Error("This is not a compatible Version 11 through Version 23 game file.");setFieldsFromData(saved.data);scoring=saved.scoring;ensureScoringState();refreshAll();scheduleAutosave("Game file opened");setPanel("scoring");}catch(err){alert(`Could not open the game file: ${err.message}`);}
}
function clearForManual(){
  if(!confirm("Start a blank game? This clears every current scorecard field and recorded play."))return;
  blankEntireGame("Blank manual game ready. All scorecard fields and scoring totals are empty.");
}

function dateDisplay(value){if(!value)return"";const d=new Date(`${value}T12:00:00`);return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
function setConnectionState(state,message){
  const badge=$("connectionBadge");
  if(!badge)return;
  badge.className=`connection-badge ${state}`;
  badge.textContent=message;
}
function restoreRefreshPosition(anchor, previousScrollX, previousScrollY){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const root=document.documentElement;
    const priorInlineBehavior=root.style.scrollBehavior;
    root.style.scrollBehavior="auto";
    window.scrollTo(previousScrollX,previousScrollY);
    anchor?.focus({preventScroll:true});
    root.style.scrollBehavior=priorInlineBehavior;
  }));
}
async function refreshScheduleAndClear(){
  const refreshButton=$("refreshGamesBtn");
  const previousScrollX=window.scrollX;
  const previousScrollY=window.scrollY;
  const selectedDate=getField("lookupDate");
  const selectedLevel=getField("scheduleLevel")||"mlb";
  blankEntireGame("Schedule refreshed. All previously populated game data and scoring were cleared.",false);
  setField("lookupDate",selectedDate);
  setField("scheduleLevel",selectedLevel);
  scheduleGames=[];
  $("dailyGameSelect").innerHTML='<option value="">Loading scheduled games…</option>';
  $("lookupGameBtn").disabled=true;
  try{
    await loadSchedule();
  }finally{
    restoreRefreshPosition(refreshButton,previousScrollX,previousScrollY);
  }
}

async function loadSchedule(){
  const date=getField("lookupDate"),level=getField("scheduleLevel");
  if(!date)return;
  const requestToken=++scheduleRequestToken;
  scheduleGames=[];
  $("dailyGameSelect").innerHTML='<option value="">Loading scheduled games…</option>';
  $("lookupStatus").textContent="Connecting to official baseball schedule data…";
  setConnectionState("checking","Checking connection…");
  $("refreshGamesBtn").disabled=true;
  $("lookupGameBtn").disabled=true;
  try{
    if(!globalThis.BaseballData)throw new Error("The baseball-data connection module is missing.");
    const payload=await BaseballData.getSchedule(date,level);
    if(requestToken!==scheduleRequestToken)return;
    scheduleGames=payload.games||[];
    $("dailyGameSelect").innerHTML=scheduleGames.length
      ?'<option value="">Choose a matchup</option>'+scheduleGames.map((game,index)=>`<option value="${index}">${escapeHtml(game.label)}</option>`).join("")
      :'<option value="">No games found</option>';
    setConnectionState("connected","Online schedule connected");
    const source=payload.source?` Connection: ${payload.source}.`:"";
    $("lookupStatus").textContent=scheduleGames.length
      ?`${scheduleGames.length} game${scheduleGames.length===1?"":"s"} available for ${dateDisplay(date)}.${source}`
      :`The connection is working, but no scheduled games were returned for ${dateDisplay(date)} and that level.${source}`;
  }catch(err){
    if(requestToken!==scheduleRequestToken)return;
    console.error(err);
    $("dailyGameSelect").innerHTML='<option value="">Schedule unavailable — use Refresh Schedule</option>';
    setConnectionState("disconnected","Schedule connection unavailable");
    $("lookupStatus").textContent=`The online schedule could not be loaded: ${err.message || "unknown connection error"}. Select Refresh Schedule to try again, or use manual entry.`;
  }finally{
    if(requestToken===scheduleRequestToken)$("refreshGamesBtn").disabled=false;
  }
}
async function loadSelectedGame(){
  const fillButton=$("lookupGameBtn");
  const previousScrollX=window.scrollX;
  const previousScrollY=window.scrollY;
  const rawIndex=$("dailyGameSelect").value;
  if(rawIndex==="")return;
  const game=scheduleGames[num(rawIndex)];
  if(!game)return;
  $("lookupStatus").textContent="Loading teams, venue, lineups, pitchers, broadcasts, and available game details…";
  setConnectionState("checking","Loading selected game…");
  $("lookupGameBtn").disabled=true;
  try{
    if(!globalThis.BaseballData)throw new Error("The baseball-data connection module is missing.");
    const payload=await BaseballData.getGame(game.gamePk);
    setFieldsFromData(payload.data||{});
    scoring=initialScoring();
    refreshAll();
    scheduleAutosave("Official game information loaded");
    setConnectionState("connected","Selected game connected");
    const source=payload.source?` Connection: ${payload.source}.`:"";
    $("lookupStatus").textContent=`Game information loaded. Review the populated game information below before moving to the next section.${source}`;
    setPanel("setup",{preserveScroll:true});
    restoreRefreshPosition(fillButton,previousScrollX,previousScrollY);
  }catch(err){
    console.error(err);
    setConnectionState("disconnected","Game details unavailable");
    $("lookupStatus").textContent=`The selected game could not be loaded: ${err.message || "unknown connection error"}. Refresh the schedule or enter the game manually.`;
  }finally{
    $("lookupGameBtn").disabled=!$("dailyGameSelect").value;
  }
}

function base64ToArrayBuffer(base64){const binary=atob(base64),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes.buffer;}
function getTemplateArrayBuffer(){if(uploadedTemplateBuffer)return uploadedTemplateBuffer.slice(0);return base64ToArrayBuffer(EMBEDDED_SCORECARD_TEMPLATE_BASE64);}
function colNumber(ref){let n=0;for(const c of ref.match(/[A-Z]+/)[0])n=n*26+c.charCodeAt(0)-64;return n;}
function ensureCell(doc,ref){
  const ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main",rowNum=num(ref.match(/\d+/)[0]),sheetData=doc.getElementsByTagNameNS(ns,"sheetData")[0];let row=[...doc.getElementsByTagNameNS(ns,"row")].find(r=>num(r.getAttribute("r"))===rowNum);
  if(!row){row=doc.createElementNS(ns,"row");row.setAttribute("r",rowNum);const rows=[...sheetData.children];const before=rows.find(r=>num(r.getAttribute("r"))>rowNum);before?sheetData.insertBefore(row,before):sheetData.appendChild(row);}
  let cell=[...row.getElementsByTagNameNS(ns,"c")].find(c=>c.getAttribute("r")===ref);if(!cell){cell=doc.createElementNS(ns,"c");cell.setAttribute("r",ref);const before=[...row.children].find(c=>colNumber(c.getAttribute("r"))>colNumber(ref));before?row.insertBefore(cell,before):row.appendChild(cell);}return cell;
}
function clearCellChildren(cell){while(cell.firstChild)cell.removeChild(cell.firstChild);}
function setXmlCell(doc,ref,value,type="string"){
  const ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main",cell=ensureCell(doc,ref);clearCellChildren(cell);
  if(type==="number"){cell.setAttribute("t","n");const v=doc.createElementNS(ns,"v");v.textContent=String(num(value));cell.appendChild(v);} else {cell.setAttribute("t","inlineStr");const is=doc.createElementNS(ns,"is"),t=doc.createElementNS(ns,"t");t.setAttribute("xml:space","preserve");t.textContent=String(value??"");is.appendChild(t);cell.appendChild(is);}
}
function columnLetter(n){let s="";while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
function topLine(d){return [[d.awayTeam,d.homeTeam].some(Boolean)?`${d.awayTeam||"Away"} at ${d.homeTeam||"Home"}`:"",dateDisplay(d.gameDate),d.gameTime,d.venue,[d.awayRecord,d.homeRecord].filter(Boolean).join(" / "),d.gameNumber].filter(Boolean).join(" • ");}
function exportNotes(d,t){const score=`Final / Current Score: ${d.awayTeam||"Away"} ${t.away.runs}, ${d.homeTeam||"Home"} ${t.home.runs}`;const recent=[...scoring.plays].sort((a,b)=>a.seq-b.seq).slice(-12).map(p=>`${p.half==="top"?"T":"B"}${p.inning} ${p.playerName}: ${playNotation(p)}`).join("; ");return ["Game Notes",score,d.gameNotes,recent].filter(Boolean).join("\n");}
async function exportExcel(){
  try{
    const d=collectData(),t=computeGameTotals(),zip=await JSZip.loadAsync(getTemplateArrayBuffer()),path="xl/worksheets/sheet1.xml",xml=await zip.file(path).async("text"),doc=new DOMParser().parseFromString(xml,"application/xml");
    setXmlCell(doc,"A1","");setXmlCell(doc,"A2",topLine(d));setXmlCell(doc,"A3",[[d.weather?`Weather: ${d.weather}`:"",d.umpires?`Umpires: ${d.umpires}`:""].filter(Boolean).join(" • "),[d.broadcast?`TV: ${d.broadcast}`:"",d.radio?`Radio: ${d.radio}`:""].filter(Boolean).join(" • ")].filter(Boolean).join("\n"));
    setXmlCell(doc,"J3","□ Replay Challenge □");setXmlCell(doc,"J4",`ABS\nAway: ${d.awayTeam||"Away"}  □ □ EI□`);setXmlCell(doc,"M4",`ABS\nHome: ${d.homeTeam||"Home"}  □ □ EI□`);setXmlCell(doc,"A6",`Away: ${d.awayTeam||"Away"}`);setXmlCell(doc,"A7",`Home: ${d.homeTeam||"Home"}`);
    setXmlCell(doc,"A9",`Away: ${d.awayTeam||"Away"}${d.awayRecord?` (${d.awayRecord})`:""}`);setXmlCell(doc,"A21",`Home: ${d.homeTeam||"Home"}${d.homeRecord?` (${d.homeRecord})`:""}`);setXmlCell(doc,"A33",`Away: ${d.awayTeam||"Away"} Pitching`);setXmlCell(doc,"A41",`Home: ${d.homeTeam||"Home"} Pitching`);setXmlCell(doc,"J33",exportNotes(d,t));
    for(const [team,rowStart] of [["away",11],["home",23]]){
      const stats=computeTeamStats(team);for(let i=0;i<LINEUP_ROWS;i++){const row=rowStart+i;setXmlCell(doc,`A${row}`,formatLineupPlayer(d[team].lineup[i]||{}));for(let inning=1;inning<=10;inning++){const plays=playsByBatterInning(team,i,inning);setXmlCell(doc,`${columnLetter(inning+1)}${row}`,plays.length?plays.map(playNotation).join(" / "):"");}setXmlCell(doc,`L${row}`,stats[i].ab,"number");setXmlCell(doc,`M${row}`,stats[i].r,"number");setXmlCell(doc,`N${row}`,stats[i].h,"number");setXmlCell(doc,`O${row}`,stats[i].rbi,"number");}
    }
    for(const [team,rowStart] of [["away",35],["home",43]])for(let i=0;i<PITCHER_ROWS;i++)setXmlCell(doc,`A${rowStart+i}`,formatPitcher(d[team].pitchers[i]||{}));
    for(let inning=1;inning<=10;inning++){setXmlCell(doc,`${columnLetter(inning+1)}6`,t.away.innings[inning-1]||0,"number");setXmlCell(doc,`${columnLetter(inning+1)}7`,t.home.innings[inning-1]||0,"number");}
    [["M6",t.away.runs],["N6",t.away.hits],["O6",t.away.errors],["M7",t.home.runs],["N7",t.home.hits],["O7",t.home.errors]].forEach(([r,v])=>setXmlCell(doc,r,v,"number"));
    for(let row=1;row<=48;row++)setXmlCell(doc,`AA${row}`,"");
    zip.file(path,new XMLSerializer().serializeToString(doc));const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6},mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});downloadBlob(blob,`${safeFileName(`${d.awayTeam||"Away"}_at_${d.homeTeam||"Home"}_${d.gameDate||"scorecard"}`)}.xlsx`);$("autosaveBar").textContent="Excel scorecard downloaded.";
  }catch(err){console.error(err);alert(`Excel export failed: ${err.message}`);}
}
function buildPrintTeam(team,rowLabel){
  const d=collectData(),stats=computeTeamStats(team);let h=`<div class="print-section"><div class="team-title">${escapeHtml(rowLabel)}: ${escapeHtml(d[`${team}Team`]||team)}</div><table><thead><tr><th class="player-col">Player / No.</th>`;for(let i=1;i<=10;i++)h+=`<th>${i}</th>`;h+=`<th class="tot">AB</th><th class="tot">R</th><th class="tot">H</th><th class="tot">RBI</th></tr></thead><tbody>`;
  d[team].lineup.forEach((p,idx)=>{h+=`<tr><td class="player-col">${escapeHtml(formatLineupPlayer(p))}</td>`;for(let inn=1;inn<=10;inn++){const plays=playsByBatterInning(team,idx,inn);h+=`<td class="score-box">${escapeHtml(plays.length?plays.map(playNotation).join(" / "):"")}</td>`;}const s=stats[idx];h+=`<td>${s.ab}</td><td>${s.r}</td><td>${s.h}</td><td>${s.rbi}</td></tr>`;});return h+`</tbody></table></div>`;
}
function renderPrintScorecard(){
  const d=collectData(),t=computeGameTotals(),log=[...scoring.plays].sort((a,b)=>a.seq-b.seq).slice(-18).map(p=>`${p.half==="top"?"T":"B"}${p.inning} ${p.playerName}: ${playNotation(p)}`).join(" • ");
  $("printScorecard").innerHTML=`<div class="print-header"><h1>${escapeHtml(d.awayTeam||"Away")} at ${escapeHtml(d.homeTeam||"Home")}</h1><p>${escapeHtml(topLine(d))}</p></div><div class="print-info"><div>${escapeHtml([d.weather?`Weather: ${d.weather}`:"",d.umpires?`Umpires: ${d.umpires}`:""].filter(Boolean).join(" • "))}</div><div>${escapeHtml([d.broadcast?`TV: ${d.broadcast}`:"",d.radio?`Radio: ${d.radio}`:""].filter(Boolean).join(" • "))}</div></div>${renderLineScoreTable()}${buildPrintTeam("away","Away")}${buildPrintTeam("home","Home")}<div class="print-bottom"><div class="print-notes"><h3>Game Notes</h3>${escapeHtml(d.gameNotes||"").replace(/\n/g,"<br>")}</div><div class="print-log"><h3>Play Log</h3>${escapeHtml(log)}</div></div>`;
}
function printPdf(){renderPrintScorecard();setTimeout(()=>window.print(),60);}
async function downloadBlank(){
  try{
    const zip=await JSZip.loadAsync(getTemplateArrayBuffer()),path="xl/worksheets/sheet1.xml",xml=await zip.file(path).async("text"),doc=new DOMParser().parseFromString(xml,"application/xml");
    ["A1","A2","A3","J4","M4","A6","A7","A9","A21","A33","A41"].forEach(ref=>setXmlCell(doc,ref,""));
    setXmlCell(doc,"J3","□ Replay Challenge □");setXmlCell(doc,"J33","Game Notes");
    for(let col=2;col<=15;col++){setXmlCell(doc,`${columnLetter(col)}6`,"");setXmlCell(doc,`${columnLetter(col)}7`,"");}
    for(const rowStart of [11,23])for(let i=0;i<LINEUP_ROWS;i++){const row=rowStart+i;setXmlCell(doc,`A${row}`,"");for(let inning=1;inning<=10;inning++)setXmlCell(doc,`${columnLetter(inning+1)}${row}`,"+");for(const col of ["L","M","N","O"])setXmlCell(doc,`${col}${row}`,"");}
    for(const rowStart of [35,43])for(let i=0;i<PITCHER_ROWS;i++)for(let col=1;col<=8;col++)setXmlCell(doc,`${columnLetter(col)}${rowStart+i}`,"");
    for(let row=1;row<=48;row++)setXmlCell(doc,`AA${row}`,"");
    zip.file(path,new XMLSerializer().serializeToString(doc));
    const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6},mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    downloadBlob(blob,uploadedTemplateName||TEMPLATE_FILE_NAME);
  }catch(err){console.error(err);alert(`Blank scorecard download failed: ${err.message}`);}
}
async function uploadTemplate(file){try{uploadedTemplateBuffer=await file.arrayBuffer();uploadedTemplateName=file.name;$("templateStatus").textContent=`Using uploaded template: ${file.name}`;}catch(err){uploadedTemplateBuffer=null;uploadedTemplateName="";$("templateStatus").textContent="The uploaded template could not be read.";}}



// Version 23 preserves the classic one-page geometry while adding home-team MLB palettes and clean computer scoring boxes.
const CLASSIC_PDF_WIDTH=612, CLASSIC_PDF_HEIGHT=792;
const SCORECARD_SOURCE_SWATCHES=[
  {source:[60,36,24],role:"primary"},{source:[75,49,36],role:"primary"},{source:[47,67,76],role:"primary"},{source:[89,70,54],role:"gridDark"},
  {source:[154,76,30],role:"secondary"},{source:[136,59,17],role:"secondary"},{source:[155,118,95],role:"secondary"},{source:[199,150,112],role:"light"},
  {source:[175,135,58],role:"accent"},{source:[247,240,224],role:"cream"},{source:[210,202,183],role:"alternate"},{source:[202,180,163],role:"yellow"},
  {source:[164,159,153],role:"grid"},{source:[150,135,117],role:"grid"},{source:[109,103,97],role:"gridDark"},{source:[188,198,203],role:"grid"},{source:[120,129,133],role:"gridDark"}
];
let classicPdfMeasureContext=null,classicPdfPalette=scorecardPaletteForHomeTeam("");
function classicPdfSanitize(value){return String(value??"").replace(/\u00a0/g," ").replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g," - ").replace(/\u2022/g," - ").replace(/\u2026/g,"...").replace(/[\u25a1\u2610]/g,"").replace(/[^\x09\x0A\x0D\x20-\xFF]/g,"?");}
function classicPdfCtx(){if(!classicPdfMeasureContext){const c=document.createElement("canvas");classicPdfMeasureContext=c.getContext("2d");}return classicPdfMeasureContext;}
function classicPdfMeasure(text,size,bold=false){const c=classicPdfCtx();c.font=`${bold?700:400} ${size}px Arial`;return c.measureText(classicPdfSanitize(text)).width;}
function classicPdfFit(text,width,size,min,bold=false){while(size>min&&classicPdfMeasure(text,size,bold)>width)size-=.25;return Math.max(min,size);}
function classicPdfHex(value){let h="";for(const ch of classicPdfSanitize(value)){const n=ch.charCodeAt(0);h+=(n<=255?n:63).toString(16).padStart(2,"0").toUpperCase();}return `<${h}>`;}
function classicPdfRgb(hex){const {r,g,b}=hexToRgb(hex);return `${(r/255).toFixed(4)} ${(g/255).toFixed(4)} ${(b/255).toFixed(4)}`;}
function classicPdfColor(role){const color=role==="white"?classicPdfPalette.onSecondary:role==="brown"?classicPdfPalette.text:role==="cream"?classicPdfPalette.cream:classicPdfPalette[role]||classicPdfPalette.text;return classicPdfRgb(color);}
function classicPdfText(cmd,value,x,top,width,size,opt={}){const text=classicPdfSanitize(value).trim();if(!text)return;const bold=opt.bold!==false;size=classicPdfFit(text,width,size,opt.minSize||4.2,bold);const w=classicPdfMeasure(text,size,bold);let dx=x;if(opt.align==="center")dx=x+Math.max(0,(width-w)/2);if(opt.align==="right")dx=x+Math.max(0,width-w);const y=CLASSIC_PDF_HEIGHT-top-size*.95;cmd.push(`BT /${bold?"F2":"F1"} ${size.toFixed(2)} Tf ${classicPdfColor(opt.color)} rg 1 0 0 1 ${dx.toFixed(2)} ${y.toFixed(2)} Tm ${classicPdfHex(text)} Tj ET`);}
function classicPdfWrap(text,width,size,bold=false){const out=[];for(const para of classicPdfSanitize(text).split(/\r?\n/)){const words=para.trim().split(/\s+/).filter(Boolean);if(!words.length){out.push("");continue;}let line="";for(const word of words){const test=line?`${line} ${word}`:word;if(!line||classicPdfMeasure(test,size,bold)<=width)line=test;else{out.push(line);line=word;}}if(line)out.push(line);}return out;}
function classicPdfNotes(cmd,text){const clean=classicPdfSanitize(text).replace(/^Game Notes\s*/i,"").trim();if(!clean)return;let size=7.2,lineHeight=8.4,lines=classicPdfWrap(clean,166,size,false);const maxHeight=143;while(lines.length*lineHeight>maxHeight&&size>5.2){size-=.25;lineHeight=size*1.18;lines=classicPdfWrap(clean,166,size,false);}lines.slice(0,Math.floor(maxHeight/lineHeight)).forEach((line,i)=>classicPdfText(cmd,line,423,617+i*lineHeight,166,size,{bold:false,minSize:size,color:"brown"}));}
function colorDistance(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);}
function scorecardImageElement(){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Classic scorecard background could not be loaded."));image.src=`data:image/jpeg;base64,${EMBEDDED_SCORECARD_BACKGROUND_JPEG_BASE64}`;});}
function recolorScorecardCanvas(ctx,width,height,palette){const image=ctx.getImageData(0,0,width,height),pixels=image.data,targets=Object.fromEntries(Object.entries(palette).map(([key,value])=>[key,Object.values(hexToRgb(value))]));for(let i=0;i<pixels.length;i+=4){const rgb=[pixels[i],pixels[i+1],pixels[i+2]];let best=null,bestDistance=Infinity;for(const swatch of SCORECARD_SOURCE_SWATCHES){const distance=colorDistance(rgb,swatch.source);if(distance<bestDistance){bestDistance=distance;best=swatch;}}if(best&&bestDistance<62){const target=targets[best.role]||targets.text,shade=.38;pixels[i]=Math.max(0,Math.min(255,target[0]+(rgb[0]-best.source[0])*shade));pixels[i+1]=Math.max(0,Math.min(255,target[1]+(rgb[1]-best.source[1])*shade));pixels[i+2]=Math.max(0,Math.min(255,target[2]+(rgb[2]-best.source[2])*shade));}}ctx.putImageData(image,0,0);}
function removeTraditionalScoringGuides(ctx,width,height){const sx=width/CLASSIC_PDF_WIDTH,sy=height/CLASSIC_PDF_HEIGHT,xStart=196.8,cellWidth=28.55,rowHeight=22,rowStarts=[158,180,202,224,246,268,290,312,334,394,416,438,460,482,504,526,548,570];for(const top of rowStarts){for(let col=0;col<10;col++){const left=xStart+col*cellWidth,x=Math.round((left+1.25)*sx),y=Math.round((top+1.25)*sy),w=Math.round((cellWidth-2.5)*sx),h=Math.round((rowHeight-2.5)*sy),sample=ctx.getImageData(Math.round((left+4)*sx),Math.round((top+4)*sy),1,1).data;ctx.fillStyle=`rgb(${sample[0]},${sample[1]},${sample[2]})`;ctx.fillRect(x,y,w,h);}}}
async function themedScorecardBackground(includeTraditionalGuides=false,palette=classicPdfPalette){const source=await scorecardImageElement(),canvas=document.createElement("canvas");canvas.width=source.naturalWidth||EMBEDDED_SCORECARD_BACKGROUND_WIDTH;canvas.height=source.naturalHeight||EMBEDDED_SCORECARD_BACKGROUND_HEIGHT;const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(source,0,0,canvas.width,canvas.height);recolorScorecardCanvas(ctx,canvas.width,canvas.height,palette);if(!includeTraditionalGuides)removeTraditionalScoringGuides(ctx,canvas.width,canvas.height);const dataUrl=canvas.toDataURL("image/jpeg",.94);return {bytes:new Uint8Array(base64ToArrayBuffer(dataUrl.split(",")[1])),width:canvas.width,height:canvas.height};}
function classicPdfOverlay(){const d=collectData(),totals=computeGameTotals(),cmd=["q 612 0 0 792 0 0 cm /Im0 Do Q"];classicPdfText(cmd,topLine(d),21.4,5.0,395,9.4,{minSize:5.8,color:"brown"});const info=[[d.weather?`Weather: ${d.weather}`:"",d.umpires?`Umpires: ${d.umpires}`:""].filter(Boolean).join(" • "),[d.broadcast?`TV: ${d.broadcast}`:"",d.radio?`Radio: ${d.radio}`:""].filter(Boolean).join(" • ")].filter(Boolean);info.slice(0,2).forEach((line,i)=>classicPdfText(cmd,line,21.4,22+i*12,395,8.8,{minSize:5,color:"brown"}));classicPdfText(cmd,`ABS  Away: ${d.awayTeam||"Away"}`,424,51,80,6.1,{minSize:4.2,color:"white",align:"center"});classicPdfText(cmd,`ABS  Home: ${d.homeTeam||"Home"}`,506,51,84,6.1,{minSize:4.2,color:"white",align:"center"});const scoreTops={away:88.3,home:105.6};classicPdfText(cmd,`Away: ${d.awayTeam||"Away"}`,21.4,scoreTops.away,178,10.2,{minSize:6.2,color:"white"});classicPdfText(cmd,`Home: ${d.homeTeam||"Home"}`,21.4,scoreTops.home,178,10.2,{minSize:6.2,color:"white"});const inningX=i=>196.8+(i-1)*28.55;for(let i=1;i<=10;i++){classicPdfText(cmd,totals.away.innings[i-1]||0,inningX(i),scoreTops.away,28.5,8,{align:"center",color:"brown"});classicPdfText(cmd,totals.home.innings[i-1]||0,inningX(i),scoreTops.home,28.5,8,{align:"center",color:"brown"});}[["away",scoreTops.away],["home",scoreTops.home]].forEach(([team,top])=>{classicPdfText(cmd,totals[team].runs,520,top,27,8,{align:"center",color:"brown"});classicPdfText(cmd,totals[team].hits,548.5,top,27,8,{align:"center",color:"brown"});classicPdfText(cmd,totals[team].errors,577,top,27,8,{align:"center",color:"brown"});});const awayTitle=`Away: ${d.awayTeam||"Away"}${d.awayRecord?` (${d.awayRecord})`:""}`,homeTitle=`Home: ${d.homeTeam||"Home"}${d.homeRecord?` (${d.homeRecord})`:""}`;classicPdfText(cmd,awayTitle,21.4,128.0,395,10.3,{minSize:5.5,color:"white"});classicPdfText(cmd,homeTitle,21.4,364.6,395,10.3,{minSize:5.5,color:"white"});const rowTops={away:[161.7,184.1,205.8,227.6,249.3,271.7,293.5,315.2,336.9],home:[398.2,420.0,441.7,463.4,485.1,507.6,529.3,551.0,572.7]};for(const team of ["away","home"]){const stats=computeTeamStats(team);d[team].lineup.forEach((p,r)=>{const top=rowTops[team][r];classicPdfText(cmd,formatLineupPlayer(p),21.4,top,178,8.7,{minSize:4.7,color:"brown"});for(let inn=1;inn<=10;inn++){const plays=playsByBatterInning(team,r,inn),notation=plays.length?plays.map(playNotation).join("/"):"";if(notation)classicPdfText(cmd,notation,inningX(inn)+1,top-2.6,26.5,8.8,{minSize:4.4,align:"center",color:"brown"});}const xs=[482,511,540,569];[stats[r].ab,stats[r].r,stats[r].h,stats[r].rbi].forEach((v,j)=>classicPdfText(cmd,v,xs[j],top,27,7.5,{align:"center",color:"brown"}));});}classicPdfText(cmd,`Away: ${d.awayTeam||"Away"} Pitching`,21.4,599.7,395,9.2,{minSize:4.8,color:"white"});classicPdfText(cmd,`Home: ${d.homeTeam||"Home"} Pitching`,21.4,697.7,395,9.2,{minSize:4.8,color:"white"});const pTops={away:[625.7,637.8,649.8,661.8,673.7,685.8],home:[723.2,735.1,747.1,759.1,771.0,781.0]};for(const team of ["away","home"])d[team].pitchers.forEach((p,i)=>classicPdfText(cmd,formatPitcher(p),21.4,pTops[team][i],178,7.2,{minSize:4.2,color:"brown"}));classicPdfNotes(cmd,exportNotes(d,totals));return `${cmd.join("\n")}\n`;}
function buildClassicPdfBytes(imageInfo,contentText=""){const image=imageInfo.bytes,content=new TextEncoder().encode(contentText||"q 612 0 0 792 0 0 cm /Im0 Do Q\n"),parts=[],offsets=Array(8).fill(0);let length=0;const push=b=>{parts.push(b);length+=b.length;},txt=t=>push(new TextEncoder().encode(t)),obj=(n,b)=>{offsets[n]=length;txt(`${n} 0 obj\n`);b.forEach(push);txt("\nendobj\n");};txt("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");obj(1,[new TextEncoder().encode("<< /Type /Catalog /Pages 2 0 R >>")]);obj(2,[new TextEncoder().encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")]);obj(3,[new TextEncoder().encode("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im0 6 0 R >> >> /Contents 7 0 R >>")]);obj(4,[new TextEncoder().encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")]);obj(5,[new TextEncoder().encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")]);offsets[6]=length;txt(`6 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageInfo.width} /Height ${imageInfo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`);push(image);txt("\nendstream\nendobj\n");offsets[7]=length;txt(`7 0 obj\n<< /Length ${content.length} >>\nstream\n`);push(content);txt("endstream\nendobj\n");const xref=length;txt("xref\n0 8\n0000000000 65535 f \n");for(let i=1;i<=7;i++)txt(`${String(offsets[i]).padStart(10,"0")} 00000 n \n`);txt(`trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);const out=new Uint8Array(length);let pos=0;for(const p of parts){out.set(p,pos);pos+=p.length;}return out;}
async function exportClassicPdf(){try{const d=collectData();classicPdfPalette=scorecardPaletteForHomeTeam(d.homeTeam);const image=await themedScorecardBackground(false,classicPdfPalette),bytes=buildClassicPdfBytes(image,classicPdfOverlay());downloadBlob(new Blob([bytes],{type:"application/pdf"}),`${safeFileName(`${d.awayTeam||"Away"}_at_${d.homeTeam||"Home"}_${d.gameDate||"scorecard"}`)}.pdf`);$("autosaveBar").textContent=`PDF downloaded using ${paletteStatusText(d.homeTeam)}. Traditional guides were removed from computer-scored boxes.`;}catch(err){console.error(err);alert(`PDF export failed: ${err.message}`);}}
async function exportBlankClassicPdf(includeTraditionalGuides){try{const d=collectData();classicPdfPalette=scorecardPaletteForHomeTeam(d.homeTeam);const image=await themedScorecardBackground(includeTraditionalGuides,classicPdfPalette),bytes=buildClassicPdfBytes(image);downloadBlob(new Blob([bytes],{type:"application/pdf"}),`${safeFileName(`${d.homeTeam||"Baseball"}_blank_scorecard${includeTraditionalGuides?"_with_guides":"_clean"}`)}.pdf`);$("blankPdfDialog").close();$("autosaveBar").textContent=`Blank PDF downloaded using ${paletteStatusText(d.homeTeam)}${includeTraditionalGuides?" with traditional guides":" with clean scoring boxes"}.`;}catch(err){console.error(err);alert(`Blank PDF export failed: ${err.message}`);}}

function initEvents(){
  document.querySelectorAll(".step").forEach(b=>b.addEventListener("click",()=>setPanel(b.dataset.panel)));document.querySelectorAll(".next-panel").forEach(b=>b.addEventListener("click",()=>setPanel(b.dataset.next)));
  document.addEventListener("input",e=>{if(e.target.matches("input,textarea,select")&&!e.target.closest("#playDialog")){refreshHeadings();scheduleAutosave();}});
  $("playForm").addEventListener("submit",recordPlay);$("closePlayDialogBtn").addEventListener("click",()=>$("playDialog").close());$("cancelPlayBtn").addEventListener("click",()=>$("playDialog").close());$("playOutcome").addEventListener("change",()=>{const team=$("dialogTeam").value,idx=num($("dialogPlayerIndex").value),existing=scoring.plays.find(play=>play.id===$("dialogPlayId").value),def=defaultDetails($("playOutcome").value,team,idx,existing?.beforeState?.bases||null,existing?.beforeState?.outs??null).d;$("playRuns").value=def.runs;$("playRbi").value=def.rbi;$("playOuts").value=def.outs;$("playErrors").value=def.errors;$("batterDestination").value=def.batter;$("runner1Destination").value=def.r1;$("runner2Destination").value=def.r2;$("runner3Destination").value=def.r3;});
  $("deletePlayBtn").addEventListener("click",()=>{const id=$("dialogPlayId").value;if(id&&confirm("Delete this play?")){deletePlay(id);$("playDialog").close();}});
  $("undoBtn").addEventListener("click",undoLastPlay);$("manualHalfBtn").addEventListener("click",manualChangeHalf);$("resetScoringBtn").addEventListener("click",resetScoring);
  $("ballBtn").addEventListener("click",()=>addPitch("ball"));$("swingStrikeBtn").addEventListener("click",()=>addPitch("swingingStrike"));$("calledStrikeBtn").addEventListener("click",()=>addPitch("calledStrike"));$("foulBtn").addEventListener("click",()=>addPitch("foul"));$("inPlayBtn").addEventListener("click",()=>addPitch("inplay"));
  $("undoPitchBtn").addEventListener("click",undoPitch);$("resetCountBtn").addEventListener("click",()=>resetCurrentCount());$("toggleQuickResultsBtn").addEventListener("click",toggleQuickResults);$("activePitcherSelect").addEventListener("change",changeActivePitcher);
  $("quickResultGrid").addEventListener("click",event=>{const button=event.target.closest("[data-quick-outcome]");if(button)handleQuickOutcome(button.dataset.quickOutcome);});
  $("strikeoutChooser").addEventListener("click",event=>{const button=event.target.closest("[data-terminal-outcome]");if(button)handleTerminalStrikeout(button.dataset.terminalOutcome);});
  document.addEventListener("keydown",handleScoringKeyboard);
  $("refreshGamesBtn").addEventListener("click",refreshScheduleAndClear);$("dailyGameSelect").addEventListener("change",()=>$("lookupGameBtn").disabled=!$("dailyGameSelect").value);$("lookupGameBtn").addEventListener("click",loadSelectedGame);$("clearForManualBtn").addEventListener("click",clearForManual);
  $("downloadPitchLogBtn").addEventListener("click",downloadPitchLogCsv);
  ["exportExcelBtn","exportExcelBtn2"].forEach(id=>$(id).addEventListener("click",exportExcel));["printPdfBtn","printPdfBtn2"].forEach(id=>$(id).addEventListener("click",exportClassicPdf));["saveGameFileBtn","saveGameFileBtn2"].forEach(id=>$(id).addEventListener("click",saveGameFile));
  ["openGameFile","openGameFile2"].forEach(id=>$(id).addEventListener("change",e=>{if(e.target.files[0])openGameFile(e.target.files[0]);e.target.value="";}));$("templateFile").addEventListener("change",e=>{if(e.target.files[0])uploadTemplate(e.target.files[0]);});$("downloadBlankBtn").addEventListener("click",downloadBlank);$("downloadBlankPdfBtn").addEventListener("click",()=>$("blankPdfDialog").showModal());$("blankPdfWithGuidesBtn").addEventListener("click",()=>exportBlankClassicPdf(true));$("blankPdfCleanBtn").addEventListener("click",()=>exportBlankClassicPdf(false));
  $("lookupDate").addEventListener("change",loadSchedule);$("scheduleLevel").addEventListener("change",loadSchedule);
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").hidden=false;});$("installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").hidden=true;});
}
function disableBrowserFormRestore(){
  document.querySelectorAll("input:not([type=file]):not([type=hidden]), textarea").forEach(field=>{
    field.setAttribute("autocomplete","off");
    field.setAttribute("autocapitalize",field.type==="text"?"words":"off");
  });
  document.querySelectorAll("form").forEach(form=>form.setAttribute("autocomplete","off"));
}
function initializeBlankStartup(){
  clearPersistentGameData();
  scoring=initialScoring();
  setFieldsFromData({});
  const today=globalThis.BaseballData?.localDateISO?.("America/New_York") || new Date().toISOString().slice(0,10);
  setField("lookupDate",today);
  setField("scheduleLevel","mlb");
  refreshAll();
  setPanel("setup");
  if($("autosaveBar")) $("autosaveBar").textContent="Blank game ready. Use Save Game File to preserve a game.";
}
function init(){
  createLineupInputs("away");createLineupInputs("home");createPitcherInputs("away");createPitcherInputs("home");
  disableBrowserFormRestore();
  renderQuickResults();
  setQuickResultsVisible(true);
  initEvents();
  initializeBlankStartup();
  loadSchedule();
  window.addEventListener("pageshow",event=>{
    if(event.persisted){
      initializeBlankStartup();
      loadSchedule();
    }
  });
  if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js?v=23-scroll-preserve",{updateViaCache:"none"}).catch(console.warn);
}
init();
