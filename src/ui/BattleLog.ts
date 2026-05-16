import { bus, EVENTS } from "../core/EventBus";

export function mountBattleLog(logElement: HTMLElement): void {
  bus.on(EVENTS.LOG_ENTRY, ({ text }) => {
    const entry = document.createElement("p");
    entry.textContent = text;
    logElement.appendChild(entry);
    logElement.scrollTop = logElement.scrollHeight;
  });
}

export function log(text: string): void {
  bus.emit(EVENTS.LOG_ENTRY, { text });
}

