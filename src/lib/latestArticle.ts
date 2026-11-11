// Fetches the latest article from the Aiixi Bear blog RSS feed at build
// time, so the card is rendered into the HTML instead of being filled in
// by client-side JavaScript. Any failure returns null and the card is
// simply omitted; a broken or slow feed must never break the build.

export interface LatestArticle {
  title: string;
  description: string;
  href: string;
  coverHref?: string;
  publishedAt: Date;
}

const TRUSTED_HOSTS = ["aiixi.cc", "www.aiixi.cc"];

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
  };
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => named[name] ?? match);
}

function tagValue(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!match) return undefined;
  const raw = match[1].trim().replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1");
  return decodeEntities(raw).trim();
}

function trustedHttpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !TRUSTED_HOSTS.includes(url.hostname)) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

export async function getLatestArticle(locale: string): Promise<LatestArticle | null> {
  // Matches the previous client-side behaviour: only the English page
  // reads the English feed, every other locale reads the default feed.
  const feedPath = locale === "en" ? "/en/index.xml" : "/index.xml";
  try {
    const response = await fetch(`https://www.aiixi.cc${feedPath}`, {
      headers: { Accept: "application/rss+xml, application/xml" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.warn(`Latest article: RSS request failed with status ${response.status}`);
      return null;
    }
    const xml = await response.text();
    const item = xml.match(/<item>([\s\S]*?)<\/item>/)?.[1];
    if (!item) {
      console.warn("Latest article: RSS feed contains no articles");
      return null;
    }
    const title = tagValue(item, "title");
    const description = tagValue(item, "description");
    const pubDate = tagValue(item, "pubDate");
    const href = trustedHttpsUrl(tagValue(item, "link"));
    const coverHref = trustedHttpsUrl(
      item.match(/<media:content[^>]*url="([^"]+)"/)?.[1],
    );
    if (!title || !description || !pubDate || !href) {
      console.warn("Latest article: first RSS item is missing title, description, date, or link");
      return null;
    }
    const publishedAt = new Date(pubDate);
    if (Number.isNaN(publishedAt.getTime())) {
      console.warn("Latest article: first RSS item has an invalid publication date");
      return null;
    }
    return { title, description, href, coverHref, publishedAt };
  } catch (error) {
    console.warn("Latest article: failed to fetch the RSS feed, omitting the card:", error);
    return null;
  }
}
