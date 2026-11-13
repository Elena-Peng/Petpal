import { useEffect } from "react";
import { useNavigate } from "react-router";

// 首页 AI 小结卡入口：整卡 / 头像 / 右侧气泡按钮点击均进入派派页
// 三视图共用 id，统一在此绑定，无需逐个修改视图内部 onClick
const TARGET_IDS = ["332_301", "332_308", "332_309"];

export default function PaipaiEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    const els = TARGET_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const handler = (e: MouseEvent) => {
      e.stopPropagation();
      navigate("/paipai");
    };
    els.forEach((el) => el.addEventListener("click", handler, true));
    return () => els.forEach((el) => el.removeEventListener("click", handler, true));
  }, [navigate]);

  return null;
}
