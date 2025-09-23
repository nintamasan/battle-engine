import { BattleConfig } from '../../src/battle-system/types.js';
import { commonSkillEffectsFixtures } from './skill.js';

export const defaultEngineConfig: Partial<BattleConfig> = {
  skillEffects: commonSkillEffectsFixtures,
  // logger: console,
};
