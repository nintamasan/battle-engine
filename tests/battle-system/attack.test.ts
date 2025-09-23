import { elementRelationsFixture } from 'tests/helpers/element';
import { executeAttack } from '../../src/battle-system/attack';
import { calculateInitialState } from '../../src/battle-system/state';
import { loadFireHeroineFixture } from '../helpers/fixtures';

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
      elementRelations: elementRelationsFixture,
    });

    const damage = executeAttack({
      attackerState: enemyState,
      defenderState: heroState,
      elementRelations: elementRelationsFixture,
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
      elementRelations: elementRelationsFixture,
    });

    const damage = executeAttack({
      attackerState: heroState,
      defenderState: enemyState,
      elementRelations: elementRelationsFixture,
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
      elementRelations: elementRelationsFixture,
    });

    const equivalentDamage = executeAttack({
      attackerState: heroState,
      defenderState: equivalentIntelligentEnemyState,
      elementRelations: elementRelationsFixture,
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
      elementRelations: elementRelationsFixture,
    });

    const equivalentDamage = executeAttack({
      attackerState: equivalentIntelligentEnemyState,
      defenderState: heroState,
      elementRelations: elementRelationsFixture,
    });

    expect(damage).toEqual(equivalentDamage);
  });
});
