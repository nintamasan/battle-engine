import {
  type BattleResult,
  type TurnInfo,
  CalculatedSkillEffect,
  ExecutedSkill,
} from './types.js';
import {
  calculateInitialState,
  calculateState,
  CharacterState,
  formatState,
  getRemainedHp,
} from './state';
import {
  executeActiveSkills,
  executeAttackSkills,
  executePassiveSkills,
} from './skill';
import { executeAttack } from './attack';
import type { Character } from '../character';
import type { SkillEffectMap } from './state/skillEffect.js';
import type { ElementRelations } from './element.js';

export type BattleConfig = {
  maxTurns: number;
  baseDamageRatio: number; // 基本ダメージの比率（デフォルト1/5）

  elementRelations: ElementRelations;
  skillEffects: SkillEffectMap;

  // tmp
  logger?: typeof console;
};

export class BattleEngine {
  private config: BattleConfig;

  constructor(config: Partial<BattleConfig> = {}) {
    this.config = {
      maxTurns: 12,
      baseDamageRatio: 0.2, // 1/5
      skillEffects: {},
      elementRelations: {
        fire: { advantage: 'wind', disadvantage: 'water' },
        water: { advantage: 'fire', disadvantage: 'wind' },
        wind: { advantage: 'water', disadvantage: 'fire' },
      },
      ...config,
    };
  }

  // バトルを実行
  runBattle({
    heroStats,
    enemyStats,
  }: {
    heroStats: Character;
    enemyStats: Character;
  }): { result: BattleResult; turns: TurnInfo[] } {
    const turns: TurnInfo[] = [];

    // ループ間で更新していく
    let heroState: CharacterState = calculateInitialState(heroStats);
    let enemyState: CharacterState = calculateInitialState(enemyStats);

    for (let turn = 1; turn <= this.config.maxTurns; turn++) {
      this.config?.logger?.debug(`Turn ${turn} starts`);

      const turnResult = this.runTurn({
        beforeHeroState: heroState,
        beforeEnemyState: enemyState,
        turn,
      });

      // ターン情報を記録
      turns.push(turnResult);

      heroState = turnResult.heroState;
      enemyState = turnResult.enemyState;

      // 勝敗判定
      if (getRemainedHp(heroState) <= 0 && getRemainedHp(enemyState) <= 0) {
        this.config?.logger?.debug('Both sides are down.');
        return { result: 'mutual-strike', turns };
      }
      if (getRemainedHp(enemyState) <= 0) {
        this.config?.logger?.debug('Hero wins!');
        return { result: 'victory', turns };
      }
      if (getRemainedHp(heroState) <= 0) {
        this.config?.logger?.debug('Hero loses!');
        return { result: 'lose', turns };
      }
    }

    return { result: 'draw', turns };
  }

  runTurn({
    beforeHeroState,
    beforeEnemyState,
    turn,
  }: {
    beforeHeroState: CharacterState;
    beforeEnemyState: CharacterState;
    turn: number;
  }): TurnInfo {
    // 1. 開始処理
    const {
      effectedHeroState,
      effectedEnemyState,
      executedActiveSkillsToHero,
      executedActiveSkillsToEnemy,
    } = this.runActiveSkills({
      beforeHeroState,
      beforeEnemyState,
      turn,
    });

    // 2. 戦闘処理
    const {
      afterHeroState,
      afterEnemyState,
      damageDealt,
      damageReceived,
      heroAffects,
      enemyAffects,
      executedSkills: executedPassiveSkills,
      unprotectedStrike,
    } = this.runAttack({
      beforeHeroState: effectedHeroState,
      beforeEnemyState: effectedEnemyState,
      turn,
    });

    // 3. 終了処理
    return {
      heroState: this.teardownState({ ...afterHeroState }), // 多分 deep copy しないとだめ
      enemyState: this.teardownState({ ...afterEnemyState }),
      damageDealt,
      damageReceived,
      executedSkills: [
        ...executedActiveSkillsToEnemy,
        ...executedActiveSkillsToHero,
        ...executedPassiveSkills,
      ],
      skillEffectsApplied: [...heroAffects, ...enemyAffects],
      unprotectedStrike,
    };
  }

  runActiveSkills({
    beforeHeroState,
    beforeEnemyState,
    turn,
  }: {
    beforeHeroState: CharacterState;
    beforeEnemyState: CharacterState;
    turn: number;
  }) {
    // これはターン開始時に発動するエフェクトの効果は受けない
    const [effectedEnemyState, executedActiveSkillsToEnemy] =
      executeActiveSkills({
        attackerState: beforeHeroState,
        defenderState: beforeEnemyState,
        skillEffects: this.config.skillEffects,
        turn,
      });
    const [effectedHeroState, executedActiveSkillsToHero] = executeActiveSkills(
      {
        attackerState: beforeEnemyState,
        defenderState: beforeHeroState,
        skillEffects: this.config.skillEffects,
        turn,
      }
    );

    executedActiveSkillsToEnemy.forEach(skill => {
      this.config?.logger?.debug(`Hero applies skill: ${skill.name} to enemy`);
    });
    executedActiveSkillsToHero.forEach(skill => {
      this.config?.logger?.debug(`Enemy applies skill: ${skill.name} to hero`);
    });

    // ターン開始前の状態を記録
    return {
      effectedHeroState,
      effectedEnemyState,
      executedActiveSkillsToHero,
      executedActiveSkillsToEnemy,
    };
  }

