import type { GameStore } from "../store/gameStore";
import { gameStore } from "../store/gameStore";

interface HudElements {
  status: HTMLElement;
  playerHealthBar: HTMLElement;
  playerStaminaBar: HTMLElement;
  buttons: NodeListOf<HTMLButtonElement>;
}

export function mountHUD(elements: HudElements): void {
  const render = (state: GameStore) => {
    const { player, enemy } = state;

    elements.status.innerHTML = `
      <div>
        <p class="text-lg font-semibold">Jogador</p>
        <p>Vida: ${player.hp}/${player.maxHp} | Estamina: ${player.stamina}/${player.maxStamina} | Nível: ${player.level}</p>
      </div>
      <div class="mt-2">
        <p class="text-lg font-semibold">Inimigo</p>
        <p>Vida: ${enemy.hp}/${enemy.maxHp} | Nível: ${enemy.level} | Estamina: ${enemy.stamina}</p>
      </div>
      ${state.restartPending ? '<p id="restart-message" class="text-red-400 font-bold mt-2">Você morreu! Aperte R para reiniciar.</p>' : ""}
    `;

    updateBar(elements.playerHealthBar, player.hp, player.maxHp);
    updateBar(elements.playerStaminaBar, player.stamina, player.maxStamina);
    elements.buttons.forEach((button) => {
      button.disabled = !state.controlsEnabled;
    });
  };

  render(gameStore.getState());
  gameStore.subscribe(render);
}

function updateBar(el: HTMLElement, current: number, max: number): void {
  const percent = max > 0 ? (current / max) * 100 : 0;
  el.style.width = `${percent}%`;
  el.textContent = `${current} / ${max}`;
  el.style.color = "white";
  el.style.textAlign = "center";
  el.style.fontWeight = "bold";
}
