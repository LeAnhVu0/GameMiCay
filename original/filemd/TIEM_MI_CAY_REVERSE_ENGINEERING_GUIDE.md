# Tiệm Mì Cay — Playbook Reverse Engineering & Refactor `game.js`

> Mục tiêu của tài liệu này là biến `game.js` đã bị minify/identifier-shortened thành một codebase JavaScript có cấu trúc, dễ đọc, dễ debug và có thể tiếp tục phát triển mà **không làm thay đổi gameplay**.
>
> Baseline hiện tại:
>
> - `game.js` vẫn chứa toàn bộ logic gameplay và asset nhúng.
> - Có khoảng **236 function declaration** cần phân loại và đặt lại tên.
> - Save format hiện tại phải giữ tương thích: `MC2|base64(JSON)|checksum`.
> - Một số symbol đã xác định chắc chắn: `kA`, `y`, `$A`, `uA`, `xA`, `o`, `i`, `Wn`, `bt`, `Hc`, `Q`, `Dc`, `Li`, `Bt`, `FA`, `xc`.
> - Không có source map, vì vậy mục tiêu là **khôi phục semantic theo hành vi**, không giả định rằng ta có thể lấy lại tên biến/hàm gốc 100%.

---

# 1. Mục tiêu cuối cùng

Không nên dừng ở việc đổi:

```js
function Wn() {}
function Hc() {}
function Bt(A, n) {}
```

thành:

```js
function createDefaultSaveState() {}
function loadSaveState() {}
function addInventoryItem(itemId, quantity) {}
```

Mục tiêu thật sự phải là chuyển từ một file monolithic:

```text
game.js
```

thành một project có dependency rõ ràng:

```text
src/
├── app/
│   ├── bootstrap.js
│   ├── game-controller.js
│   └── game-loop.js
│
├── assets/
│   └── image-assets.js
│
├── config/
│   ├── item-catalog.js
│   ├── recipes.js
│   ├── progression-config.js
│   └── constants.js
│
├── state/
│   ├── default-state.js
│   ├── game-state.js
│   └── runtime-state.js
│
├── persistence/
│   ├── save-codec.js
│   ├── save-migration.js
│   └── save-repository.js
│
├── inventory/
│   ├── inventory-service.js
│   └── expiry-service.js
│
├── economy/
│   └── economy-service.js
│
├── customers/
│   ├── customer-service.js
│   └── order-service.js
│
├── cooking/
│   ├── recipe-service.js
│   ├── cooking-service.js
│   └── pot-service.js
│
├── staff/
│   └── staff-service.js
│
├── progression/
│   ├── upgrade-service.js
│   ├── achievement-service.js
│   └── event-service.js
│
├── ui/
│   ├── render.js
│   ├── screens/
│   ├── components/
│   ├── modal.js
│   └── toast.js
│
├── audio/
│   └── audio-manager.js
│
└── utils/
    ├── random.js
    ├── format.js
    ├── time.js
    └── dom.js
```

Không nhất thiết phải đúng chính xác cấu trúc trên, nhưng dependency cuối cùng phải gần với mô hình này.

---

# 2. Nguyên tắc quan trọng nhất

## 2.1 Không rename khi chưa hiểu side effect

Một hàm không được đặt tên chỉ dựa trên tên biến nó đọc.

Ví dụ:

```js
function X(A) {
    o.money -= y[A].cost;
    Bt(A, 1);
    Q();
    M();
}
```

Không nên vội gọi:

```js
buyItem()
```

mà phải ghi nhận đầy đủ:

```text
- trừ tiền
- thêm inventory
- save
- render/update UI
```

Tên hợp lý hơn có thể là:

```js
purchaseInventoryItem()
```

hoặc:

```js
buyStockItem()
```

sau khi xác nhận call site.

---

## 2.2 Luôn phân biệt 3 loại state

Code hiện tại có ít nhất hai state lớn đã xác định:

```js
o // persistent save state
i // runtime session state
```

Khi reverse-engineer, cần luôn phân biệt:

### Persistent state

Dữ liệu phải tồn tại sau reload:

```text
money
day
inventory
upgrades
staff
statistics
settings
progression
...
```

### Runtime state

Dữ liệu chỉ sống trong phiên hiện tại:

```text
mode
tab
slots
pots
focus
run
paused
online
...
```

### Derived state

Không nên lưu trực tiếp nếu có thể tính lại:

```text
current inventory total
available recipe list
customer satisfaction summary
current star display
...
```

Nếu lẫn 3 loại này với nhau, việc refactor rất dễ tạo bug save/load.

---

# 3. Không được làm refactor lớn ngay từ đầu

Sai:

```text
Ngày 1:
- đổi 200 tên hàm
- chia 15 file
- chuyển toàn bộ sang ES module
- đổi state model
- sửa UI
```

Khả năng debug khi game hỏng gần như bằng 0.

Phải đi theo thứ tự:

```text
Observe
→ Classify
→ Alias
→ Verify
→ Rename
→ Extract
→ Test
→ Commit
```

---

# 4. Thiết lập baseline trước khi rename

Trước khi sửa bất cứ symbol nào, tạo branch:

```bash
git checkout -b refactor/reverse-engineering
```

Tag bản đang chạy:

```bash
git tag reverse-baseline
```

Sau đó tạo checklist baseline.

## Baseline gameplay

Phải kiểm tra tối thiểu:

```text
[ ] Game khởi động được
[ ] Có thể tạo/new game
[ ] Có thể load save
[ ] Có thể mua nguyên liệu
[ ] Inventory tăng đúng
[ ] Inventory giảm khi sử dụng
[ ] Hàng hết hạn xử lý đúng
[ ] Có thể bắt đầu bán
[ ] Customer xuất hiện
[ ] Có thể nấu món
[ ] Hoàn thành order
[ ] Tiền tăng/giảm đúng
[ ] Ngày game thay đổi đúng
[ ] Upgrade hoạt động
[ ] Staff hoạt động
[ ] Modal hoạt động
[ ] Toast hoạt động
[ ] Sound/music hoạt động
[ ] Reload trang giữ nguyên save
```

Không refactor tiếp nếu baseline chưa ổn.

---

# 5. Tạo Symbol Registry

Đây là file quan trọng nhất trong quá trình reverse-engineer.

Tạo:

```text
docs/SYMBOL_MAP.md
```

Mỗi symbol phải có một record.

Ví dụ:

