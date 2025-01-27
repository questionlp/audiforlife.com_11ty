export default function () {
    return {
        google: {
            id: process.env.GOOGLE_ANALYTICS_ID || null
        },
        umami: {
            url: process.env.UMAMI_ANALYTICS_URL || null,
            website_id: process.env.UMAMI_ANALYTICS_WEBSITE_ID || null,
            domains: process.env.UMAMI_ANALYTICS_DOMAINS || null
        }
    };
}
