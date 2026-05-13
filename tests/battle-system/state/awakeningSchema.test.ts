import { describe, expect, it } from 'vitest';
import { AwakeningSchema } from '../../../src/battle-system/state/awakening';

describe('AwakeningSchema', () => {
  it('固定 awareness を受け入れる', () => {
    expect(() =>
      AwakeningSchema.parse({
        hp_awareness: 10,
        physical_attack_awareness: 10,
        magic_attack_awareness: 1,
        hit_awareness: 1,
        evasion_awareness: 1,
        spirit_defense_awareness: 1,
      })
    ).not.toThrow();
  });

  it('推移 awareness を受け入れる', () => {
    expect(() =>
      AwakeningSchema.parse({
        start_hp_awareness: 0.5,
        end_hp_awareness: 1,
        start_physical_attack_awareness: 0.5,
        end_physical_attack_awareness: 1,
        start_magic_attack_awareness: 0.5,
        end_magic_attack_awareness: 1,
        turn_to_awake: 5,
        hit_awareness: 1,
        evasion_awareness: 1,
        spirit_defense_awareness: 1,
      })
    ).not.toThrow();
  });

  it('旧 ratio 形式を拒否する', () => {
    expect(() =>
      AwakeningSchema.parse({
        ratio: 10,
        hit_awareness: 1,
        evasion_awareness: 1,
        spirit_defense_awareness: 1,
      })
    ).toThrow();
  });

  it('同じ awareness の固定値と推移値の混在を拒否する', () => {
    expect(() =>
      AwakeningSchema.parse({
        hp_awareness: 10,
        start_hp_awareness: 0.5,
        end_hp_awareness: 1,
        physical_attack_awareness: 10,
        magic_attack_awareness: 1,
        turn_to_awake: 5,
        hit_awareness: 1,
        evasion_awareness: 1,
        spirit_defense_awareness: 1,
      })
    ).toThrow();
  });
});