```md
| Old | Proposed name | Type | Domain | Evidence | Side effects | Confidence | Status |
|---|---|---|---|---|---|---|---|
| Wn | createDefaultSaveState | function | persistence/state | returns complete initial save object | none | HIGH | renamed |
| Hc | loadSaveState | function | persistence | localStorage read + decode + migrate | updates `o` | HIGH | renamed |
| Bt | addInventoryBatch | function | inventory | pushes/merges expiry batches | modifies inventory | HIGH | candidate |
```

## Confidence

Dùng đúng 3 mức:

### HIGH

Có thể xác định gần như chắc chắn từ:

- implementation;
- call sites;
- state mutation;
- UI text;
- dữ liệu input/output.

Có thể rename ngay.

### MEDIUM

Biết domain nhưng chưa chắc semantic chính xác.

Ví dụ:

```text
Có vẻ liên quan customer patience
nhưng chưa biết là initialize hay update.
```

Chưa rename final.

Có thể dùng alias tạm:

```js
const updateCustomerSomething = Ab;
```

### LOW

Chỉ đoán dựa vào vị trí code.

Không rename.

---

# 6. Workflow reverse-engineer một hàm

Giả sử đang phân tích:

```js
function Pe() {
    ...
}
```

Thực hiện đúng các bước sau.

## Bước 1 — tìm declaration

```bash
grep -n "function Pe" game.js
```

Hoặc IDE:

```text
Find → function Pe
```

---

## Bước 2 — tìm tất cả call site

Tìm:

```text
Pe(
```

Không chỉ xem implementation.

Một hàm có thể trông như utility nhưng call site cho thấy nó chỉ được gọi lúc:

```text
start day
finish cooking
open modal
customer spawn
```

Call site thường cho semantic mạnh hơn tên biến bên trong.

---

## Bước 3 — ghi input

Ví dụ:

```js
function Pe(A, n) {
```

Theo dõi:

```text
A lấy từ đâu?
n lấy từ đâu?
```

Nếu call site:

```js
Pe(customer, order)
```

ghi:

```text
A = customer-like object
n = order-like object
```

Chưa rename parameter ngay.

---

## Bước 4 — ghi output

Hàm có:

```js
return ...
```

hay không?

Phân loại:

```text
query
command
renderer
event-handler
factory
validator
serializer
state-mutator
```

---

## Bước 5 — ghi state read/write

Ví dụ:

```text
Reads:
- o.inventory
- o.money
- y[itemId]

Writes:
- o.inventory
- o.stats.waste

Calls:
- Q()
- M()
```

Đây là dữ liệu mạnh nhất để xác định domain.

---

## Bước 6 — ghi DOM interaction

Tìm:

```js
document.querySelector
getElementById
innerHTML
insertAdjacentHTML
classList
dataset
onclick
addEventListener
```

Nếu hàm chủ yếu sinh HTML:

```text
→ ui/rendering
```

Không đặt tên kiểu gameplay service.

---

## Bước 7 — ghi thời điểm chạy

Tìm xem hàm chạy khi:

```text
boot
new game
load game
start day
customer arrives
start cooking
finish cooking
sell
end day
upgrade
settings
visibility change
timer tick
```

---

## Bước 8 — viết pseudo-code

Không rename trước khi có pseudo-code.

Ví dụ:

```text
function Bt(itemId, qty):
    lấy metadata item
    tính expiry
    tìm batch tương thích
    nếu có:
        tăng quantity
    nếu không:
        tạo batch mới
    sort batch theo expiry
```

---

## Bước 9 — đặt candidate name

Ví dụ:

```text
Bt
candidate 1: addInventoryItem
candidate 2: addInventoryBatch
candidate 3: receiveStock
```

Chọn tên phản ánh implementation nhất.

Nếu hàm quản lý expiry batch:

```js
addInventoryBatch()
```

tốt hơn:

```js
addItem()
```

---

## Bước 10 — rename bằng IDE toàn project

Không dùng Search/Replace text thuần nếu symbol ngắn như:

```text
M
N
Q
E
```

Dùng Rename Symbol của IDE/AST.

---

# 7. Parameter naming

Minified code thường có:

```js
function A(n, t, e, a) {}
```

Sau khi xác định semantic, đổi thành:

```js
function createCustomerOrder(customer, recipe, spiceLevel, timestamp) {}
```

Nhưng nên làm hai pha.

## Pha 1

Rename function:

```js
function createCustomerOrder(n, t, e, a) {}
```

Test.

## Pha 2

Rename parameter:

```js
function createCustomerOrder(customer, recipe, spiceLevel, timestamp) {}
```

Test lại.

Không đổi cả function + 5 params + internal variables cùng một commit.

---

# 8. Thứ tự xử lý 236 function

Không nên đi từ line 1 tới line 10.000.

Phải xử lý theo dependency.

## Phase A — utilities

Ưu tiên các hàm:

```text
format
random
clamp
time
DOM helper
encoding
checksum
array/object normalization
```

Lý do:

```text
dependency thấp
call site nhiều
semantic dễ xác định
```

---

## Phase B — persistence

Đã có các anchor:

```text
Dc
Li
Wn
bt
Hc
Q
```

Mục tiêu cuối:

```js
encodeSaveEnvelope()
decodeSaveEnvelope()

createDefaultSaveState()
normalizeSaveState()
loadSaveState()
saveGameState()
```

Sau đó tách:

```text
persistence/save-codec.js
persistence/save-migration.js
persistence/save-repository.js
```

---

# 9. Save subsystem

Đây là subsystem cần refactor trước vì nó tạo boundary rất rõ.

## Mapping hiện tại

```text
Dc(state)
    ↓
JSON.stringify
    ↓
base64
    ↓
checksum
    ↓
MC2|payload|checksum
```

và:

```text
localStorage
    ↓
Hc()
    ↓
Li()
    ↓
bt()
    ↓
o
```

Mục tiêu:

```js
// save-codec.js

export function encodeSaveEnvelope(state) {
    ...
}

export function decodeSaveEnvelope(serialized) {
    ...
}
```

```js
// save-migration.js

export function normalizeSaveState(rawState) {
    ...
}
```

```js
// save-repository.js

export function loadSaveState() {
    ...
}

export function saveGameState(state) {
    ...
}
```

## Quy tắc

Không thay đổi:

```text
MC2|
base64 encoding
checksum algorithm
storage key
legacy save migration
```

trong cùng phase refactor.

Refactor trước.

Thay format sau nếu thật sự cần.

---

# 10. Inventory subsystem

Các anchor đã biết:

