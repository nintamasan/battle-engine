import { getElementMultiplier } from '@/battle-system/element';
import { CharacterState } from '@/battle-system/state';
import { getEffectivenessMultiplier } from '@/battle-system/attack/effectiveness';

export function executeAttack({
  attackerState,
  defenderState,
}: {
  attackerState: CharacterState;
  defenderState: CharacterState;
}): number {
  const baseDamage = calculateBaseDamage(attackerState.maxHp);
  const elementMultiplier = getElementMultiplier({
    attackerElement: attackerState.stats.element,
    defenderElement: defenderState.stats.element,
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
