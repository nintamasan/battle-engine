import { getAwakeningRatio } from '../../../src/battle-system/state/awakening';

describe('覚醒値', () => {
  test.each([
    { turn: 1, expected: 0.5 },
    { turn: 2, expected: 0.6 },
    { turn: 5, expected: 0.9 },
    { turn: 6, expected: 1.0 },
    { turn: 7, expected: 1.0 },
  ])('ターン数が $turn に $expected になる', ({ turn, expected }) => {
    const awakening = { startRatio: 0.5, endRatio: 1, turnToAwake: 5 };

    expect(getAwakeningRatio({ awakening, turn })).toBe(expected);
  });
});
