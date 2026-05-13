import z from 'zod';

const AwarenessValueSchema = z.number().min(0);

export const AwakeningSchema = z
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
  .strict()
  .superRefine((awakening, ctx) => {
    validateAwarenessSource({
      awakening,
      ctx,
      fixedKey: 'hp_awareness',
      startKey: 'start_hp_awareness',
      endKey: 'end_hp_awareness',
    });
    validateAwarenessSource({
      awakening,
      ctx,
      fixedKey: 'physical_attack_awareness',
      startKey: 'start_physical_attack_awareness',
      endKey: 'end_physical_attack_awareness',
    });
    validateAwarenessSource({
      awakening,
      ctx,
      fixedKey: 'magic_attack_awareness',
      startKey: 'start_magic_attack_awareness',
      endKey: 'end_magic_attack_awareness',
    });
  });

export type Awakening = z.infer<typeof AwakeningSchema>;

function validateAwarenessSource({
  awakening,
  ctx,
  fixedKey,
  startKey,
  endKey,
}: {
  awakening: {
    turn_to_awake?: number;
    [key: string]: number | undefined;
  };
  ctx: z.RefinementCtx;
  fixedKey: string;
  startKey: string;
  endKey: string;
}) {
  const hasFixed = awakening[fixedKey] !== undefined;
  const hasStart = awakening[startKey] !== undefined;
  const hasEnd = awakening[endKey] !== undefined;

  if (hasFixed && (hasStart || hasEnd)) {
    ctx.addIssue({
      code: 'custom',
      path: [fixedKey],
      message: `${fixedKey} cannot be combined with ${startKey}/${endKey}`,
    });
  }
  if (!hasFixed && !(hasStart && hasEnd && awakening.turn_to_awake)) {
    ctx.addIssue({
      code: 'custom',
      path: [fixedKey],
      message: `${fixedKey} or ${startKey}/${endKey}/turn_to_awake is required`,
    });
  }
}

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
