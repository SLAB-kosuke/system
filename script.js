import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const PX = 20;

window.mode = "all";

/* 追加 */
window.addTask = async function () {
  const title = titleEl().value;
  const start = startEl().value;
  const end = endEl().value;
  const status = statusEl().value;

  if (!title || !start || !end) return;

  await addDoc(col, { title, start, end, status });

  clear();
  load();
};

/* 削除 */
window.del = async function (id) {
  await deleteDoc(doc(db, "tasks", id));
  load();
};

/* 読み込み */
async function load() {
  const snap = await getDocs(col);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  render(data);
}

/* 描画 */
function render(data) {
  const gantt = document.getElementById("gantt");
  const list = document.getElementById("list");

  gantt.innerHTML = "";
  list.innerHTML = "";

  if (!data.length) return;

  const base = new Date(Math.min(...data.map(d => new Date(d.start))));

  data.forEach(t => {
    const s = new Date(t.start);
    const e = new Date(t.end);

    const left = (s - base) / 3600000 * PX;
    const width = (e - s) / 3600000 * PX;

    const row = document.createElement("div");
    row.className = "gantt-row";

    row.innerHTML = `
      <div class="gantt-label">${t.title}</div>
      <div class="gantt-track">
        <div class="gantt-bar ${t.status}"
          style="left:${left}px;width:${width}px">
          ${t.title}
        </div>
        <div class="end-line"
          style="left:${left + width}px"></div>
      </div>
    `;

    gantt.appendChild(row);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.title}</td>
      <td>${t.start}</td>
      <td>${t.end}</td>
      <td>${t.status}</td>
      <td><button onclick="del('${t.id}')">削除</button></td>
    `;

    list.appendChild(tr);
  });
}

/* 初期 */
load();

/* helpers */
const titleEl = () => document.getElementById("title");
const startEl = () => document.getElementById("start");
const endEl = () => document.getElementById("end");
const statusEl = () => document.getElementById("status");

function clear(){
  titleEl().value="";
  startEl().value="";
  endEl().value="";
}
