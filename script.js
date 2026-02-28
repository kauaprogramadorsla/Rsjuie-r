import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// =======================
// CONFIGURAÇÃO FIREBASE
// =======================
const firebaseConfig = {
    apiKey: "AIzaSyC8PSXTyOxn_kgyFzpn-Qw3EGUXdS7BGOo",
    authDomain: "feature-8e659.firebaseapp.com",
    databaseURL: "https://feature-8e659-default-rtdb.firebaseio.com",
    projectId: "feature-8e659",
    storageBucket: "feature-8e659.firebasestorage.app",
    messagingSenderId: "755676249847",
    appId: "1:755676249847:web:2a01bda6f99d6e32b7ddf2",
    measurementId: "G-LN21J71XEV"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// =======================
// REFERÊNCIAS
// =======================
const votosRef = ref(database, 'votos');
const contadorRef = ref(database, 'contador');

// =======================
// FUNÇÕES DE LOGIN
// =======================

// Criar conta
window.criarConta = function () {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    createUserWithEmailAndPassword(auth, email, senha)
        .then(() => alert("Conta criada com sucesso!"))
        .catch(error => alert(error.message));
};

// Entrar
window.entrar = function () {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    signInWithEmailAndPassword(auth, email, senha)
        .catch(error => alert(error.message));
};

// Verificar login e controlar exibição das áreas
onAuthStateChanged(auth, user => {
    const areaLogin = document.getElementById("areaLogin");
    const areaVotacao = document.getElementById("areaVotacao");

    if (!areaLogin || !areaVotacao) return;

    if (user) {
        areaLogin.style.display = "none";
        areaVotacao.style.display = "block";
        atualizarResultadosAoVivo();
        atualizarContador();
        incrementarContador();
    } else {
        areaLogin.style.display = "block";
        areaVotacao.style.display = "none";
    }
});

// =======================
// SISTEMA DE VOTAÇÃO
// =======================

window.votar = async function(nomeJogador) {
    const votoRef = ref(database, "votos/" + nomeJogador);
    const snapshot = await get(votoRef);

    let votos = 0;
    if (snapshot.exists()) {
        votos = snapshot.val();
    }

    set(votoRef, votos + 1)
        .then(() => console.log("Voto registrado com sucesso!"))
        .catch((error) => console.error("Erro ao registrar voto:", error));
};

// Atualizar resultados em tempo real
function atualizarResultadosAoVivo() {
    onValue(votosRef, (snapshot) => {
        const votos = snapshot.val();
        let textoResultados = "";
        if (votos) {
            Object.entries(votos).forEach(([jogador, quantidade]) => {
                textoResultados += `${jogador}: ${quantidade} voto(s)<br>`;
            });
        }
        const resultadoElement = document.getElementById('resultado');
        if (resultadoElement) {
            resultadoElement.innerHTML = textoResultados || "Nenhum voto registrado ainda";
        }
    });
}

// =======================
// CONTADOR DE VOTANTES ONLINE
// =======================

function atualizarContador() {
    onValue(contadorRef, (snapshot) => {
        const contador = snapshot.val() || 0;
        const contadorElement = document.getElementById('contadorVotantes');
        if (contadorElement) {
            contadorElement.textContent = contador.total || 0;
        }
    });
}

function incrementarContador() {
    get(contadorRef).then((snapshot) => {
        const contadorAtual = snapshot.val() || { total: 0 };
        update(contadorRef, { total: contadorAtual.total + 1 });
    });
}

function decrementarContador() {
    get(contadorRef).then((snapshot) => {
        const contadorAtual = snapshot.val() || { total: 0 };
        if (contadorAtual.total > 0) {
            update(contadorRef, { total: contadorAtual.total - 1 });
        }
    });
}

// Decrementar contador quando a página é fechada
window.addEventListener('beforeunload', decrementarContador);
