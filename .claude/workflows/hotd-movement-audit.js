export const meta = {
  name: 'hotd-movement-audit',
  description: 'Web-grounded accuracy audit of the HOTD tracker character-movement data against the aired show',
  whenToUse: 'Full accuracy audit of src/data/episodes.json against the aired show (scope with args to re-check just new episodes)',
  phases: [
    { title: 'Scan', detail: 'derive episode list + rosters from the repo data' },
    { title: 'Find', detail: 'one auditor per episode + per character, web-grounded, plus a structural critic' },
    { title: 'Verify', detail: 'adversarial fact + convention check per finding' },
  ],
}

// ---------------------------------------------------------------------------
// Config (all overridable via args — nothing episode/season-specific is baked in)
//   args.repo            : repo root (default below)
//   args.episodeNumbers  : restrict the audit to these absolute episode numbers
//   args.characterIds    : restrict the per-character pass to these ids
//   args.skipCharacterArcs : true to skip the per-character pass (lighter run)
//   args.seeds           : { <episodeNumber>: "hypothesis hint string" } — optional
// ---------------------------------------------------------------------------
const A = (args && typeof args === 'object') ? args : {}
const REPO = A.repo || '/Users/nordinbelkacemi/code/hotd-tracker-cloud/hotd-tracker'
const EPISODES_PATH = `${REPO}/src/data/episodes.json`
const CHARACTERS_PATH = `${REPO}/src/data/characters.json`
const LOCATIONS_PATH = `${REPO}/src/data/locations.json`
const SEEDS = (A.seeds && typeof A.seeds === 'object') ? A.seeds : {}

// The tracker's data model and the rules for what does / does not count as a
// defect. Inlined so the audit is self-contained (no external prep files).
const CONVENTIONS = `# Tracker data model & audit conventions

## Data model (src/data/episodes.json)
- An array of episodes, each: { number (absolute, 1-based), title, initialLocations, movements }.
- initialLocations maps every tracked characterId -> { location: <locationId|null>, status, note? }: the state of EVERY tracked character at the episode's START.
- movements is an ordered list of { characters: [ids], from: <locationId|null>, to: <locationId|null>, note? } — relocations DURING the episode, in story order.
- Every character id and location id must exist in characters.json / locations.json. A null location means off the board (dead, departed, or whereabouts unknown). A movement whose "to" is null is the character "leaving the board".
- Statuses in use: "alive", "dead", "not-born", "not-introduced", "alive-offscreen".
- The map draws a path through the successive real locations a character occupies; a character who never sits at a mapped location draws no path.

## Defect kinds (what to file)
- wrong-movement: a movement that did not happen, happened in a different episode, has the wrong characters, or wrong from/to endpoints.
- missing-movement: a tracked character travels on-screen this episode (including a round trip ending where it began) but the data leaves them parked.
- wrong-initial: a character's episode-start location contradicts where the show places them at the episode's start.
- wrong-status: status contradicts the show — on-screen while "not-introduced"/"not-born", "alive" after an on-screen death, or "alive-offscreen" misused.
- wrong-note: a note makes a factually FALSE claim (wrong name, place, or event).
- missing-location: see convention 4.

## Conventions (several exist specifically to PREVENT false findings)
1. Off-screen travel between episodes may legitimately be encoded in EITHER the departing or the arriving episode. Do not flag a movement merely because it could equally live in an adjacent episode.
2. An episode-opening arrival encoded as an in-episode movement (from the prior location to where the character begins the episode) is acceptable, not a defect.
3. Spatial granularity is coarse: one location per character per episode segment. Movement WITHIN one mapped place is not a movement and not a defect.
4. The bar for a new location is HIGH. Only file missing-location when a tracked character travels significantly on-screen to a place absent from locations.json AND the journey genuinely cannot be expressed with existing mapped locations. Propose id, display name, region, and approximate position relative to existing places.
5. Retroactive truth. If a later episode reveals where a character REALLY was earlier (e.g. secretly imprisoned all along), the earlier episodes' data should reflect that revealed truth; file per-episode fixes.
6. Notes are defective ONLY if factually false. An incomplete-but-true or differently-worded note is not a defect.
7. Status semantics: "not-born" before birth; "not-introduced" before first on-screen appearance; "alive"/"dead" as depicted; "alive-offscreen" for a character known alive but absent. Dead characters keep location null and stay dead in every later episode.

## Do NOT flag
- Encoding-style choices permitted by conventions 1-3.
- Incomplete-but-true notes (convention 6).
- Speculative or unverifiable claims — if you cannot corroborate it from a source, do not file it.
- Within-location scene movement (convention 3).`

