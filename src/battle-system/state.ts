import type { CalculatedSkillEffect } from './types';
import { getAwareness } from './state/awakening';
import {
  calculateSkillEffects,
  type SkillEffectMap,
} from './state/skillEffect';
import type { Character } from '../character';

export type CharacterState = {
  maxHp: number;
  physicalAttack: number;
  magicAttack: number;
  totalDamage: number;
  intelligence: number;
  hit: number;
  evasion: number;
  spirit: number;
  spiritDefense: number;
  stats: Character;
};

export function calculateInitialState(stats: Character): CharacterState {
  return {
    ...calculateAwakenedState({ stats, turn: 1 }),
    totalDamage: 0, //
    intelligence: stats.intelligence,
    hit: calculateHit(stats),
    evasion: calculateEvasion(stats),
    spirit: stats.spirit,
    spiritDefense: calculateSpiritDefense(stats),
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
    ...calculateAwakenedState({ stats, turn }),
    // デバフのリセット
    intelligence: stats.intelligence,
    hit: calculateHit(stats),
    evasion: calculateEvasion(stats),
    spirit: stats.spirit,
    spiritDefense: calculateSpiritDefense(stats),
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

function calculateAwakenedState({
  stats,
  turn,
}: {
  stats: Character;
  turn: number;
}): Pick<CharacterState, 'maxHp' | 'physicalAttack' | 'magicAttack'> {
  return {
    maxHp: calculateMaxHp({ stats, turn }),
    physicalAttack: Math.floor(
      (stats.vitality *
        getAwareness({
          awakening: stats.awakening,
          turn,
          fixedKey: 'physical_attack_awareness',
          startKey: 'start_physical_attack_awareness',
          endKey: 'end_physical_attack_awareness',
        })) /
        8
    ),
    magicAttack: Math.floor(
      (stats.vitality *
        getAwareness({
          awakening: stats.awakening,
          turn,
          fixedKey: 'magic_attack_awareness',
          startKey: 'start_magic_attack_awareness',
          endKey: 'end_magic_attack_awareness',
        })) /
        8
    ),
  };
}

function calculateMaxHp({
  stats,
  turn,
}: {
  stats: Character;
  turn: number;
}): number {
  return Math.floor(
    stats.vitality *
      getAwareness({
        awakening: stats.awakening,
        turn,
        fixedKey: 'hp_awareness',
        startKey: 'start_hp_awareness',
        endKey: 'end_hp_awareness',
      })
  );
}

function calculateHit(stats: Character): number {
  return Math.floor(stats.intelligence * stats.awakening.hit_awareness);
}

function calculateEvasion(stats: Character): number {
  return Math.floor(stats.intelligence * stats.awakening.evasion_awareness);
}

function calculateSpiritDefense(stats: Character): number {
  return Math.floor(stats.spirit * stats.awakening.spirit_defense_awareness);
}

export function getRemainedHp(state: CharacterState): number {
  return state.maxHp - state.totalDamage;
}

export function formatState(state: CharacterState): string {
  return [
    `HP: ${getRemainedHp(state)}/${state.maxHp}`,
    `PhysicalAttack: ${state.physicalAttack}`,
    `MagicAttack: ${state.magicAttack}`,
    `Hit: ${state.hit}`,
    `Evasion: ${state.evasion}`,
    `SpiritDefense: ${state.spiritDefense}`,
  ].join(' ');
  // TODO: debuff とかの情報も出せれば
}
