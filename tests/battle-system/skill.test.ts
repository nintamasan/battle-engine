import {
  calculateSkillSuccessRate,
  executeActiveSkills,
  executePassiveSkills,
} from '../../src/battle-system/skill';
import {
  calculateInitialState,
  CharacterState,
} from '../../src/battle-system/state';
import {
  loadFireHeroineFixture,
  loadWaterHeroineFixture,
} from '../helpers/fixtures';
import { commonSkillEffectsFixtures } from '../helpers/skill';

describe('スキルシステム', () => {
  describe('スキルの成功率計算', () => {
    test.each([
      { attackerIntelligence: 100, defenderSpirit: 0, expected: 1.0 },
      { attackerIntelligence: 0, defenderSpirit: 100, expected: 0 },
      // 互角なら6ターンに一度ほど
      { attackerIntelligence: 100, defenderSpirit: 100, expected: 0.17 },
    ])(
      '攻撃側の判断力が $attackerIntelligence で守備側の精神力が $defenderSpilit なら $expected になる',
      ({ attackerIntelligence, defenderSpirit, expected }) => {
        const successRate = calculateSkillSuccessRate({
          attackerIntelligence,
          defenderSpirit,
        });
        expect(successRate).toBeCloseTo(expected, 2);
      }
    );
  });

  describe('パッシブスキルの実行', () => {
    it('パッシブスキルが付与できる', () => {
      const heroState: CharacterState = calculateInitialState({
        ...loadWaterHeroineFixture(),
        skills: [
          {
            name: '判断力低下',
            effect: 'intelligence-down',
            duration: 1,
            stackable: false,
            coolTime: 0,
            coolDownEndTurn: 0,
          },
        ],
      });
      const enemyState: CharacterState = calculateInitialState({
        ...loadFireHeroineFixture(),
        spirit: 0, // 100% 成功する
        activeEffects: [
          {
            type: 'poison',
            duration: 1,
            stackable: false,
          },
        ],
      });

      executeActiveSkills({
        attackerState: heroState,
        defenderState: enemyState,
        skillEffects: commonSkillEffectsFixtures,
        turn: 1,
      });

      // スキルが適用される
      // expect(appliedEffects.length).toBe(1);
      expect(enemyState.stats.activeEffects.length).toBe(2);
    });

    it('重ねがけ制御が正しく動作する', () => {
      const heroState: CharacterState = calculateInitialState({
        ...loadWaterHeroineFixture(),
        skills: [
          {
            name: '毒付与',
            effect: 'poison',
            duration: 3,
            stackable: false, // 重ねがけ不可
            coolTime: 0,
            coolDownEndTurn: 0,
          },
        ],
      });
      const enemyState: CharacterState = calculateInitialState({
        ...loadFireHeroineFixture(),
        spirit: 0, // 100% 成功する
        activeEffects: [
          {
            type: 'poison',
            duration: 1,
            stackable: false,
          },
        ],
      });

      // 最初の実行
      executeActiveSkills({
        attackerState: heroState,
        defenderState: enemyState,
        skillEffects: commonSkillEffectsFixtures,
        turn: 1,
      });
      // TODO: duration が更新される
      expect(enemyState.stats.activeEffects.length).toBe(1); // 1つの毒付与のみ適用される
    });
  });

  describe('executePassiveSkills', () => {
    it('パッシブスキルが正しく実行される', () => {
      const heroState: CharacterState = calculateInitialState({
        ...loadWaterHeroineFixture(),
        skills: [
          {
            name: '体力回復',
            effect: 'heal',
            duration: 1,
            stackable: false,
            coolTime: 2, // 2ターンに1回
            coolDownEndTurn: 0,
          },
        ],
      });

      // ダメージを受けた状態にする
      heroState.totalDamage = 50;

      const result = executePassiveSkills({
        attackerState: heroState,
        damageDealt: 30,
        damageReceived: 20,
        skillEffects: commonSkillEffectsFixtures,
        turn: 1,
      });

      // 体力が100%回復される
      expect(result.attackerState.totalDamage).toBe(0);
      expect(result.executedSkills).toHaveLength(1);
      expect(result.executedSkills[0].name).toBe('体力回復');
    });

    it('クールダウン中のパッシブスキルは実行されない', () => {
      const heroState: CharacterState = calculateInitialState({
        ...loadWaterHeroineFixture(),
        skills: [
          {
            name: '体力回復',
            effect: 'heal',
            duration: 1,
            stackable: false,
            coolTime: 2,
            coolDownEndTurn: 0,
          },
        ],
      });

      // ダメージを受けた状態にする
      heroState.totalDamage = 50;
      heroState.stats.skills[0].coolDownEndTurn = 3; // まだクールダウン中

      const result = executePassiveSkills({
        attackerState: heroState,
        damageDealt: 30,
        damageReceived: 20,
        skillEffects: commonSkillEffectsFixtures,
        turn: 1,
      });

      // スキルが実行されない（executedSkills が空）
      expect(result.executedSkills).toHaveLength(0);
    });

    it('damageDealt が null の場合はパッシブスキルが実行されない', () => {
      const heroState: CharacterState = calculateInitialState({
        ...loadWaterHeroineFixture(),
        skills: [
          {
            name: '体力回復',
            effect: 'heal',
            duration: 1,
            stackable: false,
            coolTime: 2,
            coolDownEndTurn: 0,
          },
        ],
      });

      heroState.totalDamage = 50;

      const result = executePassiveSkills({
        attackerState: heroState,
        damageDealt: null,
        damageReceived: null,
        skillEffects: commonSkillEffectsFixtures,
        turn: 1,
      });

      // スキルが実行されない
      expect(result.attackerState.totalDamage).toBe(50);
      expect(result.executedSkills).toHaveLength(0);
    });
  });
});
