import FrameLulu from "@/views/FrameLulu";
import PetSwitcher from "@/components/PetSwitcher";
import PaipaiEntry from "@/components/PaipaiEntry";
import ArchiveEntry from "@/components/ArchiveEntry";
import ScienceEntry from "@/components/ScienceEntry";
import CommunityEntry from "@/components/CommunityEntry";
import ServiceEntry from "@/components/ServiceEntry";
import MineEntry from "@/components/MineEntry";
import BottomNav from "@/components/BottomNav";
import "@/styles/home-adapt.css";

// 首页-露露外壳：复用啾啾首页的手机屏容器/渐变/贴底导航标准，仅替换视图
// AI 悬浮球已上移到路由层（router/index.tsx）
export default function HomeLuluShell() {
  return (
    <div className="home-stage">
      <div className="home-canvas">
        <FrameLulu />
      </div>
      <PetSwitcher />
      <PaipaiEntry />
      <ArchiveEntry />
      <ScienceEntry />
      <CommunityEntry />
      <ServiceEntry />
      <MineEntry />
      <BottomNav />
      </div>
  );
}
