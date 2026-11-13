import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import "@/styles/PetSwitcher.css";
import {
  getPets,
  getCurrentPet,
  setCurrentPet,
  PET_SWITCH_EVENT,
} from "@/utils/petStore";

// 首页宠物切换器（数据驱动）：绑定宠物名胶囊(id=332_322，由 HomePetCard 渲染)，
// 点击展开宠物列表，选择后写入 petpal-current-pet 并通过 pet-switch 事件刷新首页宠物卡。
export default function PetSwitcher() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const pets = getPets();
  const current = getCurrentPet();

  // 绑定宠物名胶囊点击（HomePetCard 渲染 id=332_322）
  useEffect(() => {
    const btn = document.getElementById("332_322");
    if (!btn) return;
    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const r = btn.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
      setOpen((v) => !v);
    };
    btn.addEventListener("click", onClick, true);
    return () => btn.removeEventListener("click", onClick, true);
  }, []);

  // 路由切换后自动收起
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // 点击菜单外区域收起
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) return;
      const btn = document.getElementById("332_322");
      if (btn && btn.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("click", onDoc, true);
    return () => document.removeEventListener("click", onDoc, true);
  }, [open]);

  if (!open) return null;
  if (!pets.length) return null;

  return (
    <div ref={menuRef} className="pet-switcher-menu" style={{ top: pos.top, left: pos.left }}>
      {pets.map((p) => {
        const active = current?.id === p.id;
        return (
          <button
            key={p.id}
            className={"pet-switcher-item" + (active ? " active" : "")}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPet(p.id);
              window.dispatchEvent(new CustomEvent(PET_SWITCH_EVENT));
              setOpen(false);
            }}
          >
            <span className="pet-switcher-dot" />
            <span>{p.name}</span>
            {active && <span className="pet-switcher-check">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
