import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

// Home page copy, one YAML file per locale under src/content/home/.
// Editing copy means editing one small YAML file, never TypeScript:
// a missing field or a mistyped value fails the build instead of
// shipping a blank section. Shared, language-independent data such as
// link URLs and icon filenames stays in src/data/site.ts.

const textPart = z.object({
  text: z.string(),
  strong: z.boolean().optional(),
  class: z.string().optional(),
  id: z.string().optional(),
});

const home = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/home" }),
  schema: z.object({
    lang: z.string(),
    title: z.string(),
    description: z.string(),
    ogDescription: z.string(),
    ogImageAlt: z.string(),
    ogSiteName: z.string(),
    jsonLdName: z.string(),
    languageLabel: z.string(),
    avatarAlt: z.string(),
    slogan: z.string(),
    intro: z.object({
      greeting: z.string(),
      greetingMorning: z.string(),
      greetingAfternoon: z.string(),
      greetingEvening: z.string(),
      greetingNight: z.string(),
      greetingMidnight: z.string(),
      greetingOnOwnLine: z.boolean(),
      line1: z.string(),
      line2: z.string(),
      alternateName: z.string(),
      alternateSuffix: z.string(),
      line5: z.string(),
    }),
    aboutHeading: z.string(),
    quickLinksHeading: z.string(),
    mediaHeading: z.string(),
    aboutCards: z.array(
      z.object({
        title: z.string(),
        lines: z.array(z.array(textPart)),
      }),
    ),
    aboutLink: z.string(),
    quickLinkClasses: z.object({
      about: z.string(),
      homepage: z.string(),
      aqa: z.string(),
    }),
    linksHeading: z.string(),
    websitesHeading: z.string(),
    socialHeading: z.string(),
    websiteTitle: z.string(),
    aqaTitle: z.string(),
    footerTitle: z.string(),
    imageCredit: z.string(),
    versionLabel: z.string(),
    shareLabel: z.string(),
    websiteIconAlt: z.string(),
    homepageIconAlt: z.string(),
  }),
});

// Inspiration section, one single YAML file: src/content/inspiration.yaml.
// Adding an image or a YouTube embed means appending one small block to
// that file; the items are language-independent except alt / caption,
// which may be a plain string or a per-locale object.

const localizedText = z.union([
  z.string(),
  z.object({
    "zh-tw": z.string().optional(),
    en: z.string().optional(),
    ja: z.string().optional(),
  }),
]);

const inspiration = defineCollection({
  loader: file("src/content/inspiration.yaml"),
  schema: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("image"),
      src: z.string(),
      srcDesktop: z.string().optional(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
      href: z.string().optional(),
      alt: localizedText,
      caption: localizedText.optional(),
    }),
    z.object({
      type: z.literal("youtube"),
      videoId: z.string(),
      title: z.string(),
      caption: localizedText.optional(),
      posterQuality: z
        .enum(["default", "mqdefault", "hqdefault", "sddefault", "maxresdefault"])
        .optional(),
    }),
  ]),
});

export const collections = { home, inspiration };
