import { bus, EVENTS } from "./core/EventBus";
import { pickRandomSpells } from "./data/spells";
import { BattleStateMachine } from "./domain/combat/BattleStateMachine";
import { createEnemy } from "./domain/entities/EnemyFactory";
import { audio } from "./services/AudioManager";
import { gameStore, type GameState } from "./store/gameStore";
import { log, mountBattleLog } from "./ui/BattleLog";
import { mountHUD } from "./ui/HUD";
import { showChoiceModal } from "./ui/Modal";

const battleState = new BattleStateMachine();

function updateGame(recipe: (state: GameState) => GameState): void {
  gameStore.getState().update(recipe);
}

async function nextEnemy(): Promise<void> {
  const state = gameStore.getState();
  const previousMaxHp = state.player.maxHp;
  const missingHp = previousMaxHp - state.player.hp;
  const recoverHp = Math.floor(missingHp * 0.33);
  const nextLevel = state.player.level + 1;

  let bonusHp = 0;
  let rewardMessage = "";

  if (nextLevel % 10 === 0) {
    const choice = await showChoiceModal(`Você chegou no nível ${nextLevel}!`, [
      { label: "Receber +25 de vida", value: "fixed" },
      { label: "Rolar entre +25 e +50", value: "roll" },
    ]);

    if (choice === "roll") {
      bonusHp = 25 + Math.floor(Math.random() * 26);
      rewardMessage = `Você rolou e ganhou +${bonusHp} de vida máxima!`;
    } else {
      bonusHp = 25;
      rewardMessage = "Você ganhou +25 de vida máxima!";
    }
  }

  updateGame((current) => {
    const maxHp = current.player.maxHp + bonusHp;
    const hpAfterRecovery = Math.min(current.player.hp + recoverHp + bonusHp, maxHp);
    const player = {
      ...current.player,
      hp: hpAfterRecovery,
      maxHp,
      level: nextLevel,
    };

    return {
      ...current,
      player,
      enemy: createEnemy(player.level),
    };
  });

  const nextState = gameStore.getState();

  if (rewardMessage) {
    log(`🎉 ${rewardMessage}`);
  }

  log(
    `⚔️ Um novo inimigo apareceu! Nível ${nextState.enemy.level}, Vida ${nextState.enemy.hp}. Você subiu para o nível ${nextState.player.level} e recuperou ${recoverHp} de vida.`,
  );
  battleState.transition("PLAYER_TURN");
}

async function playerAttack(): Promise<void> {
  if (!canAct()) return;
  battleState.transition("RESOLVING");

  const state = gameStore.getState();
  let damage = 10 + state.player.level * 5;

  if (Math.random() < 0.023) {
    damage = state.player.level * 15;
    log("💥 Ataque crítico!");
  }

  updateGame((current) => ({
    ...current,
    enemy: { ...current.enemy, hp: current.enemy.hp - damage },
  }));

  log(`🗡️ Você causou ${damage} de dano com a espada.`);
  await endTurn();
}

async function playerMagic(): Promise<void> {
  if (!canAct()) return;
  battleState.transition("RESOLVING");

  let state = gameStore.getState();

  if (state.player.spells.length === 0) {
    const spells = pickRandomSpells(4);
    updateGame((current) => ({
      ...current,
      player: { ...current.player, spells },
    }));
    log(`🔮 Suas magias disponíveis: ${spells.map((spell) => spell.name).join(", ")}`);
    state = gameStore.getState();
  }

  const spell = state.player.spells[Math.floor(Math.random() * state.player.spells.length)];

  if (!spell) {
    battleState.transition("PLAYER_TURN");
    return;
  }

  if (state.player.stamina < spell.staminaCost) {
    log(`⚠️ Você não tem estamina suficiente para usar ${spell.name}.`);
    battleState.transition("PLAYER_TURN");
    return;
  }

  updateGame((current) => ({
    ...current,
    player: { ...current.player, stamina: current.player.stamina - spell.staminaCost },
    enemy: { ...current.enemy, hp: current.enemy.hp - spell.damage },
  }));

  log(`✨ Você usou ${spell.name} e causou ${spell.damage} de dano.`);
  await endTurn();
}

async function playerRest(): Promise<void> {
  if (!canAct()) return;
  battleState.transition("RESOLVING");

  const { player } = gameStore.getState();
  const minRecover = Math.floor(player.maxHp * 0.1);
  const maxRecover = Math.floor(player.maxHp * 0.25);
  const recoveredHp = minRecover + Math.floor(Math.random() * (maxRecover - minRecover + 1));
  const recoveredStamina = Math.floor(player.maxStamina * 0.06);

  updateGame((current) => ({
    ...current,
    player: {
      ...current.player,
      hp: Math.min(current.player.hp + recoveredHp, current.player.maxHp),
      stamina: Math.min(current.player.stamina + recoveredStamina, current.player.maxStamina),
    },
  }));

  log(`🛌 Você descansou. Recuperou ${recoveredHp} de vida e ${recoveredStamina} de estamina.`);
  await endTurn();
}

