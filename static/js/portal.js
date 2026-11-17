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

async function loadLatestArticle() {
  const card = document.getElementById("latest-article");
  if (!card) return;

  const feedPath = document.documentElement.lang.toLowerCase().startsWith("en")
    ? "/en/index.xml"
    : "/index.xml";
  const response = await fetch(`https://www.aiixi.cc${feedPath}`, {
    headers: { Accept: "application/rss+xml, application/xml" },
  });
  if (!response.ok) {
    throw new Error(`RSS request failed with status ${response.status}`);
  }

  const xml = new DOMParser().parseFromString(await response.text(), "application/xml");
  if (xml.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Unable to parse the latest-article RSS feed");
  }

  const item = xml.getElementsByTagName("item").item(0);
  if (!item) {
    throw new Error("The latest-article RSS feed contains no articles");
  }

  const title = item.getElementsByTagName("title").item(0)?.textContent?.trim();
  const description = item.getElementsByTagName("description").item(0)?.textContent?.trim();
  const pubDate = item.getElementsByTagName("pubDate").item(0)?.textContent?.trim();
  const articleHref = item.getElementsByTagName("link").item(0)?.textContent?.trim();
  const coverHref = item
    .getElementsByTagNameNS("http://search.yahoo.com/mrss/", "content")
    .item(0)
    ?.getAttribute("url");

  if (!title || !description || !pubDate || !articleHref) {
    throw new Error("The latest article is missing its title, description, publication date, or link");
  }

  const publishedAt = new Date(pubDate);
  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error("The latest article has an invalid publication date");
  }

  const articleUrl = new URL(articleHref);
  if (articleUrl.protocol !== "https:" || !["aiixi.cc", "www.aiixi.cc"].includes(articleUrl.hostname)) {
    throw new Error("The latest article link is not a trusted HTTPS URL");
  }

  const link = document.getElementById("latest-article-link");
  const image = document.getElementById("latest-article-image");
  const titleElement = document.getElementById("latest-article-title");
  const dateElement = document.getElementById("latest-article-date");
  const descriptionElement = document.getElementById("latest-article-description");
  const summary = document.getElementById("latest-article-summary");
  if (!(link instanceof HTMLAnchorElement)
    || !(image instanceof HTMLImageElement)
    || !titleElement
    || !(dateElement instanceof HTMLTimeElement)
    || !descriptionElement
    || !(summary instanceof HTMLElement)) {
    throw new Error("The latest-article card is missing required elements");
  }

  const formattedDate = new Intl.DateTimeFormat(document.documentElement.lang, {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(publishedAt);

  link.href = articleUrl.href;
  titleElement.textContent = title;
  summary.textContent = `${summary.textContent}${title} (${formattedDate})`;
  dateElement.dateTime = publishedAt.toISOString();
  dateElement.textContent = formattedDate;
  descriptionElement.textContent = description;

  if (coverHref) {
    const coverUrl = new URL(coverHref, articleUrl);
    if (coverUrl.protocol !== "https:" || !["aiixi.cc", "www.aiixi.cc"].includes(coverUrl.hostname)) {
      throw new Error("The latest article cover is not a trusted HTTPS URL");
    }
    image.src = coverUrl.href;
    image.hidden = false;
  } else {
    image.hidden = true;
  }

  card.hidden = false;
  card.parentElement?.classList.add("has-latest-article");
}

loadLatestArticle().catch((error) => {
  console.error("Unable to load the latest article:", error);
});
