import { DateTime } from "luxon";

export default function(eleventyConfig) {
    eleventyConfig.addFilter("readableDateTime", (dateObj, format, zone) => {
        // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
        return DateTime.fromJSDate(dateObj, { zone: zone || "America/Los_Angeles" }).toFormat(format || "dd MMMM yyyy hh:mm ZZZZ");
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
    });

    eleventyConfig.addFilter("isoDateString", (dateObj) => {
        // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
    });

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if(!Array.isArray(array) || array.length === 0) {
            return [];
        }
        if( n < 0 ) {
            return array.slice(n);
        }

        return array.slice(0, n);
    });

    // Return the smallest number argument
    eleventyConfig.addFilter("min", (...numbers) => {
        return Math.min.apply(null, numbers);
    });

    // Return the keys used in an object
    eleventyConfig.addFilter("getKeys", target => {
        return Object.keys(target).sort();
    });

    eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
        return (tags || []).filter(tag => ["all", "posts", "postsByYear", "postsByYearMonth", "postsByYearMonthDay"].indexOf(tag) === -1);
    });

    eleventyConfig
        .addFilter('postTags', tags => Object.keys(tags)
            .filter(k => k !== "posts")
            .filter(k => k !== "all")
            .filter(k => k !== "postsByYear")
            .filter(k => k !== "postsByYearMonth")
            .filter(k => k !== "postsByYearMonthDay")
            .map(k => ({ name: k, count: tags[k].length }))
            .sort((a, b) => b.count - a.count));

    eleventyConfig.addFilter("filterCategoryList", function filterCategoryList(categories) {
        return (categories || []).filter(category => ["all", "posts", "postsByYear", "postsByYearMonth", "postsByYearMonthDay"].indexOf(category) === -1);
    });
};
