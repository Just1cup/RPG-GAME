import { createStore } from "zustand/vanilla";
import { createEnemy } from "../domain/entities/EnemyFactory";
import type { Enemy, Player } from "../domain/types";

export interface GameState {
  player: Player;
  enemy: Enemy;
  controlsEnabled: boolean;
  restartPending: boolean;
}

interface GameActions {
  update: (recipe: (state: GameState) => GameState) => void;
  reset: () => void;
  setControlsEnabled: (enabled: boolean) => void;
  setRestartPending: (pending: boolean) => void;
}

export type GameStore = GameState & GameActions;

export function createInitialPlayer(): Player {
  return {
    hp: 100,
    stamina: 100,
    level: 1,
    maxHp: 100,
    maxStamina: 100,
    spells: [],
  };
}

function createInitialState(): GameState {
  const player = createInitialPlayer();

  return {
    player,
    enemy: createEnemy(player.level),
    controlsEnabled: true,
    restartPending: false,
  };
}

export const gameStore = createStore<GameStore>((set) => ({
  ...createInitialState(),

  update: (recipe) => set((state) => recipe(state)),
  reset: () => set(createInitialState()),
  setControlsEnabled: (enabled) => set({ controlsEnabled: enabled }),
  setRestartPending: (pending) => set({ restartPending: pending }),
}));
