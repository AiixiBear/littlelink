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
  element.textContent = "⏰ \u00B7 " + formatter.format(new Date());
}

updateTime();

function getGreetingPeriod(hour) {
  // 深夜報時提醒：23:00 ~ 04:59
  if (hour >= 23 || hour < 5) return "midnight";

  // 早晨：05:00 ~ 10:59
  if (hour < 11) return "morning";

  // 午後：11:00 ~ 16:59
  if (hour < 17) return "afternoon";

  // 傍晚 / 晚上：17:00 ~ 21:59
  if (hour < 22) return "evening";

  // 深夜關懷：22:00 ~ 22:59
  return "night";
}

function updateGreeting() {
  const element = document.getElementById("profile-greeting");
  if (!element) return;

  const hour = new Date().getHours();
  const period = getGreetingPeriod(hour);
  // 取得對應時段的問候語，若無 midnight 則降級使用 night
  const rawGreeting = element.dataset[`greeting${period[0].toUpperCase()}${period.slice(1)}`] 
    || element.dataset.greetingNight;

  if (!rawGreeting) {
    throw new Error(`Missing ${period} greeting for the current locale`);
  }

  // 顯示 12 小時制數字（如 0 點顯示為 12 點），若喜歡 24 小時制可保持 String(hour)
  const displayHour = String(hour);
  element.textContent = rawGreeting.replace("{hour}", displayHour);
}

updateGreeting();
window.setInterval(updateGreeting, 60_000);
