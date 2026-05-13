import { getAwareness } from '../../../src/battle-system/state/awakening';

describe('覚醒値', () => {
  test.each([
    { turn: 1, expected: 0.5 },
    { turn: 2, expected: 0.6 },
    { turn: 5, expected: 0.9 },
    { turn: 6, expected: 1.0 },
    { turn: 7, expected: 1.0 },
  ])('ターン数が $turn に $expected になる', ({ turn, expected }) => {
    const awakening = {
      start_hp_awareness: 0.5,
      end_hp_awareness: 1,
      physical_attack_awareness: 1,
      magic_attack_awareness: 1,
      turn_to_awake: 5,
      hit_awareness: 1,
      evasion_awareness: 1,
      spirit_defense_awareness: 1,
    };

    expect(
      getAwareness({
        awakening,
        turn,
        fixedKey: 'hp_awareness',
        startKey: 'start_hp_awareness',
        endKey: 'end_hp_awareness',
      })
    ).toBe(expected);
  });
});
