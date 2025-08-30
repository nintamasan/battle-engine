import { CharacterSchema } from '../../src/character';
import { readFileSync } from 'fs';
import { parse } from 'yaml';

function loadFixture(name: string) {
  const fixturePath = `tests/fixtures/${name}.yml`;
  try {
    return parse(readFileSync(fixturePath).toString());
  } catch (error) {
    throw new Error(`Failed to load fixture from ${fixturePath}: ${error}`);
  }
}

function loadCharacterFixture(name: string) {
  return CharacterSchema.parse(loadFixture(name));
}

export function loadFireHeroineFixture() {
  return loadCharacterFixture('fire_heroine');
}

export function loadWaterHeroineFixture() {
  return loadCharacterFixture('water_heroine');
}
