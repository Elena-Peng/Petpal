import { useEffect } from "react";
import { useNavigate } from "react-router";

// 首页「今日状态 · 全部记录」入口：三页共用 #332_372，统一绑定进入宠物档案页
const TARGET_IDS = ["332_372"];

export default function ArchiveEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    const els = TARGET_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const handler = (e: MouseEvent) => {
      e.stopPropagation();
      navigate("/archive");
    };
    els.forEach((el) => el.addEventListener("click", handler, true));
    return () => els.forEach((el) => el.removeEventListener("click", handler, true));
  }, [navigate]);

  return null;
}
