const products = [

  }

}

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
    .innerText = `${year}年 ${month+1}月`;

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

renderProducts();

loadViews();
