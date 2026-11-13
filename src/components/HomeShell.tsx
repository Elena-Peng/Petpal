import Frame332254 from "@/views/Frame332254";
import PetSwitcher from "@/components/PetSwitcher";
import PaipaiEntry from "@/components/PaipaiEntry";
import ArchiveEntry from "@/components/ArchiveEntry";
import ScienceEntry from "@/components/ScienceEntry";
import CommunityEntry from "@/components/CommunityEntry";
import ServiceEntry from "@/components/ServiceEntry";
import MineEntry from "@/components/MineEntry";
import BottomNav from "@/components/BottomNav";
import "@/styles/home-adapt.css";

// 首页外壳：全屏浅绿渐变背景 + 内容列居中 + 整页纵向滚动；切换器/派派入口挂在外壳层
// AI 悬浮球已上移到路由层（router/index.tsx），任何页面都会显示
export default function HomeShell() {
  return (
    <div className="home-stage">
      <div className="home-canvas">
        <Frame332254 />
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
