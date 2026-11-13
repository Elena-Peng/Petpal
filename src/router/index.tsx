import RouterViewContext from "./components/StaticWrapper";
import AiFloatButton from "@/components/AiFloatButton";

import {
  BrowserRouter as Router,
} from "react-router";

export const RouterView = () => {
  return (
    <Router>
      <RouterViewContext />
      {/* AI 侧边栏挂在路由层，任何页面都可见；社区/服务/我的展开后带消息与购物车 */}
      <AiFloatButton />
    </Router>
  );
};
