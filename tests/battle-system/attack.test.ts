import { executeAttack } from '@/battle-system/attack';
import { calculateInitialState } from '@/battle-system/state';
import { loadFireHeroineFixture } from 'tests/helpers/fixtures';

describe('ダメージ計算', () => {
  it('ヒロインの判断力が高い場合、ヒロインが受けるダメージが軽減される', () => {
    const heroState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 100,
    });

    const equivalentIntelligentEnemyState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 100,
    });
    const enemyState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 60,
    });

    const equivalentDamage = executeAttack({
      attackerState: equivalentIntelligentEnemyState,
      defenderState: heroState,
    });

    const damage = executeAttack({
      attackerState: enemyState,
      defenderState: heroState,
    });

    expect(damage).toBeLessThan(equivalentDamage);
  });

  it('ヒロインの判断力が高い場合、敵が受けるダメージは変化しない', () => {
    const heroState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 100,
    });

    const equivalentIntelligentEnemyState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 100,
    });
    const enemyState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 60,
    });

    const equivalentDamage = executeAttack({
      attackerState: heroState,
      defenderState: equivalentIntelligentEnemyState,
    });

    const damage = executeAttack({
      attackerState: heroState,
      defenderState: enemyState,
    });

    expect(damage).toEqual(equivalentDamage);
  });

  it('ヒロインの判断力が低い場合、ヒロインの攻撃ダメージが減少する', () => {
    const heroState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 40,
    });

    const equivalentIntelligentEnemyState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 40,
    });
    const enemyState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 60,
    });

    const damage = executeAttack({
      attackerState: heroState,
      defenderState: enemyState,
    });

    const equivalentDamage = executeAttack({
      attackerState: heroState,
      defenderState: equivalentIntelligentEnemyState,
    });

    expect(damage).toBeLessThan(equivalentDamage);
  });

  it('ヒロインの判断力が低い場合、ヒロインの攻撃ダメージは変化しない', () => {
    const heroState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 40,
    });

    const equivalentIntelligentEnemyState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 40,
    });
    const enemyState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 60,
    });

    const damage = executeAttack({
      attackerState: enemyState,
      defenderState: heroState,
    });

    const equivalentDamage = executeAttack({
      attackerState: equivalentIntelligentEnemyState,
      defenderState: heroState,
    });

    expect(damage).toEqual(equivalentDamage);
  });
});
