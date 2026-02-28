import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase - SUBSTITUA COM SUAS CREDENCIAIS
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO-default-rtdb.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referências
const votosRef = ref(database, 'votos');
const contadorRef = ref(database, 'contador');

// Função para votar
window.votar = function(nomeJogador) {
    const novoVoto = {
        jogador: nomeJogador,
        timestamp: Date.now()
    };
    
    push(votosRef, novoVoto)
        .then(() => {
            console.log("Voto registrado com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao registrar voto:", error);
        });
};

// Função para atualizar contador de votantes
function atualizarContador() {
    onValue(contadorRef, (snapshot) => {
        const contador = snapshot.val();
        const contadorElement = document.getElementById('contadorVotantes');
        if (contadorElement) {
            contadorElement.textContent = contador || 0;
        }
    });
}

// Função para atualizar resultados em tempo real
function atualizarResultadosAoVivo() {
    onValue(votosRef, (snapshot) => {
        const votos = snapshot.val();
        const resultados = {};
        
        if (votos) {
            Object.values(votos).forEach((voto) => {
                const jogador = voto.jogador;
                resultados[jogador] = (resultados[jogador] || 0) + 1;
            });
        }
        
        // Atualizar display de resultados
        const resultadoElement = document.getElementById('resultado');
        if (resultadoElement && window.resultadosVisiveis) {
            let textoResultados = "";
            for (const [jogador, quantidade] of Object.entries(resultados)) {
                textoResultados += `${jogador}: ${quantidade} voto(s)<br>`;
            }
            resultadoElement.innerHTML = textoResultados || "Nenhum voto registrado ainda";
        }
    });
}

// Função para incrementar contador quando alguém entra na página
function incrementarContador() {
    onValue(contadorRef, (snapshot) => {
        const contadorAtual = snapshot.val() || 0;
        update(contadorRef, { total: contadorAtual + 1 });
    }, { onlyOnce: true });
}

// Função para decrementar contador quando alguém sai da página
function decrementarContador() {
    onValue(contadorRef, (snapshot) => {
        const contadorAtual = snapshot.val() || 0;
        if (contadorAtual > 0) {
            update(contadorRef, { total: contadorAtual - 1 });
        }
    }, { onlyOnce: true });
}

// Inicializar
atualizarContador();
atualizarResultadosAoVivo();
incrementarContador();

// Decrementar contador quando a página é fechada
window.addEventListener('beforeunload', decrementarContador);
