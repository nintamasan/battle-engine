import { CharacterState } from '../state';
import { CalculatedSkillEffect } from '../types';
import z from 'zod';

export const AppliedSkillEffectSchema = z.object({
  type: z.string().transform((string): SkillEffectType => {
    assertSkillEffectType(string);
    return string;
  }),
  duration: z.number().int().min(1), // 残りターン数は1以上
  stackable: z.boolean(), // 重ねがけ可能かどうか
});

export type AppliedSkillEffect = z.infer<typeof AppliedSkillEffectSchema>;

export type SkillEffect = {
  type: 'active' | 'passive';
  name: string;
  description: string;
  apply: (params: {
    characterState: CharacterState;
    damageDealt?: number | null;
    damageReceived?: number | null;
  }) =>
    | (Partial<CharacterState> & {
        damageDealt?: number | null;
        damageReceived?: number | null;
      })
    | undefined;
};

export const SKILL_EFFECT: Record<string, SkillEffect> = {};

export function addSkillEffect(id: string, effect: SkillEffect) {
  if (id in SKILL_EFFECT) {
    throw new Error(`Skill effect with id ${id} already exists.`);
  }
  SKILL_EFFECT[id] = effect;
}

export function calculateSkillEffects({
  state,
}: {
  state: CharacterState;
  turn: number;
}): [CharacterState, CalculatedSkillEffect[]] {
  const affectedEffectsCounter: { [x in SkillEffectType]?: number } = {};
  const calculatedSkillEffects: CalculatedSkillEffect[] = [];

  for (const effect of state.stats.activeEffects) {
    if (effect.duration <= 0) continue;

    const skill = SKILL_EFFECT[effect.type];
    if (skill) {
      const appliedCount = affectedEffectsCounter[effect.type] ?? 0;
      if (effect.stackable || appliedCount === 0) {
        affectedEffectsCounter[effect.type] = appliedCount + 1;

        const appliedEffect = skill.apply({
          characterState: state,
        });
        if (!appliedEffect) continue; // 効果がない場合はスキップ

        // スキル効果を適用
        state = { ...state, ...appliedEffect };

        // TODO: どういうデバフが適用されたかを記録する
        calculatedSkillEffects.push({
          type: effect.type,
          effect: appliedEffect,
        });
      }
    } else {
      throw new Error('Unknown skill effect type: ' + effect.type);
    }
  }

  return [state, calculatedSkillEffects];
}

export function assertSkillEffectType(
  type: string
): asserts type is SkillEffectType {
  if (!(type in SKILL_EFFECT)) {
    throw new Error(`Unknown skill effect type: ${type}`);
  }
}

export type SkillEffectType = keyof typeof SKILL_EFFECT;
