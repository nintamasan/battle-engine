import { getEffectivenessMultiplier } from '@/battle-system/attack/effectiveness';

describe('判断力システム', () => {
  test.each([
    { attackerIntelligence: 100, defenderIntelligence: 100, expected: 1 },
    { attackerIntelligence: 60, defenderIntelligence: 100, expected: 0.75 },
    { attackerIntelligence: 20, defenderIntelligence: 60, expected: 0.5 },
    { attackerIntelligence: 60, defenderIntelligence: 80, expected: 0.87 },
  ])(
    '攻撃側が $attackerIntelligence な判断力で、守備側が $defenderIntelligence な判断力だと、$expected な倍率になる',
    ({ attackerIntelligence, defenderIntelligence, expected }) => {
      const multiplier = getEffectivenessMultiplier({
        attackerIntelligence,
        defenderIntelligence,
      });

      expect(multiplier).toBeCloseTo(expected, 1);
    }
  );
});
