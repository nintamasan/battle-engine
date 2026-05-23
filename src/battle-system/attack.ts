import { type ElementRelations, getElementMultiplier } from './element';
import type { CharacterState } from './state';
import { getEffectivenessMultiplier } from './attack/effectiveness';
import type { AttackModifier } from './types';

export function executeAttack({
  attackerState,
  defenderState,
  elementRelations,
  modifiers = [],
}: {
  attackerState: CharacterState;
  defenderState: CharacterState;
  elementRelations: ElementRelations;
  modifiers?: AttackModifier[];
}): number {
  const effectiveDefenderState = applyDefenderModifiers({
    defenderState,
    modifiers,
  });
  const baseDamage = calculateBaseDamage(attackerState);
  const elementMultiplier = getElementMultiplier({
    attackerElement: attackerState.stats.element,
    defenderElement: effectiveDefenderState.stats.element,
    elementRelations,
  });
  const intelligenceMultiplier = getEffectivenessMultiplier({
    attackerIntelligence: attackerState.hit,
    defenderIntelligence: effectiveDefenderState.evasion,
  });
  const damageRatio = modifiers
    .filter(modifier => modifier.type === 'damage-ratio')
    .reduce((ratio, modifier) => ratio * modifier.value, 1);

  return Math.floor(
    baseDamage * elementMultiplier * intelligenceMultiplier * damageRatio
  );
}

// 基本ダメージを計算
function calculateBaseDamage(attackerState: CharacterState): number {
  return attackerState.stats.attack_type === 'magic'
    ? attackerState.magicAttack
    : attackerState.physicalAttack;
}

function applyDefenderModifiers({
  defenderState,
  modifiers,
}: {
  defenderState: CharacterState;
  modifiers: AttackModifier[];
}): CharacterState {
  return modifiers.some(modifier => modifier.type === 'unprotected')
    ? { ...defenderState, evasion: 0 }
    : defenderState;
}
