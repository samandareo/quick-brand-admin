import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import { getPurchaseRequests, updateRequestStatus } from "../apis";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatusBadge from "../components/ui/StatusBadge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { useLocation } from "react-router-dom";

const PurchaseRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("approved");
  const location = useLocation();

  const [filters, setFilters] = useState({
    status: "pending",
    operator: "",
    dateRange: "today",
    search: "",
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await getPurchaseRequests(filters);
      setRequests(data.data?.requests);

      const { id } = location.state;

      if (id) {
        setSelectedRequest(
          data.data?.requests.find(
            (req) => req?._id?.toString() == id?.toString()
          )
        );

        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching purchase requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setSelectedStatus(request.status);
    setModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    try {
      setStatusUpdateLoading(true);
      await updateRequestStatus(selectedRequest._id, {
        status: selectedStatus,
        adminNotes,
      });
      fetchRequests();
      setModalOpen(false);
    } catch (error) {
      console.error("Error updating request status:", error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getDateRangeOptions = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    return [
      { value: "today", label: "Today" },
      { value: "yesterday", label: "Yesterday" },
      { value: "last7", label: "Last 7 Days" },
      { value: "last30", label: "Last 30 Days" },
      { value: "all", label: "All Time" },
    ];
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    // { value: "completed", label: "Completed" },
  ];

  const operatorOptions = [
    { value: "", label: "All Operators" },
    { value: "robi", label: "Robi" },
    { value: "airtel", label: "Airtel" },
    { value: "banglalink", label: "Banglalink" },
    { value: "telenor", label: "Telenor" },
    { value: "whatsapp", label: "Whatsapp" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Requests</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchRequests()}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              {[...statusOptions, { value: "", label: "All Statuses" }].map(
                (opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              label="Operator"
              name="operator"
              value={filters.operator}
              onChange={handleFilterChange}
              options={operatorOptions}
            >
              {operatorOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              label="Date Range"
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
            >
              {getDateRangeOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Input
              label="Search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Phone, User, Offer..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <Table
            headers={[
              "User",
              "Phone",
              "Offer",
              "Amount",
              "Status",
              "Date",
              "Actions",
            ]}
            data={requests}
            renderRow={(request) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {request.user?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.user?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.phoneNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {request.offer?.title}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {request.offer?.operator} • {request.offer?.offerType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                  <br />
                  {new Date(request.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRequestClick(request)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Manage
                  </button>
                </td>
              </>
            )}
          />
        )}
      </Card>

      {/* Request Management Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Manage Request`}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">User</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.user?.name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.phoneNo}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Offer</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.offer?.title} (
                  {selectedRequest.offer?.operator})
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.amount}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  State Division
                </h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {selectedRequest.stateDivision}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Request Date
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedRequest.status === "pending" && (
              <div>
                <div>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    label="Update Status"
                    name="status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this request..."
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={statusUpdateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                loading={statusUpdateLoading}
                disabled={selectedStatus === selectedRequest.status}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseRequestsPage;
