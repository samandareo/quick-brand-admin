import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";
import DeleteConfirmation from "../components/ui/DeleteConfirmation";
import StatusBadge from "../components/ui/StatusBadge";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  SpeakerphoneIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon
} from "../components/icons";
import { 
  getAllRechargeOperators, 
  createRechargeOperator, 
  updateRechargeOperator, 
  toggleRechargeOperatorStatus,
  deleteRechargeOperator 
} from "../apis";

const RechargeOperators = () => {
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [deletingOperator, setDeletingOperator] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    operatorName: "",
    operatorCode: "",
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchOperators();
  }, []);

  useEffect(() => {
    filterOperatorsByStatus();
  }, [operators, filterStatus]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await getAllRechargeOperators();
      
      if (response.data?.success) {
        setOperators(response.data.data || []);
      } else {
        setError("Failed to fetch recharge operators");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch recharge operators");
      console.error("Error fetching recharge operators:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterOperatorsByStatus = () => {
    if (filterStatus === "all") {
      setFilteredOperators(operators);
    } else {
      const isActive = filterStatus === "active";
      setFilteredOperators(operators.filter(op => op.isActive === isActive));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.operatorName.trim()) {
      errors.operatorName = "Operator name is required";
    }
    
    if (!formData.operatorCode.trim()) {
      errors.operatorCode = "Operator code is required";
    } else if (formData.operatorCode.length < 2) {
      errors.operatorCode = "Operator code must be at least 2 characters";
    }

    // Check for duplicate operator name or code
    const existingOperator = operators.find(op => {
      // Skip current operator if editing
      if (editingOperator && op._id === editingOperator._id) {
        return false;
      }
      
      return (
        op.operatorName.toLowerCase() === formData.operatorName.trim().toLowerCase() ||
        op.operatorCode.toLowerCase() === formData.operatorCode.trim().toLowerCase()
      );
    });
    
    if (existingOperator) {
      if (existingOperator.operatorName.toLowerCase() === formData.operatorName.trim().toLowerCase()) {
        errors.operatorName = "An operator with this name already exists";
      }
      if (existingOperator.operatorCode.toLowerCase() === formData.operatorCode.trim().toLowerCase()) {
        errors.operatorCode = "An operator with this code already exists";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const data = {
        operatorName: formData.operatorName.trim(),
        operatorCode: formData.operatorCode.trim().toUpperCase(),
        isActive: formData.isActive
      };

      if (editingOperator) {
        data.id = editingOperator._id;
        await updateRechargeOperator(data);
        setSuccess("Recharge operator updated successfully!");
      } else {
        await createRechargeOperator(data);
        setSuccess("Recharge operator created successfully!");
      }

      handleCloseModal();
      fetchOperators(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
      console.error("Error submitting recharge operator:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (operator) => {
    setEditingOperator(operator);
    setFormData({
      operatorName: operator.operatorName,
      operatorCode: operator.operatorCode,
      isActive: operator.isActive
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleToggleStatus = async (operator) => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await toggleRechargeOperatorStatus({ id: operator._id });
      
      const newStatus = !operator.isActive;
      setSuccess(`Operator ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchOperators(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle operator status");
      console.error("Error toggling operator status:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (operator) => {
    setDeletingOperator(operator);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingOperator) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await deleteRechargeOperator({ id: deletingOperator._id });
      setSuccess("Recharge operator deleted successfully!");
      setShowDeleteModal(false);
      setDeletingOperator(null);
      fetchOperators(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
      console.error("Error deleting recharge operator:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOperator(null);
    setFormData({ operatorName: "", operatorCode: "", isActive: true });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const headers = [
    "Operator Name",
    "Operator Code",
    "Status",
    "Created At",
    "Updated At",
    "Actions"
  ];

  const renderRow = (operator) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center">
          <SpeakerphoneIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div className="font-medium">{operator.operatorName}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
          {operator.operatorCode}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          status={operator.isActive ? "active" : "inactive"}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(operator.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(operator.updatedAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(operator)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
            title="Edit Operator"
            disabled={submitting}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(operator)}
            className={`p-1 rounded ${
              operator.isActive 
                ? "text-red-600 hover:text-red-900 hover:bg-red-50" 
                : "text-green-600 hover:text-green-900 hover:bg-green-50"
            }`}
            title={operator.isActive ? "Deactivate" : "Activate"}
            disabled={submitting}
          >
            {operator.isActive ? (
              <XMarkIcon className="h-4 w-4" />
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => handleDelete(operator)}
            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
            title="Delete Operator"
            disabled={submitting}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/recharge-logs"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Recharge Logs
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recharge Operators Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage mobile recharge operators and their availability
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Operator</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SpeakerphoneIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Operators</p>
              <p className="text-2xl font-semibold text-blue-900">{operators.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Active Operators</p>
              <p className="text-2xl font-semibold text-green-900">
                {operators.filter(op => op.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Inactive Operators</p>
              <p className="text-2xl font-semibold text-red-900">
                {operators.filter(op => !op.isActive).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="block rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
          >
            <option value="all">All Operators</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <span className="text-sm text-gray-500">
            Showing {filteredOperators.length} of {operators.length} operators
          </span>
        </div>
      </Card>

      {/* Operators Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recharge Operators
            {submitting && <span className="ml-2 text-sm text-gray-500">(Processing...)</span>}
          </h2>
        </div>

        <Table
          headers={headers}
          data={filteredOperators}
          renderRow={renderRow}
          className="min-w-full"
        />

        {filteredOperators.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <SpeakerphoneIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">
              {operators.length === 0 ? "No operators configured" : "No operators match the filter"}
            </p>
            <p className="text-sm">
              {operators.length === 0 ? "Add your first recharge operator to get started" : "Try changing the filter"}
            </p>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingOperator ? "Edit Recharge Operator" : "Add New Recharge Operator"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleInputChange}
              placeholder="e.g., Airtel, Jio, Vodafone Idea"
              error={formErrors.operatorName}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Full name of the mobile operator</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator Code <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="operatorCode"
              value={formData.operatorCode}
              onChange={handleInputChange}
              placeholder="e.g., AIRTEL, JIO, VI"
              error={formErrors.operatorCode}
              className="w-full"
              style={{ textTransform: 'uppercase' }}
            />
            <p className="text-xs text-gray-500 mt-1">Short code used for API integration (will be converted to uppercase)</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (allow recharges for this operator)
            </label>
          </div>

          {/* Preview section */}
          {formData.operatorName && formData.operatorCode && !formErrors.operatorName && !formErrors.operatorCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">✅ Preview</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {formData.operatorName}</p>
                <p><strong>Code:</strong> {formData.operatorCode.toUpperCase()}</p>
                <p><strong>Status:</strong> {formData.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2"
            >
              {submitting && <LoadingSpinner className="h-4 w-4" />}
              <span>{editingOperator ? "Update Operator" : "Create Operator"}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingOperator(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Recharge Operator"
        message={
          deletingOperator ? 
            `Are you sure you want to delete "${deletingOperator.operatorName}" (${deletingOperator.operatorCode})? This action cannot be undone and may affect existing recharge operations.` :
            ""
        }
        confirmText="Delete Operator"
        isLoading={submitting}
      />
    </div>
  );
};

export default RechargeOperators;