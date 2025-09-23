import {
  getAttackableRandomResult,
  getDefensableRandomResult,
  getLessAttackableRandomResult,
  getLessDefensableRandomResult,
} from 'src/battle-system/random';

// 0.5 vs 1 => 100 / 79 / 50 / 33
// 0.8 vs 1 =>  83 / 66 / 39 / 11
// 1   vs 1 =>  74 / 59 / 33 /  0
// 1.2 vs 1 =>  68 / 48 / 18
// 1.5 vs 1 =>  50 / 31 /  0
// 2   vs 1 =>  26 /  0

describe(getAttackableRandomResult, () => {
  test.each([
    { defender: 0.51, attacker: 1, ratio: 99 }, // 守備が最低半分ないと防げない
    { defender: 0.8, attacker: 1, ratio: 83 },
    { defender: 0.9, attacker: 1, ratio: 78 },
    { defender: 1, attacker: 1, ratio: 74 },
    { defender: 1.1, attacker: 1, ratio: 70 },
    { defender: 1.2, attacker: 1, ratio: 65 },
    { defender: 1.5, attacker: 1, ratio: 50 }, // 相手が1.5倍程度でも 25%勝てる
    { defender: 2, attacker: 1, ratio: 26 },
  ])(
    'with defender:$defender attacker:$attacker attacker wins $ratio percent',
    ({ attacker, defender, ratio }) => {
      expect(
        getAttackableRandomResult({
          attacker,
          defender,
          random: ratio / 100,
          //   logger: console,
        })
      ).toEqual(true);

      expect(
        getAttackableRandomResult({
          attacker,
          defender,
          random: (ratio + 1) / 100,
        })
      ).toEqual(false);
    }
  );
});

describe(getLessAttackableRandomResult, () => {
  test.each([
    { defender: 0.205, attacker: 1, ratio: 99 }, // 守備が 20% はないと防げない
    { defender: 0.5, attacker: 1, ratio: 79 },
    { defender: 0.8, attacker: 1, ratio: 66 }, // 互角 50% / Attackable 75&
    { defender: 1, attacker: 1, ratio: 59 }, // 互角 50% / Attackable 75&
    { defender: 1.2, attacker: 1, ratio: 48 },
    { defender: 1.5, attacker: 1, ratio: 31 },
    { defender: 1.99, attacker: 1, ratio: 1 }, // 2倍程度の相手でもギリ勝てる
  ])(
    'with defender:$defender attacker:$attacker attacker wins $ratio percent',
    ({ attacker, defender, ratio }) => {
      expect(
        getLessAttackableRandomResult({
          attacker,
          defender,
          random: ratio / 100,
          //   logger: console,
        })
      ).toEqual(true);

      expect(
        getLessAttackableRandomResult({
          attacker,
          defender,
          random: (ratio + 1) / 100,
        })
      ).toEqual(false);
    }
  );
});

describe(getLessDefensableRandomResult, () => {
  test.each([
    { defender: 0.2, attacker: 1, ratio: 73 }, // Defensable で 64
    { defender: 0.5, attacker: 1, ratio: 50 }, // 50% くらい目指したい
    { defender: 0.8, attacker: 1, ratio: 39 },
    { defender: 1, attacker: 1, ratio: 33 }, // 互角 50%
    { defender: 1.2, attacker: 1, ratio: 18 },
    { defender: 1.5, attacker: 1, ratio: 0 }, // 通らない
  ])(
    'with defender:$defender attacker:$attacker attacker wins $ratio percent',
    ({ attacker, defender, ratio }) => {
      expect(
        getLessDefensableRandomResult({
          attacker,
          defender,
          random: ratio / 100,
          //   logger: console,
        })
      ).toEqual(true);

      expect(
        getLessDefensableRandomResult({
          attacker,
          defender,
          random: (ratio + 1) / 100,
        })
      ).toEqual(false);
    }
  );
});

describe(getDefensableRandomResult, () => {
  test.each([
    { defender: 0.1, attacker: 1, ratio: 81 },
    { defender: 0.2, attacker: 1, ratio: 66 },
    { defender: 0.34, attacker: 1, ratio: 49 }, // 相手が 1/3 程度でも50%しか勝てない
    { defender: 0.5, attacker: 1, ratio: 33 },
    { defender: 0.8, attacker: 1, ratio: 11 },
    { defender: 0.9, attacker: 1, ratio: 5 },
  ])(
    'with defender:$defender attacker:$attacker attacker wins $ratio percent',
    ({ attacker, defender, ratio }) => {
      expect(
        getDefensableRandomResult({
          attacker,
          defender,
          random: ratio / 100,
          //   logger: console,
        })
      ).toEqual(true);

      expect(
        getDefensableRandomResult({
          attacker,
          defender,
          random: (ratio + 1) / 100,
        })
      ).toEqual(false);
    }
  );
});
