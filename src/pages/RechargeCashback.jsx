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
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  PercentBadgeIcon 
} from "../components/icons";
import { 
  getAllCashbackRules, 
  createCashbackRule, 
  updateCashbackRule, 
  deleteCashbackRule 
} from "../apis";

const RechargeCashback = () => {
  const [cashbackRules, setCashbackRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    min: "",
    max: "",
    percent: ""
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCashbackRules();
  }, []);

  const fetchCashbackRules = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await getAllCashbackRules();
      
      if (response.data?.success) {
        setCashbackRules(response.data.data || []);
      } else {
        setError("Failed to fetch cashback rules");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch cashback rules");
      console.error("Error fetching cashback rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.min || formData.min < 0) {
      errors.min = "Minimum amount is required and must be positive";
    }
    
    if (!formData.max || formData.max < 0) {
      errors.max = "Maximum amount is required and must be positive";
    }
    
    if (!formData.percent || formData.percent < 0 || formData.percent > 100) {
      errors.percent = "Percentage is required and must be between 0 and 100";
    }
    
    if (formData.min && formData.max && parseInt(formData.min) >= parseInt(formData.max)) {
      errors.max = "Maximum amount must be greater than minimum amount";
    }

    // Note: Removed overlap validation to allow flexible cashback rules
    // The API will handle any business logic conflicts

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
        min: parseInt(formData.min),
        max: parseInt(formData.max),
        percent: parseFloat(formData.percent)
      };

      let response;
      if (editingRule) {
        response = await updateCashbackRule(data);
      } else {
        response = await createCashbackRule(data);
      }

      if (response.data?.success) {
        setSuccess(editingRule ? "Cashback rule updated successfully!" : "Cashback rule created successfully!");
        setCashbackRules(response.data.data || []);
        handleCloseModal();
        fetchCashbackRules(); // Refresh the list
      } else {
        setError(response.data?.message || "Operation failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
      console.error("Error submitting cashback rule:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      min: rule.min.toString(),
      max: rule.max.toString(),
      percent: rule.percent.toString()
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = (rule) => {
    setDeletingRule(rule);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingRule) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const data = {
        min: deletingRule.min,
        max: deletingRule.max
      };

      const response = await deleteCashbackRule(data);

      if (response.data?.success) {
        setSuccess("Cashback rule deleted successfully!");
        setCashbackRules(response.data.data || []);
        setShowDeleteModal(false);
        setDeletingRule(null);
        fetchCashbackRules(); // Refresh the list
      } else {
        setError(response.data?.message || "Delete failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
      console.error("Error deleting cashback rule:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setFormData({ min: "", max: "", percent: "" });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const formatCurrency = (amount) => `৳${amount}`;

  const formatPercentage = (percent) => `${percent}%`;

  const headers = [
    "Amount Range",
    "Cashback Percentage",
    "Actions"
  ];

  const renderRow = (rule) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-semibold text-green-600">
          {formatCurrency(rule.min)} - {formatCurrency(rule.max)}
        </div>
        <div className="text-xs text-gray-500">
          Applies to recharges between these amounts
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {formatPercentage(rule.percent)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(rule)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
            title="Edit Rule"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(rule)}
            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
            title="Delete Rule"
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
          <h1 className="text-2xl font-semibold text-gray-900">Recharge Cashback Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure cashback percentages for different recharge amount ranges. Multiple overlapping ranges are allowed.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Example: Range ৳20-৳50 (2%) and ৳100-৳250 (7%) can coexist. Users get the applicable cashback for their recharge amount.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Cashback Rule</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Rules</p>
              <p className="text-2xl font-semibold text-blue-900">{cashbackRules.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PercentBadgeIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Max Cashback</p>
              <p className="text-2xl font-semibold text-green-900">
                {cashbackRules.length > 0 ? 
                  formatPercentage(Math.max(...cashbackRules.map(r => r.percent))) : 
                  "0%"
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Max Amount Range</p>
              <p className="text-2xl font-semibold text-purple-900">
                {cashbackRules.length > 0 ? 
                  formatCurrency(Math.max(...cashbackRules.map(r => r.max))) : 
                  "৳0"
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Cashback Rules Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Cashback Rules</h2>
        </div>

        {cashbackRules.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <h4 className="text-sm font-medium text-green-800 mb-2">How these rules work:</h4>
            <div className="text-xs text-green-700 space-y-1">
              {cashbackRules.slice(0, 3).map((rule, index) => (
                <p key={index}>
                  • If user recharges ৳{rule.min + Math.floor((rule.max - rule.min) / 2)}, they get {formatPercentage(rule.percent)} cashback = ৳{((rule.min + Math.floor((rule.max - rule.min) / 2)) * rule.percent / 100).toFixed(2)}
                </p>
              ))}
              {cashbackRules.length > 3 && <p>• And more rules...</p>}
            </div>
          </div>
        )}

        <Table
          headers={headers}
          data={cashbackRules}
          renderRow={renderRow}
          className="min-w-full"
        />

        {cashbackRules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No cashback rules configured</p>
            <p className="text-sm">Create cashback rules for different recharge amount ranges</p>
            <p className="text-xs mt-2 text-gray-400">
              Example: ৳20-৳50 with 2% cashback, ৳100-৳250 with 7% cashback
            </p>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingRule ? "Edit Cashback Rule" : "Add New Cashback Rule"}
      >
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>How it works:</strong> When a user recharges within this amount range, they will receive the specified percentage as cashback.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Multiple ranges can overlap. For example: ৳20-৳50 (2%) and ৳30-৳60 (3%) are both valid.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Amount (৳)
              </label>
              <Input
                type="number"
                name="min"
                value={formData.min}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                error={formErrors.min}
                min="0"
                step="1"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Amount (৳)
              </label>
              <Input
                type="number"
                name="max"
                value={formData.max}
                onChange={handleInputChange}
                placeholder="e.g., 500"
                error={formErrors.max}
                min="0"
                step="1"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cashback Percentage (%)
            </label>
            <Input
              type="number"
              name="percent"
              value={formData.percent}
              onChange={handleInputChange}
              placeholder="e.g., 5"
              error={formErrors.percent}
              min="0"
              max="100"
              step="0.1"
              className="w-full"
            />
          </div>

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
              <span>{editingRule ? "Update Rule" : "Create Rule"}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingRule(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Cashback Rule"
        message={
          deletingRule ? 
            `Are you sure you want to delete the cashback rule for ৳${deletingRule.min} - ৳${deletingRule.max} (${deletingRule.percent}% cashback)? This action cannot be undone.` :
            ""
        }
        confirmText="Delete Rule"
        isLoading={submitting}
      />
    </div>
  );
};

export default RechargeCashback;