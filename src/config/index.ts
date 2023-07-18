export default () => ({
  db: {
    url: process.env.DATABASE_URL,
  },
  app: {
    defaultUserAgent: process.env.DEFAULT_USER_AGENT,
    userAgent: process.env.USER_AGENT,
    captchaKey: process.env.CAPTCHA_KEY,
  },
  busha: {
    baseUrl: process.env.BUSHA_BASEURL,
    referer: process.env.BUSHA_REFERER,
    origin: process.env.BUSHA_ORIGIN,
    host: process.env.BUSHA_HOST,
    authBaseUrl: process.env.BUSHA_AUTH_BASEURL,
    authReferer: process.env.BUSHA_AUTH_REFERER,
    authHost: process.env.BUSHA_AUTH_HOST,
    authOrigin: process.env.BUSHA_AUTH_ORIGIN,
    authEmail: process.env.BUSHA_AUTH_EMAIL,
    authPassword: process.env.BUSHA_AUTH_PASSWORD,
    siteKey: process.env.BUSHA_SITE_KEY,
    captchaPageUrl: process.env.BUSHA_CAPTCHA_PAGE_URL,
  },
});
