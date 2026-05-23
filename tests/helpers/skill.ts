import type { SkillEffectMap } from 'src/battle-system/state/skillEffect';

export const commonSkillEffectsFixtures: SkillEffectMap = {
  poison: {
    type: 'active',
    name: '毒のダメージ',
    description: '相手に体力の10%を毎ターン開始時にダメージとして与える',
    apply: ({ characterState }) => {
      const poisonDamage = Math.floor(characterState.maxHp * 0.1);
      return {
        totalDamage: characterState.totalDamage + poisonDamage,
      };
    },
  },

  'intelligence-down': {
    type: 'active',
    name: '判断力ダウン',
    description: '判断力が半減する',
    apply: ({ characterState }) => {
      return {
        intelligence: Math.floor(characterState.intelligence * 0.5),
      };
    },
  },

  heal: {
    type: 'passive',
    name: '体力回復',
    description: '2ターンに1回体力を100%回復する',
    apply: () => {
      return {
        totalDamage: 0, // 体力を100%回復
      };
    },
  },

  'finishing-strike': {
    type: 'attack',
    name: '追撃',
    description: '相手が倒れている場合でも無防備な相手へ攻撃する',
    apply: ({ execution, attackerState, defenderState }) => {
      const attackerHp = attackerState.maxHp - attackerState.totalDamage;
      const defenderHp = defenderState.maxHp - defenderState.totalDamage;
      if (execution.canExecute || attackerHp <= 0 || defenderHp > 0) {
        return undefined;
      }

      return {
        ...execution,
        canExecute: true,
        modifiers: [...execution.modifiers, { type: 'unprotected' }],
      };
    },
  },

  'special-move': {
    type: 'attack',
    name: '必殺技',
    description: '通常攻撃ダメージを2倍にする',
    apply: ({ execution }) => {
      if (!execution.canExecute) return undefined;

      return {
        ...execution,
        modifiers: [...execution.modifiers, { type: 'damage-ratio', value: 2 }],
      };
    },
  },
};
