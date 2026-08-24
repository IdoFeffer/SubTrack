import Sidebar from "./Sidebar";

export default function PageShell({ activePage, bottomCard, children }) {
  return (
    <>
      <div className="hidden lg:grid min-h-screen w-full" style={{ gridTemplateColumns: "250px 1fr" }}>
        <Sidebar activePage={activePage} {...bottomCard} />
        <div className="relative min-h-screen bg-[linear-gradient(180deg,#faf5ff,#fdf2f8)] px-[34px] py-[30px] flex flex-col gap-[22px]">
          {children}
        </div>
      </div>
      <div className="lg:hidden min-h-screen bg-[linear-gradient(180deg,#faf5ff,#fdf2f8)] px-5 py-6 flex flex-col gap-5 overflow-x-hidden">
        {children}
      </div>
    </>
  );
}
