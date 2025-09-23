import { BattleConfig } from 'src/index.js';
import { commonSkillEffectsFixtures } from './skill.js';

export const defaultEngineConfig: Partial<BattleConfig> = {
  skillEffects: commonSkillEffectsFixtures,
  // logger: console,
};
