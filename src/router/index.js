import { createRouter, createWebHistory } from "vue-router";
import { useLoginStore } from "@/stores/login";
import i18n from "@/plugins/i18n";
import { setLocale } from "@/plugins/i18n";

// 1) БАЗОВЫЕ (RU, без префикса)
const baseRoutes = [
  { path: "/", redirect: "/offer" },
  // Форвардер входа (Вариант 1): /login?redirect=/app/partner/{id}?...
  {
    path: "/login",
    name: "Login",
    meta: { public: true },
    component: () => import("@/views/login/index.vue"),
  },
  // Точка входа WebView: SSO-автологин или гостевой режим
  {
    path: "/app/partner/:partner_id",
    name: "PartnerEntry",
    meta: { public: true },
    component: () => import("@/views/partner/index.vue"),
  },
  {
    path: "/offer",
    name: "OfferAll",
    component: () => import("@/views/offer/[slug].vue"),
  },
  {
    path: "/offer/:slug",
    name: "OfferByCategory",
    component: () => import("@/views/offer/category/[slug].vue"),
  },
  {
    path: "/offer/:slug/:slug",
    name: "OfferMerchantDetail",
    component: () => import("@/views/offer/[slug]/[slug].vue"),
  },
  {
    path: "/certificates",
    name: "certificates",
    meta: { requiresAuth: true },
    component: () => import("@/views/certificates/index.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    meta: { requiresAuth: true, demoBlocked: true },
    component: () => import("@/views/profile/index.vue"),
  },
  {
    path: "/profile/detail-info",
    name: "profile/detail-info",
    meta: { requiresAuth: true, demoBlocked: true },
    component: () => import("@/views/profile/detail-info.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("@/views/search/index.vue"),
  },
  {
    path: "/:slug",
    name: "DynamicPage",
    meta: { guest: true },
    component: () => import("@/views/[slug].vue"),
  },
  {
    path: "/favorites",
    name: "Favorites",
    meta: { requiresAuth: true },
    component: () => import("@/views/favorites/index.vue"),
  },

  // 404: оставим одну явную страницу + catch-all с разными именами
  {
    path: "/404",
    name: "404-explicit",
    component: () => import("@/views/404.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "404",
    component: () => import("@/views/404.vue"),
  },
];

// 2) Утилита: префиксируем все пути
function withLocalePrefix(routes, locale) {
  const prefix = `/${locale}`;
  return [
    // редирект /uz -> /uz/offer
    { path: `/${locale}`, redirect: `${prefix}/offer` },

    ...routes
      .map((r) => {
        // для корня "/" не дублируем (у нас выше отдельный редирект)
        if (r.path === "/") return null;

        // не трогаем компонент/мету; клонируем путь и имя
        const path = r.path.startsWith("/")
          ? prefix + r.path
          : `${prefix}/${r.path}`;
        return {
          ...r,
          path,
          name: r.name ? `${r.name}-uz` : undefined,
          meta: { ...(r.meta || {}), locale },
        };
      })
      .filter(Boolean),
  ];
}

// 3) Собираем финальные маршруты
const routes = [
  // RU как дефолт (пометим метой)
  ...baseRoutes.map((r) => ({
    ...r,
    meta: { ...(r.meta || {}), locale: "ru" },
  })),
  // UZ c префиксом
  ...withLocalePrefix(baseRoutes, "uz"),
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

// 4) Guard: локаль (по параметру lang или префиксу /uz) + защита приватных роутов.
//    Гостевой режим: публичные разделы витрины открыты без токена;
//    только meta.requiresAuth требует авторизации.
router.beforeEach(async (to, from, next) => {
  const isUz = to.path.startsWith("/uz");
  const langParam = to.query.lang;
  const targetLocale =
    langParam === "uz" || langParam === "ru"
      ? langParam
      : isUz
      ? "uz"
      : "ru";

  if (i18n.global.locale.value !== targetLocale) {
    setLocale(targetLocale);
  }

  const loginStore = useLoginStore();
  const token = loginStore.token;

  // Приватные разделы недоступны гостю — уводим на витрину
  if (to.meta.requiresAuth && !token) {
    next(isUz ? "/uz/offer" : "/offer");
    return;
  }

  // Разделы, закрытые для демо-пользователя (например, профиль)
  if (to.meta.demoBlocked && loginStore.isDemo) {
    next(isUz ? "/uz/offer" : "/offer");
    return;
  }

  if (to.meta.requiresAuth && token) {
    loginStore.checkAuthToken(router);
  }

  next();
});

export default router;
