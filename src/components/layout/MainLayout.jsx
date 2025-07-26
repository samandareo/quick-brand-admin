import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="">
        <Sidebar />
        <div className="pl-24 md:pl-64 flex flex-col overflow-auto">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mt-24 mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
