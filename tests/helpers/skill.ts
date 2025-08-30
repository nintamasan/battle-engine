import { addSkillEffect } from '@/battle-system/state/skillEffect';

export function addCommonSkillEffects() {
  addSkillEffect('poison', {
    type: 'active',
    name: '毒のダメージ',
    description: '相手に体力の10%を毎ターン開始時にダメージとして与える',
    apply: ({ characterState }) => {
      const poisonDamage = Math.floor(characterState.maxHp * 0.1);
      return {
        totalDamage: characterState.totalDamage + poisonDamage,
      };
    },
  });

  addSkillEffect('intelligence-down', {
    type: 'active',
    name: '判断力ダウン',
    description: '判断力が半減する',
    apply: ({ characterState }) => {
      return {
        intelligence: Math.floor(characterState.intelligence * 0.5),
      };
    },
  });

  addSkillEffect('heal', {
    type: 'passive',
    name: '体力回復',
    description: '2ターンに1回体力を100%回復する',
    apply: ({ characterState }) => {
      return {
        totalDamage: 0, // 体力を100%回復
      };
    },
  });
}
