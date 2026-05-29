const weekNames = [
  "日","月","火","水","木","金","土"
];


/* 工程マスタ */

const processMaster = {

  "A100":[

    {
      name:"荒①",
      hours:36
    },

    {
      name:"仕上①",
      hours:4
    },

    {
      name:"荒②",
      hours:8
    },

    {
      name:"仕上②",
      hours:2
    },

    {
      name:"洗浄・出荷",
      hours:3.5
    }

  ]

};


/* 製品データ */

let products = [];


/* 選択中工程 */

let selectedProductIndex = null;
let selectedProcessIndex = null;


/* QR */

let qr = null;


/* QR開始 */

function startQR(){

  if(!qr){

    qr = new Html5Qrcode("reader");

  }

  qr.start(

    {
      facingMode:"environment"
    },

    {
      fps:10,
      qrbox:250
    },

    function(qrText){

      qr.stop().then(()=>{

        qr.clear();

      });

      const data =
        qrText.split(",");

      if(data.length < 2){

        alert("QR形式エラー");

        return;

      }

      document
        .getElementById("drawingInput")
        .value =
        data[0];

      document
        .getElementById("serialInput")
        .value =
        data[1];

      registerProduct();

    },

    function(error){

    }

  );

}


/* 製品登録 */

function registerProduct(){

  const drawing =
    document
      .getElementById("drawingInput")
      .value
      .trim()
      .toUpperCase();

  const serial =
    document
      .getElementById("serialInput")
      .value
      .trim();

  if(!drawing || !serial){

    alert("図番とシリアル入力");

    return;

  }

  if(!processMaster[drawing]){

    alert("工程マスタ未登録");

    return;

  }

  const processes =
    createProcesses(drawing);

  products.push({

    drawing,
    serial,
    processes

  });

  document
    .getElementById("drawingInput")
    .value = "";

  document
    .getElementById("serialInput")
    .value = "";

  renderAll();

}


/* 工程生成 */

function createProcesses(drawing){

  const master =
    processMaster[drawing];

  let current =
    new Date();

  let result = [];

  master.forEach(proc=>{

    const start =
      new Date(current);

    current =
      new Date(
        current.getTime()
        + proc.hours * 60 * 60 * 1000
      );

    const end =
      new Date(current);

    result.push({

      name:proc.name,
      hours:proc.hours,
      start,
      end,
      status:"",
      actualStart:null,
      actualEnd:null

    });

  });

  return result;

}


/* 全更新 */

function renderAll(){

  renderProducts();

  renderPlanTimeline();

  renderActualTimeline();

  renderWeek();

  renderMonth();

}


/* 製品一覧 */

function renderProducts(){

  const list =
    document.getElementById(
      "productList"
    );

  if(!list){
    return;
  }

  list.innerHTML = "";

  products.forEach(
    (product,productIndex)=>{

      const card =
        document.createElement("div");

      card.className =
        "product-card";

      let processHTML = "";

      product.processes.forEach(
        (proc,processIndex)=>{

          processHTML += `

            <div
              class="
                process-box
                ${proc.status}
              "

              onclick="
                openStatusButtons(
                  ${productIndex},
                  ${processIndex}
                )
              "
            >

              ${proc.name}

            </div>

          `;

        });

      card.innerHTML = `

        <div class="product-top">

          <div>

            <div class="drawing">

              ${product.drawing}

            </div>

            <div class="serial">

              ${product.serial}

            </div>

          </div>

        </div>

        <div class="process-row">

          ${processHTML}

        </div>

        <div
          class="status-buttons"
          id="status-${productIndex}"
        >

          <button
            onclick="
              changeProcessStatus(
                ${productIndex},
                'processing'
              )
            "
          >
            開始
          </button>

          <button
            onclick="
              changeProcessStatus(
                ${productIndex},
                'stop'
              )
            "
          >
            中断
          </button>

          <button
            onclick="
              changeProcessStatus(
                ${productIndex},
                'complete'
              )
            "
          >
            完了
          </button>

          <button
            onclick="
              changeProcessStatus(
                ${productIndex},
                'hold'
              )
            "
          >
            保留
          </button>

          <button
            onclick="
              changeProcessStatus(
                ${productIndex},
                ''
              )
            "
          >
            クリア
          </button>

        </div>

      `;

      list.appendChild(card);

    });

}


/* 状態ボタン */

function openStatusButtons(
  productIndex,
  processIndex
){

  document
    .querySelectorAll(
      ".status-buttons"
    )
    .forEach(el=>{

      el.style.display =
        "none";

    });

  selectedProductIndex =
    productIndex;

  selectedProcessIndex =
    processIndex;

  const target =
    document.getElementById(
      `status-${productIndex}`
    );

  if(target){

    target.style.display =
      "flex";

  }

}


