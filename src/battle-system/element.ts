export type ElementRelations = Record<
  string,
  { advantage: string; disadvantage: string }
>;

export function getElementMultiplier({
  attackerElement,
  defenderElement,
  elementRelations,
}: {
  attackerElement: string;
  defenderElement: string;
  elementRelations: ElementRelations;
}): number {
  if (
    isAdvantage({
      from: attackerElement,
      to: defenderElement,
      elementRelations,
    })
  ) {
    return 1.5;
  }
  if (
    isDisadvantage({
      from: attackerElement,
      to: defenderElement,
      elementRelations,
    })
  ) {
    return 0.67;
  }
  return 1.0;
}

export function getAdvantageElement(
  element: string,
  elementRelations: ElementRelations
): string {
  return elementRelations[element].advantage;
}
export function isAdvantage({
  from,
  to,
  elementRelations,
}: {
  from: string;
  to: string;
  elementRelations: ElementRelations;
}): boolean {
  return getAdvantageElement(from, elementRelations) === to;
}

export function getDisadvantageElement(
  element: string,
  elementRelations: ElementRelations
): string {
  return elementRelations[element].disadvantage;
}

export function isDisadvantage({
  from,
  to,
  elementRelations,
}: {
  from: string;
  to: string;
  elementRelations: ElementRelations;
}): boolean {
  return getDisadvantageElement(from, elementRelations) === to;
}
