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
  const baseDamage = calculateBaseDamage(attackerState.maxHp);
  const elementMultiplier = getElementMultiplier({
    attackerElement: attackerState.stats.element,
    defenderElement: defenderState.stats.element,
    elementRelations,
  });
  const intelligenceMultiplier = getEffectivenessMultiplier({
    attackerIntelligence: attackerState.intelligence,
    defenderIntelligence: defenderState.intelligence,
  });

  return Math.floor(baseDamage * elementMultiplier * intelligenceMultiplier);
}

// 基本ダメージを計算
function calculateBaseDamage(attackerMaxHp: number): number {
  // 5ターンほどで決着するように
  return attackerMaxHp * 0.2;
}
