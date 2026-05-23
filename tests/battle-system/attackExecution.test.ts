import { describe, expect, it } from 'vitest';
import { BattleEngine } from '../../src/battle-system/battle-engine';
import { executeAttack } from '../../src/battle-system/attack';
import {
  calculateInitialState,
  type CharacterState,
} from '../../src/battle-system/state';
import { commonSkillEffectsFixtures } from '../helpers/skill';
import { elementRelationsFixture } from '../helpers/element';
import {
  loadFireHeroineFixture,
  loadWaterHeroineFixture,
} from '../helpers/fixtures';

const engineConfig = {
  skillEffects: {
    ...commonSkillEffectsFixtures,
    'fatal-poison': {
      type: 'active' as const,
      name: '致死毒',
      description: '相手のHPを0にする',
      apply: ({ characterState }: { characterState: CharacterState }) => ({
        totalDamage: characterState.maxHp,
      }),
    },
  },
  elementRelations: elementRelationsFixture,
};

describe('attack execution', () => {
  it('追撃 skill がない場合は攻撃前にHP0になった相手へ攻撃しない', () => {
    const engine = new BattleEngine(engineConfig);
    const beforeHeroState = calculateInitialState({
      ...loadFireHeroineFixture(),
      activeEffects: [
        {
          type: 'fatal-poison',
          duration: 1,
          stackable: false,
        },
      ],
    });
    const beforeEnemyState = calculateInitialState(loadWaterHeroineFixture());

    const result = engine.runTurn({
      beforeHeroState,
      beforeEnemyState,
      turn: 1,
    });

    expect(result.damageReceived).toBeNull();
    expect(result.unprotectedStrike).toBe(false);
    expect(result.executedSkills).toHaveLength(0);
  });

  it('追撃 skill がある場合は攻撃前にHP0になった相手へ無防備な追撃を行い event に記録する', () => {
    const engine = new BattleEngine(engineConfig);
    const beforeHeroState = calculateInitialState({
      ...loadFireHeroineFixture(),
      activeEffects: [
        {
          type: 'fatal-poison',
          duration: 1,
          stackable: false,
        },
      ],
    });
    const beforeEnemyState = calculateInitialState({
      ...loadWaterHeroineFixture(),
      skills: [
        {
          name: '追撃',
          effect: 'finishing-strike',
          duration: 1,
          stackable: false,
          coolTime: 1,
          coolDownEndTurn: 0,
        },
      ],
    });

    const result = engine.runTurn({
      beforeHeroState,
      beforeEnemyState,
      turn: 1,
    });

    expect(result.damageReceived).not.toBeNull();
    expect(result.unprotectedStrike).toBe(true);
    expect(result.executedSkills.map(skill => skill.effect)).toContain(
      'finishing-strike'
    );
  });

  it('必殺技は cooldown 外で通常攻撃ダメージを修飾して event に記録し、cooldown 中は発動しない', () => {
    const engine = new BattleEngine(engineConfig);
    const beforeHeroState = calculateInitialState({
      ...loadFireHeroineFixture(),
      skills: [
        {
          name: '必殺技',
          effect: 'special-move',
          duration: 1,
          stackable: false,
          coolTime: 2,
          coolDownEndTurn: 0,
        },
      ],
    });
    const beforeEnemyState = calculateInitialState(loadWaterHeroineFixture());
    const normalDamage = executeAttack({
      attackerState: beforeHeroState,
      defenderState: beforeEnemyState,
      elementRelations: elementRelationsFixture,
    });
    const specialMoveDamage = executeAttack({
      attackerState: beforeHeroState,
      defenderState: beforeEnemyState,
      elementRelations: elementRelationsFixture,
      modifiers: [{ type: 'damage-ratio', value: 2 }],
    });

    const turn1 = engine.runTurn({
      beforeHeroState,
      beforeEnemyState,
      turn: 1,
    });
    const turn2 = engine.runTurn({
      beforeHeroState: turn1.heroState,
      beforeEnemyState: turn1.enemyState,
      turn: 2,
    });

    expect(turn1.damageDealt).toBe(specialMoveDamage);
    expect(turn1.executedSkills.map(skill => skill.effect)).toContain(
      'special-move'
    );
    expect(turn2.damageDealt).toBe(normalDamage);
    expect(turn2.executedSkills.map(skill => skill.effect)).not.toContain(
      'special-move'
    );
  });
});
