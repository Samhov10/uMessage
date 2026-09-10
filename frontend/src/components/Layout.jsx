import Sidebar from "./Sidebar.jsx";
import { Navbar } from "./Navbar.jsx";

const Layout = ({
  children,
  showSidebar = false,
  theme,
  setTheme,
}) => {
  return (
    <div className="h-screen w-full overflow-hidden bg-base-100">
      <div className="flex h-full w-full min-h-0">

        {showSidebar && (
          <div className="shrink-0 h-full">
            <Sidebar />
          </div>
        )}

        <div
          className="
            flex
            flex-1
            flex-col
            min-w-0
            min-h-0
            overflow-hidden
          "
        >
          <div className="shrink-0">
            <Navbar
              showLogo={!showSidebar}
              theme={theme}
              setTheme={setTheme}
            />
          </div>

          <main
            className="
              flex-1
              min-h-0
              min-w-0
              overflow-hidden
            "
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;