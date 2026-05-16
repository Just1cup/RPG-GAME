export class StateMachine<State extends string> {
  constructor(
    private state: State,
    private readonly transitions: Record<State, State[]>,
    private readonly onTransition?: (state: State) => void,
  ) {}

  current(): State {
    return this.state;
  }

  transition(next: State): void {
    const allowed = this.transitions[this.state];

    if (!allowed.includes(next)) {
      throw new Error(`Invalid transition: ${this.state} -> ${next}`);
    }

    this.state = next;
    this.onTransition?.(next);
  }
}

