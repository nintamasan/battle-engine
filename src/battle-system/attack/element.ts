import type { ElementRelations } from '../element';

export function getElementMultiplier({
  attackerElement,
  defenderElement,
  elementRelations,
}: {
  attackerElement: string;
  defenderElement: string;
  elementRelations: ElementRelations;
}): number {
  const relation = elementRelations[attackerElement];
  if (relation.advantage === defenderElement) {
    return 1.5;
  }
  if (relation.disadvantage === defenderElement) {
    return 0.67;
  }
  return 1.0;
}
