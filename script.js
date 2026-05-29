import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   Firebase設定（ここだけ自分のに変更）
========================= */
const firebaseConfig = {
   apiKey: "AIzaSyCEqhjoJuNOfSY6SDuXNCfXSScHcYpkvTs",
  authDomain: "system-bc7f1.firebaseapp.com",
  projectId: "system-bc7f1",
  storageBucket: "system-bc7f1.firebasestorage.app",
  messagingSenderId: "463071825210",
  appId: "1:463071825210:web:0ffb147ec37746a51d5403"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const col = collection(db, "tasks");

/* =========================
   表示スケール
========================= */
const PX_PER_HOUR = 20;

/* =========================
   追加
========================= */
window.addTask = async function () {
  const title = document.getElementById("title").value;
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const status = document.getElementById("status").value;

  if (!title || !start || !end) return;

  await addDoc(col, { title, start, end, status });

  document.getElementById("title").value = "";
  document.getElementById("start").value = "";
  document.getElementById("end").value = "";

  load();
};

/* =========================
   削除
========================= */
window.del = async function (id) {
  await deleteDoc(doc(db, "tasks", id));
  load();
};

/* =========================
   読み込み
========================= */
async function load() {
  const snap = await getDocs(col);

  const data = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  render(data);
}

/* =========================
   描画
========================= */
function render(data) {
  const gantt = document.getElementById("gantt");
  const list = document.getElementById("list");

  gantt.innerHTML = "";
  list.innerHTML = "";

  if (data.length === 0) return;

  const base = new Date(Math.min(...data.map(d => new Date(d.start))));

  data.forEach(task => {
    const start = new Date(task.start);
    const end = new Date(task.end);

    const left = (start - base) / (1000 * 60 * 60) * PX_PER_HOUR;
    const width = (end - start) / (1000 * 60 * 60) * PX_PER_HOUR;

    const row = document.createElement("div");
    row.className = "gantt-row";

    row.innerHTML = `
      <div class="gantt-label">${task.title}</div>

      <div class="gantt-track">

        <div class="gantt-bar ${task.status}"
          style="left:${left}px;width:${width}px">
          ${task.title}
        </div>

        <div class="planned-end"
          style="left:${left + width}px"></div>

      </div>
    `;

    gantt.appendChild(row);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${task.title}</td>
      <td>${task.start}</td>
      <td>${task.end}</td>
      <td>${task.status}</td>
      <td><button onclick="del('${task.id}')">削除</button></td>
    `;

    list.appendChild(tr);
  });
}

/* =========================
   初回ロード
========================= */
load();
