import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../shared/NotificationBell";
import ChatNotification from "../chat/ChatNotification";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b fixed w-full">
      <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-primary">
            {/* Admin Panel */}
            <img src="/logo.jpeg" alt="logo" className="h-14 w-auto rounded" />
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          
          <Link to="/chat" className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150">
            <ChatNotification />
          </Link>
          <NotificationBell />
          <Link to={"settings"} className="flex items-center space-x-4">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || "Admin"}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
