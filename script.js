import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

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
const db = getDatabase(app);
const auth = getAuth(app);


// =======================
// SISTEMA DE VOTAÇÃO
// =======================
window.votar = async function(nome) {
  const votoRef = ref(db, "votos/" + nome);
  const snapshot = await get(votoRef);

  let votos = 0;
  if (snapshot.exists()) {
    votos = snapshot.val();
  }

  set(votoRef, votos + 1);
};

const resultadoRef = ref(db, "votos");
onValue(resultadoRef, (snapshot) => {
  let texto = "";
  snapshot.forEach((child) => {
    texto += child.key + ": " + child.val() + " votos<br>";
  });

  const resultado = document.getElementById("resultado");
  if (resultado) {
    resultado.innerHTML = texto;
  }
});


// =======================
// SISTEMA DE LOGIN
// =======================

// criar conta
window.criarConta = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert("Conta criada com sucesso!");
    })
    .catch(error => {
      alert(error.message);
    });
};

// entrar
window.entrar = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .catch(error => {
      alert(error.message);
    });
};

// verificar login
onAuthStateChanged(auth, user => {
  const areaLogin = document.getElementById("areaLogin");
  const areaVotacao = document.getElementById("areaVotacao");

  if (!areaLogin || !areaVotacao) return;

  if (user) {
    areaLogin.style.display = "none";
    areaVotacao.style.display = "block";
  } else {
    areaLogin.style.display = "block";
    areaVotacao.style.display = "none";
  }
});
