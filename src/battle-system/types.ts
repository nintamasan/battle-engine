import { CharacterState } from '@/battle-system/state';
import { SkillEffectType } from '@/battle-system/state/skillEffect';
import { Skill } from '@/battle-system/skill';

// バトル結果
export type BattleResult = 'victory' | 'lose' | 'mutual-strike' | 'draw';

// ターン情報
export interface TurnInfo {
  heroState: CharacterState;
  enemyState: CharacterState;
  damageDealt: number | null;
  damageReceived: number | null;
  executedSkills: ExecutedSkill[]; // このターンで実行されたスキル
  skillEffectsApplied: CalculatedSkillEffect[]; // このターンで適用されたスキル効果
  // 特殊処理
  unprotectedStrike: boolean;
}

// 成功したスキル
export type ExecutedSkill = Skill & {
  // target: string;
};

// 適用されたスキル効果の記録
export interface CalculatedSkillEffect {
  type: SkillEffectType;
  // target: string;
  effect: Partial<CharacterState>; // 適用された効果
}

// バトル設定
export interface BattleConfig {
  maxTurns: number;
  baseDamageRatio: number; // 基本ダメージの比率（デフォルト1/5）
  // tmp
  logger?: typeof console;
}