/* 状態変更 */

function changeProcessStatus(
  productIndex,
  status
){

  if(
    selectedProcessIndex === null
  ){
    return;
  }

  const proc =
    products
      [productIndex]
      .processes
      [selectedProcessIndex];

  proc.status = status;

  /* 開始 */

  if(
    status === "processing"
    &&
    !proc.actualStart
  ){

    proc.actualStart =
      new Date();

  }

  /* 完了 */

  if(
    status === "complete"
  ){

    proc.actualEnd =
      new Date();

  }

  /* クリア */

  if(status === ""){

    proc.actualStart = null;

    proc.actualEnd = null;

  }

  renderAll();

}


/* ページ切替 */

function showPage(id){

  document
    .querySelectorAll(".page")
    .forEach(page=>{

      page.classList.remove(
        "active"
      );

    });

  const target =
    document.getElementById(id);

  if(target){

    target.classList.add(
      "active"
    );

  }

}


/* 予定ガント */

function renderPlanTimeline(){

  const container =
    document.getElementById(
      "planTimeline"
    );

  if(!container){
    return;
  }

  container.innerHTML = "";

  createGanttHeader(container);

  products.forEach(product=>{

    const row =
      document.createElement("div");

    row.className =
      "gantt-row";

    const label =
      document.createElement("div");

    label.className =
      "gantt-label";

    label.innerHTML =
      product.serial;

    const line =
      document.createElement("div");

    line.className =
      "gantt-line";

    product.processes.forEach(proc=>{

      const start =
        new Date(proc.start);

      const end =
        new Date(proc.end);

      const left =
        (
          start.getHours() * 80
        )
        +
        (
          start.getMinutes() / 60 * 80
        );

      const diffHours =
        (
          end - start
        )
        / 1000
        / 60
        / 60;

      const width =
        diffHours * 80;

      const bar =
        document.createElement("div");

      bar.className =
        "gantt-bar processing";

      bar.style.left =
        `${left}px`;

      bar.style.width =
        `${width}px`;

      bar.innerHTML =
        proc.name;

      line.appendChild(bar);

    });

    row.appendChild(label);

    row.appendChild(line);

    container.appendChild(row);

  });

}


/* 実績ガント */

function renderActualTimeline(){

  const container =
    document.getElementById(
      "actualTimeline"
    );

  if(!container){
    return;
  }

  container.innerHTML = "";

  createGanttHeader(container);

  products.forEach(product=>{

    const row =
      document.createElement("div");

    row.className =
      "gantt-row";

    const label =
      document.createElement("div");

    label.className =
      "gantt-label";

    label.innerHTML =
      product.serial;

    const line =
      document.createElement("div");

    line.className =
      "gantt-line";

    product.processes.forEach(proc=>{

      if(!proc.actualStart){
        return;
      }

      const start =
        new Date(proc.actualStart);

      const endTime =
        proc.actualEnd
        ? new Date(proc.actualEnd)
        : new Date();

      const left =
        (
          start.getHours() * 80
        )
        +
        (
          start.getMinutes() / 60 * 80
        );

      const diffHours =
        (
          endTime - start
        )
        / 1000
        / 60
        / 60;

      const width =
        diffHours * 80;

      const bar =
        document.createElement("div");

      bar.className =
        `gantt-bar ${proc.status}`;

      bar.style.left =
        `${left}px`;

      bar.style.width =
        `${width}px`;

      bar.innerHTML =
        proc.name;

      line.appendChild(bar);

    });

    row.appendChild(label);

    row.appendChild(line);

    container.appendChild(row);

  });

}


/* ガントヘッダー */

function createGanttHeader(container){

  const header =
    document.createElement("div");

  header.className =
    "gantt-header";

  let html =
    "<div>製品</div>";

  for(let h=0; h<24; h++){

    html += `
      <div>${h}:00</div>
    `;

  }

  header.innerHTML =
    html;

  container.appendChild(header);

}


/* 週間 */

function renderWeek(){}


/* 月間 */

function renderMonth(){}


/* ボタン */

document
  .getElementById("registerBtn")
  .addEventListener(
    "click",
    registerProduct
  );

document
  .getElementById("scanBtn")
  .addEventListener(
    "click",
    startQR
  );

document
  .querySelectorAll("[data-page]")
  .forEach(btn=>{

    btn.addEventListener(
      "click",
      ()=>{

        showPage(
          btn.dataset.page
        );

      }
    );

  });


/* 初期表示 */

renderAll();


/* リアルタイム更新 */

setInterval(()=>{

  renderActualTimeline();

},1000);