  runAttack({
    beforeHeroState,
    beforeEnemyState,
    turn,
  }: {
    beforeHeroState: CharacterState;
    beforeEnemyState: CharacterState;
    turn: number;
  }): {
    afterHeroState: CharacterState;
    afterEnemyState: CharacterState;
    damageDealt: number | null;
    damageReceived: number | null;
    heroAffects: Omit<CalculatedSkillEffect, 'target'>[];
    enemyAffects: Omit<CalculatedSkillEffect, 'target'>[];
    executedSkills: ExecutedSkill[];
    unprotectedStrike: boolean;
  } {
    // 2.1 現在のステータスの更新（デバフ等によるスタータス補正）
    // effects や awakening の影響を受ける
    const [currentHeroState, heroAffects] = calculateState({
      beforeState: beforeHeroState,
      skillEffects: this.config.skillEffects,
      turn,
    });
    const [currentEnemyState, enemyAffects] = calculateState({
      beforeState: beforeEnemyState,
      skillEffects: this.config.skillEffects,
      turn,
    });

    if (heroAffects.length) {
      this.config?.logger?.debug(
        `Hero state after effects: ${formatState(currentHeroState)}`
      );
    }
    if (enemyAffects.length) {
      this.config?.logger?.debug(
        `Enemy state after effects: ${formatState(currentEnemyState)}`
      );
    }

    const heroHp = getRemainedHp(currentHeroState);
    const heroAttackExecution = executeAttackSkills({
      attackerState: currentHeroState,
      defenderState: currentEnemyState,
      skillEffects: this.config.skillEffects,
      turn,
    });
    const enemyAttackExecution = executeAttackSkills({
      attackerState: currentEnemyState,
      defenderState: currentHeroState,
      skillEffects: this.config.skillEffects,
      turn,
    });
    const unprotectedStrike = enemyAttackExecution.modifiers.some(
      modifier => modifier.type === 'unprotected'
    );

    if (unprotectedStrike) {
      this.config?.logger?.debug(
        `Hero was down, and enemy attacks with no defense.`
      );
    }

    // 2-2. ダメージ計算
    // ヒロインの攻撃
    const damageDealt = heroAttackExecution.canExecute
      ? executeAttack({
          attackerState: currentHeroState,
          defenderState: currentEnemyState,
          elementRelations: this.config.elementRelations,
          modifiers: heroAttackExecution.modifiers,
        })
      : null;

    // 敵の攻撃
    const damageReceived = enemyAttackExecution.canExecute
      ? executeAttack({
          attackerState: currentEnemyState,
          defenderState: currentHeroState,
          elementRelations: this.config.elementRelations,
          modifiers: enemyAttackExecution.modifiers,
        })
      : null;

    const executedAttackSkills = [
      ...heroAttackExecution.executedSkills,
      ...enemyAttackExecution.executedSkills,
    ];

    // すでに倒れている場合はパッシブスキルも発動しない
    if (heroHp <= 0) {
      return {
        afterHeroState: currentHeroState,
        afterEnemyState: currentEnemyState,
        damageDealt,
        damageReceived,
        heroAffects,
        enemyAffects,
        executedSkills: executedAttackSkills,
        unprotectedStrike,
      };
    }

    // 2-3. パッシブスキルの効果適用
    // 現状、パッシブスキルを持つのはヒロインのみとする
    const {
      attackerState: updatedHeroState,
      damageDealt: updatedDamageDealt,
      damageReceived: updatedDamageReceived,
      executedSkills,
    } = executePassiveSkills({
      attackerState: currentHeroState,
      // defenderState: currentEnemyState,
      damageDealt,
      damageReceived,
      skillEffects: this.config.skillEffects,
      turn,
    });

    const updatedHeroHp = getRemainedHp(updatedHeroState);
    const updatedEnemyHp = getRemainedHp(currentEnemyState);

    // ダメージ更新
    updatedHeroState.totalDamage =
      updatedHeroState.totalDamage + (updatedDamageReceived ?? 0);
    currentEnemyState.totalDamage =
      currentEnemyState.totalDamage + (updatedDamageDealt ?? 0);

    if (updatedDamageReceived !== null) {
      this.config?.logger?.debug(
        `Hero HP: ${updatedHeroHp}/${currentHeroState.maxHp} --> ${updatedDamageReceived} --> ${getRemainedHp(updatedHeroState)}`
      );
    }
    if (damageDealt !== null) {
      this.config?.logger?.debug(
        `Enemy HP: ${updatedEnemyHp}/${currentEnemyState.maxHp} --> ${updatedDamageDealt} --> ${getRemainedHp(currentEnemyState)}`
      );
    }

    return {
      afterHeroState: updatedHeroState,
      afterEnemyState: currentEnemyState,
      damageDealt: updatedDamageDealt,
      damageReceived: updatedDamageReceived,
      heroAffects,
      enemyAffects,
      executedSkills: [...executedAttackSkills, ...executedSkills],
      unprotectedStrike,
    };
  }

  teardownState(state: CharacterState): CharacterState {
    return {
      ...state,
      stats: {
        ...state.stats,
        // スキル効果のターン終了処理
        activeEffects: state.stats.activeEffects
          .map(effect => ({ ...effect, duration: effect.duration - 1 }))
          .filter(effect => effect.duration > 0),
      },
    };
  }
}