```text
Bt(item, qty)
FA(item)
xc()
```

Tạo dependency graph:

```text
item catalog `y`
      ↓
inventory add/remove
      ↓
expiry
      ↓
waste/statistics
      ↓
save
      ↓
render
```

Mục tiêu:

```text
inventory/
├── inventory-service.js
└── expiry-service.js
```

Candidate API:

```js
export function addInventoryBatch(state, itemId, quantity) {}
export function consumeInventoryItem(state, itemId) {}
export function removeExpiredInventory(state, now) {}
export function getInventoryQuantity(state, itemId) {}
export function getInventoryBatches(state, itemId) {}
```

## Quan trọng

Nếu code hiện tại trực tiếp sử dụng global:

```js
o
y
Q()
```

đừng chuyển ngay sang dependency injection.

Pha đầu chỉ extract:

```js
export function addInventoryBatch(itemId, quantity) {
    // vẫn dùng shared state adapter
}
```

Sau khi module ổn mới chuyển sang:

```js
addInventoryBatch(gameState, catalog, itemId, quantity)
```

---

# 11. Catalog / configuration

Các symbol hiện đã biết:

```text
y
$A
uA
xA
```

Nên rename:

```js
itemCatalog
allItemIds
brothItemIds
toppingItemIds
```

Tách:

```text
config/item-catalog.js
```

Ví dụ:

```js
export const itemCatalog = {
    ...
};

export const allItemIds = [...];

export const brothItemIds = [...];

export const toppingItemIds = [...];
```

## Không giữ tên `y`

Một global như:

```js
y[id].cost
```

xuất hiện hàng trăm lần sẽ làm reverse-engineering cực khó.

Rename global domain object là một trong những thay đổi có ROI cao nhất.

---

# 12. Asset subsystem

Hiện:

```text
kA
```

là bảng WEBP data URI.

Rename:

```js
imageAssets
```

Tách hoàn toàn khỏi logic:

```text
assets/image-assets.js
```

```js
export const imageAssets = {
    masc_happy: "...",
    masc_sad: "...",
    ...
};
```

Asset file lớn nhưng gần như không có logic.

Tách nó sớm giúp `game.js` giảm rất nhiều noise.

---

# 13. Runtime state

Hiện đã biết:

```js
i
```

có các field dạng:

```text
mode
tab
slots
online
pots
focus
run
paused
```

Rename:

```js
runtimeState
```

Sau đó tạo:

```text
state/runtime-state.js
```

Ví dụ:

```js
export function createRuntimeState() {
    return {
        mode: "splash",
        tab: "kho",
        slots: [],
        online: [],
        pots: [],
        focus: null,
        run: false,
        paused: false
    };
}
```

Nếu object ban đầu phức tạp hơn, giữ nguyên field đầy đủ.

---

# 14. Persistent state

Rename:

```text
o
```

thành:

```text
gameState
```

Đây là refactor lớn.

Không đổi ở commit đầu tiên.

Thứ tự nên là:

```text
1. Alias
2. Test
3. Replace read-only references
4. Replace mutation references
5. Remove alias
```

Ví dụ:

```js
let o = Wn();

const gameState = o;
```

Sau khi toàn bộ code chuyển dần sang:

```js
gameState.money
```

mới xóa:

```js
o
```

---

# 15. Economy subsystem

Tìm tất cả mutation của:

```text
money
cost
sell
revenue
expense
profit
```

Search:

```text
.money
.cost
.sell
```

Tạo bảng:

```md
| Function | Reads money | Writes money | Cause |
|---|---:|---:|---|
| X | yes | yes | buy inventory |
| Y | yes | yes | upgrade |
| Z | no | yes | customer sale |
```

Sau đó extract thành:

```text
economy/economy-service.js
```

Candidate API:

```js
canAfford(amount)
spendMoney(amount, reason)
earnMoney(amount, reason)
calculateSalePrice(order)
recordRevenue(amount)
recordExpense(amount)
```

Không bắt buộc phải có tất cả các API này.

Chỉ tạo khi source thực sự có semantic tương ứng.

---

# 16. Customer subsystem

Tìm các function đọc/ghi:

```text
online
customer
patience
wait
rating
review
order
```

Đặc biệt theo dõi:

```js
i.online
```

Candidate module:

```text
customers/
├── customer-service.js
└── order-service.js
```

Candidate responsibilities:

```text
spawn customer
generate order
select customer
update patience
serve customer
leave customer
calculate satisfaction
create review
```

## Cách xác định function customer

Evidence mạnh:

```text
- push/remove object vào runtimeState.online
- object chứa avatar/name/order/patience
- timer giảm theo thời gian
- gọi render customer lane
- kết thúc bằng tiền/review
```

---

# 17. Cooking subsystem

Tìm mọi function liên quan:

```text
pots
broth
topping
spice
cook
boil
recipe
serve
```

Đặc biệt:

```js
i.pots
```

Candidate structure:

```text
cooking/
├── pot-service.js
├── recipe-service.js
└── cooking-service.js
```

Ví dụ API:

```js
createPot()
addIngredientToPot()
setSpiceLevel()
startCooking()
updateCookingProgress()
isOrderMatch()
finishDish()
serveDish()
resetPot()
```

Không tự tạo hàm nếu source không có tương ứng.

Nếu một hàm hiện tại làm 5 việc, trước tiên rename nó đúng semantic tổng:

```js
completeCookingAndServeOrder()
```

sau đó mới split.

---

# 18. Staff subsystem

Tìm:

```text
employee
staff
hire
salary
worker
auto
speed
```

Nếu game dùng upgrade và staff chung object, đừng tách ngay.

Trước hết xác định:

```text
staff entity
staff config
staff effect
staff lifecycle
```

Candidate:

```text
staff/staff-service.js
```

---

# 19. Upgrade subsystem

Tìm function:

```text
upgrade
level
unlock
price
capacity
speed
```

Tạo matrix:

```md
| Upgrade | Cost source | Level field | Effect | UI function |
|---|---|---|---|---|
```

Mục tiêu:

```text
progression/upgrade-service.js
```

Candidate API:

```js
getUpgradeLevel()
getUpgradeCost()
canPurchaseUpgrade()
purchaseUpgrade()
applyUpgradeEffect()
```

---

# 20. Event / day / progression subsystem

Tìm:

```text
day
event
daily
challenge
achievement
rank
star
exp
unlock
```

Tách:

```text
progression/
├── day-service.js
├── event-service.js
├── achievement-service.js
└── progression-service.js
```

