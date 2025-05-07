//@ts-check
window.addEventListener("load", (event) => {
  const dropdownEl = document.getElementById("active-comparison");
  dropdownEl.addEventListener("change", (e) => {
    console.log({ newValue: e.target.value });
    const handle = e.target.value;
    const tableEl = document.getElementById("comparison-dropdown-table");
    const elementsToHide = tableEl.querySelectorAll(
      `td:not([data-handle='${handle}']),th:not([data-handle='${handle}'])`,
    );
    const elementsToShow = tableEl.querySelectorAll(
      `td[data-handle='${handle}'],th[data-handle='${handle}']`,
    );
    const isCurrentProduct = (handle) =>
      window.location.pathname.includes(handle);

    console.log({ elementsToHide });
    for (const element of elementsToShow) {
      element.classList.remove("hide");
    }

    for (const element of elementsToHide) {
      const isFirstColumn = !element.dataset.handle;
      if (isFirstColumn) {
        continue;
      }
      element.classList.add("hide");
    }
  });
});
