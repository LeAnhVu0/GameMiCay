import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../game.js", import.meta.url), "utf8");
const extract = (name, next) =>
  source.slice(
    source.indexOf(`  function ${name}(`),
    source.indexOf(`  function ${next}(`),
  );

function setup(money = 100000, canBorrow = false) {
  const elements = Object.fromEntries(
    ["modal", "card", "goNext", "goLoan"].map((id) => [
      id,
      { hidden: true, innerHTML: "", querySelector: () => null },
    ]),
  );
  let renders = 0;
  const cur = () => ({
    lost: 0,
    served: 0,
    spoil: 0,
    oth: [],
    sales: 0,
    tips: 0,
    bonus: 0,
    ing: 0,
    equip: 0,
    fee: 0,
    stars: [],
  });
  const context = vm.createContext({
    i: {
      run: true,
      mode: "sell",
      slots: [],
      online: [],
      pots: [],
      today: { priceLost: 0 },
    },
    o: {
      money,
      day: 1,
      best: 0,
      cur: cur(),
      loan: { owe: 0 },
      history: [],
      tot: { rev: 0, cost: 0, served: 0 },
    },
    B: null,
    zn: 1,
    yo: 60,
    Gh: 5,
    SA: [],
    Qn: {},
    R: { rent: 100, util: 50, utilPer: 0 },
    y: { mi: { cost: 1 } },
    d: (id) => elements[id] || null,
    document: {
      body: { classList: { remove() {} } },
      querySelector: () => null,
    },
    clearInterval() {},
    setTimeout() {},
    M() {},
    WA() {},
    k() {},
    Ye() {},
    xc: () => [],
    Fn: () => 0,
    mn() {},
    Oi: cur,
    ca() {},
    _a: () => false,
    Wt: () => (canBorrow ? 1 : 0),
    at: () => 50000,
    Q() {},
    Pe: () => ({ l: 1 }),
    dA: () => "",
    Kh: () => "",
    S: () => "",
    b: String,
    on: String,
    oo: () => "",
    Gt: () => "",
    bn: () => 100,
    Ot() {},
    TA: () => renders++,
    Rt() {},
    ai: (amount) => {
      context.o.money += amount;
    },
  });
  vm.runInContext(extract("dh", "GA") + extract("ui", "mh"), context);
  return { context, elements, renders: () => renders };
}

for (const waiting of [false, true]) {
  const { context, elements, renders } = setup();
  if (waiting) context.i.slots = [{ id: 1 }];
  context.dh(0.1);
  if (waiting) {
    assert.equal(context.i.closing, true);
    assert.equal(context.i.run, true);
    context.dh(60);
  }
  assert.equal(context.i.run, false);
  assert.equal(elements.modal.hidden, false);
  assert.match(elements.card.innerHTML, /Hết ngày 1/);
  assert.equal(context.o.history.length, 1);
  assert.equal(context.o.day, 2);
  elements.goNext.onclick();
  assert.equal(elements.modal.hidden, true);
  assert.equal(renders(), 1);
}

const loan = setup(-1, true);
loan.context.ui();
assert.equal(loan.elements.modal.hidden, false);
loan.elements.goLoan.onclick();
assert.equal(loan.elements.modal.hidden, true);
assert.equal(loan.context.o.day, 2);
assert.equal(loan.renders(), 1);
console.log(
  "OK   closing with/without waiting customers, next day, and loan recovery",
);
