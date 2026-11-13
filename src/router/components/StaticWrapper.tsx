import { Route, Routes, Navigate, useLocation } from "react-router";
import { routes } from "../routes";
import { getCurrentUser } from "@/utils/userStore";

// 公开可匿名访问的路径（白名单，精确匹配）。其余路径（含 /、/mine 及子页、
// /orders、/mall/cart、/community/publish、/service/rescue-publish、
// /service/favorites、/reminders 及子页、/settings 及子页、/archive、/paipai、
// /status/log/:type 等）均为受保护页，未登录时重定向到登录页并携带
// redirect 回跳参数。注意：采用精确匹配，避免前缀把 /community/publish、
// /service/rescue-publish、/service/favorites 等受保护子页误判为公开。
const PUBLIC_PATHS = new Set([
  "/login",
  "/login/register",
  "/science",
  "/science/detail",
  "/community",
  "/community/post",
  "/community/user",
  "/service",
  "/service/category",
  "/service/detail",
  "/service/pet",
  "/service/lili",
  "/service/rescue",
  "/service/search",
  "/mall/product",
]);

// 登录态判定：兼容 legacy 标记（petpal_auth === "1"）与当前用户对象
// （petpal-auth-user，从 userStore 的 getCurrentUser() 只读读取）。两套口径
// 任一成立即视为已登录，避免“标记在但用户对象无”的误判。
function isAuthed(): boolean {
  const legacy = localStorage.getItem("petpal_auth") === "1";
  const current = getCurrentUser();
  return legacy || !!current;
}

const RouterView = () => {
  const location = useLocation();
  const authed = isAuthed();

  const isPublic = PUBLIC_PATHS.has(location.pathname);

  if (!isPublic && !authed) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return (
    <Routes location={location} key={location.pathname}>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<route.component />}
        />
      ))}
    </Routes>
  );
};

export default RouterView;
