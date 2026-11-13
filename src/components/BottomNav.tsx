import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

// 底部 Bar 统一跳转：5 个 Tab 热区 + 文字，点击切路由（不做高亮）
// 热区 id 与文字按钮位置对应（按实际 getBoundingClientRect 的 x 对齐）：
//   首页 2_459 (x=188) / 科普 4_3 (x=271) / 社区 2_460 (x=354) / 服务 4_4 (x=438) / 我的 2_474 (x=523)
// 文字 id：2_431 首页 / 2_432 科普 / 2_433 社区 / 2_434 服务 / 2_435 我的
const TABS: { to: string; rect: string; textId: string; paraClass: string }[] = [
  { to: "/", rect: ".Pixso-rectangle-2_459", textId: "2_431", paraClass: ".Pixso-paragraph-2_431" },
  { to: "/science", rect: ".Pixso-rectangle-4_3", textId: "2_432", paraClass: ".Pixso-paragraph-2_432" },
  { to: "/community", rect: ".Pixso-rectangle-2_460", textId: "2_433", paraClass: ".Pixso-paragraph-2_433" },
  { to: "/service", rect: ".Pixso-rectangle-4_4", textId: "2_434", paraClass: ".Pixso-paragraph-2_434" },
  { to: "/mine", rect: ".Pixso-rectangle-2_474", textId: "2_435", paraClass: ".Pixso-paragraph-2_435" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const handlers: { el: HTMLElement; fn: (e: MouseEvent) => void }[] = [];

    TABS.forEach((tab) => {
      const els: HTMLElement[] = [];
      document.querySelectorAll(tab.rect).forEach((el) => els.push(el as HTMLElement));
      const text = document.getElementById(tab.textId);
      if (text) els.push(text);
      document.querySelectorAll(tab.paraClass).forEach((el) => els.push(el as HTMLElement));

      const fn = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (loc.pathname !== tab.to) navigate(tab.to);
      };
      els.forEach((el) => {
        el.addEventListener("click", fn, true);
        handlers.push({ el, fn });
      });
    });

    return () => handlers.forEach(({ el, fn }) => el.removeEventListener("click", fn, true));
  }, [navigate, loc.pathname]);

  return null;
}
