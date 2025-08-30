export function getEffectivenessMultiplier({
  attackerIntelligence,
  defenderIntelligence,
}: {
  attackerIntelligence: number;
  defenderIntelligence: number;
}): number {
  const diff = attackerIntelligence - defenderIntelligence;

  if (diff >= 0) {
    return 1;
  } else {
    return (
      (2 * attackerIntelligence) / (attackerIntelligence + defenderIntelligence)
    );
  }
}
