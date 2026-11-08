function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return Promise.resolve(copied);
}

document.querySelectorAll("[data-id]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("data-id");
    if (!id) return;

    event.preventDefault();
    copyText(id).then((copied) => {
      window.alert(copied ? `已複製 ${link.getAttribute("data-label") || "帳號"}！` : "複製失敗，請手動複製。 ");
    });
  });
});

function updateTime() {
  const element = document.getElementById("aiixi-time");
  if (!element) return;

  const locale = document.documentElement.lang || "zh-TW";
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Taipei",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  element.textContent = formatter.format(new Date());
}

updateTime();