// One generic sourcing mandate for every episode — no season/date assumptions.
const WEB_MANDATE = `SOURCING MANDATE: this tracker covers a TV show, so treat your own memory of it as unreliable — recent seasons may post-date your training, and even older episodes are easy to misremember. Every finding you file MUST be corroborated by web sources fetched now: the episode's fandom wiki synopsis ("Wiki of Westeros" on gameofthrones.fandom.com — WebFetch may return HTTP 402 on it, in which case use search snippets plus full recaps from sites such as comicbookclublive.com, winteriscoming.net, screenrant.com, collider.com, ew.com, vulture.com, wolfsports.com, seat42f.com, butwhytho.net, scrapsfromtheloft.com). Cross-check at least two independent sources for every fact you assert. Beware book contamination: recappers sometimes describe the source books; only what is depicted in the SHOW counts. Memory alone is enough to decide something is FINE and file nothing; it is never enough to file a finding.`

const SCAN = {
  type: 'object', required: ['episodes', 'characterIds', 'locationIds'], additionalProperties: false,
  properties: {
    episodes: {
      type: 'array',
      items: {
        type: 'object', required: ['number', 'title'], additionalProperties: false,
        properties: { number: { type: 'integer' }, title: { type: 'string' } },
      },
    },
    characterIds: { type: 'array', items: { type: 'string' } },
    locationIds: { type: 'array', items: { type: 'string' } },
  },
}

const FINDINGS = {
  type: 'object', required: ['findings', 'sources'], additionalProperties: false,
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['episode', 'kind', 'characters', 'summary', 'evidence', 'proposedFix', 'confidence'],
        additionalProperties: false,
        properties: {
          episode: { type: 'integer', description: 'absolute episode number the defect belongs to' },
          kind: { enum: ['wrong-movement', 'missing-movement', 'wrong-initial', 'wrong-status', 'wrong-note', 'missing-location', 'other'] },
          characters: { type: 'array', items: { type: 'string' }, description: 'tracked character ids involved' },
          summary: { type: 'string', description: 'one-sentence statement of the defect' },
          evidence: { type: 'string', description: 'what the show actually depicts, with source URLs' },
          proposedFix: { type: 'string', description: 'precise fix referencing JSON fields (initialLocations entries / movements to add, remove or change)' },
          confidence: { enum: ['high', 'medium', 'low'] },
        },
      },
    },
    sources: { type: 'array', items: { type: 'string' } },
  },
}

const VERDICT = {
  type: 'object', required: ['isRealDefect', 'explanation', 'sources'], additionalProperties: false,
  properties: {
    isRealDefect: { type: 'boolean' },
    explanation: { type: 'string' },
    correctedFix: { type: ['string', 'null'], description: 'if defect is real but the proposed fix needs adjustment, the corrected fix; else null' },
    sources: { type: 'array', items: { type: 'string' } },
  },
}

const episodePrompt = (e, seed) => `You are auditing ONE episode of a House of the Dragon character-location tracker against the aired HBO show.

Episode under audit: absolute episode ${e.number}, "${e.title}". (Work out its season and episode-in-season yourself if you need them for searching.)

DATA TO READ (Read tool):
- ${EPISODES_PATH} — the full episodes array. Find the entry with "number": ${e.number}. Also read entry ${e.number - 1} if it exists and compute where each character ENDS that previous episode (apply its movements to its initialLocations), so you can judge whether this episode's initial entries reflect real off-screen travel.
- ${CHARACTERS_PATH} — valid character ids (audit only these ids).
- ${LOCATIONS_PATH} — valid mapped location ids.

TRACKER CONVENTIONS (follow exactly):
${CONVENTIONS}

RESEARCH: load web tools — ToolSearch "select:WebSearch,WebFetch" — then establish what ACTUALLY happens in this episode: who travels where (on-screen or unambiguously implied), who dies, who first appears, where each scene is set.
${WEB_MANDATE}
${seed ? '\nFIRST-PASS HYPOTHESES to verify or refute (do not trust blindly): ' + seed + '\n' : ''}
AUDIT EXHAUSTIVELY:
- Every movement in this episode's data: did it happen, in this episode, with exactly these characters and endpoints?
- Every character's initialLocations entry (location AND status) vs where the show has them at episode start.
- Missing movements: any tracked character who travels this episode but is left parked.
- Notes with factually false claims (wrong names/places/events).
- missing-location only per convention 4.

Report ONLY genuine defects per the conventions. If the episode's data is fully correct, return an empty findings array — do not invent findings. Each finding needs a precise proposedFix in terms of the JSON (which initialLocations entries or movements to add/remove/change, with exact ids). "sources" lists every URL you relied on.`

