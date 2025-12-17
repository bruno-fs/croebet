// Estado do jogo
let balance = 1000;
let betAmount = 10;
let isSpinning = false;

// Símbolos do jogo (trabalhista Krepinho themed)
const symbols = [
    '👔', // Gravata (Krepinho)
    '📊', // Gráfico
    '💼', // Maleta
    '⚖️', // Balança (justiça trabalhista)
    '📋', // Contrato
    '💰', // Dinheiro
    '🏛️', // Tribunal
];

// Elementos DOM
const balanceElement = document.getElementById('balance');
const betAmountInput = document.getElementById('betAmount');
const spinBtn = document.getElementById('spinBtn');
const spinPriceElement = document.getElementById('spinPrice');
const resultMessage = document.getElementById('resultMessage');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateBalance();
    updateBetDisplay();

    // Event listeners
    spinBtn.addEventListener('click', spin);
    document.getElementById('increaseBet').addEventListener('click', () => adjustBet(10));
    document.getElementById('decreaseBet').addEventListener('click', () => adjustBet(-10));
    betAmountInput.addEventListener('change', handleBetInputChange);
});

// Atualizar display do saldo
function updateBalance() {
    balanceElement.textContent = `R$ ${balance.toFixed(2)}`;

    // Desabilitar botão se não tiver saldo suficiente
    if (balance < betAmount) {
        spinBtn.disabled = true;
        resultMessage.textContent = '❌ Saldo insuficiente! (Mas é tudo de mentirinha mesmo 😄)';
        resultMessage.className = 'result-message lose';
    } else {
        spinBtn.disabled = false;
    }
}

// Ajustar aposta
function adjustBet(change) {
    const newBet = betAmount + change;
    if (newBet >= 1 && newBet <= Math.min(1000, balance)) {
        betAmount = newBet;
        betAmountInput.value = betAmount;
        updateBetDisplay();
    }
}

// Lidar com mudança manual do input
function handleBetInputChange(e) {
    let value = parseInt(e.target.value) || 1;
    value = Math.max(1, Math.min(value, Math.min(1000, balance)));
    betAmount = value;
    betAmountInput.value = betAmount;
    updateBetDisplay();
}

// Atualizar display da aposta
function updateBetDisplay() {
    spinPriceElement.textContent = betAmount.toFixed(2);
}

// Função principal - Girar
async function spin() {
    if (isSpinning || balance < betAmount) return;

    isSpinning = true;
    spinBtn.disabled = true;
    resultMessage.textContent = '';
    resultMessage.className = 'result-message';

    // Deduzir aposta
    balance -= betAmount;
    updateBalance();

    // Adicionar classe de spinning
    reels.forEach(reel => reel.classList.add('spinning'));

    // Girar por um tempo aleatório (1-3 segundos)
    const spinDuration = 1000 + Math.random() * 2000;

    // Animar símbolos durante o giro
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.querySelector('.symbol').textContent = randomSymbol;
        });
    }, 100);

    // Aguardar fim do giro
    await sleep(spinDuration);
    clearInterval(spinInterval);

    // Determinar resultado final
    const result = getSpinResult();

    // Parar os rolos um por um (efeito dramático)
    for (let i = 0; i < reels.length; i++) {
        await sleep(300);
        reels[i].classList.remove('spinning');
        reels[i].querySelector('.symbol').textContent = result[i];
    }

    // Verificar vitória
    await sleep(500);
    const winAmount = checkWin(result);

    if (winAmount > 0) {
        // Vitória!
        balance += winAmount;
        updateBalance();

        // Animação de vitória
        reels.forEach(reel => reel.classList.add('win'));

        resultMessage.textContent = `🎉 GANHOU! +R$ ${winAmount.toFixed(2)} 🎉`;
        resultMessage.className = 'result-message win';

        // Remover animação de vitória após um tempo
        setTimeout(() => {
            reels.forEach(reel => reel.classList.remove('win'));
        }, 1000);
    } else {
        // Perdeu
        resultMessage.textContent = `😢 Não foi dessa vez... O Krepinho não sorriu para você!`;
        resultMessage.className = 'result-message lose';
    }

    isSpinning = false;

    // Verificar se acabou o saldo
    if (balance === 0) {
        resultMessage.textContent = '💸 Sem saldo! Mas relaxa, clique aqui para resetar! 💸';
        resultMessage.className = 'result-message lose';
        resultMessage.style.cursor = 'pointer';
        resultMessage.onclick = resetBalance;
    } else {
        spinBtn.disabled = false;
    }
}

