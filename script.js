const products = [

  {
    drawing: "A-1001",
    serial: "SN-001",
    process: "組立"
  },

  {
    drawing: "B-2001",
    serial: "SN-002",
    process: "検査"
  },

  {
    drawing: "C-3001",
    serial: "SN-003",
    process: "出荷待ち"
  }

];

const weekNames = [
  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土"
];


/* 製品一覧 */

function renderProducts(){

  const container =
    document.getElementById("productList");

  container.innerHTML = "";

  products.forEach(item=>{

    const div =
      document.createElement("div");

    div.className =
      "product-card";

    div.innerHTML = `
      <div><strong>図番:</strong> ${item.drawing}</div>
      <div><strong>シリアル:</strong> ${item.serial}</div>
      <div><strong>工程:</strong> ${item.process}</div>
    `;

    container.appendChild(div);

  });

}


/* ページ切替 */

function showPage(pageId){

  document
    .querySelectorAll(".page")
    .forEach(page=>{

      page.classList.remove("active");

    });

  document
    .getElementById(pageId)
    .classList.add("active");

}


/* 表示更新 */

function loadViews(){

  const selected =
    document.getElementById("datePicker").value;

  const baseDate =
    selected
    ? new Date(selected)
    : new Date();

  renderTimeline(baseDate);

  renderWeek(baseDate);

  renderMonth(baseDate);

}


/* タイムライン */

function renderTimeline(baseDate){

  const container =
    document.getElementById("timelineContainer");

  container.innerHTML = "";

  document.getElementById("timelineTitle")
    .innerText = "3日間タイムライン";

  for(let d=0; d<3; d++){

    const date = new Date(baseDate);

    date.setDate(baseDate.getDate()+d);

    const row =
      document.createElement("div");

    row.className =
      "timeline-row";

    const title =
      document.createElement("div");

    title.innerHTML = `
      <strong>
      ${date.getMonth()+1}月
      ${date.getDate()}日
      (${weekNames[date.getDay()]})
      </strong>
    `;

    row.appendChild(title);

    const hours =
      document.createElement("div");

    hours.className =
      "timeline-hours";

    for(let h=0; h<24; h++){

      const hour =
        document.createElement("div");

      hour.className =
        "hour-box";

      hour.innerHTML = `${h}:00`;

      hours.appendChild(hour);

    }

    row.appendChild(hours);

    container.appendChild(row);

  }

}


/* 週間表示 */

function renderWeek(baseDate){

  const container =
    document.getElementById("weekContainer");

  container.innerHTML = "";

  const start =
    new Date(baseDate);

  start.setDate(
    baseDate.getDate() - baseDate.getDay()
  );

  document.getElementById("weekTitle")
    .innerText = "週間表示";

  for(let i=0; i<7; i++){

    const date =
      new Date(start);

    date.setDate(start.getDate()+i);

    const div =
      document.createElement("div");

    div.className =
      "week-day";

    div.innerHTML = `
      <strong>
      ${date.getMonth()+1}/${date.getDate()}
      (${weekNames[date.getDay()]})
      </strong>

      <hr>

      予定なし
    `;

    container.appendChild(div);

  }

}


/* 月間表示 */

function renderMonth(baseDate){

  const container =
    document.getElementById("monthContainer");

  container.innerHTML = "";

  const year =
    baseDate.getFullYear();

  const month =
    baseDate.getMonth();

  const lastDate =
    new Date(year,month+1,0).getDate();

  document.getElementById("monthTitle")
    .innerText =
      `${year}年 ${month+1}月`;

  for(let d=1; d<=lastDate; d++){

    const date =
      new Date(year,month,d);

    const row =
      document.createElement("div");

    row.className =
      "month-row";

    row.innerHTML = `

      <div class="month-date">

        ${month+1}/${d}
        (${weekNames[date.getDay()]})

      </div>

      <div class="month-events">

        予定なし

      </div>

    `;

    container.appendChild(row);

  }

}


/* 初期表示 */

window.onload = function(){

  renderProducts();

  loadViews();

};
