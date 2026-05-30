import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   Firebase
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

/* =========================
   入力画面判定
========================= */

const partNoInput = document.getElementById("partNo");

if (partNoInput) {

  initInputPage();

}

/* =========================
   入力画面
========================= */

function initInputPage() {

  const partNoEl = document.getElementById("partNo");
  const serialEl = document.getElementById("serial");

  const messageEl =
    document.getElementById("message");

  const selectedProcessEl =
    document.getElementById("selectedProcess");

  const selectedStatusEl =
    document.getElementById("selectedStatus");

  let selectedProcess = "";
  let qrScanner = null;

  /* =========================
     工程選択
  ========================= */

  const processButtons =
    document.querySelectorAll(".process-btn");

  processButtons.forEach(btn => {

    btn.addEventListener("click", () => {

      processButtons.forEach(b => {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      selectedProcess =
        btn.dataset.process;

      selectedProcessEl.textContent =
        selectedProcess;

    });

  });

  /* =========================
     状態ボタン
  ========================= */

  const statusButtons =
    document.querySelectorAll(".status-btn");

  statusButtons.forEach(btn => {

    btn.addEventListener("click", async () => {

      const status =
        btn.dataset.status;

      selectedStatusEl.textContent =
        status;

      if (!partNoEl.value) {

        alert("QRを読み取ってください");
        return;

      }

      if (!serialEl.value) {

        alert("QRを読み取ってください");
        return;

      }

      if (!selectedProcess) {

        alert("工程を選択してください");
        return;

      }

      try {

        messageEl.textContent =
          "保存中...";

        await saveLog({

          partNo:
            partNoEl.value.trim(),

          serial:
            serialEl.value.trim(),

          process:
            selectedProcess,

          status:
            status

        });

        messageEl.textContent =
          "✓ 保存完了";

        if (navigator.vibrate) {

          navigator.vibrate(200);

        }

      } catch (error) {

        console.error(error);

        messageEl.textContent =
          "保存失敗";

        alert(
          "保存エラーが発生しました"
        );

      }

    });

  });

  /* =========================
     QR開始
  ========================= */

  const startBtn =
    document.getElementById("startQrBtn");

  const stopBtn =
    document.getElementById("stopQrBtn");

  startBtn.addEventListener("click", () => {

    startQR();

  });

  stopBtn.addEventListener("click", () => {

    stopQR();

  });

  async function startQR() {

    try {

      qrScanner =
        new Html5Qrcode("reader");

      await qrScanner.start(
        {
          facingMode: "environment"
        },
        {
          fps: 10,
          qrbox: 250
        },
        onScanSuccess
      );

      messageEl.textContent =
        "QR読取中";

    } catch (err) {

      console.error(err);

      alert("カメラ起動失敗");

    }

  }

  async function stopQR() {

    try {

      if (qrScanner) {

        await qrScanner.stop();
        await qrScanner.clear();

      }

      messageEl.textContent =
        "QR停止";

    } catch (err) {

      console.error(err);

    }

  }

  /* =========================
     QR読取成功
  ========================= */

  async function onScanSuccess(text) {

    try {

      const values =
        text.split(",");

      if (values.length < 2) {

        alert(
          "QR形式エラー\n図番,シリアル"
        );

        return;

      }

      const partNo =
        values[0].trim();

      const serial =
        values[1].trim();

      partNoEl.value =
        partNo;

      serialEl.value =
        serial;

      messageEl.textContent =
        "読取完了";

      if (navigator.vibrate) {

        navigator.vibrate(100);

      }

      await stopQR();

    } catch (error) {

      console.error(error);

    }

  }

}

/* =========================
   Firestore保存
========================= */

async function saveLog(data) {

  const now = new Date();

  await addDoc(
    collection(db, "workLogs"),
    {

      partNo:
        data.partNo,

      serial:
        data.serial,

      process:
        data.process,

      status:
        data.status,

      createdAt:
        serverTimestamp(),

      datetime:
        now.toLocaleString("ja-JP")

    }
  );

}

/* =========================
   ログ一覧ページ
========================= */

const historyList =
  document.getElementById("historyList");

if (historyList) {

  initLogsPage();

}

async function initLogsPage() {

  try {

    const {
      getDocs,
      query,
      collection,
      orderBy
    } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
    );

    const snap = await getDocs(
      query(
        collection(db, "workLogs"),
        orderBy("createdAt", "desc")
      )
    );

    const logs = [];

    snap.forEach(doc => {

      logs.push({
        id: doc.id,
        ...doc.data()
      });

    });

    createHistory(logs);

    createActiveList(logs);

    setupSearch(logs);

    setupCsv(logs);

    document.getElementById(
      "totalCount"
    ).textContent = logs.length;

  } catch (error) {

    console.error(error);

    historyList.innerHTML =
      "<div class='empty-message'>読込失敗</div>";

  }

}

/* =========================
   色管理
========================= */

const productColors = [
  "#d9f2ff",
  "#fff7cc",
  "#ffd9ec",
  "#dfffd9",
  "#f5e6d3"
];

const productColorMap = {};

function getProductColor(key) {

  if (!productColorMap[key]) {

    const index =
      Object.keys(productColorMap).length %
      productColors.length;

    productColorMap[key] =
      productColors[index];

  }

  return productColorMap[key];

}

/* =========================
   履歴表示
========================= */

function createHistory(logs) {

  const container =
    document.getElementById("historyList");

  container.innerHTML = "";

  const template =
    document.getElementById(
      "historyTemplate"
    );

  logs.forEach(log => {

    const clone =
      template.content.cloneNode(true);

    const key =
      `${log.partNo}_${log.serial}`;

    const color =
      getProductColor(key);

    clone.querySelector(
      ".product-color"
    ).style.background = color;

    clone.querySelector(
      ".part-no"
    ).textContent = log.partNo;

    clone.querySelector(
      ".serial-no"
    ).textContent = log.serial;

    clone.querySelector(
      ".process"
    ).textContent = log.process;

    clone.querySelector(
      ".status"
    ).textContent = log.status;

    clone.querySelector(
      ".datetime"
    ).textContent =
      log.datetime || "";

    container.appendChild(clone);

  });

}

/* =========================
   現在進行中
========================= */

function createActiveList(logs) {

  const activeArea =
    document.getElementById("activeList");

  activeArea.innerHTML = "";

  const latestMap = {};

  logs.forEach(log => {

    const key =
      `${log.partNo}_${log.serial}`;

    if (!latestMap[key]) {

      latestMap[key] = log;

    }

  });

  const activeItems =
    Object.values(latestMap)
      .filter(item =>
        item.status !== "完了"
      );

  document.getElementById(
    "activeCount"
  ).textContent =
    activeItems.length;

  if (activeItems.length === 0) {

    activeArea.innerHTML =
      "<div class='empty-message'>進行中なし</div>";

    return;

  }

  const template =
    document.getElementById(
      "activeTemplate"
    );

  activeItems.forEach(item => {

    const clone =
      template.content.cloneNode(true);

    const key =
      `${item.partNo}_${item.serial}`;

    const color =
      getProductColor(key);

    clone.querySelector(
      ".product-color"
    ).style.background = color;

    clone.querySelector(
      ".part-no"
    ).textContent =
      item.partNo;

    clone.querySelector(
      ".serial-no"
    ).textContent =
      item.serial;

    clone.querySelector(
      ".process"
    ).textContent =
      item.process;

    clone.querySelector(
      ".status"
    ).textContent =
      item.status;

    clone.querySelector(
      ".datetime"
    ).textContent =
      item.datetime || "";

    activeArea.appendChild(clone);

  });

}

/* =========================
   検索
========================= */

function setupSearch(logs) {

  const search =
    document.getElementById(
      "searchText"
    );

  if (!search) return;

  search.addEventListener(
    "input",
    () => {

      const word =
        search.value
          .trim()
          .toLowerCase();

      const filtered =
        logs.filter(log => {

          return (
            log.partNo
              ?.toLowerCase()
              .includes(word) ||

            log.serial
              ?.toLowerCase()
              .includes(word)
          );

        });

      createHistory(filtered);

    }
  );

}

/* =========================
   CSV出力
========================= */

function setupCsv(logs) {

  const btn =
    document.getElementById(
      "csvBtn"
    );

  if (!btn) return;

  btn.addEventListener(
    "click",
    () => {

      let csv =
        "図番,シリアル,工程,状態,日時\n";

      logs.forEach(log => {

        csv +=
          `"${log.partNo}",` +
          `"${log.serial}",` +
          `"${log.process}",` +
          `"${log.status}",` +
          `"${log.datetime}"\n`;

      });

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        `worklogs_${Date.now()}.csv`;

      a.click();

      URL.revokeObjectURL(url);

    }
  );

}
