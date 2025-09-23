import type { CalculatedSkillEffect } from './types';
import { getAwakeningRatio } from './state/awakening';
import {
  calculateSkillEffects,
  type SkillEffectMap,
} from './state/skillEffect';
import type { Character } from '../character';

export type CharacterState = {
  maxHp: number;
  totalDamage: number;
  intelligence: number;
  spirit: number;
  stats: Character;
};

export function calculateInitialState(stats: Character): CharacterState {
  return {
    maxHp: calculateMaxHp({ stats, turn: 1 }),
    totalDamage: 0, //
    intelligence: stats.intelligence,
    spirit: stats.spirit,
    stats: {
      ...stats,
      skills: stats.skills.map(skill => ({ ...skill, coolDownEndTurn: 0 })), // クールタイム初期化
    },
  };
}

export function calculateState({
  beforeState,
  skillEffects,
  turn,
}: {
  beforeState: CharacterState;
  skillEffects: SkillEffectMap;
  turn: number;
}): [CharacterState, Omit<CalculatedSkillEffect, 'target'>[]] {
  const stats = beforeState.stats;

  // デバフ適用前の state の計算
  let state: CharacterState = {
    ...beforeState,
    maxHp: calculateMaxHp({ stats, turn }),
    // デバフのリセット
    intelligence: stats.intelligence,
    spirit: stats.spirit,
    // （初回限定）疲労度による処理
    ...(turn === 1
      ? {
          totalDamage: Math.floor(
            (calculateMaxHp({ stats, turn }) * stats.fatigue) / 100
          ),
        }
      : {}),
  };

  // デバフの適用
  return calculateSkillEffects({ state, turn, skillEffects });
}

function calculateMaxHp({
  stats,
  turn,
}: {
  stats: Character;
  turn: number;
}): number {
  return Math.floor(
    stats.vitality * getAwakeningRatio({ awakening: stats.awakening, turn })
  );
}

export function getRemainedHp(state: CharacterState): number {
  return state.maxHp - state.totalDamage;
}

export function formatState(state: CharacterState): string {
  return [
    `HP: ${getRemainedHp(state)}/${state.maxHp}`,
    `Intelligence: ${state.intelligence}/${state.stats.intelligence}`,
    `Spirit: ${state.spirit}/${state.stats.spirit}`,
  ].join(' ');
  // TODO: debuff とかの情報も出せれば
}