// Determinar resultado do giro
function getSpinResult() {
    const result = [];

    // Probabilidade ajustada para ser "generoso" (é uma paródia, afinal)
    const winChance = Math.random();

    if (winChance < 0.15) {
        // 15% chance de ganhar com 3 iguais
        const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        return [winSymbol, winSymbol, winSymbol];
    } else if (winChance < 0.25) {
        // 10% chance de ganhar com 2 iguais
        const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const position = Math.floor(Math.random() * 3);
        result[position] = symbols[Math.floor(Math.random() * symbols.length)];
        result[(position + 1) % 3] = winSymbol;
        result[(position + 2) % 3] = winSymbol;
        return result;
    } else {
        // 75% chance de perder
        // Garantir que não sejam todos iguais
        do {
            result[0] = symbols[Math.floor(Math.random() * symbols.length)];
            result[1] = symbols[Math.floor(Math.random() * symbols.length)];
            result[2] = symbols[Math.floor(Math.random() * symbols.length)];
        } while (result[0] === result[1] && result[1] === result[2]);

        return result;
    }
}

// Verificar vitória e calcular prêmio
function checkWin(result) {
    // Contar símbolos iguais
    const symbolCounts = {};
    result.forEach(symbol => {
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(symbolCounts));

    if (maxCount === 3) {
        // 3 símbolos iguais
        const winSymbol = result[0];
        let multiplier = 2; // Base

        // Multiplicadores especiais
        if (winSymbol === '👔') {
            multiplier = 10; // Krepinho!
        } else if (winSymbol === '📊') {
            multiplier = 5;
        } else if (winSymbol === '💼') {
            multiplier = 3;
        } else if (winSymbol === '⚖️') {
            multiplier = 2;
        }

        return betAmount * multiplier;
    } else if (maxCount === 2) {
        // 2 símbolos iguais (prêmio pequeno)
        return betAmount * 0.5;
    }

    return 0;
}

// Resetar saldo
function resetBalance() {
    balance = 1000;
    updateBalance();
    resultMessage.textContent = '💰 Saldo resetado! Boa sorte! 💰';
    resultMessage.className = 'result-message';
    resultMessage.style.cursor = 'default';
    resultMessage.onclick = null;
}

// Utility: Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Easter eggs e mensagens aleatórias
const easterEggMessages = [
    'O Krepinho aprova esta jogada! 👔',
    'Quase! O trabalhista quase apareceu!',
    'A CLT não protege contra perdas no cassino! ⚖️',
    'Tente novamente, a sorte está chegando!',
    'O sindicato dos apostadores fictícios te deseja boa sorte! 💼',
];

// Adicionar easter eggs ocasionalmente
setInterval(() => {
    if (!isSpinning && Math.random() < 0.1 && resultMessage.textContent === '') {
        const randomMessage = easterEggMessages[Math.floor(Math.random() * easterEggMessages.length)];
        resultMessage.textContent = randomMessage;
        resultMessage.className = 'result-message';

        setTimeout(() => {
            if (!isSpinning) {
                resultMessage.textContent = '';
            }
        }, 3000);
    }
}, 10000);

// Console Easter Egg
console.log('%c🎰 CROEBET - O Cassino da Croezinha 🎰', 'font-size: 24px; color: #ffd700; font-weight: bold;');
console.log('%cLembre-se: Esta é uma PARÓDIA! Nenhum dinheiro real está envolvido.', 'font-size: 14px; color: #ff0000;');
console.log('%cSe você gostou, dê uma olhada no código! 💻', 'font-size: 12px; color: #00ff00;');
console.log('%cFeito com 💚 para a comunidade Croezinha', 'font-size: 12px; color: #aaa;');

// Atalhos do teclado (para os nerds)
document.addEventListener('keydown', (e) => {
    if (isSpinning) return;

    switch(e.key) {
        case ' ':
        case 'Enter':
            e.preventDefault();
            spin();
            break;
        case '+':
        case '=':
            e.preventDefault();
            adjustBet(10);
            break;
        case '-':
        case '_':
            e.preventDefault();
            adjustBet(-10);
            break;
        case 'r':
        case 'R':
            if (balance === 0) {
                resetBalance();
            }
            break;
    }
});
