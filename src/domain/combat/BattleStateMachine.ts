import { bus, EVENTS } from "../../core/EventBus";
import { StateMachine } from "../../core/StateMachine";

export type BattleState =
  | "IDLE"
  | "PLAYER_TURN"
  | "RESOLVING"
  | "ENEMY_TURN"
  | "VICTORY"
  | "DEFEAT";

const transitions: Record<BattleState, BattleState[]> = {
  IDLE: ["PLAYER_TURN"],
  PLAYER_TURN: ["RESOLVING"],
  RESOLVING: ["ENEMY_TURN", "VICTORY", "DEFEAT", "PLAYER_TURN"],
  ENEMY_TURN: ["PLAYER_TURN", "DEFEAT", "VICTORY"],
  VICTORY: ["PLAYER_TURN"],
  DEFEAT: ["IDLE"],
};

export class BattleStateMachine {
  private readonly machine = new StateMachine<BattleState>(
    "IDLE",
    transitions,
    (state) => bus.emit(EVENTS.BATTLE_STATE_CHANGED, { state }),
  );

  current(): BattleState {
    return this.machine.current();
  }

  transition(next: BattleState): void {
    this.machine.transition(next);
  }
}

