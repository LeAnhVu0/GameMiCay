// --- State Management ---
let state = {
    money: 150000,
    day: 1,
    stars: 5.0,
    maxCustomers: 2,
    baseCustomerPatience: 100, // seconds
    unlockedPots: 1,
    unlockedToppings: ["Bò Mỹ", "Tôm Mực"]
};

// --- Configs ---
const AVATARS = ["😋", "😎", "🧐", "🥳", "🥵", "👧", "👨‍🎓", "👩‍.💼"];
const TOPPINGS_CONFIG = [
    { id: "Bò Mỹ", emoji: "🥩", unlockPrice: 0 },
    { id: "Tôm Mực", emoji: "🦐", unlockPrice: 0 },
    { id: "Xúc Xích", emoji: "🌭", unlockPrice: 20000 },
    { id: "Kim Chi", emoji: "🥬", unlockPrice: 25000 },
    { id: "Nấm Kim", emoji: "🍄", unlockPrice: 15000 },
    { id: "Cá Viên", emoji: "🍡", unlockPrice: 30000 },
    { id: "Trứng", emoji: "🥚", unlockPrice: 40000 },
    { id: "Bạch Tuộc", emoji: "🐙", unlockPrice: 50000 }
];
const MAX_POTS = 4;
const POT_UPGRADE_COSTS = [0, 50000, 150000, 300000];

// --- Entities ---
let pots = []; // Array of pot objects
let customers = []; // Array of customer objects
let currentBowl = {
    hasNoodle: false,
    noodleStatus: "empty", // "empty", "good", "bad"
    spicyLevel: 0,
    toppings: []
};

// DOM Elements
const moneyValEl = document.getElementById("money-val");
const dayEl = document.getElementById("current-day");
const starsEl = document.getElementById("current-stars");
const customerQueueEl = document.getElementById("customer-queue");
const potsGridEl = document.getElementById("pots-grid");
const ingredientsGridEl = document.getElementById("ingredients-grid");
const upgradesListEl = document.getElementById("upgrades-list");

const bowlNoodleEl = document.getElementById("bowl-noodle-status");
const bowlSpicyEl = document.getElementById("bowl-spicy-level");
const bowlToppingsEl = document.getElementById("bowl-toppings-list");
const shopModal = document.getElementById("shop-modal");
const toastEl = document.getElementById("toast");

// --- Initialization ---
function initGame() {
    updateTopBar();
    renderIngredients();
    initPots();
    renderShop();
    
    // Bắt đầu game loop cho khách hàng
    setInterval(gameLoop, 1000);
}

function updateTopBar() {
    moneyValEl.innerText = state.money.toLocaleString("vi-VN");
    dayEl.innerText = state.day;
    starsEl.innerText = state.stars.toFixed(1);
}

function showToast(message, isError = false) {
    toastEl.innerText = message;
    toastEl.style.background = isError ? "var(--bad)" : "var(--night2)";
    toastEl.classList.remove("hidden");
    setTimeout(() => toastEl.classList.add("hidden"), 3000);
}

// --- Pots Logic ---
function initPots() {
    pots = [];
    for(let i=0; i<MAX_POTS; i++) {
        pots.push({
            id: i,
            unlocked: i < state.unlockedPots,
            state: 0, // 0: empty, 1: cooking, 2: done, 3: ruined
            progress: 0, // seconds
            timer: null
        });
    }
    renderPots();
}

function renderPots() {
    potsGridEl.innerHTML = "";
    pots.forEach(pot => {
        const div = document.createElement("div");
        div.className = `pot ${!pot.unlocked ? 'locked' : ''} ${pot.state===1?'cooking':pot.state===2?'done':pot.state===3?'ruined':''}`;
        
        if(!pot.unlocked) {
            div.innerHTML = `🔒 Chỗ Trống`;
            div.onclick = () => showToast("Vào Cửa Hàng để mở khóa nồi mới!", true);
        } else {
            let statusText = "Đang trống";
            let icon = "🥘";
            let pct = 0;
            
            if(pot.state === 1) { statusText = `Đang sôi (${pot.progress}s)`; pct = (pot.progress / 7) * 100; }
            if(pot.state === 2) { statusText = "Chín ngon!"; icon = "🍜"; pct = 100; }
            if(pot.state === 3) { statusText = "Quá lửa!"; pct = 100; }
            
            div.innerHTML = `
                <div class="pot-icon">${icon}</div>
                <div class="pot-info">
                    <span style="font-size: 11px; font-weight: bold;">Nồi ${pot.id + 1}</span>
                    <span class="pot-status">${statusText}</span>
                    <div class="pot-gauge"><div class="pot-gauge-fill" style="width: ${pct}%"></div></div>
                </div>
            `;
            div.onclick = () => handlePotClick(pot.id);
        }
        potsGridEl.appendChild(div);
    });
}