Chỉ tách thành nhiều file nếu mỗi domain đủ lớn.

Nếu nhỏ, dùng:

```text
progression/progression-service.js
```

---

# 21. UI subsystem

Đây thường là phần chiếm rất nhiều function.

Tìm function có:

```text
innerHTML
querySelector
getElementById
classList
dataset
insertAdjacentHTML
```

Phân loại thành:

```text
screen renderer
component renderer
modal
toast
DOM event handler
DOM utility
```

Không để gameplay logic nằm trong renderer sau khi refactor xong.

Sai:

```js
function renderShop() {
    if (gameState.money >= price) {
        gameState.money -= price;
        ...
    }
}
```

Đúng hơn:

```js
function renderShop() {
    ...
}

function purchaseItem() {
    ...
}
```

---

# 22. Cách tách renderer

Giai đoạn đầu:

```text
ui/render.js
```

có thể giữ nhiều function.

Sau đó split:

```text
ui/screens/home-screen.js
ui/screens/inventory-screen.js
ui/screens/shop-screen.js
ui/screens/sell-screen.js
ui/screens/staff-screen.js
ui/screens/statistics-screen.js
ui/components/customer-card.js
ui/components/pot.js
ui/modal.js
ui/toast.js
```

Không split 20 file ngay từ đầu.

---

# 23. Audio subsystem

Search:

```text
Audio
AudioContext
play()
pause()
music
sound
volume
```

Từ source hiện tại đã thấy audio có state kiểu:

```text
F.el
F.cur
F.bad
o.music
```

Candidate:

```text
audio/audio-manager.js
```

API nên quanh:

```js
playMusic(trackId)
stopMusic()
resumeAudio()
suspendAudio()
playSound(effectId)
setMusicEnabled(enabled)
```

Giữ workaround browser autoplay nếu có.

---

# 24. Utility subsystem

Trong quá trình reverse-engineer sẽ xuất hiện các hàm kiểu:

```text
clamp
randomInt
shuffle
formatMoney
formatTime
escapeHtml
createElement
sleep
```

Đừng vứt tất cả vào:

```text
utils.js
```

nếu file trở nên hỗn loạn.

Tối đa:

```text
utils/random.js
utils/format.js
utils/time.js
utils/dom.js
```

---

# 25. Cách xác định boundary module

Một function thuộc module nào dựa theo thứ tự:

```text
1. State nó mutate
2. Entity nó xử lý
3. Lifecycle nó tham gia
4. UI chỉ là secondary signal
```

Ví dụ:

```js
function X(customer) {
    customer.patience--;
    renderCustomers();
}
```

Domain chính:

```text
customer
```

không phải:

```text
ui
```

Vì render chỉ là side effect.

---

# 26. Dependency rule

Mục tiêu dependency:

```text
config/assets
      ↓
state
      ↓
domain services
      ↓
controller
      ↓
UI
```

Persistence được phép đọc/write state:

```text
state ↔ persistence
```

UI không được tự sửa state tùy tiện.

Không mong muốn:

```text
ui → inventory → ui
```

hoặc:

```text
inventory → modal → inventory
```

Nếu xuất hiện circular dependency, cần đưa orchestration lên:

```text
game-controller.js
```

---

# 27. Game Controller

Sau khi tách service, tạo một lớp orchestration mỏng:

```js
export function purchaseStock(itemId, quantity) {
    const cost = inventoryPricing.calculatePurchaseCost(itemId, quantity);

    if (!economy.canAfford(cost)) {
        ui.showInsufficientMoney();
        return;
    }

    economy.spendMoney(cost);
    inventory.addInventoryBatch(itemId, quantity);
    persistence.saveGameState();
    ui.renderCurrentScreen();
}
```

Không cần dùng class.

Functional module hoàn toàn phù hợp.

---

# 28. Đừng chuyển sang class chỉ để code trông "enterprise"

Không cần:

```js
class InventoryManagerFactoryService {}
```

nếu source đơn giản.

Ưu tiên:

```js
export function addInventoryBatch(...) {}
```

Game browser nhỏ không cần architecture quá nặng.

---

# 29. Alias-first strategy

Đây là chiến thuật an toàn nhất.

Giả sử:

```js
function Bt(A, n) {
    ...
}
```

Thêm:

```js
const addInventoryBatch = Bt;
```

Sau đó chuyển call site dần:

```js
addInventoryBatch(itemId, quantity);
```

thay vì:

```js
Bt(itemId, quantity);
```

Khi tất cả call site đã chuyển:

```js
function addInventoryBatch(A, n) {
    ...
}
```

Sau đó mới đổi params.

Cách này giúp diff nhỏ và rollback dễ.

---

# 30. Không rename symbol 1 ký tự bằng global text replace

Ví dụ:

```text
M
N
Q
E
k
o
i
y
```

Search & Replace text có thể phá:

```text
property name
string
CSS
HTML
local variable
object field
```

Dùng:

```text
IntelliJ Rename Symbol
VS Code Rename Symbol
AST transform
```

---

# 31. AST tooling khuyến nghị

Nếu cần xử lý hàng trăm rename, có thể dùng:

```text
Babel parser
jscodeshift
recast
ast-grep
```

Workflow:

```text
parse
→ identify binding
→ rename binding references
→ print
```

Không regex rename symbol scope-sensitive.

---

# 32. Function inventory sheet

Tạo file:

```text
docs/FUNCTION_INVENTORY.md
```

Format:

```md
## `Pe()`

Location:
`game.js:L1891`

### Calls from

- ...
- ...

### Calls

- ...
- ...

### Reads

- `gameState...`
- `runtimeState...`

### Writes

- ...

### DOM

- ...

### Return

- ...

### Hypothesis

...

### Candidate name

`...`

### Confidence

`HIGH | MEDIUM | LOW`

### Verification

- [ ] output checked
- [ ] side effects checked
- [ ] all call sites checked
- [ ] gameplay regression checked
- [ ] renamed
```

Đây là cách làm 236 function mà không bị mất dấu.

---

# 33. Phân nhóm function index hiện tại

Dựa theo vị trí line, không được khẳng định domain chỉ bằng khoảng line.

Nhưng có thể dùng range để chia workload:

```text
Batch 01: L1092–L2238
Batch 02: L2256–L3445
Batch 03: L3465–L4563
Batch 04: L4594–L5917
Batch 05: L5925–L7068
Batch 06: L7958–L8975
Batch 07: L9280–L10223
```

Mỗi batch:

```text
10–40 functions
```

