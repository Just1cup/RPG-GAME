"use strict";
function playBackgroundMusic() {
    const audio = new Audio("loop.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch((err) => {
        console.warn("Não foi possível tocar a música automaticamente:", err);
    });
    return audio;
}
const bgMusic = playBackgroundMusic();
function resetGame() {
    player.hp = player.maxHp = 100;
    player.stamina = player.maxStamina = 100;
    player.level = 1;
    player.spells = [];
    enemy = createEnemy();
    updateStatus();
    log("♻️ Jogo reiniciado. Boa sorte!");
    enableButtons();
}
function showRestartMessage() {
    const statusDiv = document.getElementById("status");
    const message = document.createElement("p");
    message.id = "restart-message";
    message.textContent = "☠️ Você morreu! Aperte R para reiniciar.";
    message.style.color = "red";
    message.style.fontWeight = "bold";
    statusDiv.appendChild(message);
}
// Remover mensagem de reinício da tela
function removeRestartMessage() {
    const message = document.getElementById("restart-message");
    if (message)
        message.remove();
}
const magicList = [
    { name: "Bola de Fogo", damage: 20, staminaCost: 10 },
    { name: "Gelo Congelante", damage: 15, staminaCost: 8 },
    { name: "Relâmpago", damage: 25, staminaCost: 12 },
    { name: "Vento Cortante", damage: 10, staminaCost: 5 },
    { name: "Explosão Sombria", damage: 30, staminaCost: 15 },
];
let player = {
    hp: 100,
    stamina: 100,
    level: 1,
    maxHp: 100,
    maxStamina: 100,
    spells: [],
};
let enemy = createEnemy();
function createEnemy() {
    const level = player.level + Math.floor(Math.random() * 6); // 0 até 5
    const hp = 30 + level * (10 + Math.floor(Math.random() * 21)); // 0 até 20
    const stamina = 50;
    const spells = [...magicList].sort(() => 0.5 - Math.random()).slice(0, 2);
    return { hp, maxHp: hp, stamina, level, spells };
}
function updateStatus() {
    const statusDiv = document.getElementById("status");
    statusDiv.innerHTML = `
    <div>
      <p class="text-lg font-semibold">👤 Jogador</p>
      <p>Vida: ${player.hp}/${player.maxHp} | Estamina: ${player.stamina}/${player.maxStamina} | Nível: ${player.level}</p>
    </div>
    <div class="mt-2">
      <p class="text-lg font-semibold">👾 Inimigo</p>
      <p>Vida: ${enemy.hp}/${enemy.maxHp} | Nível: ${enemy.level} | Estamina: ${enemy.stamina}</p>
    </div>
  `;
    const hpBar = document.getElementById("player-health-bar");
    const staminaBar = document.getElementById("player-stamina-bar");
    hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    hpBar.textContent = `${player.hp} / ${player.maxHp}`;
    hpBar.style.color = "white";
    hpBar.style.textAlign = "center";
    hpBar.style.fontWeight = "bold";
    staminaBar.style.width = `${(player.stamina / player.maxStamina) * 100}%`;
    staminaBar.textContent = `${player.stamina} / ${player.maxStamina}`;
    staminaBar.style.color = "white";
    staminaBar.style.textAlign = "center";
    staminaBar.style.fontWeight = "bold";
}
function log(text) {
    const logDiv = document.getElementById("log");
    const entry = document.createElement("p");
    entry.textContent = text;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
}
function nextEnemy() {
    enemy = createEnemy();
    player.level++;
    const missingHp = player.maxHp - player.hp;
    const recoverHp = Math.floor(missingHp * 0.33);
    player.hp = Math.min(player.hp + recoverHp, player.maxHp);
    if (player.level % 10 === 0) {
        const choice = prompt(`Você chegou no nível ${player.level}! Deseja receber +25 de vida (digite 1) ou rolar para ganhar entre 25 e 50 (digite 2)?`);
        if (choice === "2") {
            const roll = 25 + Math.floor(Math.random() * 26);
            player.maxHp += roll;
            player.hp += roll;
            log(`🎉 Você rolou e ganhou +${roll} de vida máxima!`);
        }
        else {
            player.maxHp += 25;
            player.hp += 25;
            log(`🎉 Você ganhou +25 de vida máxima!`);
        }
        if (player.hp > player.maxHp)
            player.hp = player.maxHp;
    }
    log(`⚔️ Um novo inimigo apareceu! Nível ${enemy.level}, Vida ${enemy.hp}. Você subiu para o nível ${player.level} e recuperou ${recoverHp} de vida.`);
    updateStatus();
}
window.playerAttack = function playerAttack() {
    let damage = 10 + player.level * 5;
    if (Math.random() < 0.023) {
        damage = player.level * 15;
        log("💥 Ataque crítico!");
    }
    enemy.hp -= damage;
    log(`🗡️ Você causou ${damage} de dano com a espada.`);
    endTurn();
};
window.playerMagic = function playerMagic() {
    if (player.spells.length === 0) {
        player.spells = [...magicList].sort(() => 0.5 - Math.random()).slice(0, 4);
        log("🔮 Suas magias disponíveis: " + player.spells.map((m) => m.name).join(", "));
    }
    const spell = player.spells[Math.floor(Math.random() * player.spells.length)];
    if (player.stamina < spell.staminaCost) {
        log(`⚠️ Você não tem estamina suficiente para usar ${spell.name}.`);
        return;
    }
    player.stamina -= spell.staminaCost;
    enemy.hp -= spell.damage;
    log(`✨ Você usou ${spell.name} e causou ${spell.damage} de dano.`);
    endTurn();
};
window.playerRest = function playerRest() {
    const minRecover = Math.floor(player.maxHp * 0.1);
    const maxRecover = Math.floor(player.maxHp * 0.25);
    const recoveredHP = minRecover + Math.floor(Math.random() * (maxRecover - minRecover + 1));
    player.hp = Math.min(player.hp + recoveredHP, player.maxHp);
    const recoveredStamina = Math.floor(player.maxStamina * 0.06);
    player.stamina = Math.min(player.stamina + recoveredStamina, player.maxStamina);
    log(`🛌 Você descansou. Recuperou ${recoveredHP} de vida e ${recoveredStamina} de estamina.`);
    endTurn();
};
window.playerFlee = function playerFlee() {
    if (Math.random() < 0.5) {
        log("🏃 Você escapou com sucesso!");
        nextEnemy();
    }
    else {
        log("🚫 Tentativa de fuga falhou!");
        enemyTurn();
    }
    updateStatus();
};
function enemyTurn() {
    if (enemy.hp <= 0)
        return nextEnemy();
    const action = Math.random();
    if (action < 0.4 && enemy.spells.length > 0 && enemy.stamina > 0) {
        const spell = enemy.spells[Math.floor(Math.random() * enemy.spells.length)];
        if (enemy.stamina >= spell.staminaCost) {
            enemy.stamina -= spell.staminaCost;
            player.hp -= spell.damage;
            log(`🔥 O inimigo usou ${spell.name} e causou ${spell.damage} de dano.`);
        }
        else {
            basicEnemyAttack();
        }
    }
    else {
        basicEnemyAttack();
    }
    if (player.hp <= 0) {
        player.hp = 0;
        updateStatus();
        log("☠️ Você foi derrotado.");
        disableButtons();
        showRestartMessage();
        return;
    }
    updateStatus();
}
function basicEnemyAttack() {
    const damage = 10 + Math.floor(enemy.level * 4);
    player.hp -= damage;
    log(`💀 O inimigo atacou com força e causou ${damage} de dano.`);
}
function endTurn() {
    if (enemy.hp <= 0) {
        log("✅ Inimigo derrotado!");
        nextEnemy();
    }
    else {
        enemyTurn();
    }
}
function disableButtons() {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((b) => (b.disabled = true));
}
function enableButtons() {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => (btn.disabled = false));
}
updateStatus();
log("⚔️ Um inimigo apareceu!");
window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r") {
        const buttons = document.querySelectorAll(".btn");
        if (Array.from(buttons).every((b) => b.disabled)) {
            removeRestartMessage();
            resetGame();
        }
    }
});
