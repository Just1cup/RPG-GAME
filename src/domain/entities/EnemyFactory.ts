import { pickRandomSpells } from "../../data/spells";
import type { Enemy } from "../types";

export function createEnemy(playerLevel: number): Enemy {
  const level = playerLevel + Math.floor(Math.random() * 6);
  const hp = 30 + level * (10 + Math.floor(Math.random() * 21));

  return {
    hp,
    maxHp: hp,
    stamina: 50,
    maxStamina: 50,
    level,
    spells: pickRandomSpells(2),
  };
}