và phải classify từng function.

---

# 34. Priority scoring

Dùng score để biết hàm nào reverse trước.

## +3

Global state mutation:

```text
gameState
runtimeState
```

## +2

Được gọi bởi nhiều nơi.

## +2

Liên quan save/load.

## +2

Liên quan money/inventory/order.

## +1

Render screen chính.

## -2

Pure SVG/HTML helper.

## -3

Asset-only utility.

Hàm score cao xử lý trước.

---

# 35. Call graph

Mỗi function nên có graph tối thiểu.

Ví dụ:

```text
purchase button
      ↓
handlePurchase()
      ↓
canAfford()
      ↓
spendMoney()
      ↓
addInventoryBatch()
      ↓
saveGameState()
      ↓
renderInventory()
```

Nếu chưa vẽ được flow thì semantic chưa đủ chắc để split module.

---

# 36. Runtime instrumentation

Nếu đọc source chưa đủ, instrument.

Ví dụ:

```js
function trace(name, args) {
    console.debug(`[TRACE] ${name}`, args);
}
```

Tạm chèn:

```js
function Pe(A, n) {
    trace("Pe", { A, n, gameState, runtimeState });
    ...
}
```

Sau đó thao tác UI.

Quan sát:

```text
click gì
→ hàm nào chạy
→ input gì
→ state gì đổi
```

Đây là một trong những kỹ thuật reverse-engineer hiệu quả nhất.

Xóa tracing sau khi xác định xong.

---

# 37. Proxy state instrumentation

Nếu khó biết chỗ nào ghi state:

```js
const gameStateDebug = new Proxy(gameState, {
    set(target, property, value) {
        console.trace("gameState write", property, value);
        target[property] = value;
        return true;
    }
});
```

Chỉ dùng trong debug branch.

Không ship production.

---

# 38. DOM event tracing

Để xác định handler:

Chrome DevTools:

```text
Elements
→ Event Listeners
```

hoặc console:

```js
monitorEvents(document.querySelector("#..."), ["click"]);
```

Từ button → handler → domain function.

---

# 39. Snapshot state

Trước hành động:

```js
structuredClone(gameState)
```

Sau hành động:

```js
structuredClone(gameState)
```

Diff 2 state.

Ví dụ:

```text
Before buy:
money = 1000
inventory.noodle = 2

After buy:
money = 900
inventory.noodle = 3
```

Từ đó biết chính xác effect của function.

---

# 40. Golden save files

Tạo:

```text
test/saves/
├── fresh-game.txt
├── mid-game.txt
├── rich-game.txt
├── inventory-expiry.txt
├── upgrades.txt
└── staff.txt
```

Mỗi lần refactor persistence/domain:

```text
load save
→ run game
→ save lại
→ compare semantic state
```

Đây là safety net cực quan trọng.

---

# 41. Regression test strategy

Không cần test framework ngay lập tức.

Giai đoạn đầu dùng smoke test.

Sau khi các pure function được tách, mới viết unit test.

Ví dụ:

```js
import {
    encodeSaveEnvelope,
    decodeSaveEnvelope
} from "../src/persistence/save-codec.js";

const save = { money: 100 };

const encoded = encodeSaveEnvelope(save);
const decoded = decodeSaveEnvelope(encoded);

console.assert(decoded.money === 100);
```

---

# 42. Contract tests cho save

Bắt buộc giữ:

```text
decode(old save)
encode(new save)
decode(encoded save)
```

Assertions:

```text
money giữ nguyên
inventory giữ nguyên
upgrade giữ nguyên
staff giữ nguyên
progress giữ nguyên
```

---

# 43. Test inventory

Cases:

```text
add 1 item
add multiple item
consume existing item
consume empty item
multiple expiry batches
consume correct batch
expire old stock
waste record
reload after inventory mutation
```

---

# 44. Test economy

Cases:

```text
buy affordable
buy insufficient money
sell
upgrade
staff purchase/hire
end-day calculation
negative-money guard nếu có
```

---

# 45. Test cooking

Cases:

```text
empty pot
valid recipe
wrong ingredient
wrong spice
start cooking
finish cooking
serve correct customer
serve wrong order
cancel/reset
```

Chỉ giữ case thực sự tồn tại trong game.

---

# 46. Test customer

Cases:

```text
spawn
queue/online list
patience
order creation
served
leave
review/rating
multiple customers
```

---

# 47. Test UI

UI test manual tối thiểu:

```text
splash
inventory tab
shop
sell gameplay
upgrade
staff
reviews
statistics/settings
modal
toast
dark mode
mobile width
desktop width
```

---

# 48. Commit strategy

Một commit nên có một semantic change.

Tốt:

```text
refactor: rename save codec functions
refactor: extract save codec module
refactor: rename inventory mutation helpers
refactor: extract inventory service
refactor: rename customer lifecycle functions
```

Tệ:

```text
refactor game
```

với 8.000 dòng thay đổi.

---

# 49. Commit sequence mẫu

```text
01 rename known persistence symbols
02 extract save-codec
03 extract save-migration
04 extract save-repository
05 rename asset/catalog globals
06 extract assets
07 extract item catalog
08 rename runtime/persistent state aliases
09 identify inventory helpers
10 extract inventory
11 identify economy functions
12 extract economy
13 identify customer/order functions
14 extract customers
15 identify cooking functions
16 extract cooking
17 identify staff/upgrade functions
18 extract progression/staff
19 identify render functions
20 extract UI
21 extract audio
22 create game controller
23 remove legacy aliases
24 cleanup dead code
```

---

# 50. Module target đề xuất

Bản cuối nên khoảng **12–15 module chính**, chưa tính screen con.

## 1. `assets/image-assets.js`

Chứa:

```text
kA → imageAssets
```

---

## 2. `config/item-catalog.js`

Chứa:

```text
y → itemCatalog
$A → allItemIds
uA → brothItemIds
xA → toppingItemIds
```

---

## 3. `state/game-state.js`

Persistent state access.

---

## 4. `state/runtime-state.js`

Runtime session state.

---

## 5. `persistence/save-codec.js`

```text
Dc
Li
checksum/base64 helpers
```

---

## 6. `persistence/save-repository.js`

```text
Wn
bt
Hc
Q
```

Nếu migration lớn, tách riêng:

```text
save-migration.js
```

---

## 7. `inventory/inventory-service.js`

```text
Bt
FA
inventory query/mutation
```

---

## 8. `inventory/expiry-service.js`

```text
xc
expiry/waste
```

---

