export interface Spell {
  name: string;
  damage: number;
  staminaCost: number;
}

export interface Character {
  hp: number;
  stamina: number;
  level: number;
  maxHp: number;
  maxStamina: number;
  spells: Spell[];
}

export type Player = Character;

export type Enemy = Character;

