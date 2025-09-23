import type { CharacterState } from '../state';
import type { CalculatedSkillEffect } from '../types';
import { z } from 'zod';

export const AppliedSkillEffectSchema = z.object({
  type: z.string(),
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

export function calculateSkillEffects({
  state,
  skillEffects,
}: {
  state: CharacterState;
  turn: number;
  skillEffects: Record<string, SkillEffect>;
}): [CharacterState, CalculatedSkillEffect[]] {
  const affectedEffectsCounter: { [x in string]?: number } = {};
  const calculatedSkillEffects: CalculatedSkillEffect[] = [];

  for (const effect of state.stats.activeEffects) {
    if (effect.duration <= 0) continue;

    const skill = skillEffects[effect.type];
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