## 9. `economy/economy-service.js`

Money/revenue/cost.

---

## 10. `customers/customer-service.js`

Customer lifecycle.

---

## 11. `cooking/cooking-service.js`

Recipe/pot/cooking/serve.

Nếu lớn:

```text
recipe-service.js
pot-service.js
```

---

## 12. `progression/progression-service.js`

Upgrade/staff/day/event/achievement tùy kích thước.

Có thể split staff:

```text
staff/staff-service.js
```

---

## 13. `ui/render.js`

Screen/component rendering.

Sau đó split theo màn hình.

---

## 14. `audio/audio-manager.js`

Music/SFX.

---

## 15. `app/game-controller.js`

Orchestration và lifecycle.

---

# 51. Quy tắc import

Không tạo dependency spaghetti.

Ví dụ:

```js
// inventory-service.js

import { itemCatalog } from "../config/item-catalog.js";
import { gameState } from "../state/game-state.js";
```

Không để:

```js
inventory-service
    ↓
render
    ↓
game-controller
    ↓
inventory-service
```

UI update nên được controller gọi.

---

# 52. Transitional architecture

Trong giai đoạn đầu có thể dùng:

```text
legacy-context.js
```

Ví dụ:

```js
export {
    gameState,
    runtimeState,
    itemCatalog
};
```

Các module mới dùng context này.

Sau khi migration xong thì loại bỏ.

Điều này tốt hơn việc cố dependency-inject toàn project ngay lập tức.

---

# 53. Rename global constants trước local variables

ROI cao:

```text
kA → imageAssets
y → itemCatalog
$A → allItemIds
uA → brothItemIds
xA → toppingItemIds
o → gameState
i → runtimeState
```

Sau các rename này, ngay cả function chưa rename cũng dễ đọc hơn rất nhiều.

Ví dụ:

Trước:

```js
function Bt(A, n) {
    const t = y[A];
    ...
    o.inv[A] ...
}
```

Sau:

```js
function Bt(A, n) {
    const t = itemCatalog[A];
    ...
    gameState.inv[A] ...
}
```

Semantic bắt đầu lộ ra ngay.

---

# 54. Không đổi property save tùy tiện

Nếu save JSON đang dùng:

```js
{
    inv: ...,
    money: ...,
    day: ...
}
```

đừng đổi:

```text
inv → inventory
```

ngay trong persisted schema.

Có thể tạo accessor:

```js
function getInventoryState() {
    return gameState.inv;
}
```

hoặc migration versioned sau.

Nếu đổi persisted property sớm sẽ phá save cũ.

---

# 55. Naming convention

## Functions

Dùng verb:

```text
create...
load...
save...
normalize...
add...
remove...
consume...
calculate...
render...
update...
start...
finish...
serve...
spawn...
purchase...
```

---

## Boolean

```text
isPaused
isRunning
hasStock
canAfford
shouldSpawn
```

---

## Collections

Plural:

```text
customers
orders
pots
inventoryBatches
itemIds
```

---

## Configuration

```text
itemCatalog
recipeCatalog
upgradeConfig
customerConfig
```

---

# 56. Không dùng tên vague

Tránh:

```text
handleData
processData
doThing
manageState
updateStuff
helper
util2
temp
```

Nếu chưa biết semantic:

```text
unknownPe
```

hoặc giữ:

```text
Pe
```

tốt hơn đặt tên sai.

---

# 57. Rename ledger

Mỗi rename phải thêm vào:

```text
docs/RENAMES.md
```

Ví dụ:

```md
| Old | New | Confidence | Reason |
|---|---|---|---|
| Wn | createDefaultSaveState | HIGH | constructs initial persistent state |
| Hc | loadSaveState | HIGH | localStorage -> decode -> normalize |
| Bt | addInventoryBatch | HIGH | adds quantity with expiry handling |
```

Điều này cực hữu ích khi debug regression.

---

# 58. Những symbol hiện có thể xử lý ngay

Dựa trên mapping đã xác định:

```text
kA  → imageAssets
y   → itemCatalog
$A  → allItemIds
uA  → brothItemIds
xA  → toppingItemIds

o   → gameState
i   → runtimeState

Wn  → createDefaultSaveState
bt  → normalizeSaveState
Hc  → loadSaveState
Q   → saveGameState

Dc  → encodeSaveEnvelope
Li  → decodeSaveEnvelope

Bt  → addInventoryBatch
FA  → consumeInventoryItem
xc  → removeExpiredStock
```

Tên cuối của:

```text
Bt
FA
xc
```

vẫn nên kiểm tra tất cả call site trước khi commit.

---

# 59. Thứ tự rename khuyến nghị

## Wave 1 — chắc chắn cao

```text
kA
y
$A
uA
xA
Wn
bt
Hc
Q
Dc
Li
```

---

## Wave 2 — state

```text
o
i
```

Cẩn thận vì references rất nhiều.

---

## Wave 3 — inventory

```text
Bt
FA
xc
```

và các helper gần chúng.

---

## Wave 4 — utility gần save/inventory

Phân tích từ:

```text
L1092 → L2238
```

---

## Wave 5 — gameplay domain

```text
customer
order
cooking
economy
staff
upgrade
progression
```

---

## Wave 6 — UI/render

Làm sau domain để renderer gọi tên domain rõ ràng.

---

## Wave 7 — audio/browser/runtime

Cuối cùng.

---

# 60. Definition of Done cho một function

Một function được coi là reverse-engineer xong khi:

```text
[ ] Biết tất cả call sites quan trọng
[ ] Biết input semantic
[ ] Biết return semantic
[ ] Biết state reads
[ ] Biết state writes
[ ] Biết side effects
[ ] Biết DOM effect nếu có
[ ] Biết lifecycle
[ ] Có pseudo-code
[ ] Có candidate name
[ ] Confidence HIGH
[ ] Rename bằng symbol-aware tooling
[ ] Game regression test pass
[ ] SYMBOL_MAP cập nhật
```

---

# 61. Definition of Done cho một module

Module chỉ được coi là tách xong khi:

```text
[ ] Không còn symbol minified quan trọng bên trong
[ ] Public API có tên rõ
[ ] Import dependency rõ
[ ] Không circular dependency
[ ] Không truy cập DOM nếu là domain module
[ ] Không save trực tiếp ngoài persistence boundary nếu có thể tránh
[ ] Smoke test pass
[ ] Save compatibility pass
[ ] Commit riêng
```

---

# 62. Definition of Done toàn project

Mục tiêu cuối:

