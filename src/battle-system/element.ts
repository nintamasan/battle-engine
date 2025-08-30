import z from 'zod';

// 属性の定義
export const ElementSchema = z.enum(['fire', 'water', 'wind']);

export type Element = z.infer<typeof ElementSchema>;

// 属性の相性関係
export const ELEMENT_RELATIONS: Record<
  Element,
  { advantage: Element; disadvantage: Element }
> = {
  fire: { advantage: 'wind', disadvantage: 'water' },
  water: { advantage: 'fire', disadvantage: 'wind' },
  wind: { advantage: 'water', disadvantage: 'fire' },
};

export function getElementMultiplier({
  attackerElement,
  defenderElement,
}: {
  attackerElement: Element;
  defenderElement: Element;
}): number {
  if (isAdvantage(attackerElement, defenderElement)) {
    return 1.5;
  }
  if (isDisadvantage(attackerElement, defenderElement)) {
    return 0.67;
  }
  return 1.0;
}

export function getAdvantageElement(element: Element): Element {
  return ELEMENT_RELATIONS[element].advantage;
}
export function isAdvantage(from: Element, to: Element): boolean {
  return getAdvantageElement(from) === to;
}

export function getDisadvantageElement(element: Element): Element {
  return ELEMENT_RELATIONS[element].disadvantage;
}

export function isDisadvantage(from: Element, to: Element): boolean {
  return getDisadvantageElement(from) === to;
}
