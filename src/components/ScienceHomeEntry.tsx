import { useEffect } from "react";
import { useNavigate } from "react-router";

// 科普页底部导航「首页」入口：首页图标(#2_459) + 首页文字(#2_431) 点击回到首页-啾啾 /
// 捕获阶段拦截，阻止 Bar 内原有占位 onClick(navigate("")) 生效
export default function ScienceHomeEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    const els: HTMLElement[] = [];
    const icon = document.getElementById("2_459");
    if (icon) els.push(icon);
    const text = document.getElementById("2_431");
    if (text) els.push(text);

    const handler = (e: MouseEvent) => {
      e.stopPropagation();
      navigate("/");
    };
    els.forEach((el) => el.addEventListener("click", handler, true));
    return () => els.forEach((el) => el.removeEventListener("click", handler, true));
  }, [navigate]);

  return null;
}
