import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext";
import PrivateRoute from "./components/shared/PrivateRoute";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UpdateUser from "./pages/UpdateUser";
import Transactions from "./pages/Transactions";
import OperatorsPage from "./pages/OperatorsPage";
import OffersPage from "./pages/OffersPage";
import OfferForm from "./pages/OfferForm";
import PurchaseRequestsPage from "./pages/PurchaseRequestsPage";
import SocialMediaPage from "./pages/SocialMedia";
import ImageSliderPage from "./pages/ImageSliderPage";
import Settings from "./pages/Settings";
import NotificationsPage from "./pages/NotificationsPage";
import Chat from "./pages/Chat";
import ManualWithdrawalsPage from "./pages/ManualWithdrawals";
import MobileBanking from "./pages/MobileBanking";
import Ecommerce from "./pages/Ecommerce";
import Categories from "./pages/ecommerce/Categories";
import Banners from "./pages/ecommerce/Banners";
import Products from "./pages/ecommerce/Products";
import ProductVariants from "./pages/ecommerce/ProductVariants";
import Orders from "./pages/ecommerce/Orders";
import RechargeLogs from "./pages/RechargeLogs";
import RechargeCashback from "./pages/RechargeCashback";


const App = () => {
  console.log(import.meta.env.VITE_BACKEND);
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="users/edit/:id" element={<UpdateUser />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="operators" element={<OperatorsPage />} />
                <Route path="offers" element={<OffersPage />} />
                <Route path="offers/new" element={<OfferForm />} />
                <Route path="offers/edit/:id" element={<OfferForm />} />
                <Route
                  path="purchase-requests"
                  element={<PurchaseRequestsPage />}
                />
                <Route path="social-media" element={<SocialMediaPage />} />
                <Route path="sliders" element={<ImageSliderPage />} />
                <Route path="chat" element={<Chat />} />
                <Route path="settings" element={<Settings />} />
                <Route path="manual-withdrawals" element={<ManualWithdrawalsPage />} />
                <Route path="mobile-banking" element={<MobileBanking />} />
                <Route path="push-notifications" element={<NotificationsPage />} />
                <Route path="recharge-logs" element={<RechargeLogs />} />
                <Route path="recharge-cashback" element={<RechargeCashback />} />
                
                {/* Ecommerce Routes */}
                <Route path="ecommerce" element={<Ecommerce />} />
                <Route path="ecommerce/categories" element={<Categories />} />
                <Route path="ecommerce/banners" element={<Banners />} />
                <Route path="ecommerce/products" element={<Products />} />
                <Route path="ecommerce/products/:productId/variants" element={<ProductVariants />} />
                <Route path="ecommerce/orders" element={<Orders />} />
              </Route>
            </Routes>
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
