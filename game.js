var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function playBackgroundMusic() {
    var audio = new Audio("assets/loop.mp3"); // caminho relativo ao index.html
    audio.loop = true; // ativa o loop infinito
    audio.volume = 0.3; // volume entre 0.0 e 1.0
    audio.play().catch(function (err) {
        console.warn("Não foi possível tocar a música automaticamente:", err);
        // Pode ser necessário tocar após interação do usuário (clique)
    });
    return audio;
}
// Chame essa função quando quiser iniciar a música (por exemplo, no começo do jogo)
var bgMusic = playBackgroundMusic();
// Função para desabilitar os botões (quando o player morrer)
// Função para habilitar botões (quando reiniciar)
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
    var statusDiv = document.getElementById("status");
    var message = document.createElement("p");
    message.id = "restart-message";
    message.textContent = "☠️ Você morreu! Aperte R para reiniciar.";
    message.style.color = "red";
    message.style.fontWeight = "bold";
    statusDiv.appendChild(message);
}
// Remover mensagem de reinício da tela
function removeRestartMessage() {
    var message = document.getElementById("restart-message");
    if (message)
        message.remove();
}
var magicList = [
    { name: "Bola de Fogo", damage: 20, staminaCost: 10 },
    { name: "Gelo Congelante", damage: 15, staminaCost: 8 },
    { name: "Relâmpago", damage: 25, staminaCost: 12 },
    { name: "Vento Cortante", damage: 10, staminaCost: 5 },
    { name: "Explosão Sombria", damage: 30, staminaCost: 15 },
];
var player = {
    hp: 100,
    stamina: 100,
    level: 1,
    maxHp: 100,
    maxStamina: 100,
    spells: [],
};
var enemy = createEnemy();
function createEnemy() {
    var level = player.level + Math.floor(Math.random() * 6); // até +5 níveis
    var hp = 30 + level * (10 + Math.floor(Math.random() * 21)); // HP entre 30 a 130+ por nível
    var stamina = 50;
    var spells = __spreadArray([], magicList, true).sort(function () { return 0.5 - Math.random(); }).slice(0, 2);
    return { hp: hp, maxHp: hp, stamina: stamina, level: level, spells: spells };
}
function updateStatus() {
    var statusDiv = document.getElementById("status");
    statusDiv.innerHTML = "\n    <div>\n      <p class=\"text-lg font-semibold\">\uD83D\uDC64 Jogador</p>\n      <p>Vida: ".concat(player.hp, "/").concat(player.maxHp, " | Estamina: ").concat(player.stamina, "/").concat(player.maxStamina, " | N\u00EDvel: ").concat(player.level, "</p>\n    </div>\n    <div class=\"mt-2\">\n      <p class=\"text-lg font-semibold\">\uD83D\uDC7E Inimigo</p>\n      <p>Vida: ").concat(enemy.hp, "/").concat(enemy.maxHp, " | N\u00EDvel: ").concat(enemy.level, " | Estamina: ").concat(enemy.stamina, "</p>\n    </div>\n  ");
    var hpBar = document.getElementById("player-health-bar");
    var staminaBar = document.getElementById("player-stamina-bar");
    hpBar.style.width = "".concat((player.hp / player.maxHp) * 100, "%");
    hpBar.textContent = "".concat(player.hp, " / ").concat(player.maxHp);
    hpBar.style.color = "white";
    hpBar.style.textAlign = "center";
    hpBar.style.fontWeight = "bold";
    staminaBar.style.width = "".concat((player.stamina / player.maxStamina) * 100, "%");
    staminaBar.textContent = "".concat(player.stamina, " / ").concat(player.maxStamina);
    staminaBar.style.color = "white";
    staminaBar.style.textAlign = "center";
    staminaBar.style.fontWeight = "bold";
}
function log(text) {
    var logDiv = document.getElementById("log");
    var entry = document.createElement("p");
    entry.textContent = text;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
}
function nextEnemy() {
    enemy = createEnemy();
    player.level++;
    // Recuperar 33% da vida faltante ao subir de nível
    var missingHp = player.maxHp - player.hp;
    var recoverHp = Math.floor(missingHp * 0.33);
    player.hp = Math.min(player.hp + recoverHp, player.maxHp);
    // A cada 10 níveis, o jogador ganha +25 de vida, ou pode rolar para +25 a +50
    if (player.level % 2 === 0) {
        // Aqui deixei a escolha manual via prompt, mas pode trocar para automático
        var choice = prompt("Voc\u00EA chegou no n\u00EDvel ".concat(player.level, "! Deseja receber +25 de vida (digite 1) ou rolar para ganhar entre 25 e 50 (digite 2)?"));
        if (choice === "2") {
            var roll = 25 + Math.floor(Math.random() * 26);
            player.maxHp += roll;
            player.hp += roll;
            log("\uD83C\uDF89 Voc\u00EA rolou e ganhou +".concat(roll, " de vida m\u00E1xima!"));
        }
        else {
            player.maxHp += 25;
            player.hp += 25;
            log("\uD83C\uDF89 Voc\u00EA ganhou +25 de vida m\u00E1xima!");
        }
        // Garantir que vida atual não ultrapasse o máximo
        if (player.hp > player.maxHp)
            player.hp = player.maxHp;
    }
    log("\u2694\uFE0F Um novo inimigo apareceu! N\u00EDvel ".concat(enemy.level, ", Vida ").concat(enemy.hp, ". Voc\u00EA subiu para o n\u00EDvel ").concat(player.level, " e recuperou ").concat(recoverHp, " de vida."));
    updateStatus();
}
window.playerAttack = function playerAttack() {
    var damage = 10 + player.level * 5;
    if (Math.random() < 0.023) {
        damage = player.level * 15;
        log("💥 Ataque crítico!");
    }
    enemy.hp -= damage;
    log("\uD83D\uDDE1\uFE0F Voc\u00EA causou ".concat(damage, " de dano com a espada."));
    endTurn();
};
window.playerMagic = function playerMagic() {
    if (player.spells.length === 0) {
        player.spells = __spreadArray([], magicList, true).sort(function () { return 0.5 - Math.random(); }).slice(0, 4);
        log("🔮 Suas magias disponíveis: " + player.spells.map(function (m) { return m.name; }).join(", "));
    }
    var spell = player.spells[Math.floor(Math.random() * player.spells.length)];
    if (player.stamina < spell.staminaCost) {
        log("\u26A0\uFE0F Voc\u00EA n\u00E3o tem estamina suficiente para usar ".concat(spell.name, "."));
        return;
    }
    player.stamina -= spell.staminaCost;
    enemy.hp -= spell.damage;
    log("\u2728 Voc\u00EA usou ".concat(spell.name, " e causou ").concat(spell.damage, " de dano."));
    endTurn();
};
window.playerRest = function playerRest() {
    // Cura aleatória entre 10% e 25%
    var minRecover = Math.floor(player.maxHp * 0.1);
    var maxRecover = Math.floor(player.maxHp * 0.25);
    var recoveredHP = minRecover + Math.floor(Math.random() * (maxRecover - minRecover + 1));
    player.hp = Math.min(player.hp + recoveredHP, player.maxHp);
    // Recupera estamina (fixo 6%)
    var recoveredStamina = Math.floor(player.maxStamina * 0.06);
    player.stamina = Math.min(player.stamina + recoveredStamina, player.maxStamina);
    log("\uD83D\uDECC Voc\u00EA descansou. Recuperou ".concat(recoveredHP, " de vida e ").concat(recoveredStamina, " de estamina."));
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
    var action = Math.random();
    if (action < 0.4 && enemy.spells.length > 0 && enemy.stamina > 0) {
        var spell = enemy.spells[Math.floor(Math.random() * enemy.spells.length)];
        if (enemy.stamina >= spell.staminaCost) {
            enemy.stamina -= spell.staminaCost;
            player.hp -= spell.damage;
            log("\uD83D\uDD25 O inimigo usou ".concat(spell.name, " e causou ").concat(spell.damage, " de dano."));
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
    var damage = 10 + Math.floor(enemy.level * 4);
    player.hp -= damage;
    log("\uD83D\uDC80 O inimigo atacou com for\u00E7a e causou ".concat(damage, " de dano."));
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
    var buttons = document.querySelectorAll(".btn");
    buttons.forEach(function (b) { return (b.disabled = true); });
}
function enableButtons() {
    var buttons = document.querySelectorAll(".btn");
    buttons.forEach(function (btn) { return (btn.disabled = false); });
}
updateStatus();
log("⚔️ Um inimigo apareceu!");
window.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "r") {
        var buttons = document.querySelectorAll(".btn");
        if (Array.from(buttons).every(function (b) { return b.disabled; })) {
            removeRestartMessage();
            resetGame();
        }
    }
});
