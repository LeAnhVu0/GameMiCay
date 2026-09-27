# FUNCTION_INVENTORY — Template phan tich tung ham

Moi function phai co record day du truoc khi rename (muc 32 GUIDE).

---

## Template

### `SYMBOL()`

**Location:** `game.js:LNNN`

#### Calls from
- ...

#### Calls
- ...

#### Reads
- `gameState...`
- `runtimeState...`

#### Writes
- ...

#### DOM
- ...

#### Return
- ...

#### Pseudo-code
```
...
```

#### Hypothesis
...

#### Candidate name
`...`

#### Confidence
`HIGH | MEDIUM | LOW`

#### Verification
- [ ] output checked
- [ ] side effects checked
- [ ] all call sites checked
- [ ] gameplay regression checked
- [ ] renamed

---

## Ham da phan tich (HIGH confidence)

### `Ya()` → `showAnnouncementModal` [DISABLED]
**Location:** `game.js:L3901`
**Status:** renamed — function body replaced with no-op comment

#### Pseudo-code
```
set i.byeShown = true
set localStorage["tiemMiCayBye"] = "1"
call E() to show announcement modal HTML
```

#### Candidate name: `showAnnouncementModal`
#### Confidence: HIGH — da xac nhan call site, HTML content, localStorage pattern
#### Verification: [x] all call sites removed [x] no regression

---

### `Ms()` → `hasSeenAnnouncement`
**Location:** `game.js:L3892`

#### Pseudo-code
```
if i.byeShown return true
try: return localStorage["tiemMiCayBye"] === "1"
catch: return false
```

#### Candidate name: `hasSeenAnnouncement`
#### Confidence: HIGH

---

### `Ra()` → `renderSplashScreen`
**Location:** `game.js:L3904`

#### Pseudo-code
```
set i.mode = "splash"
call Se() — likely clearRunState
remove "selling" body class
inject splash HTML into #view
bind goBtn → startGame flow
bind howBtn → ti() (onboarding)
show bye announcement if not yet seen
```

#### Candidate name: `renderSplashScreen`
#### Confidence: HIGH

---

### `ti()` → `openOnboardingDialog`
**Location:** `game.js:L3980`

#### Params
- A: boolean — true = first-time onboarding (includes shop name input), false = how-to-play review

#### Pseudo-code
```
if #ob already exists, return early
build slides array = Ds(A)
create #ob div (role=dialog, aria-modal)
inject HTML: skip button, .obs scroll container, dots, next button
append to body
bind scroll → update dots/button text
bind next → scroll to next slide or call finish
bind skip → jump to last slide or call finish
```

#### Candidate name: `openOnboardingDialog`
#### Confidence: HIGH

---

### `Ds()` → `buildOnboardingSlides`
**Location:** `game.js:L3975`

#### Pseudo-code
```
build array of 9 HTML slide strings
if A (first time): push shop name input slide
return array
```

#### Candidate name: `buildOnboardingSlides`
#### Confidence: HIGH

---
Updated: 2026-09-28
---

## Ham da phan tich (Wave 1 & 3 - Persistence & Inventory)

### `Dc()` -> `encodeSaveEnvelope`
**Location:** `game.js:L1302`
**Confidence:** HIGH

### `Li()` -> `decodeSaveEnvelope`
**Location:** `game.js:L1306`
**Confidence:** HIGH

### `Wn()` -> `createDefaultSaveState`
**Location:** `game.js:L1365`
**Confidence:** HIGH

### `bt()` -> `normalizeSaveState`
**Location:** `game.js:L1511`
**Confidence:** HIGH

### `Hc()` -> `loadSaveState`
**Location:** `game.js:L1798`
**Confidence:** HIGH

### `Q()` -> `saveGameState`
**Location:** `game.js:L1833`
**Confidence:** HIGH

### `Bt()` -> `addInventoryBatch`
**Location:** `game.js:L1855`
**Confidence:** HIGH

### `FA()` -> `consumeInventoryItem`
**Location:** `game.js:L1870`
**Confidence:** HIGH

### `xc()` -> `removeExpiredStock`
**Location:** `game.js:L1880`
**Confidence:** HIGH


## Ham da phan tich (Wave 4 - UI & Audio)

### `dA()` -> `renderMascot`
**Location:** `game.js:L2110`
**Confidence:** MEDIUM

### `M()` -> `playSound`
**Location:** `game.js:L2317`
**Confidence:** MEDIUM

### `k()` -> `showToast`
**Location:** `game.js:L2779`
**Confidence:** MEDIUM

### `E()` -> `showModal`
**Location:** `game.js:L2786`
**Confidence:** MEDIUM

### `Ps()` -> `renderTermsReadonly`
**Location:** `game.js:L3998`
**Confidence:** MEDIUM

### `Rt()` -> `resetGameStateKeepSettings`
**Location:** `game.js:L4088`
**Confidence:** MEDIUM

### `TA()` -> `startPrepMode`
**Location:** `game.js:L4099`
**Confidence:** MEDIUM

### `zA()` -> `renderSettingsScreen`
**Location:** `game.js:L4966`
**Confidence:** MEDIUM

