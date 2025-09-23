import type { CharacterState } from './state';
import type { SkillEffect } from './state/skillEffect';
import type { ExecutedSkill } from './types';
import { z } from 'zod';

export const SkillSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  effect: z.string(),
  duration: z.number().int().min(1), // 残りターン数は1以上
  stackable: z.boolean(), // 重ねがけ可能かどうか
  // クールタイム
  coolTime: z.number().int().min(1),
  coolDownEndTurn: z.number().int().min(0),
});

export type Skill = z.infer<typeof SkillSchema>;

export function calculateSkillSuccessRate({
  attackerIntelligence,
  defenderSpirit,
}: {
  attackerIntelligence: number;
  defenderSpirit: number;
}): number {
  return Math.max(
    0,
    (attackerIntelligence - defenderSpirit / 2) /
      (attackerIntelligence + defenderSpirit * 2)
  );
}

export function executeActiveSkills({
  attackerState,
  defenderState,
  skillEffects,
  turn,
}: {
  attackerState: CharacterState;
  defenderState: CharacterState;
  skillEffects: Record<string, SkillEffect>;
  turn: number;
}): [CharacterState, ExecutedSkill[]] {
  const skillSuccessRate = calculateSkillSuccessRate({
    attackerIntelligence: attackerState.intelligence,
    defenderSpirit: defenderState.spirit,
  });
  const executedSkills: ExecutedSkill[] = [];

  for (const skill of attackerState.stats.skills) {
    if (skill.coolDownEndTurn > turn) continue;

    const skillEffect = skillEffects[skill.effect];
    if (!skillEffect) throw new Error(`Unknown skill effect: ${skill.effect}`);

    // passive は処理しない
    if (skillEffect.type !== 'active') continue;

    if (Math.random() <= skillSuccessRate) {
      // 重ねがけチェック
      if (
        skill.stackable ||
        !defenderState.stats.activeEffects.some(e => e.type === skill.effect)
      ) {
        executedSkills.push({ ...skill });

        defenderState.stats.activeEffects.push({
          type: skill.effect,
          duration: 1,
          stackable: skill.stackable,
        });

        skill.coolDownEndTurn = turn + skill.coolTime;
      } else {
        // TODO: 重ねがけじゃないときには期間を延長したい
      }
    }
  }

  return [defenderState, executedSkills];
}

export function executePassiveSkills({
  attackerState,
  // defenderState,
  damageDealt,
  damageReceived,
  skillEffects,
  turn,
}: {
  attackerState: CharacterState;
  // defenderState: CharacterState;
  damageDealt: number | null;
  damageReceived: number | null;
  skillEffects: Record<string, SkillEffect>;
  turn: number;
}): {
  attackerState: CharacterState;
  // defenderState: CharacterState;
  damageDealt: number | null;
  damageReceived: number | null;
  executedSkills: ExecutedSkill[];
} {
  // damageDealt が null のときは攻撃していないのでスキルも発動しない
  if (damageDealt === null)
    return {
      attackerState,
      // defenderState,
      damageDealt,
      damageReceived,
      executedSkills: [],
    };

  const executedSkills: ExecutedSkill[] = [];

  let currentState = { ...attackerState };
  let currentDamageDealt = damageDealt;
  let currentDamageReceived = damageReceived;
  for (const skill of attackerState.stats.skills) {
    // クールダウン中はスキップ
    if (skill.coolDownEndTurn > turn) continue;

    const skillEffect = skillEffects[skill.effect];
    if (!skillEffect) throw new Error(`Unknown skill effect: ${skill.effect}`);

    // active は処理しない
    if (skillEffect.type !== 'passive') continue;

    // とりあえずパッシブスキルは必ず発動とする（最初は coolTime と apply 時の条件のみで制御する）
    const result = skillEffect.apply({
      characterState: currentState,
      damageDealt,
    });
    if (!result) continue;

    const {
      damageDealt: updatedDamageDealt,
      damageReceived: updatedDamageReceived,
      ...stats
    } = result;

    if (updatedDamageDealt || updatedDamageDealt === 0)
      currentDamageDealt = updatedDamageDealt;
    if (updatedDamageReceived || updatedDamageReceived === 0)
      currentDamageReceived = updatedDamageReceived;
    currentState = { ...currentState, ...stats };

    executedSkills.push({ ...skill });

    skill.coolDownEndTurn = turn + skill.coolTime;
  }

  return {
    attackerState: currentState,
    // defenderState,
    damageDealt: currentDamageDealt,
    damageReceived: currentDamageReceived,
    executedSkills,
  };
}
