import { useEffect } from "react";
import { useNavigate } from "react-router";

// 底部导航「我的」入口：热区(.Pixso-rectangle-4_3) + 文字(2_435) → /mine
export default function MineEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    const els: HTMLElement[] = [];
    document
      .querySelectorAll(".Pixso-rectangle-4_3")
      .forEach((el) => els.push(el as HTMLElement));
    const text = document.getElementById("2_435");
    if (text) els.push(text);
    document
      .querySelectorAll(".Pixso-paragraph-2_435")
      .forEach((el) => els.push(el as HTMLElement));

    const handler = (e: MouseEvent) => {
      e.stopPropagation();
      navigate("/mine");
    };
    els.forEach((el) => el.addEventListener("click", handler, true));
    return () => els.forEach((el) => el.removeEventListener("click", handler, true));
  }, [navigate]);

  return null;
}
