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

function showPage(pageId){

  document
    .querySelectorAll(".page")
    .forEach(page=>{

      page.classList.remove("active");
loadViews();
