import { Element, ELEMENT_RELATIONS } from '@/battle-system/element';

export function getElementMultiplier({
  attackerElement,
  defenderElement,
}: {
  attackerElement: Element;
  defenderElement: Element;
}): number {
  const relation = ELEMENT_RELATIONS[attackerElement];
  if (relation.advantage === defenderElement) {
    return 1.5;
  }
  if (relation.disadvantage === defenderElement) {
    return 0.67;
  }
  return 1.0;
}
