import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// 全局错误边界：任一页面渲染抛错时降级到兜底 UI，避免整应用白屏。
// 注意：本边界包裹在 Router 外层，降级视图不在 Router 上下文内，
// 因此返回首页使用 location 跳转，不能调用 useNavigate/Link（会二次抛错）。
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 保留原始错误日志，便于后续定位组件栈
    console.error("[ErrorBoundary] 页面渲染异常:", error, info);
  }

  // 开发期热更新后自动重试一次：避免一次 HMR 中间态抛错把页面永久锁在兜底视图
  componentDidMount() {
    if (import.meta.hot) import.meta.hot.on("vite:afterUpdate", this.reset);
  }

  componentWillUnmount() {
    if (import.meta.hot) import.meta.hot.off("vite:afterUpdate", this.reset);
  }

  reset = () => {
    if (this.state.hasError) this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <FallbackUI onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

// 降级视图：纯 DOM + location 跳转，不依赖 Router 上下文。
const FallbackUI = ({ onRetry }: { onRetry: () => void }) => {
  const goHome = () => {
    window.location.assign(import.meta.env.BASE_URL);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        fontFamily: "inherit",
        color: "#1f6d2e",
        background: "#f5f7f5",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600 }}>页面出错了</div>
      <div style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
        页面遇到一点问题，可先重试；仍不行就返回首页。
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: "10px 24px",
            borderRadius: 12,
            border: "1px solid #1f6d2e",
            background: "#fff",
            color: "#1f6d2e",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          重试
        </button>
        <button
          type="button"
          onClick={goHome}
          style={{
            padding: "10px 24px",
            borderRadius: 12,
            border: "none",
            background: "#1f6d2e",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          返回首页
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;