function handlePotClick(potId) {
    let pot = pots[potId];
    if(!pot.unlocked) return;

    if(pot.state === 0) {
        // Bắt đầu nấu
        pot.state = 1;
        pot.progress = 0;
        pot.timer = setInterval(() => {
            pot.progress++;
            if(pot.progress >= 4 && pot.progress <= 7 && pot.state === 1) {
                pot.state = 2; // Chín ngon
            } else if(pot.progress > 7 && (pot.state === 1 || pot.state === 2)) {
                pot.state = 3; // Nhão
            }
            renderPots();
        }, 1000);
    } else {
        // Vớt mì
        if(currentBowl.hasNoodle) {
            showToast("Tô đang chuẩn bị đã có mì rồi!", true);
            return;
        }
        if(pot.state === 1) {
            showToast("Mì chưa chín, sống nhăn!", true);
            currentBowl.noodleStatus = "bad";
        } else if(pot.state === 2) {
            currentBowl.noodleStatus = "good";
        } else if(pot.state === 3) {
            currentBowl.noodleStatus = "bad";
            showToast("Vớt trễ, mì nhão nhoét!", true);
        }
        
        currentBowl.hasNoodle = true;
        updatePrepStation();
        
        // Reset pot
        clearInterval(pot.timer);
        pot.state = 0;
        pot.progress = 0;
    }
    renderPots();
}

// --- Ingredients Logic ---
function renderIngredients() {
    // Keep the chili button, regenerate others
    const html = `
        <button class="btn-ingredient chili-btn" onclick="addSpicy()">
            <span class="emoji">🌶️</span>
            <span class="name">+1 Cấp Cay</span>
        </button>
    `;
    ingredientsGridEl.innerHTML = html;
    
    TOPPINGS_CONFIG.forEach(t => {
        let isUnlocked = state.unlockedToppings.includes(t.id);
        const btn = document.createElement("button");
        btn.className = `btn-ingredient ${!isUnlocked ? 'locked' : ''}`;
        btn.innerHTML = `<span class="emoji">${t.emoji}</span><span class="name">${t.id}</span>`;
        btn.onclick = () => {
            if(!isUnlocked) {
                showToast("Vào Cửa Hàng để mở khóa topping này!", true);
                return;
            }
            addTopping(t.id);
        };
        ingredientsGridEl.appendChild(btn);
    });
}

function addSpicy() {
    if(currentBowl.spicyLevel < 7) {
        currentBowl.spicyLevel++;
        updatePrepStation();
    } else {
        showToast("Đã đạt mức cay tối đa 7!");
    }
}

function addTopping(name) {
    if(!currentBowl.toppings.includes(name)) {
        currentBowl.toppings.push(name);
        updatePrepStation();
    }
}

function updatePrepStation() {
    bowlSpicyEl.innerText = currentBowl.spicyLevel;
    
    if(currentBowl.hasNoodle) {
        bowlNoodleEl.innerText = currentBowl.noodleStatus === 'good' ? "Dai ngon 🌟" : "Sống/Nhão 😖";
        bowlNoodleEl.style.color = currentBowl.noodleStatus === 'good' ? "var(--ok)" : "var(--bad)";
    } else {
        bowlNoodleEl.innerText = "Chưa có";
        bowlNoodleEl.style.color = "#666";
    }
    
    if(currentBowl.toppings.length === 0) {
        bowlToppingsEl.innerText = "Trống";
    } else {
        bowlToppingsEl.innerText = currentBowl.toppings.join(", ");
    }
}

function resetBowl() {
    currentBowl = { hasNoodle: false, noodleStatus: "empty", spicyLevel: 0, toppings: [] };
    updatePrepStation();
}

// --- Customers Logic ---
function gameLoop() {
    // Tăng ngày mỗi 60 giây
    if(Math.random() < 0.01) { state.day++; updateTopBar(); }

    // Giảm sự kiên nhẫn
    customers.forEach(c => {
        c.patience -= 1.5; // Giảm nhanh hơn một chút
        if(c.patience <= 0) {
            c.left = true;
            state.stars = Math.max(1, state.stars - 0.5);
            updateTopBar();
            showToast("Khách đợi quá lâu nên bỏ đi! Trừ sao uy tín.", true);
        }
    });

    // Remove left customers
    customers = customers.filter(c => !c.left);

    // Spawn new customer
    if(customers.length < state.maxCustomers && Math.random() < 0.3) {
        spawnCustomer();
    }
    
    renderCustomers();
}

function spawnCustomer() {
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const targetSpicy = Math.floor(Math.random() * 8);
    
    // Choose 2 random unlocked toppings
    const shuffled = [...state.unlockedToppings].sort(() => 0.5 - Math.random());
    const targetToppings = shuffled.slice(0, Math.min(2, state.unlockedToppings.length));
    
    // Tính giá tiền: cơ bản 35k + cấp cay*2k + mỗi topping*5k
    const price = 35000 + (targetSpicy * 2000) + (targetToppings.length * 6000);

    customers.push({
        id: Date.now(),
        avatar: avatar,
        spicy: targetSpicy,
        toppings: targetToppings,
        price: price,
        patience: 100,
        left: false
    });
}

