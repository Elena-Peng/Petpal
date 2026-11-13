import { useEffect } from "react";
import { useNavigate } from "react-router";

// 首页底部导航「社区」入口：社区图标(.Pixso-rectangle-2_460) + 社区文字 点击进入社区-推荐页
export default function CommunityEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    const els: HTMLElement[] = [];
    // 图标：第三列爪印
    document
      .querySelectorAll(".Pixso-rectangle-2_460")
      .forEach((el) => els.push(el as HTMLElement));
    // 文字：第三列「社区」（首页 slot 渲染为 431_121，兜底默认 id 2_433）
    const textById = document.getElementById("431_121");
    if (textById) els.push(textById);
    document
      .querySelectorAll(".Pixso-paragraph-431_121")
      .forEach((el) => els.push(el as HTMLElement));
    const textFallback = document.getElementById("2_433");
    if (textFallback) els.push(textFallback);
    document
      .querySelectorAll(".Pixso-paragraph-2_433")
      .forEach((el) => els.push(el as HTMLElement));

    const handler = (e: MouseEvent) => {
      e.stopPropagation();
      navigate("/community");
    };
    els.forEach((el) => el.addEventListener("click", handler, true));
    return () => els.forEach((el) => el.removeEventListener("click", handler, true));
  }, [navigate]);

  return null;
}
