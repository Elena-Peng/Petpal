import { useEffect } from "react";
import { useNavigate } from "react-router";

// 首页底部导航「科普」入口：科普图标(#4_3 / .Pixso-rectangle-4_3) + 科普文字(#431_120 / .Pixso-paragraph-431_120) 点击进入科普页
export default function ScienceEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    const els: HTMLElement[] = [];
    // 图标：第二列书本
    document
      .querySelectorAll(".Pixso-rectangle-4_3")
      .forEach((el) => els.push(el as HTMLElement));
    // 文字：第二列「科普」
    const textById = document.getElementById("431_120");
    if (textById) els.push(textById);
    document
      .querySelectorAll(".Pixso-paragraph-431_120")
      .forEach((el) => els.push(el as HTMLElement));

    const handler = (e: MouseEvent) => {
      e.stopPropagation();
      navigate("/science");
    };
    els.forEach((el) => el.addEventListener("click", handler, true));
    return () => els.forEach((el) => el.removeEventListener("click", handler, true));
  }, [navigate]);

  return null;
}
