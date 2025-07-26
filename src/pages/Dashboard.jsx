import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";
import { getDashboardStats } from "../apis";
import ChatStats from "../components/chat/ChatStats";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="space-y-2">
            <p className="text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p
              className={`text-sm ${
                stats.stats.usersLast7Days > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stats.stats.usersLast7Days} new this week
            </p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-gray-500">Total Wallets</p>
            <p className="text-2xl font-bold">{stats.totalWallets}</p>
            <p
              className={`text-sm ${
                stats.stats.walletGrowthPercentage > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stats.stats.walletGrowthPercentage > 0 ? "+" : ""}
              {stats.stats.walletGrowthPercentage.toFixed(1)}% growth
            </p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            <p
              className={`text-sm ${
                stats.stats.transactionGrowthPercentage > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stats.stats.transactionGrowthPercentage > 0 ? "+" : ""}
              {stats.stats.transactionGrowthPercentage.toFixed(1)}% growth
            </p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-gray-500">Total Balance</p>
            <p className="text-2xl font-bold">
              {stats.totalBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Across all wallets</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Recent Transactions">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {txn.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {txn.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        txn.type === "credit"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {txn.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Active Offers" className="h-fit">
          <div className="flex items-center justify-center h-fit">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                {stats.activeOffers}
              </p>
              <p className="text-gray-500">Active offers available</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chat Statistics */}
      <Card title="Live Chat Statistics">
        <ChatStats />
      </Card>
    </div>
  );
};

export default Dashboard;
