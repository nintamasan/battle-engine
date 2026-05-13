import z from 'zod';

const AwarenessValueSchema = z.number().min(0);

const HpAwarenessSchema = z.union([
  z
    .object({
      hp_awareness: AwarenessValueSchema,
      start_hp_awareness: z.never().optional(),
      end_hp_awareness: z.never().optional(),
    })
    .passthrough(),
  z
    .object({
      hp_awareness: z.never().optional(),
      start_hp_awareness: AwarenessValueSchema,
      end_hp_awareness: AwarenessValueSchema,
      turn_to_awake: z.number().int().min(1),
    })
    .passthrough(),
]);

const PhysicalAttackAwarenessSchema = z.union([
  z
    .object({
      physical_attack_awareness: AwarenessValueSchema,
      start_physical_attack_awareness: z.never().optional(),
      end_physical_attack_awareness: z.never().optional(),
    })
    .passthrough(),
  z
    .object({
      physical_attack_awareness: z.never().optional(),
      start_physical_attack_awareness: AwarenessValueSchema,
      end_physical_attack_awareness: AwarenessValueSchema,
      turn_to_awake: z.number().int().min(1),
    })
    .passthrough(),
]);

const MagicAttackAwarenessSchema = z.union([
  z
    .object({
      magic_attack_awareness: AwarenessValueSchema,
      start_magic_attack_awareness: z.never().optional(),
      end_magic_attack_awareness: z.never().optional(),
    })
    .passthrough(),
  z
    .object({
      magic_attack_awareness: z.never().optional(),
      start_magic_attack_awareness: AwarenessValueSchema,
      end_magic_attack_awareness: AwarenessValueSchema,
      turn_to_awake: z.number().int().min(1),
    })
    .passthrough(),
]);

const AwakeningBaseSchema = z
  .object({
    hp_awareness: AwarenessValueSchema.optional(),
    start_hp_awareness: AwarenessValueSchema.optional(),
    end_hp_awareness: AwarenessValueSchema.optional(),
    physical_attack_awareness: AwarenessValueSchema.optional(),
    start_physical_attack_awareness: AwarenessValueSchema.optional(),
    end_physical_attack_awareness: AwarenessValueSchema.optional(),
    magic_attack_awareness: AwarenessValueSchema.optional(),
    start_magic_attack_awareness: AwarenessValueSchema.optional(),
    end_magic_attack_awareness: AwarenessValueSchema.optional(),
    turn_to_awake: z.number().int().min(1).optional(),
    hit_awareness: AwarenessValueSchema,
    evasion_awareness: AwarenessValueSchema,
    spirit_defense_awareness: AwarenessValueSchema,
  })
  .strict();

export const AwakeningSchema = AwakeningBaseSchema.and(HpAwarenessSchema)
  .and(PhysicalAttackAwarenessSchema)
  .and(MagicAttackAwarenessSchema);

export type Awakening = z.infer<typeof AwakeningSchema>;

export function getAwareness({
  awakening,
  turn,
  fixedKey,
  startKey,
  endKey,
}: {
  awakening: Awakening;
  turn: number;
  fixedKey:
    | 'hp_awareness'
    | 'physical_attack_awareness'
    | 'magic_attack_awareness';
  startKey:
    | 'start_hp_awareness'
    | 'start_physical_attack_awareness'
    | 'start_magic_attack_awareness';
  endKey:
    | 'end_hp_awareness'
    | 'end_physical_attack_awareness'
    | 'end_magic_attack_awareness';
}): number {
  const fixedAwareness = awakening[fixedKey];
  if (fixedAwareness !== undefined) {
    return fixedAwareness;
  }

  const startAwareness = awakening[startKey];
  const endAwareness = awakening[endKey];
  const turnToAwake = awakening.turn_to_awake;
  if (
    startAwareness === undefined ||
    endAwareness === undefined ||
    turnToAwake === undefined
  ) {
    throw new Error(`Invalid awareness configuration: ${fixedKey}`);
  }

  return turn > turnToAwake
    ? endAwareness
    : startAwareness +
        (endAwareness - startAwareness) * ((turn - 1) / turnToAwake);
}
