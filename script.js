const weekNames = [
  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土"
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


/* 製品 */

let products = [];


/* 登録 */

function registerProduct(){

  const drawing =
    document
      .getElementById("drawingInput")
      .value;

  const serial =
    document
      .getElementById("serialInput")
      .value;

  if(
    !drawing ||
    !serial
  ){

    alert("図番とシリアル入力");

    return;

  }

  const start =
    new Date();

  const processes =
    createProcesses(
      drawing,
      start
    );

  products.push({

    drawing,
    serial,
    processes,
    status:"processing"

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

function createProcesses(
  drawing,
  startDate
){

  const master =
    processMaster[drawing]
    || [];

  let current =
    new Date(startDate);

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

      end

    });

  });

  return result;

}


/* 全描画 */

function renderAll(){

  renderProducts();

  renderTimeline();

  renderWeek();

  renderMonth();

}


/* 製品一覧 */

function renderProducts(){

  const list =
    document.getElementById("productList");

  list.innerHTML = "";

  products.forEach(
    (product,productIndex)=>{

    /* 状態色 */

    let cardClass = "";

    switch(product.status){

      case "processing":
        cardClass = "card-processing";
        break;

      case "stop":
        cardClass = "card-stop";
        break;

      case "complete":
        cardClass = "card-complete";
        break;

      case "hold":
        cardClass = "card-hold";
        break;

      default:
        cardClass = "";
        break;

    }

    /* 工程名 */

    let processHTML = "";

    product.processes.forEach(proc=>{

      processHTML += `

        <div class="process-name">

          ${proc.name}

        </div>

      `;

    });

    const card =
      document.createElement("div");

    card.className =
      `product-card ${cardClass}`;

    card.innerHTML = `

      <div class="product-top">

        <div class="product-info">

          <div class="drawing">

            ${product.drawing}

          </div>

          <div class="serial">

            ${product.serial}

          </div>

        </div>

        <div class="process-list">

          ${processHTML}

        </div>

      </div>

      <div class="status-buttons">

        <button
          onclick="
            changeProductStatus(
              ${productIndex},
              'processing'
            )
          "
        >

          加工中

        </button>

        <button
          onclick="
            changeProductStatus(
              ${productIndex},
              'stop'
            )
          "
        >

          中断

        </button>

        <button
          onclick="
            changeProductStatus(
              ${productIndex},
              'complete'
            )
          "
        >

          終了

        </button>

        <button
          onclick="
            changeProductStatus(
              ${productIndex},
              'hold'
            )
          "
        >

          保留

        </button>

      </div>

    `;

    list.appendChild(card);

  });

}


/* 状態変更 */

function changeProductStatus(
  productIndex,
  status
){

  products[productIndex].status =
    status;

  renderAll();

}


/* ページ切替 */

function showPage(id){

  document
    .querySelectorAll(".page")
    .forEach(page=>{

      page.classList.remove("active");

    });

  document
    .getElementById(id)
    .classList.add("active");

}


/* タイムライン */

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
        `${h}:00`;

      products.forEach(product=>{

        product.processes.forEach(proc=>{

          const start =
            new Date(proc.start);

          if(
            start.getDate()
            === date.getDate()
            &&
            start.getHours()
            === h
          ){

            const bar =
              document.createElement("div");

            bar.className =
              "process-bar";

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

function renderWeek(){

  const container =
    document.getElementById(
      "weekContainer"
    );

  if(!container){

    return;

  }

  container.innerHTML = "";

  const start =
    new Date();

  start.setDate(
    start.getDate()
    - start.getDay()
  );

  for(let i=0; i<7; i++){

    const date =
      new Date(start);

    date.setDate(
      start.getDate()+i
    );

    const div =
      document.createElement("div");

    div.className =
      "week-day";

    let html = `

      <strong>

        ${date.getMonth()+1}/
        ${date.getDate()}
        (${weekNames[date.getDay()]})

      </strong>

      <hr>

    `;

    products.forEach(product=>{

      product.processes.forEach(proc=>{

        const procDate =
          new Date(proc.start);

        if(
          procDate.toDateString()
          === date.toDateString()
        ){

          html += `

            <div>

              ${product.serial}
              :
              ${proc.name}

            </div>

          `;

        }

      });

    });

    div.innerHTML = html;

    container.appendChild(div);

  }

}


/* 月間 */

function renderMonth(){

  const container =
    document.getElementById(
      "monthContainer"
    );

  if(!container){

    return;

  }

  container.innerHTML = "";

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    today.getMonth();

  const lastDate =
    new Date(
      year,
      month+1,
      0
    ).getDate();

  for(let d=1; d<=lastDate; d++){

    const date =
      new Date(year,month,d);

    const row =
      document.createElement("div");

    row.className =
      "month-row";

    let events = "";

    products.forEach(product=>{

      product.processes.forEach(proc=>{

        const procDate =
          new Date(proc.start);

        if(
          procDate.getDate()
          === d
        ){

          events += `

            <div>

              ${product.serial}
              :
              ${proc.name}

            </div>

          `;

        }

      });

    });

    row.innerHTML = `

      <div class="month-date">

        ${month+1}/${d}
        (${weekNames[date.getDay()]})

      </div>

      <div class="month-events">

        ${events}

      </div>

    `;

    container.appendChild(row);

  }

}


/* ボタン */

document
  .getElementById("registerBtn")
  .addEventListener(
    "click",
    registerProduct
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
