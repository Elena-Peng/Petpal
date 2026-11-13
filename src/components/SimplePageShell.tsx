import { useNavigate } from "react-router";
import "@/styles/service.css";
import "@/styles/simple.css";

type Props = {
  title: string;
  children?: React.ReactNode;
};

export default function SimplePageShell({ title, children }: Props) {
  const navigate = useNavigate();
  return (
    <div className="sv-stage">
      <div className="sv-canvas simple-canvas">
        <header className="simple-head">
          <button className="simple-back" onClick={() => navigate(-1)} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="simple-title">{title}</h1>
        </header>
        <div className="simple-body">{children}</div>
      </div>
    </div>
  );
}
