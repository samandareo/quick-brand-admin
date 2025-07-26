import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { getTransactions } from "../apis";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        // Build query params for filters and pagination
        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", itemsPerPage);

        if (filters.type) params.append("type", filters.type);
        if (filters.startDate)
          params.append(
            "startDate",
            new Date(
              new Date(filters.startDate).setHours(0, 0, 0, 0)
            ).toISOString()
          );
        if (filters.endDate)
          params.append(
            "endDate",
            new Date(
              new Date(filters.endDate).setHours(23, 59, 59)
            ).toISOString()
          );

        // Example: /api/transactions?page=1&limit=10&type=credit&startDate=2024-01-01&endDate=2024-01-31
        const { data } = await getTransactions(params);
        if (!data.success) throw new Error("Failed to fetch transactions");
        setTransactions(data?.data?.transactions || []);
        setTotalPages(data?.data?.pages || 1);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>

      <Card>
        <div className="flex items-end justify-between flex-wrap md:flex-nowrap gap-4 mb-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              name="endDate"
              min={filters.startDate}
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            className="w-full max-w-40 px-4 py-2 border rounded-md disabled:opacity-50 bg-primary text-white"
            onClick={() =>
              setFilters({
                type: "",
                startDate: "",
                endDate: "",
              })
            }
          >
            Clear Filters
          </button>
        </div>

        <Table
          headers={[
            "User",
            "Amount",
            "Type",
            "Description",
            "Date",
            // "Closing Balance",
            "Reference",
          ]}
          data={transactions}
          renderRow={(txn) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap">{txn.user?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{txn.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    txn.type === "credit"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {txn.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{txn.description}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(txn.createdAt).toDateString()}
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap">
                {txn?.wallet?.balance}
              </td> */}
              <td className="px-6 py-4 whitespace-nowrap">{txn.reference}</td>
            </>
          )}
        />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 border rounded-md disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 border rounded-md disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Transactions;
