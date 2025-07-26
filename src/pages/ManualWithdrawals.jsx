import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatusBadge from "../components/ui/StatusBadge";
import { EyeIcon, CheckIcon, XIcon } from "../components/icons";
import { 
  getManualWithdrawals, 
  getManualWithdrawalById, 
  updateManualWithdrawal 
} from "../apis";

const ManualWithdrawals = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        let params = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (statusFilter) {
          params.status = statusFilter;
        }
        if (typeFilter) {
          params.type = typeFilter;
        }
        if (statusFilter || typeFilter) {
          params.page = 1;
        }
        const { data } = await getManualWithdrawals(params);
        if (isMounted) {
          setWithdrawals(data?.data?.withdrawals || []);
          setTotalPages(data?.data?.pagination?.totalPages || 1);
          setTotalItems(data?.data?.pagination?.totalItems || 0);
          if (statusFilter || typeFilter) setCurrentPage(1);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to fetch withdrawal requests");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const handler = setTimeout(fetchWithdrawals, 500);

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [currentPage, statusFilter, typeFilter, itemsPerPage]);

  const viewWithdrawalDetails = async (withdrawalId) => {
    try {
      const { data } = await getManualWithdrawalById(withdrawalId);
      setSelectedWithdrawal(data?.data);
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch withdrawal details");
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedWithdrawal || !updateStatus) return;

    try {
      setUpdating(true);
      const { data } = await updateManualWithdrawal(selectedWithdrawal._id, {
        status: updateStatus
      });
      
      setSuccess(data?.message || "Withdrawal status updated successfully");
      setShowUpdateModal(false);
      setUpdateStatus("");
      
      const { data: refreshData } = await getManualWithdrawals({
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter })
      });
      setWithdrawals(refreshData?.data?.withdrawals || []);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update withdrawal status");
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setUpdateStatus(withdrawal.status);
    setShowUpdateModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const tableHeaders = [
    "Amount",
    "Type",
    "Status",
    "Request Date",
    "Actions"
  ];

  const renderTableRow = (withdrawal) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatAmount(withdrawal.amount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 capitalize">
          {withdrawal.type?.replace('_', ' ') || 'Unknown'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={withdrawal.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(withdrawal.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => viewWithdrawalDetails(withdrawal._id)}
          >
            <EyeIcon className="h-4 w-4" />
            View
          </Button>
          {withdrawal.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openUpdateModal(withdrawal)}
            >
              Update
            </Button>
          )}
        </div>
      </td>
    </>
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && !showModal) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manual Withdrawals</h1>
        <Button onClick={() => navigate('/mobile-banking')}>
          Mobile Banking
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type Filter
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_banking">Mobile Banking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items per page
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="block w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {totalItems} withdrawal requests
          </div>
        </div>

        <Table
          headers={tableHeaders}
          data={withdrawals}
          renderRow={renderTableRow}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages} ({totalItems} total items)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const getPageNumber = () => {
                    if (totalPages <= 5) return i + 1;
                    if (currentPage <= 3) return i + 1;
                    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                    return currentPage - 2 + i;
                  };
                  
                  const pageNum = getPageNumber();
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Withdrawal Details"
        size="lg"
      >
        {selectedWithdrawal && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-sm text-gray-900 font-semibold">{formatAmount(selectedWithdrawal.amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedWithdrawal.status} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedWithdrawal.type?.replace('_', ' ') || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Request Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedWithdrawal.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedWithdrawal.updatedAt)}</p>
              </div>
            </div>

            {selectedWithdrawal.type === 'bank_transfer' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Transfer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWithdrawal.bankName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWithdrawal.bankBranchName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedWithdrawal.bankAccountNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWithdrawal.accountHolderName || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedWithdrawal.type === 'mobile_banking' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mobile Banking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Operator</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWithdrawal.mobileOperator || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedWithdrawal.mobileNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedWithdrawal.note && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <p className="mt-1 text-sm text-gray-900">{selectedWithdrawal.note}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              {selectedWithdrawal.status === 'pending' && (
                <Button
                  onClick={() => {
                    setShowModal(false);
                    openUpdateModal(selectedWithdrawal);
                  }}
                >
                  Update Status
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Withdrawal Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          {updateStatus === 'rejected' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Rejection Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      When rejecting a withdrawal, the amount will be automatically refunded to the user's wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {updateStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Success Notice
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      This will mark the withdrawal as successfully processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={handleStatusUpdate}
              disabled={updating || !updateStatus}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManualWithdrawals;
