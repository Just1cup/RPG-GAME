import type { Spell } from "../domain/types";

export const magicList: Spell[] = [
  { name: "Bola de Fogo", damage: 20, staminaCost: 10 },
  { name: "Gelo Congelante", damage: 15, staminaCost: 8 },
  { name: "Relâmpago", damage: 25, staminaCost: 12 },
  { name: "Vento Cortante", damage: 10, staminaCost: 5 },
  { name: "Explosão Sombria", damage: 30, staminaCost: 15 },
];

export function pickRandomSpells(count: number): Spell[] {
  return [...magicList].sort(() => 0.5 - Math.random()).slice(0, count);
}

