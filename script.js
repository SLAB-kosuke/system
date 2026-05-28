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

    qrText=>{

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

    },

    error=>{

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

    current.setHours(
      current.getHours()
      + proc.hours
    );

    const end =
      new Date(current);

    result.push({

      name:proc.name,
      hours:proc.hours,
      start,
      end,
      status:"",
      actualStart:null

    });

  });

  return result;

}


/* 全更新 */

function renderAll(){

  renderProducts();
  renderTimeline();
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
            加工中
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


/* 状態ボタン表示 */

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

  /* 開始時間記録 */

  if(
    status === "processing"
    &&
    !proc.actualStart
  ){

    proc.actualStart =
      new Date();

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
      "active";

  }

}


/* ガントチャート */

function renderTimeline(){

  const container =
    document.getElementById(
      "timelineContainer"
    );

  if(!container){
    return;
  }

  container.innerHTML = "";

  for(let d=0; d<3; d++){

    const date =
      new Date();

    date.setDate(
      date.getDate()+d
    );

    const row =
      document.createElement("div");

    row.className =
      "timeline-row";

    const title =
      document.createElement("div");

    title.className =
      "timeline-title";

    title.innerHTML = `

      ${date.getMonth()+1}月
      ${date.getDate()}日
      (${weekNames[date.getDay()]})

    `;

    row.appendChild(title);

    const hours =
      document.createElement("div");

    hours.className =
      "timeline-hours";

    for(let h=0; h<24; h++){

      const box =
        document.createElement("div");

      box.className =
        "hour-box";

      box.innerHTML =
        `<div>${h}</div>`;

      products.forEach(product=>{

        product.processes.forEach(proc=>{

          if(!proc.actualStart){
            return;
          }

          const start =
            new Date(proc.actualStart);

          const end =
            new Date(proc.end);

          const targetDate =
            new Date(date);

          targetDate.setHours(
            h,
            0,
            0,
            0
          );

          if(
            targetDate >= start
            &&
            targetDate <= end
          ){

            const bar =
              document.createElement("div");

            bar.className =
              `process-bar ${proc.status}`;

            bar.innerHTML = `

              ${product.serial}
              <br>
              ${proc.name}

            `;

            box.appendChild(bar);

          }

        });

      });

      hours.appendChild(box);

    }

    row.appendChild(hours);

    container.appendChild(row);

  }

}


/* 週間 */

function renderWeek(){}


/* 月間 */

function renderMonth(){}


/* 登録ボタン */

document
  .getElementById("registerBtn")
  .addEventListener(
    "click",
    registerProduct
  );


/* QRボタン */

document
  .getElementById("scanBtn")
  .addEventListener(
    "click",
    startQR
  );


/* ページ切替 */

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