const characterPrompt = (cid) => `You are auditing ONE character's whereabouts across an entire House of the Dragon location tracker, against the aired HBO show.

Character under audit: id "${cid}".

DATA TO READ (Read tool):
- ${EPISODES_PATH} — read in full; build this character's tracker location+status for EVERY episode (initialLocations["${cid}"] plus every movement whose characters include "${cid}").
- ${CHARACTERS_PATH}, ${LOCATIONS_PATH} — valid ids.

TRACKER CONVENTIONS (follow exactly):
${CONVENTIONS}

Load web tools — ToolSearch "select:WebSearch,WebFetch" — and establish from the SHOW where this character actually is across the series. File CROSS-EPISODE findings the single-episode auditors would miss:
- long stretches parked in one place where the show moved them;
- wrong introduction or death episode (on-screen while "not-introduced"/"not-born", or activity after an on-screen death);
- retroactive-truth violations — a later episode reveals the character was really elsewhere earlier (convention 5);
- unexplained continuity jumps between consecutive episodes.
${WEB_MANDATE}

If the character appears in at most one episode, or you find nothing solid, return an empty findings array. Each finding names the absolute episode it belongs to and gives a precise proposedFix.`

const criticPrompt = () => `You are the cross-episode STRUCTURAL critic for a House of the Dragon location-tracker audit. Other agents audit single episodes and single characters; you hunt for internal, structural defects they cannot see.

DATA TO READ (Read tool): ${EPISODES_PATH} (in full), ${CHARACTERS_PATH}, ${LOCATIONS_PATH}.

TRACKER CONVENTIONS (follow exactly):
${CONVENTIONS}

Hunt ONLY for internal/structural defects (most need no web access; corroborate any show-fact claim per the mandate below):
1. Mechanical contradictions inside a single episode — an initialLocations entry its own movements contradict (e.g. a character with an initial location but a movement whose "from" is a different place, with no reconciling note).
2. Status misuse across the roster — "not-born" vs "not-introduced" used inconsistently for comparable characters; a character alive after an earlier on-screen death; "alive-offscreen" misuse.
3. Unexplained continuity jumps — episode N+1's initial location for a character contradicts episode N's computed final state with no note and no plausible off-screen travel.
4. Referential integrity — any character id or location id used in an episode that is not present in the rosters.
${WEB_MANDATE}

File each defect as a separate finding with a precise per-episode proposedFix.`

// --- Scan: derive the episode list + rosters from the repo -----------------
phase('Scan')
const scan = await agent(`Read three JSON files and return the tracker's episode list and rosters — data only, no commentary.
- ${EPISODES_PATH}: return every entry's { number, title }.
- ${CHARACTERS_PATH}: return every character id.
- ${LOCATIONS_PATH}: return every location id.`, { label: 'scan', phase: 'Scan', schema: SCAN })

let episodes = (scan.episodes || []).slice().sort((a, b) => a.number - b.number)
if (Array.isArray(A.episodeNumbers) && A.episodeNumbers.length) {
  const want = new Set(A.episodeNumbers)
  episodes = episodes.filter((e) => want.has(e.number))
}
const titleByNumber = new Map((scan.episodes || []).map((e) => [e.number, e.title]))
let characterIds = A.skipCharacterArcs ? [] : (scan.characterIds || [])
if (Array.isArray(A.characterIds) && A.characterIds.length) {
  const want = new Set(A.characterIds)
  characterIds = characterIds.filter((c) => want.has(c))
}

// --- Find: one auditor per episode + per character, plus a structural critic
phase('Find')
log(`Auditing ${episodes.length} episodes + ${characterIds.length} characters + 1 structural critic`)
const finderThunks = [
  ...episodes.map((e) => () => agent(episodePrompt(e, SEEDS[e.number]), { label: `episode:${e.number}`, phase: 'Find', schema: FINDINGS })),
  ...characterIds.map((cid) => () => agent(characterPrompt(cid), { label: `char:${cid}`, phase: 'Find', schema: FINDINGS })),
  () => agent(criticPrompt(), { label: 'critic', phase: 'Find', schema: FINDINGS }),
]
const found = await parallel(finderThunks)
const ok = found.filter(Boolean)
const raw = ok.flatMap((r) => r.findings || [])
log(`${raw.length} raw findings from ${ok.length}/${finderThunks.length} finders`)

