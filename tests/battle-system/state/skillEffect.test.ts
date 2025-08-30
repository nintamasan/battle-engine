import {
  calculateInitialState,
  CharacterState,
} from '../../../src/battle-system/state';
import { calculateSkillEffects } from '../../../src/battle-system/state/skillEffect';
import { loadFireHeroineFixture } from '../../helpers/fixtures';
import { addCommonSkillEffects } from '../../helpers/skill';

describe('SkillEffect', () => {
  beforeAll(() => {
    addCommonSkillEffects();
  });

  it('毒付与スキルが体力の10%ダメージを与える', () => {
    const state: CharacterState = calculateInitialState({
      ...loadFireHeroineFixture(),
      activeEffects: [
        {
          type: 'poison',
          duration: 1,
          stackable: false,
        },
      ],
    });

    const [currentState] = calculateSkillEffects({
      state,
      turn: 1,
    });
    const poisonDamage = 1000 * 0.1; // HPの10%
    expect(currentState.totalDamage).toBe(poisonDamage);
  });

  it('判断力ダウンスキルが判断力を半減する', () => {
    const state: CharacterState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 100,
      activeEffects: [
        {
          type: 'intelligence-down',
          duration: 1,
          stackable: true,
        },
      ],
    });

    const [currentState] = calculateSkillEffects({
      state,
      turn: 1,
    });
    expect(currentState.intelligence).toBe(50); // 100 * 0.5
  });

  it('判断力ダウンスキルは重ねがけ可能', () => {
    const state: CharacterState = calculateInitialState({
      ...loadFireHeroineFixture(),
      intelligence: 100,
      activeEffects: [
        {
          type: 'intelligence-down',
          duration: 1,
          stackable: true,
        },
        {
          type: 'intelligence-down',
          duration: 1,
          stackable: true,
        },
      ],
    });

    const [currentState] = calculateSkillEffects({
      state,
      turn: 1,
    });
    expect(currentState.intelligence).toBe(25); // 100 * 0.5 * 0.5
  });

  it('毒付与スキルは重ねがけ不可', () => {
    const state: CharacterState = calculateInitialState({
      ...loadFireHeroineFixture(),
      vitality: 100,
      awakening: { ratio: 10 },
      // 本来ありえない
      activeEffects: [
        {
          type: 'poison',
          duration: 1,
          stackable: false,
        },
        {
          type: 'poison',
          duration: 1,
          stackable: false,
        },
      ],
    });

    const [currentState] = calculateSkillEffects({
      state,
      turn: 1,
    });
    const poisonDamage = 1000 * 0.1; // HPの10%（1回分のみ）
    expect(currentState.totalDamage).toBe(poisonDamage);
  });
});
