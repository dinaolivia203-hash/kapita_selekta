(function () {
  "use strict";

  var quote = document.getElementById("principalQuote");
  var more = document.getElementById("principalReadMore");

  if (!quote || !more) return;

  function toggleReadMore() {
    var expanded = quote.classList.toggle("is-expanded");
    more.setAttribute("aria-expanded", String(expanded));
    more.textContent = expanded ? "Tutup" : "Baca Selengkapnya";
  }

  more.addEventListener("click", toggleReadMore);
  more.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleReadMore();
    }
  });
})();
