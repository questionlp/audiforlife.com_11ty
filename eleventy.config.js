import { DateTime } from 'luxon';
import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
// import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginFilters from "./_config/filters.js";
import tagList from "./_config/getTagList.js";
import "dotenv/config";
import _ from "lodash";
import { execSync } from 'child_process';

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
    // Drafts, see also _data/eleventyDataSchema.js
    eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
        if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
            return false;
        }
    });

    // Copy the contents of the `public` folder to the output folder
    // For example, `./public/css/` ends up in `_site/css/`
    eleventyConfig
        .addPassthroughCopy({ "./public/": "/" })
        .addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

    // Run Eleventy when these files change:
    // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

    // Watch images for the image pipeline.
    eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

    // Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
    // Adds the {% css %} paired shortcode
    eleventyConfig.addBundle("css", {
        toFileDirectory: "dist",
    });
    // Adds the {% js %} paired shortcode
    eleventyConfig.addBundle("js", {
        toFileDirectory: "dist",
    });

    eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

    eleventyConfig.addFilter('readableDate', (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
            'dd LLL yyyy'
        );
    });

    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
    });

    eleventyConfig.addFilter('getCurrentYear', () => {
        return new Date().getFullYear();
    });

    eleventyConfig.addCollection('tagList', tagList);

    // Year collection
    eleventyConfig.addCollection('postsByYear', (collection) => {
        return _.chain(collection.getAllSorted())
            .filter((item) => 'tags' in item.data && item.data.tags.includes('posts'))
            .groupBy((post) => post.date.getFullYear())
            .toPairs()
            .reverse()
            .value();
    });

    // Year / Month collection
    eleventyConfig.addCollection('postsByYearMonth', (collection) => {
        return _.chain(collection.getAllSorted())
            .filter((item) => 'tags' in item.data && item.data.tags.includes('posts'))
            .groupBy((post) => {
                const year = post.date.getFullYear();
                const month = String(post.date.getMonth() + 1).padStart(2, '0');
                return `${year}/${month}`;
            })
            .toPairs()
            .reverse()
            .value();
    });

    // Based on: https://blog.tomayac.com/2024/11/02/eleventy-11ty-year-year-month-and-year-month-day-indexes/
    // Year / Month / Day collection
    eleventyConfig.addCollection('postsByYearMonthDay', (collection) => {
        return _.chain(collection.getAllSorted())
            .filter((item) => 'tags' in item.data && item.data.tags.includes('posts'))
            .groupBy((post) => {
                const year = post.date.getFullYear();
                const month = String(post.date.getMonth() + 1).padStart(2, '0');
                const day = String(post.date.getDate()).padStart(2, '0');
                return `${year}/${month}/${day}`;
            })
            .toPairs()
            .reverse()
            .value();
    });

    // Helper filter to format month names
    eleventyConfig.addFilter('monthName', (monthNum) => {
        const date = new Date(2000, parseInt(monthNum) - 1, 1);
        return date.toLocaleString('en-US', { month: 'long' });
    });

    // Helper filters for parsing date parts
    eleventyConfig.addFilter('getYear', (dateStr) => dateStr.split('/')[0]);
    eleventyConfig.addFilter('getMonth', (dateStr) => dateStr.split('/')[1]);
    eleventyConfig.addFilter('getDay', (dateStr) => dateStr.split('/')[2]);


    // Official plugins
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        preAttributes: { tabindex: 0 }
    });
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

    eleventyConfig.addPlugin(feedPlugin, {
        type: "atom", // or "rss", "json"
        outputPath: "/feed/feed.xml",
        stylesheet: "pretty-atom-feed.xsl",
        templateData: {
            eleventyNavigation: {
                key: "Feed",
                order: 4
            }
        },
        collection: {
            name: "posts",
            // limit: 10,
        },
        metadata: {
            language: "en",
            title: "blog.wwdt.me",
            subtitle: "Wait Wait Stats Project Development Blog Archive",
            base: "https://blog.wwdt.me/",
            author: {
                name: "Linh Pham"
            }
        }
    });

    eleventyConfig.setFrontMatterParsingOptions({
        excerpt: true,
        excerpt_separator: "<!--more-->",
    });

    // Filters
    eleventyConfig.addPlugin(pluginFilters);

    // eleventyConfig.addPlugin(IdAttributePlugin, {
    // by default we use Eleventy’s built-in `slugify` filter:
    // slugify: eleventyConfig.getFilter("slugify"),
    // selector: "h1,h2,h3,h4,h5,h6", // default
    // });

    eleventyConfig.addShortcode("currentBuildDate", () => {
        return (new Date()).toISOString();
    });

    eleventyConfig.addShortcode("copyrightDate", () => `2010&ndash;${new Date().getFullYear()}`);

    eleventyConfig.on('eleventy.after', () => {
        execSync(`npx pagefind --site _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
    })

    // Features to make your build faster (when you need them)

    // If your passthrough copy gets heavy and cumbersome, add this line
    // to emulate the file copy on the dev server. Learn more:
    // https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

    // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
        "md",
        "njk",
        "html",
        "liquid",
        "11ty.js",
    ],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // These are all optional:
    dir: {
        input: "content",          // default: "."
        includes: "../_includes",  // default: "_includes" (`input` relative)
        data: "../_data",          // default: "_data" (`input` relative)
        output: "_site"
    },

    // -----------------------------------------------------------------
    // Optional items:
    // -----------------------------------------------------------------

    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

    // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
    // it will transform any absolute URLs in your HTML to include this
    // folder name and does **not** affect where things go in the output folder.

    // pathPrefix: "/",
};