function renderCustomers() {
    customerQueueEl.innerHTML = "";
    customers.forEach(c => {
        const div = document.createElement("div");
        div.className = `customer ${c.patience < 25 ? 'angry' : ''}`;
        
        let tpStr = c.toppings.length > 0 ? ` + [${c.toppings.join(", ")}]` : "";
        let pct = Math.max(0, c.patience);
        let color = pct > 50 ? "var(--ok)" : pct > 25 ? "#D98A12" : "var(--bad)";
        
        div.innerHTML = `
            <div class="bubble">Mì Cay Cấp <b style="color:var(--chili)">${c.spicy}</b>${tpStr}</div>
            <div class="avatar">${c.avatar}</div>
            <div class="patience-bar"><div class="patience-fill" style="width: ${pct}%; background: ${color}"></div></div>
        `;
        customerQueueEl.appendChild(div);
    });
}

// --- Serve Logic ---
function serveOrder() {
    if(customers.length === 0) {
        showToast("Không có khách để phục vụ!", true);
        return;
    }
    if(!currentBowl.hasNoodle) {
        showToast("Tô chưa có mì, khách ăn kiểu gì bạn ơi!", true);
        return;
    }

    // Phục vụ khách hàng đầu tiên trong hàng đợi (FIFO)
    let c = customers[0];
    
    const spicyMatch = currentBowl.spicyLevel === c.spicy;
    const toppingMatch = c.toppings.every(t => currentBowl.toppings.includes(t)) && currentBowl.toppings.length === c.toppings.length;
    const noodleGood = currentBowl.noodleStatus === "good";

    if(spicyMatch && toppingMatch && noodleGood) {
        let reward = c.price;
        showToast(`Tuyệt! Khách hài lòng. Thu được +${reward.toLocaleString()}₫`);
        state.money += reward;
        state.stars = Math.min(5.0, state.stars + 0.1);
    } else if(spicyMatch && toppingMatch) {
        let reward = Math.floor(c.price * 0.7);
        showToast(`Mì chưa ngon lắm nhưng đúng yêu cầu. Thu được +${reward.toLocaleString()}₫`);
        state.money += reward;
    } else {
        showToast("Làm sai món rồi! Bị trừ 10,000₫ bồi thường 😤", true);
        state.money -= 10000;
        state.stars = Math.max(1.0, state.stars - 0.2);
    }
    
    // Remove served customer
    customers.shift();
    updateTopBar();
    resetBowl();
    renderCustomers();
}

// --- Shop Logic ---
function openShop() {
    renderShop();
    shopModal.classList.remove("hidden");
}
function closeShop() {
    shopModal.classList.add("hidden");
}

function renderShop() {
    upgradesListEl.innerHTML = "";
    
    // Upgrade Pots
    if(state.unlockedPots < MAX_POTS) {
        let cost = POT_UPGRADE_COSTS[state.unlockedPots];
        addShopItem(`Nồi nấu mì số ${state.unlockedPots + 1}`, `Nấu được nhiều mì cùng lúc hơn`, cost, () => {
            if(state.money >= cost) {
                state.money -= cost;
                state.unlockedPots++;
                initPots();
                renderShop();
                updateTopBar();
                showToast("Mua thành công!");
            } else {
                showToast("Không đủ tiền!", true);
            }
        });
    }

    // Unlock Toppings
    TOPPINGS_CONFIG.forEach(t => {
        if(!state.unlockedToppings.includes(t.id) && t.unlockPrice > 0) {
            addShopItem(`Mở khóa: ${t.emoji} ${t.id}`, `Thêm món mới vào menu, bán được giá cao hơn`, t.unlockPrice, () => {
                if(state.money >= t.unlockPrice) {
                    state.money -= t.unlockPrice;
                    state.unlockedToppings.push(t.id);
                    renderIngredients();
                    renderShop();
                    updateTopBar();
                    showToast("Mở khóa thành công!");
                } else {
                    showToast("Không đủ tiền!", true);
                }
            });
        }
    });
    
    // Upgrade Tables (Max customers)
    let tblCost = (state.maxCustomers - 1) * 100000;
    if(state.maxCustomers < 5) {
        addShopItem(`Thêm bàn ghế (Khách tối đa: ${state.maxCustomers + 1})`, `Quán đông khách hơn`, tblCost, () => {
            if(state.money >= tblCost) {
                state.money -= tblCost;
                state.maxCustomers++;
                renderShop();
                updateTopBar();
                showToast("Mở rộng quán thành công!");
            } else {
                showToast("Không đủ tiền!", true);
            }
        });
    }
}

function addShopItem(title, desc, cost, onBuy) {
    const div = document.createElement("div");
    div.className = "upgrade-item";
    
    const canAfford = state.money >= cost;
    
    div.innerHTML = `
        <div class="upgrade-info">
            <strong>${title}</strong>
            <small>${desc}</small>
        </div>
        <button class="btn-buy" ${!canAfford ? 'disabled' : ''}>${cost.toLocaleString()}₫</button>
    `;
    div.querySelector("button").onclick = onBuy;
    upgradesListEl.appendChild(div);
}

// Start
initGame();
