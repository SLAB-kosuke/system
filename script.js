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
      name:"仕上げ①",
      hours:4
    },

    {
      name:"荒②",
      hours:8
    },

    {
      name:"仕上げ②",
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

function saveProduct(){

  const drawing =
    document.getElementById("drawing").value;

  const serial =
    document.getElementById("serial").value;

  const arrivalDate =
    document.getElementById("arrivalDate").value;

  const startDate =
    document.getElementById("startDate").value;

  const shipmentDate =
    document.getElementById("shipmentDate").value;

  const staff =
    document.getElementById("staff").value;

  const priority =
    document.getElementById("priority").value;

  const memo =
    document.getElementById("memo").value;

  if(
    !drawing ||
    !serial
  ){

    alert("図番とシリアルを入力");

    return;

  }

  const processes =
    createProcesses(
      drawing,
      startDate
    );

  const product = {

    drawing,
    serial,
    arrivalDate,
    startDate,
    shipmentDate,
    staff,
    priority,
    memo,
    processes

  };

  products.push(product);

  renderProducts();

  renderTimeline();

  renderWeek();

  renderMonth();

}


/* 工程生成 */

function createProcesses(
  drawing,
  startDate
){

  const master =
    processMaster[drawing] || [];

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


/* 製品一覧 */

function renderProducts(){

  const list =
    document.getElementById("productList");

  list.innerHTML = "";

  products.forEach(product=>{

    let statusClass =
      "processing";

    if(product.shipmentDate){

      statusClass =
        "shipment";

    }else if(product.arrivalDate){

      statusClass =
        "arrival";

    }

    const div =
      document.createElement("div");

    div.className =
      `product-card ${statusClass}`;

    div.innerHTML = `

      <div>
        <strong>図番:</strong>
        ${product.drawing}
      </div>

      <div>
        <strong>シリアル:</strong>
        ${product.serial}
      </div>

      <div>
        <strong>担当:</strong>
        ${product.staff}
      </div>

      <div>
        <strong>優先:</strong>
        ${product.priority}
      </div>

      <div>
        <strong>備考:</strong>
        ${product.memo}
      </div>

    `;

    list.appendChild(div);

  });

}


/* ページ */

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
    document.getElementById("timelineContainer");

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
    document.getElementById("weekContainer");

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
    document.getElementById("monthContainer");

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


/* 初期 */

window.onload = function(){

  renderProducts();

  renderTimeline();

  renderWeek();

  renderMonth();

};
