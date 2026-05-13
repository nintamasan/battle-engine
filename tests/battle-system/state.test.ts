import {
  calculateInitialState,
  calculateState,
} from '../../src/battle-system/state';
import { loadFireHeroineFixture } from '../helpers/fixtures';

describe('戦闘中ステータス計算', () => {
  it('固定 awareness から戦闘中ステータスを計算する', () => {
    const state = calculateInitialState({
      ...loadFireHeroineFixture(),
      vitality: 80,
      intelligence: 50,
      spirit: 30,
      awakening: {
        hp_awareness: 5,
        physical_attack_awareness: 4,
        magic_attack_awareness: 2,
        hit_awareness: 3,
        evasion_awareness: 2,
        spirit_defense_awareness: 6,
      },
    });

    expect(state.maxHp).toBe(400);
    expect(state.physicalAttack).toBe(64);
    expect(state.magicAttack).toBe(32);
    expect(state.hit).toBe(150);
    expect(state.evasion).toBe(100);
    expect(state.spiritDefense).toBe(180);
  });

  it('推移 awareness から HP と攻撃力を計算する', () => {
    const beforeState = calculateInitialState({
      ...loadFireHeroineFixture(),
      vitality: 80,
      awakening: {
        start_hp_awareness: 2,
        end_hp_awareness: 6,
        start_physical_attack_awareness: 4,
        end_physical_attack_awareness: 8,
        start_magic_attack_awareness: 1,
        end_magic_attack_awareness: 5,
        turn_to_awake: 4,
        hit_awareness: 1,
        evasion_awareness: 1,
        spirit_defense_awareness: 1,
      },
    });

    const [state] = calculateState({
      beforeState,
      skillEffects: {},
      turn: 3,
    });

    expect(state.maxHp).toBe(320);
    expect(state.physicalAttack).toBe(96);
    expect(state.magicAttack).toBe(48);
  });
});