async function playerFlee(): Promise<void> {
  if (!canAct()) return;
  battleState.transition("RESOLVING");

  if (Math.random() < 0.5) {
    log("🏃 Você escapou com sucesso!");
    await nextEnemy();
    return;
  }

  log("🚫 Tentativa de fuga falhou!");
  await enemyTurn();
}

async function enemyTurn(): Promise<void> {
  const state = gameStore.getState();

  if (state.enemy.hp <= 0) {
    await nextEnemy();
    return;
  }

  battleState.transition("ENEMY_TURN");

  if (Math.random() < 0.4 && state.enemy.spells.length > 0 && state.enemy.stamina > 0) {
    const spell = state.enemy.spells[Math.floor(Math.random() * state.enemy.spells.length)];

    if (spell && state.enemy.stamina >= spell.staminaCost) {
      updateGame((current) => ({
        ...current,
        enemy: { ...current.enemy, stamina: current.enemy.stamina - spell.staminaCost },
        player: { ...current.player, hp: current.player.hp - spell.damage },
      }));
      log(`🔥 O inimigo usou ${spell.name} e causou ${spell.damage} de dano.`);
    } else {
      basicEnemyAttack();
    }
  } else {
    basicEnemyAttack();
  }

  const latest = gameStore.getState();

  if (latest.player.hp <= 0) {
    updateGame((current) => ({
      ...current,
      player: { ...current.player, hp: 0 },
      controlsEnabled: false,
      restartPending: true,
    }));
    log("☠️ Voce foi derrotado.");
    battleState.transition("DEFEAT");
    return;
  }

  battleState.transition("PLAYER_TURN");
}

function basicEnemyAttack(): void {
  const damage = 10 + Math.floor(gameStore.getState().enemy.level * 4);

  updateGame((current) => ({
    ...current,
    player: { ...current.player, hp: current.player.hp - damage },
  }));

  log(`💀 O inimigo atacou com força e causou ${damage} de dano.`);
}

async function endTurn(): Promise<void> {
  if (gameStore.getState().enemy.hp <= 0) {
    log("✅ Inimigo derrotado!");
    battleState.transition("VICTORY");
    await nextEnemy();
    return;
  }

  await enemyTurn();
}

function canAct(): boolean {
  return gameStore.getState().controlsEnabled && battleState.current() === "PLAYER_TURN";
}

function restartIfDefeated(event: KeyboardEvent): void {
  if (event.key.toLowerCase() !== "r" || !gameStore.getState().restartPending) {
    return;
  }

  battleState.transition("IDLE");
  gameStore.getState().reset();
  log("♻️ Jogo reiniciado. Boa sorte!");
  battleState.transition("PLAYER_TURN");
}

function bindActions(): void {
  document.querySelector<HTMLButtonElement>("[data-action='attack']")?.addEventListener("click", () => void playerAttack());
  document.querySelector<HTMLButtonElement>("[data-action='magic']")?.addEventListener("click", () => void playerMagic());
  document.querySelector<HTMLButtonElement>("[data-action='rest']")?.addEventListener("click", () => void playerRest());
  document.querySelector<HTMLButtonElement>("[data-action='flee']")?.addEventListener("click", () => void playerFlee());
  window.addEventListener("keydown", restartIfDefeated);
}

function bindBattleStateToControls(): void {
  bus.on(EVENTS.BATTLE_STATE_CHANGED, ({ state }) => {
    gameStore.getState().setControlsEnabled(state === "PLAYER_TURN");
  });
}

function bootstrap(): void {
  const status = document.querySelector<HTMLElement>("#status");
  const logElement = document.querySelector<HTMLElement>("#log");
  const playerHealthBar = document.querySelector<HTMLElement>("#player-health-bar");
  const playerStaminaBar = document.querySelector<HTMLElement>("#player-stamina-bar");
  const buttons = document.querySelectorAll<HTMLButtonElement>(".btn");

  if (!status || !logElement || !playerHealthBar || !playerStaminaBar) {
    throw new Error("Game UI is missing required elements.");
  }

  mountHUD({ status, playerHealthBar, playerStaminaBar, buttons });
  mountBattleLog(logElement);
  bindBattleStateToControls();
  bindActions();
  audio.playBackgroundMusic();
  log("⚔️ Um inimigo apareceu!");
  battleState.transition("PLAYER_TURN");
}

bootstrap();