const byKey = new Map()
for (const f of raw) {
  const key = `${f.episode}|${f.kind}|${[...(f.characters || [])].sort().join(',')}`
  if (!byKey.has(key)) {
    byKey.set(key, { ...f, reports: 1 })
  } else {
    const m = byKey.get(key)
    m.reports++
    if (!m.summary.includes(f.summary)) {
      m.summary += ' || ' + f.summary
      m.evidence += ' || ' + f.evidence
      m.proposedFix += ' || ' + f.proposedFix
    }
    if (f.confidence === 'high') m.confidence = 'high'
  }
}
const deduped = [...byKey.values()]
log(`${deduped.length} findings after dedup — verifying each with 2 adversarial lenses`)

// --- Verify: adversarial fact-check + conventions judge per finding ---------
phase('Verify')
const verified = await parallel(deduped.map((f, i) => () => {
  const title = titleByNumber.get(f.episode) || '(unknown title)'
  const fjson = JSON.stringify(f, null, 1)
  const factsPrompt = `You are an adversarial fact-checker for a House of the Dragon (HBO show) location-tracker audit. A finder claims the tracker data for absolute episode ${f.episode} ("${title}") has this defect:

${fjson}

Read episode ${f.episode} from ${EPISODES_PATH} for context. Load web tools via ToolSearch "select:WebSearch,WebFetch".

Try to REFUTE the finding's factual claims about what the show depicts: check its cited sources and find independent ones.
${WEB_MANDATE}

isRealDefect = true ONLY if (a) the factual claims survive your refutation attempt with solid sourcing, AND (b) the tracker's current data really does contradict the show. If evidence is thin, contradictory, or unverifiable, return false. If the defect is real but the proposedFix has wrong details (wrong endpoint, wrong episode, wrong name), set isRealDefect true and put the corrected fix in correctedFix.`
  const convPrompt = `You are the conventions judge for a House of the Dragon location-tracker audit. ASSUME the finding's factual claims are TRUE (another agent checks facts). Your only question: under the tracker's conventions, is this a genuine data defect requiring a change — or an acceptable encoding the conventions allow?

Finding for absolute episode ${f.episode}:

${fjson}

TRACKER CONVENTIONS:
${CONVENTIONS}

Read episode ${f.episode} from ${EPISODES_PATH} (the data in question). Pay attention to conventions 1, 2, 4, 5 and 6. isRealDefect = false if the current data is an acceptable encoding even with the finding's facts true. If true but the proposedFix itself would violate a convention, set correctedFix. No web access needed; do not re-litigate facts.`
  return parallel([
    () => agent(factsPrompt, { label: `facts:E${f.episode}#${i}`, phase: 'Verify', schema: VERDICT }),
    () => agent(convPrompt, { label: `conv:E${f.episode}#${i}`, phase: 'Verify', schema: VERDICT }),
  ]).then(([facts, conv]) => ({
    finding: f,
    facts,
    conv,
    confirmed: !!(facts && facts.isRealDefect) && !!(conv && conv.isRealDefect),
  }))
}))

const results = verified.filter(Boolean)
const confirmed = results.filter((r) => r.confirmed)
const rejected = results.filter((r) => !r.confirmed)
log(`${confirmed.length} confirmed, ${rejected.length} rejected`)
return {
  stats: { finders: finderThunks.length, findersReturned: ok.length, rawFindings: raw.length, deduped: deduped.length, confirmed: confirmed.length, rejected: rejected.length },
  confirmed: confirmed.map((r) => ({ ...r.finding, factsExplanation: r.facts.explanation, factsSources: r.facts.sources, correctedFix: r.facts.correctedFix || r.conv.correctedFix || null, convExplanation: r.conv.explanation })),
  rejected: rejected.map((r) => ({ episode: r.finding.episode, kind: r.finding.kind, characters: r.finding.characters, summary: r.finding.summary, reports: r.finding.reports, factsVerdict: r.facts ? r.facts.isRealDefect : null, factsExplanation: r.facts ? r.facts.explanation : 'agent failed', convVerdict: r.conv ? r.conv.isRealDefect : null, convExplanation: r.conv ? r.conv.explanation : 'agent failed' })),
}
