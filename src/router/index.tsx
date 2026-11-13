import RouterViewContext from "./components/StaticWrapper";
import AiFloatButton from "@/components/AiFloatButton";

import {
  BrowserRouter as Router,
} from "react-router";

// 部署在子路径 /petpal/ 下时，路由需以该前缀为基准
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");

export const RouterView = () => {
  return (
    <Router basename={BASENAME}>
      <RouterViewContext />
      {/* AI 侧边栏挂在路由层，任何页面都可见；社区/服务/我的展开后带消息与购物车 */}
      <AiFloatButton />
    </Router>
  );
};
