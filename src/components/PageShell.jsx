import Sidebar from "./Sidebar";
import "./PageShell.css";

export default function PageShell({ activePage, bottomCard, children }) {
  return (
    <>
      <div className="page-shell-desktop">
        <Sidebar activePage={activePage} {...bottomCard} />
        <div className="page-shell-desktop__content">{children}</div>
      </div>
      <div className="page-shell-compact">{children}</div>
    </>
  );
}
