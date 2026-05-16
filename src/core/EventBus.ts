type Listener<T> = (payload: T) => void;

export const EVENTS = {
  BATTLE_STATE_CHANGED: "battle:state_changed",
  LOG_ENTRY: "ui:log_entry",
  LEVEL_REWARD_REQUESTED: "player:level_reward_requested",
} as const;

export interface GameEvents {
  [EVENTS.BATTLE_STATE_CHANGED]: { state: string };
  [EVENTS.LOG_ENTRY]: { text: string };
  [EVENTS.LEVEL_REWARD_REQUESTED]: { level: number };
}

export class EventBus<Events extends object> {
  private listeners = new Map<keyof Events, Set<Listener<Events[keyof Events]>>>();

  on<EventName extends keyof Events>(
    event: EventName,
    cb: Listener<Events[EventName]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(cb as Listener<Events[keyof Events]>);
    return () => this.listeners.get(event)?.delete(cb as Listener<Events[keyof Events]>);
  }

  emit<EventName extends keyof Events>(event: EventName, payload: Events[EventName]): void {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }
}

export const bus = new EventBus<GameEvents>();
