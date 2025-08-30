import { z } from 'zod';
import { ElementSchema } from './battle-system/element';
import { SkillSchema } from './battle-system/skill';
import { AppliedSkillEffectSchema } from './battle-system/state/skillEffect';
import { AwakeningSchema } from './battle-system/state/awakening';

export const CharacterSchema = z
  .object({
    id: z.string(),
    // 基本設定
    name: z.string(),
    type: z.enum(['hero', 'enemy']).optional(), // 利用していない
    description: z.string().optional(),

    element: ElementSchema,

    // ステータス
    vitality: z.number().int().min(0), // 体力
    intelligence: z.number().int().min(0), // 判断力
    spirit: z.number().int().min(0), // 精神力
    fatigue: z.number().int().min(0).max(50), // 疲労度

    // 覚醒
    awakening: AwakeningSchema,

    // スキル
    skills: z.array(SkillSchema),
    activeEffects: z.array(AppliedSkillEffectSchema),
  })
  .strict();
export type Character = z.infer<typeof CharacterSchema>;
