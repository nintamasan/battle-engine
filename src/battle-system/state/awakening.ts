import z from 'zod';

export const AwakeningSchema = z.union([
  z.object({
    ratio: z.number().min(1),
  }),
  z.object({
    startRatio: z.number().min(0),
    endRatio: z.number().min(0),
    turnToAwake: z.number().int().min(1),
  }),
]);

export type Awakening =
  | {
      // 変身ヒロイン: 素の人間の能力から何倍も増強するので1より多いい値になる
      ratio: number;
    }
  | {
      // 敵: 封印されていたので、徐々に覚醒していく
      startRatio: number;
      endRatio: number;
      turnToAwake: number; // 覚醒するまでのターン数
    };

export function getAwakeningRatio({
  awakening,
  turn,
}: {
  awakening: Awakening;
  turn: number;
}): number {
  if ('ratio' in awakening) {
    return awakening.ratio;
  } else {
    return turn > awakening.turnToAwake
      ? awakening.endRatio
      : awakening.startRatio +
          (awakening.endRatio - awakening.startRatio) *
            ((turn - 1) / awakening.turnToAwake);
  }
}
