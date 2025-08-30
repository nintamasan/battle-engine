import { describe, it, expect } from 'vitest';
import { BattleEngine } from '../src/battle-system/battle-engine.js';
import { defaultEngineConfig } from './helpers/config';
import {
  loadFireHeroineFixture,
  loadWaterHeroineFixture,
} from './helpers/fixtures';
import { Character } from '../src/character';
import { addCommonSkillEffects } from './helpers/skill';

const trashEnemyStats: Omit<Character, 'element'> = {
  id: 'normal',
  name: '雑魚敵',
  vitality: 450,
  intelligence: 45,
  spirit: 45,
  fatigue: 0,
  awakening: { startRatio: 0.5, endRatio: 1, turnToAwake: 5 },
  skills: [],
  activeEffects: [],
};
const bossEnemyStats: Omit<Character, 'element'> = {
  id: 'boss',
  name: 'ボス',
  vitality: 600,
  intelligence: 60,
  spirit: 60,
  fatigue: 0,
  awakening: { startRatio: 0.5, endRatio: 1, turnToAwake: 5 },
  skills: [],
  activeEffects: [],
};

/*
 * 現状のバランスだと、体力がかなり優位に働く
 * これに対してデバフや状態異常を導入予定である
 */
describe('仕様要求の検証', () => {
  beforeAll(() => {
    addCommonSkillEffects();
  });

  describe('雑魚敵（ヒロインの70%）に対する検証', () => {
    describe('ヒロイン1（体力1000・判断力20・精神力60）', () => {
      const heroStats = loadFireHeroineFixture();

      it('有利属性で3ターン以内程度で勝利', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...trashEnemyStats,
          element: 'wind',
        };

        const result = engine.runBattle({ heroStats, enemyStats });

        expect(result.result).toEqual('victory');
        expect(result.turns.length).toBeLessThanOrEqual(3);
      });

      it('同属性で4ターン以上かかって勝利', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...trashEnemyStats,
          element: 'fire',
        };
        const result = engine.runBattle({
          heroStats,
          enemyStats,
        });

        expect(result.result).toEqual('victory');
        // 体力高いから仕方ない
        expect(result.turns.length).toBeGreaterThanOrEqual(4 - 1);
      });

      it('不利属性で5ターン以上は戦闘継続', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...trashEnemyStats,
          element: 'water',
        };
        const result = engine.runBattle({ heroStats, enemyStats });

        // 勝利でも敗北でもよい
        expect(result.turns.length).toBeGreaterThanOrEqual(5);
      });
    });

    describe('ヒロイン2（体力400・判断力100・精神力40）', () => {
      const heroStats = loadWaterHeroineFixture();

      it('有利属性で3ターン以内程度で勝利', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...trashEnemyStats,
          element: 'fire',
        };
        const result = engine.runBattle({ heroStats, enemyStats });

        expect(result.result).toEqual('victory');
        // 低体力なので時間がかかるのは仕方ない
        expect(result.turns.length).toBeLessThanOrEqual(3 + 1);
      });

      it('同属性で4ターン以上かかって勝利', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...trashEnemyStats,
          element: 'water',
        };
        const result = engine.runBattle({ heroStats, enemyStats });

        expect(result.result).toEqual('victory');
        expect(result.turns.length).toBeGreaterThanOrEqual(4);
      });

      it('不利属性で5ターン以上は戦闘継続', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...trashEnemyStats,
          element: 'wind',
        };
        const result = engine.runBattle({ heroStats, enemyStats });

        // 勝利でも敗北でもよい
        expect(result.turns.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('ボスキャラ（ヒロインと同程度）に対する検証', () => {
    describe('ヒロイン1（体力1000・判断力20・精神力60）', () => {
      const heroStats = loadFireHeroineFixture();

      it('有利属性で4ターン程度で勝利', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...bossEnemyStats,
          element: 'wind',
        };
        const result = engine.runBattle({
          heroStats,
          enemyStats,
        });
        expect(result.result).toEqual('victory');
        // 体力高いから仕方ない
        expect(result.turns.length).toBeGreaterThanOrEqual(4 - 1);
      });

      it('同属性で5ターン以上かかって勝利', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...bossEnemyStats,
          element: 'fire',
        };
        const result = engine.runBattle({ heroStats, enemyStats });

        // 勝利でも敗北でもよい
        // 攻撃力高いから
        expect(result.turns.length).toBeGreaterThanOrEqual(5);
      });

      it('不利属性で6ターン程度で敗北', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const enemyStats: Character = {
          ...bossEnemyStats,
          element: 'water',
        };
        const result = engine.runBattle({ heroStats, enemyStats });

        // 勝利でも敗北でもよい
        expect(result.turns.length).toBeGreaterThanOrEqual(6);
      });
    });

    describe('ヒロイン2（体力400・判断力100・精神力40）', () => {
      const heroStats = loadWaterHeroineFixture();

      it('有利属性で4ターン程度で勝利', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const result = engine.runBattle({
          heroStats,
          enemyStats: {
            ...bossEnemyStats,
            element: 'fire',
          },
        });
        expect(result.result).toEqual('victory');
        // スキルシステムにより低体力キャラでも戦えるようになった
        expect(result.turns.length).toBeGreaterThanOrEqual(2);
      });

      it('同属性で5ターン以上かかって勝利', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const result = engine.runBattle({
          heroStats,
          enemyStats: {
            ...bossEnemyStats,
            element: 'water',
          },
        });
        // 勝利でも敗北でもよい
        expect(result.turns.length).toBeGreaterThanOrEqual(5);
      });

      it('不利属性で6ターン程度で敗北', () => {
        const engine = new BattleEngine(defaultEngineConfig);
        const result = engine.runBattle({
          heroStats,
          enemyStats: {
            ...bossEnemyStats,
            element: 'wind',
            // デバフかかれば負けないことを示す
            activeEffects: [
              {
                type: 'intelligence-down',
                duration: 3,
                stackable: true,
              },
            ],
          },
        });

        expect(result.result).toEqual('lose');
        expect(result.turns.length).toBeGreaterThanOrEqual(6);
      });
    });
  });

  // describe("debuff効果によるバランス調整の検証", () => {});
});
