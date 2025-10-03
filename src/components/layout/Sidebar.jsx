import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  CogIcon,
  ReceiptTaxIcon,
  ShoppingBagIcon,
  SpeakerphoneIcon,
  LinkIcon,
  PhotographIcon,
  BellIcon,
  ChatAltIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  BoltIcon,
} from "../icons";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeftIcon } from "../icons";
import { useNotifications } from "../../context/useNotifications";
import { useChat } from "../../context/ChatContext";

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { getTotalUnreadCount } = useChat();

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Ecommerce", href: "/ecommerce", icon: ShoppingCartIcon },
    { name: "Users", href: "/users", icon: UsersIcon },
    { name: "Transactions", href: "/transactions", icon: CreditCardIcon },
    { name: "Operators", href: "/operators", icon: SpeakerphoneIcon },
    { name: "Offers", href: "/offers", icon: ReceiptTaxIcon },
    {
      name: "Purchase Requests",
      href: "/purchase-requests",
      icon: ShoppingBagIcon,
      unreadCount,
    },
    { name: "Social Media", href: "/social-media", icon: LinkIcon },
    { name: "Image Slider", href: "/sliders", icon: PhotographIcon },
    { name: "Live Chat", href: "/chat", icon: ChatAltIcon, unreadCount: getTotalUnreadCount() },
    { name: "Manual Withdrawals", href: "/manual-withdrawals", icon: DocumentTextIcon },
    { name: "Recharge Logs", href: "/recharge-logs", icon: BoltIcon },
    { name: "Push Notifications", href: "/push-notifications", icon: BellIcon },
    { name: "Settings", href: "/settings", icon: CogIcon },
  ];


  return (
    <div className="">
      <div className="flex flex-col justify-between w-20 md:w-64 top-[90px] fixed h-[87dvh] bg-white">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md relative ${
                    isActive
                      ? "bg-primary text-white "
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-8 w-8 ${
                    location.pathname === item.href
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                <div className={`hidden md:flex`}>
                  {item.unreadCount > 0 && `(${item.unreadCount}) `}
                  {item.name}
                </div>
                {item.unreadCount > 0 && (
                  <span className="absolute top-2 left-9 md:left-auto md:right-3 inline-block w-2 h-2 bg-red-500 rounded-full" />
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="my-2 px-4 w-full mx-auto rounded-md py-1">
          <NavLink
            to={"/login"}
            onClick={logout}
            className={`group flex items-center px-2 py-2 w-full  text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
          >
            <ArrowLeftIcon
              className={`mr-3 flex-shrink-0 h-8 w-8 text-gray-400 group-hover:text-gray-500`}
            />

            <div className={`hidden md:flex`}>Sign Out</div>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
