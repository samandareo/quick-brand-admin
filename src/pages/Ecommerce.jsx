import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TagIcon, 
  CubeIcon, 
  ClipboardListIcon,
  PhotographIcon,
  TrendingUpIcon,
  FireIcon,
  ExclamationTriangleIcon
} from '../components/icons';
import { getOrderStats } from '../apis';

const Ecommerce = () => {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEcommerceData();
  }, []);

  const fetchEcommerceData = async () => {
    try {
      setLoading(true);
      
      // Fetch order stats
      const statsResponse = await getOrderStats();
      if (statsResponse.data?.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching ecommerce data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const SectionCard = ({ title, description, icon: Icon, href, color, count }) => (
    <Link to={href} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="text-right">
            {count !== undefined && (
              <span className="text-2xl font-bold text-gray-900">{count}</span>
            )}
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ecommerce Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your online store, products, orders, and more</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders || 0}
          icon={ExclamationTriangleIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Confirmed Orders"
          value={stats.confirmedOrders || 0}
          icon={ClipboardListIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Cancelled Orders"
          value={stats.cancelledOrders || 0}
          icon={FireIcon}
          color="bg-red-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders || 0}
          icon={TrendingUpIcon}
          color="bg-purple-500"
        />
      </div>


      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Categories"
          description="Manage product categories and subcategories"
          icon={TagIcon}
          href="/ecommerce/categories"
          color="bg-indigo-500"
        />
        <SectionCard
          title="Banners"
          description="Manage promotional banners and image sliders"
          icon={PhotographIcon}
          href="/ecommerce/banners"
          color="bg-pink-500"
        />
        <SectionCard
          title="Products"
          description="Manage products, variants, and inventory"
          icon={CubeIcon}
          href="/ecommerce/products"
          color="bg-blue-500"
        />
        <SectionCard
          title="Orders"
          description="View and manage customer orders"
          icon={ClipboardListIcon}
          href="/ecommerce/orders"
          color="bg-green-500"
        />
      </div>

    </div>
  );
};

export default Ecommerce;

