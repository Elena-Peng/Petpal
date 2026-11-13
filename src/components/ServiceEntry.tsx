import { useEffect } from "react";
import { useNavigate } from "react-router";

// 底部导航「服务」入口：服务图标热区(.Pixso-rectangle-2_474) + 服务文字(2_434) → /service
export default function ServiceEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    const els: HTMLElement[] = [];
    document
      .querySelectorAll(".Pixso-rectangle-2_474")
      .forEach((el) => els.push(el as HTMLElement));
    const text = document.getElementById("2_434");
    if (text) els.push(text);
    document
      .querySelectorAll(".Pixso-paragraph-2_434")
      .forEach((el) => els.push(el as HTMLElement));

    const handler = (e: MouseEvent) => {
      e.stopPropagation();
      navigate("/service");
    };
    els.forEach((el) => el.addEventListener("click", handler, true));
    return () => els.forEach((el) => el.removeEventListener("click", handler, true));
  }, [navigate]);

  return null;
}
