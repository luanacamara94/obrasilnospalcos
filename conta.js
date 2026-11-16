/* O Brasil nos palcos — contas reais (Firebase Auth + Firestore Lite) e métricas (Google Analytics, só com consentimento).
   A página principal fala com este módulo só por window.FB. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  sendEmailVerification, sendPasswordResetEmail, signOut, deleteUser
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore-lite.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6PJG9yXRkjtY2T5fK9Y6sPJ3FqykruMw",
  authDomain: "obrasilnospalcos.firebaseapp.com",
  projectId: "obrasilnospalcos",
  storageBucket: "obrasilnospalcos.firebasestorage.app",
  messagingSenderId: "180980343925",
  appId: "1:180980343925:web:6c762be08c95ac34fbc43c",
  measurementId: "G-YJYBDFL18L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "pt";
const db = getFirestore(app);

const ERROS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Entre ou recupere a senha.",
  "auth/weak-password": "A senha precisa ter pelo menos 8 caracteres.",
  "auth/too-many-requests": "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
  "auth/popup-blocked": "O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Verifique a internet e tente de novo.",
  "auth/account-exists-with-different-credential": "Esse e-mail já tem conta com outro método. Entre com e-mail e senha.",
  "auth/requires-recent-login": "Por segurança, entre de novo antes de excluir a conta.",
  "auth/unauthorized-domain": "Este endereço ainda não está autorizado para login.",
  "auth/user-disabled": "Esta conta foi desativada."
};
const SILENCIOSOS = ["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"];

const perfilRef = uid => doc(db, "usuarios", uid);
async function carregar(uid) {
  try { const s = await getDoc(perfilRef(uid)); return s.exists() ? s.data() : null; }
  catch (e) { console.warn("[conta] não consegui ler o perfil", e); return null; }
}
const resultado = async user => ({
  user: { uid: user.uid, nome: user.displayName || "", email: user.email || "", metodo: user.providerData.some(p => p.providerId === "google.com") ? "google" : "email" },
  perfil: await carregar(user.uid)
});

let resolverPronto;
const FB = {
  user: null,
  pronto: new Promise(r => (resolverPronto = r)),
  erro(e) {
    const c = e && e.code;
    if (SILENCIOSOS.includes(c)) return "";
    return ERROS[c] || "Não deu certo agora. Tente de novo em instantes.";
  },
  async google() {
    const prov = new GoogleAuthProvider();
    prov.setCustomParameters({ prompt: "select_account" });
    const r = await signInWithPopup(auth, prov);
    return resultado(r.user);
  },
  async entrar(email, senha) {
    const r = await signInWithEmailAndPassword(auth, email, senha);
    return resultado(r.user);
  },
  async criar(nome, email, senha) {
    const r = await createUserWithEmailAndPassword(auth, email, senha);
    try { await updateProfile(r.user, { displayName: nome }); } catch (e) {}
    try { await sendEmailVerification(r.user); } catch (e) {}
    return { user: { uid: r.user.uid, nome, email: r.user.email, metodo: "email" }, perfil: null };
  },
  async recuperar(email) {
    try { await sendPasswordResetEmail(auth, email); }
    catch (e) { if (!["auth/user-not-found", "auth/invalid-email"].includes(e.code)) throw e; }
  },
  async sair() { await signOut(auth); },
  async excluir() {
    const u = auth.currentUser; if (!u) return;
    // O Firebase só deixa excluir a conta logo depois de um login. Conferimos antes, para não apagar os dados e falhar a seguir.
    const ultimo = Date.parse(u.metadata.lastSignInTime || 0);
    if (!ultimo || Date.now() - ultimo > 4 * 60 * 1000) { const e = new Error("login antigo"); e.code = "auth/requires-recent-login"; throw e; }
    await deleteDoc(perfilRef(u.uid));
    await deleteUser(u);
  },
  async salvar(dados) {
    const u = auth.currentUser; if (!u) return;
    await setDoc(perfilRef(u.uid), { ...dados, atualizadoEm: serverTimestamp() }, { merge: true });
  },
  carregar: () => auth.currentUser ? carregar(auth.currentUser.uid) : Promise.resolve(null),

  /* ---------- métricas: o Analytics só é carregado depois de a pessoa aceitar os cookies ---------- */
  _an: null, _log: null,
  async consentir(sim) {
    if (!sim || this._an) return;
    try {
      const m = await import("https://www.gstatic.com/firebasejs/13.3.0/firebase-analytics.js");
      if (!(await m.isSupported())) return;
      this._an = m.getAnalytics(app);
      this._log = m.logEvent;
    } catch (e) { console.warn("[métricas] indisponível", e); }
  },
  track(nome, params) {
    try { if (this._an) this._log(this._an, nome, params || {}); } catch (e) {}
  }
};
window.FB = FB;

let primeira = true;
onAuthStateChanged(auth, async user => {
  FB.user = user ? { uid: user.uid, email: user.email || "", nome: user.displayName || "" } : null;
  if (primeira) { primeira = false; resolverPronto(); }
  window.dispatchEvent(new CustomEvent("fb:auth", { detail: { user: FB.user } }));
});
window.dispatchEvent(new Event("fb:carregado"));