```text
[ ] game.js monolith không còn
[ ] Asset tách riêng
[ ] Catalog/config tách riêng
[ ] Save/load tách riêng
[ ] Persistent/runtime state có tên rõ
[ ] Inventory tách riêng
[ ] Economy tách riêng
[ ] Customer/order tách riêng
[ ] Cooking tách riêng
[ ] Staff/upgrade/progression tách riêng
[ ] UI tách khỏi gameplay domain
[ ] Audio tách riêng
[ ] Controller điều phối lifecycle
[ ] Không còn global minified symbol quan trọng
[ ] Save cũ vẫn load được
[ ] Gameplay regression pass
```

---

# 63. Cấu trúc target thực tế đề xuất

```text
tiem-mi-cay/
├── index.html
├── styles/
│   └── game.css
│
├── src/
│   ├── main.js
│   │
│   ├── app/
│   │   ├── bootstrap.js
│   │   ├── game-controller.js
│   │   └── game-loop.js
│   │
│   ├── assets/
│   │   └── image-assets.js
│   │
│   ├── config/
│   │   ├── item-catalog.js
│   │   └── game-config.js
│   │
│   ├── state/
│   │   ├── game-state.js
│   │   └── runtime-state.js
│   │
│   ├── persistence/
│   │   ├── save-codec.js
│   │   ├── save-migration.js
│   │   └── save-repository.js
│   │
│   ├── inventory/
│   │   ├── inventory-service.js
│   │   └── expiry-service.js
│   │
│   ├── economy/
│   │   └── economy-service.js
│   │
│   ├── customers/
│   │   ├── customer-service.js
│   │   └── order-service.js
│   │
│   ├── cooking/
│   │   ├── cooking-service.js
│   │   ├── pot-service.js
│   │   └── recipe-service.js
│   │
│   ├── staff/
│   │   └── staff-service.js
│   │
│   ├── progression/
│   │   ├── progression-service.js
│   │   └── event-service.js
│   │
│   ├── audio/
│   │   └── audio-manager.js
│   │
│   ├── ui/
│   │   ├── render.js
│   │   ├── modal.js
│   │   ├── toast.js
│   │   ├── components/
│   │   └── screens/
│   │
│   └── utils/
│       ├── dom.js
│       ├── format.js
│       ├── random.js
│       └── time.js
│
├── docs/
│   ├── SYMBOL_MAP.md
│   ├── FUNCTION_INVENTORY.md
│   ├── RENAMES.md
│   └── REVERSE_ENGINEERING.md
│
└── test/
    └── saves/
```

Đây là target cuối. Không cần tạo tất cả file ngay ngày đầu.

---

# 64. Roadmap thực hiện

## Stage 0 — baseline

```text
Duration target: 1 unit of work
```

- Git baseline.
- Run game.
- Smoke test.
- Golden saves.
- Không sửa logic.

---

## Stage 1 — visibility

- Prettify/format code.
- Tách asset.
- Rename catalog.
- Rename known save functions.
- Tạo symbol registry.

Mục tiêu:

```text
game.js dễ đọc hơn nhưng logic chưa đổi.
```

---

## Stage 2 — persistence

- Save codec.
- Migration.
- Repository.
- Contract tests.

Mục tiêu:

```text
save/load trở thành subsystem độc lập.
```

---

## Stage 3 — inventory

- Inventory query.
- Inventory mutation.
- Expiry.
- Waste.

---

## Stage 4 — economy

- Money.
- Purchase.
- Revenue.
- Expense.

---

## Stage 5 — customer/order

- Customer lifecycle.
- Order generation.
- Patience.
- Reviews.

---

## Stage 6 — cooking

- Pot.
- Ingredient.
- Spice.
- Cooking lifecycle.
- Serve.

---

## Stage 7 — staff/progression

- Staff.
- Upgrade.
- Day.
- Event.
- Achievement/unlock nếu có.

---

## Stage 8 — UI

- Render functions.
- Screens.
- Modal.
- Toast.
- Event binding.

---

## Stage 9 — audio/runtime

- Audio manager.
- Visibility handling.
- Timers.
- Game loop.

---

## Stage 10 — cleanup

- Remove aliases.
- Remove dead code.
- Remove old globals.
- Validate no circular dependencies.
- Full regression.

---

# 65. Khi nào nên split một function

Không split chỉ vì function dài.

Split nếu function có nhiều responsibility.

Ví dụ:

```text
purchase stock
+ change money
+ mutate inventory
+ create toast
+ save
+ rerender
```

Nên orchestration:

```js
function purchaseStock(...) {
    economy.spendMoney(...);
    inventory.addInventoryBatch(...);
    persistence.saveGameState(...);
    ui.showToast(...);
    ui.renderInventory(...);
}
```

Các operation nhỏ nằm trong service tương ứng.

---

# 66. Khi nào KHÔNG nên split

Function render template dài:

```js
function renderCustomerCard(customer) {
    return `... 80 lines HTML ...`;
}
```

Dài nhưng một responsibility.

Không bắt buộc split nếu readability vẫn tốt.

---

# 67. Dead code

Chỉ xóa code khi:

```text
- không có call site;
- không được gọi dynamic;
- không được reference bởi event/string;
- không phải compatibility branch;
- smoke test không thay đổi.
```

Đừng xóa chỉ vì IDE báo unused trong một IIFE minified.

---

# 68. Dynamic usage

Cẩn thận với:

```js
window[name]
object[action]
dataset.action
```

Một function có thể được gọi qua string.

Search cả:

```text
"functionName"
'action'
dataset
window[
```

trước khi xóa.

---

# 69. DOM dataset dispatch

Nếu source có kiểu:

```js
root.addEventListener("click", e => {
    const action = e.target.dataset.action;
    ...
});
```

hãy tạo registry:

```js
const actions = {
    buy: handleBuy,
    cook: handleCook,
    serve: handleServe
};
```

Điều này làm call graph rõ hơn.

---

# 70. Tránh sửa gameplay balance trong refactor

Không thay:

```text
price
spawn rate
customer patience
recipe timing
upgrade cost
reward
```

trong branch reverse-engineering.

Nếu muốn rebalance:

```text
feature/rebalance
```

sau khi refactor xong.

---

# 71. Tránh đổi save format

Không vừa refactor vừa đổi:

```text
MC2 → MC3
```

Refactor code trước.

Sau khi stable mới tạo migration riêng.

---

# 72. Tránh chuyển TypeScript quá sớm

TypeScript sẽ rất hữu ích.

