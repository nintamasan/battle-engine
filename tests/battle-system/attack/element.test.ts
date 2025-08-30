import { Element, getElementMultiplier } from '@/battle-system/element';

describe('属性相性システム', () => {
  test.each([
    { attackerElement: 'fire', defenderElement: 'water', expected: 0.67 },
    { attackerElement: 'water', defenderElement: 'fire', expected: 1.5 },
    { attackerElement: 'fire', defenderElement: 'fire', expected: 1.0 },
  ])(
    '攻撃側の属性が $attackerElement で、防御側の属性が $defenderElement の場合、倍率は $expected',
    ({ attackerElement, defenderElement, expected }) => {
      expect(
        getElementMultiplier({
          attackerElement: attackerElement as Element,
          defenderElement: defenderElement as Element,
        })
      ).toBeCloseTo(expected, 2);
    }
  );
});
