/* 工程マスタ */

const processMaster = {

  "A100":[

    "荒①",
    "仕上①",
    "荒②",
    "仕上②",
    "洗浄・出荷"

  ],

  "B200":[

    "切削",
    "検査",
    "洗浄"

  ]

};


/* 製品 */

let products = [];


/* 登録 */

function registerProduct(){

  const serial =
    document
      .getElementById("serialInput")
      .value;

  if(!serial){

    alert("シリアル入力");

    return;

  }

  /* 仮図番 */

  const drawing =
    "A100";

  const processes =
    processMaster[drawing]
      .map(name=>({

        name,
        status:"waiting"

      }));

  products.push({

    drawing,
    serial,
    processes

  });

  document
    .getElementById("serialInput")
    .value = "";

  renderProducts();

}


/* 描画 */

function renderProducts(){

  const list =
    document
      .getElementById("productList");

  list.innerHTML = "";

  products.forEach(
    (product,productIndex)=>{

    const card =
      document
        .createElement("div");

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
            changeStatus(
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

      <div class="product-header">

        <div class="drawing">

          ${product.drawing}

        </div>

        <div class="serial">

          ${product.serial}

        </div>

      </div>

      <div class="process-row">

        ${processHTML}

      </div>

    `;

    list.appendChild(card);

  });

}


/* 状態変更 */

function changeStatus(
  productIndex,
  processIndex
){

  const proc =
    products[productIndex]
      .processes[processIndex];

  switch(proc.status){

    case "waiting":

      proc.status =
        "processing";

      break;

    case "processing":

      proc.status =
        "stop";

      break;

    case "stop":

      proc.status =
        "complete";

      break;

    case "complete":

      proc.status =
        "waiting";

      break;

  }

  renderProducts();

}