Nhưng không làm trong Stage 1.

Lý do:

```text
semantic chưa rõ
type sẽ dựa trên guess
diff khổng lồ
debug regression khó
```

Sau khi module boundary ổn mới cân nhắc:

```text
JSDoc
→ TypeScript
```

---

# 73. JSDoc trước TypeScript

Có thể thêm:

```js
/**
 * @param {string} itemId
 * @param {number} quantity
 */
function addInventoryBatch(itemId, quantity) {}
```

JSDoc giúp IDE hiểu code mà không tạo migration lớn.

---

# 74. Example hoàn chỉnh

Ban đầu:

```js
function Bt(A, n) {
    ...
}
```

Reverse:

```text
Calls:
- shop purchase
- restock action

Reads:
- item catalog
- current day/time

Writes:
- persistent inventory

Behavior:
- add quantity
- associate expiry batch

Candidate:
addInventoryBatch

Confidence:
HIGH
```

Pha alias:

```js
const addInventoryBatch = Bt;
```

Pha call-site migration:

```js
addInventoryBatch(itemId, quantity);
```

Pha rename:

```js
function addInventoryBatch(itemId, quantity) {
    ...
}
```

Pha extraction:

```js
// inventory/inventory-service.js

export function addInventoryBatch(itemId, quantity) {
    ...
}
```

Cuối cùng:

```js
import { addInventoryBatch } from "./inventory/inventory-service.js";
```

---

# 75. Mẫu phiên làm việc cho 10 function

Mỗi session:

```text
1. Chọn 10 function.
2. Tìm call sites.
3. Ghi state read/write.
4. Ghi pseudo-code.
5. Gắn domain.
6. Gắn confidence.
7. Rename HIGH-confidence.
8. Chạy game.
9. Commit.
10. Update SYMBOL_MAP.
```

Không xử lý 100 function trong một diff.

---

# 76. Template bảng tiến độ 236 functions

```md
| # | Symbol | Line | Domain | Candidate | Confidence | Analyzed | Renamed | Extracted |
|---:|---|---:|---|---|---|---|---|---|
| 1 | pc | 1092 | unknown | - | LOW | ☐ | ☐ | ☐ |
| 2 | mt | 1157 | unknown | - | LOW | ☐ | ☐ | ☐ |
| 3 | yc | 1194 | unknown | - | LOW | ☐ | ☐ | ☐ |
...
```

Mỗi function phải đi qua:

```text
unknown
→ classified
→ understood
→ renamed
→ extracted
```

---

# 77. Cách biết đã reverse-engineer đủ sâu

Bạn phải trả lời được câu:

> Nếu xóa function này, feature nào của game hỏng?

Nếu chưa trả lời được:

```text
chưa hiểu function.
```

Và:

> Function này đọc gì, sửa gì, gọi gì và được gọi khi nào?

Nếu trả lời đủ:

```text
có thể rename.
```

---

# 78. Quy tắc chống over-engineering

Source sạch không đồng nghĩa nhiều abstraction.

Không cần:

```text
Repository
Factory
Provider
Adapter
Manager
Coordinator
Strategy
```

cho mọi thứ.

Boundary được tạo vì:

```text
domain khác nhau
state khác nhau
side effect khác nhau
testability
```

không phải vì pattern.

---

# 79. Kết quả mong muốn sau refactor

Một developer mới nhìn code phải có thể đọc:

```js
async function startGame() {
    const gameState = loadSaveState() ?? createDefaultSaveState();
    const runtimeState = createRuntimeState();

    initializeAudio();
    bindUiEvents();
    renderGame(gameState, runtimeState);
}
```

thay vì:

```js
Hc();
Pe();
Kn();
M();
```

Và gameplay:

```js
function handleStockPurchase(itemId, quantity) {
    const totalCost = calculatePurchaseCost(itemId, quantity);

    if (!canAfford(totalCost)) {
        showToast("Không đủ tiền");
        return;
    }

    spendMoney(totalCost);
    addInventoryBatch(itemId, quantity);
    saveGameState();
    renderInventoryScreen();
}
```

Đây mới là đích đến thực sự của reverse-engineering.

---

# 80. Checklist bắt đầu ngay từ source hiện tại

Thứ tự thực tế nên làm:

```text
[ ] 01 Backup/tag baseline
[ ] 02 Tạo SYMBOL_MAP.md
[ ] 03 Tạo FUNCTION_INVENTORY.md
[ ] 04 Rename kA → imageAssets
[ ] 05 Extract image-assets.js
[ ] 06 Rename y → itemCatalog
[ ] 07 Rename $A/uA/xA
[ ] 08 Extract item-catalog.js
[ ] 09 Rename Dc → encodeSaveEnvelope
[ ] 10 Rename Li → decodeSaveEnvelope
[ ] 11 Rename Wn → createDefaultSaveState
[ ] 12 Rename bt → normalizeSaveState
[ ] 13 Rename Hc → loadSaveState
[ ] 14 Rename Q → saveGameState
[ ] 15 Extract persistence modules
[ ] 16 Add save compatibility tests
[ ] 17 Alias o → gameState
[ ] 18 Alias i → runtimeState
[ ] 19 Analyze Bt/FA/xc call graph
[ ] 20 Rename inventory functions
[ ] 21 Extract inventory module
[ ] 22 Classify remaining functions by domain
[ ] 23 Reverse customer/order
[ ] 24 Reverse cooking
[ ] 25 Reverse economy
[ ] 26 Reverse staff/upgrades
[ ] 27 Reverse progression/events
[ ] 28 Reverse UI renderers
[ ] 29 Reverse audio/runtime
[ ] 30 Remove all legacy aliases
[ ] 31 Full regression
```

---

# 81. Chốt nguyên tắc

Reverse-engineering source minified không phải bài toán:

```text
đoán tên biến hay nhất.
```

Nó là bài toán:

```text
quan sát hành vi
→ dựng dependency graph
→ xác định state boundary
→ xác định side effect
→ đặt semantic name
→ chứng minh rename không đổi behavior
→ extract module
→ regression test
```

Nếu tuân thủ chu trình này, 236 function không còn là một khối code bí hiểm. Nó trở thành một backlog hữu hạn có thể xử lý lần lượt.

Đích cuối không phải là "code đẹp".

Đích cuối là:

> **Một source tree mà mỗi function có semantic rõ ràng, mỗi module có trách nhiệm rõ ràng, save cũ vẫn tương thích, và gameplay trước/sau refactor là tương đương.**
