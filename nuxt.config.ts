export default defineNuxtConfig({
  compatibilityDate: "2026-10-30",

  devtools: {
    enabled: true,
  },

  components: [
    {
      path: "~/components/common",
      pathPrefix: false,
    },
  ],

  css: [
    "~/assets/css/main.css",
    "~/assets/css/layout.css",
    "~/assets/css/dashboard.css",
    "~/assets/css/event-create.css",
    "~/assets/css/event-manage.css",
    "~/assets/css/guest-join.css",
    "~/assets/css/play.css",
  ],

  app: {
    head: {
      title: "EventLab",
      meta: [
        {
          name: "description",
          content: "실시간 이벤트 및 설문 플랫폼 EventLab",
        },
      ],
    },
  },
});
