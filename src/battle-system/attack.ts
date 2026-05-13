import { type ElementRelations, getElementMultiplier } from './element';
import type { CharacterState } from './state';
import { getEffectivenessMultiplier } from './attack/effectiveness';

export function executeAttack({
  attackerState,
  defenderState,
  elementRelations,
}: {
  attackerState: CharacterState;
  defenderState: CharacterState;
  elementRelations: ElementRelations;
}): number {
  const baseDamage = calculateBaseDamage(attackerState);
  const elementMultiplier = getElementMultiplier({
    attackerElement: attackerState.stats.element,
    defenderElement: defenderState.stats.element,
    elementRelations,
  });
  const intelligenceMultiplier = getEffectivenessMultiplier({
    attackerIntelligence: attackerState.hit,
    defenderIntelligence: defenderState.evasion,
  });

  return Math.floor(baseDamage * elementMultiplier * intelligenceMultiplier);
}

// 基本ダメージを計算
function calculateBaseDamage(attackerState: CharacterState): number {
  return attackerState.stats.attack_type === 'magic'
    ? attackerState.magicAttack
    : attackerState.physicalAttack;
}
