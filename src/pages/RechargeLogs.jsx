import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";
import StatusBadge from "../components/ui/StatusBadge";
import { MagnifyingGlassIcon, FunnelIcon, CogIcon } from "../components/icons";
import { getAllRecharges } from "../apis";

const RechargeLogs = () => {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecharges, setTotalRecharges] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRecharges();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchRecharges = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await getAllRecharges(params);
      
      if (response.data?.success) {
        const { recharges, total, pages } = response.data.data;
        setRecharges(recharges || []);
        setTotalRecharges(total || 0);
        setTotalPages(pages || 1);
      } else {
        setError("Failed to fetch recharge logs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch recharge logs");
      console.error("Error fetching recharge logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (createdAt, updatedAt) => {
    const created = new Date(createdAt).toLocaleString();
    const updated = new Date(updatedAt).toLocaleString();
    
    if (createdAt === updatedAt) {
      return (
        <div className="text-sm">
          <div className="font-medium">Created:</div>
          <div className="text-gray-600">{created}</div>
        </div>
      );
    }
    
    return (
      <div className="text-sm">
        <div className="font-medium">Created:</div>
        <div className="text-gray-600">{created}</div>
        <div className="font-medium mt-1">Updated:</div>
        <div className="text-gray-600">{updated}</div>
      </div>
    );
  };

  const formatAmount = (amount) => {
    return `৳${amount}`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const headers = [
    "User ID",
    "Phone Number", 
    "Amount",
    "Operator",
    "Status",
    "Retry Count",
    "Description",
    "Created/Updated"
  ];

  const renderRow = (recharge) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          {recharge.userId}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-medium">{recharge.phoneNumber}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-semibold text-green-600">
          {formatAmount(recharge.amount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-medium">{recharge.operator}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          status={recharge.status} 
          className={getStatusColor(recharge.status)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            recharge.retry_count >= 3 ? 'bg-red-100 text-red-800' : 
            recharge.retry_count >= 2 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {recharge.retry_count}/3
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
        <div className="truncate" title={recharge.description}>
          {recharge.description}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDateTime(recharge.createdAt, recharge.updatedAt)}
      </td>
    </>
  );

  if (loading && recharges.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recharge Logs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor all recharge requests and their status
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/recharge-operators">
            <Button className="flex items-center space-x-2" variant="secondary">
              <CogIcon className="h-4 w-4" />
              <span>Manage Operators</span>
            </Button>
          </Link>
          <Link to="/recharge-cashback">
            <Button className="flex items-center space-x-2">
              <CogIcon className="h-4 w-4" />
              <span>Manage Cashback</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">T</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Recharges</p>
              <p className="text-2xl font-semibold text-blue-900">{totalRecharges}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">P</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Processing</p>
              <p className="text-2xl font-semibold text-yellow-900">
                {recharges.filter(r => r.status === 'processing').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">C</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-semibold text-green-900">
                {recharges.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">F</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Failed</p>
              <p className="text-2xl font-semibold text-red-900">
                {recharges.filter(r => r.status === 'failed').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone number, user ID, or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
            />
          </div>
          
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={handleStatusFilter}
              className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Recharge Logs Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recharge Requests
            {loading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
          </h2>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} • {totalRecharges} total
          </div>
        </div>

        <Table
          headers={headers}
          data={recharges}
          renderRow={renderRow}
          className="min-w-full"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalRecharges)}
                  </span>{" "}
                  of <span className="font-medium">{totalRecharges}</span> results
                </p>
              </div>
              
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNum
                            ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RechargeLogs;