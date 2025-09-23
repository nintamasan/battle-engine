/*
 * Random: defender と attacker が中立なときに使う
 * Attackable: 守備が攻撃の50%以上ないと攻撃が必中。どんな強い守備でも低確率で突破可能。
 * LessAttackable: 守備が攻撃の20%以上ないと攻撃が必中。守備が攻撃の200%以上なら完全防御。互角なら 60%くらい
 * LessDiffensable: 互角なら20%くらい
 * Diffensable: 守備が攻撃の100%以上なら完全防御。
 */

/*
 * attacker と defender が互角なときに使う
 */
export function getRandomResult({
  attacker,
  defender,
  leftRandom = Math.random(),
  rightRandom = Math.random(),
  message,
  logger,
}: {
  attacker: number;
  defender: number;
  leftRandom?: number;
  rightRandom?: number;
  message?: string;
  logger?: Console;
}): boolean {
  const left = defender;
  const right = attacker;

  if (logger) {
    logger.error(
      `${message ?? `[${message}]`}expected: defender: ${left} vs attacker: ${right}: ${1 - right / left}`
    );
    logger.error(`actual: ${left * leftRandom} vs ${right * rightRandom}`);
  }

  return left * leftRandom < right * rightRandom;
}

/*
 * attacker が有利な場合に使う
 * 守備が最低半分ないと防げない
 */
export function getAttackableRandomResult({
  attacker,
  defender,
  random = Math.random(),
  logger,
}: {
  attacker: number;
  defender: number;
  random?: number;
  logger?: Console;
}): boolean {
  const numerator = defender - attacker * 0.5; // defender - attacker は強すぎるので調整
  // 要は差を取るので、その差を正規化するために attacker と defender の合計を使っているだけ
  const denominator =
    (attacker + defender) *
    // defender のほうが強いとき小さくなる → 大きい threshold が求められる → 小さい random が求められる
    Math.min(1, 2 * sigmoid(2, (attacker - defender) / (attacker + defender)));
  const threshold = 1 - random; // defender - attacker なので反対にする

  if (logger) {
    logger.error(
      `expected: defender:${defender} vs attacker: ${attacker}: ${1 - numerator / denominator}`
    );
    logger.error(`actual: ${numerator} vs ${denominator * (1 - random)}`);
  }

  return numerator / denominator < threshold;
}

/*
 * attacker がちょっと有利な場合に使う
 */
export function getLessAttackableRandomResult({
  attacker,
  defender,
  random = Math.random(),
  logger,
}: {
  attacker: number;
  defender: number;
  random?: number;
  logger?: Console;
}): boolean {
  const numerator = defender - attacker * 0.2;
  const denominator =
    (attacker + defender) *
    // defender のほうが強いとき小さくなる → 大きい threshold が求められる → 小さい random が求められる
    Math.min(
      1,
      2 * sigmoid(2.5, (attacker - defender) / (attacker + defender))
    );
  const threshold = 1 - random; // defender - attacker なので反対にする

  if (logger) {
    logger.error(
      `expected: defender:${defender} vs attacker: ${attacker}: ${1 - numerator / denominator}`
    );
    logger.error(`actual: ${numerator} vs ${denominator * (1 - random)}`);
  }

  return numerator / denominator < threshold;
}

/*
 * defense がちょっと有利な場合に使う
 */
export function getLessDefensableRandomResult({
  attacker,
  defender,
  random = Math.random(),
  logger,
}: {
  attacker: number;
  defender: number;
  random?: number;
  logger?: Console;
}): boolean {
  const numerator = attacker - defender * 0.66;
  const denominator =
    (attacker + defender) *
    // attacker のほうが強いとき小さくなる → 小さい threshold が求められる → 大きい random が求められる
    Math.max(0.5, sigmoid(6, (attacker - defender) / (attacker + defender)));
  const threshold = random;

  if (logger) {
    logger.error(
      `expected: defender:${defender} vs attacker: ${attacker}: ${numerator / denominator}`
    );
    logger.error(`actual: ${numerator} vs ${denominator * random}`);
  }

  return numerator / denominator > threshold;
}

/*
 * defender が有利な場合に使う (defender > attacker だと 100%防衛)
 */
export function getDefensableRandomResult({
  attacker,
  defender,
  random = Math.random(),
  logger,
}: {
  attacker: number;
  defender: number;
  random?: number;
  logger?: Console;
}): boolean {
  const numerator = attacker - defender;
  const denominator = attacker + defender;
  const threshold = random;

  if (logger) {
    logger.error(
      `expected:defender:${defender} vs attacker: ${attacker}: ${numerator / denominator}`
    );
    logger.error(`actual: ${numerator} vs ${denominator * random}`);
  }

  return numerator / denominator > threshold;
}

function sigmoid(a: number, x: number) {
  return 1 / (1 + Math.exp(-a * x));
}
