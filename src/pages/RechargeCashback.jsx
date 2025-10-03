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

    // Check for overlapping ranges
    const min = parseInt(formData.min);
    const max = parseInt(formData.max);
    
    if (!isNaN(min) && !isNaN(max)) {
      const overlapping = cashbackRules.find(rule => {
        // Skip current rule if editing
        if (editingRule && rule.min === editingRule.min && rule.max === editingRule.max) {
          return false;
        }
        
        // Check for any overlap between ranges
        return (
          (min >= rule.min && min <= rule.max) ||  // New min falls within existing range
          (max >= rule.min && max <= rule.max) ||  // New max falls within existing range
          (min <= rule.min && max >= rule.max)     // New range completely contains existing range
        );
      });
      
      if (overlapping) {
        errors.range = `Range conflicts with existing rule: ৳${overlapping.min} - ৳${overlapping.max} (${overlapping.percent}% cashback). Please choose non-overlapping amounts.`;
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

  // Helper function to get suggested ranges
  const getSuggestedRanges = () => {
    if (cashbackRules.length === 0) {
      return [
        { min: 20, max: 100, description: "Low amounts (₹20-₹100)" },
        { min: 101, max: 500, description: "Medium amounts (₹101-₹500)" },
        { min: 501, max: 1000, description: "High amounts (₹501-₹1000)" }
      ];
    }

    const sortedRules = [...cashbackRules].sort((a, b) => a.min - b.min);
    const suggestions = [];

    // Check for gap before first rule
    if (sortedRules[0].min > 1) {
      suggestions.push({
        min: 1,
        max: sortedRules[0].min - 1,
        description: `Before existing range (₹1-₹${sortedRules[0].min - 1})`
      });
    }

    // Check for gaps between rules
    for (let i = 0; i < sortedRules.length - 1; i++) {
      const currentMax = sortedRules[i].max;
      const nextMin = sortedRules[i + 1].min;
      
      if (nextMin - currentMax > 1) {
        suggestions.push({
          min: currentMax + 1,
          max: nextMin - 1,
          description: `Between ₹${currentMax} and ₹${nextMin} (₹${currentMax + 1}-₹${nextMin - 1})`
        });
      }
    }

    // Suggest range after last rule
    const lastRule = sortedRules[sortedRules.length - 1];
    suggestions.push({
      min: lastRule.max + 1,
      max: lastRule.max + 500,
      description: `After existing range (₹${lastRule.max + 1}+)`
    });

    return suggestions.slice(0, 3); // Show only first 3 suggestions
  };

  const headers = [
    "Minimum Amount",
    "Maximum Amount",
    "Cashback Percentage",
    "Actions"
  ];

  const renderRow = (rule) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-semibold text-green-600">
          {formatCurrency(rule.min)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-semibold text-green-600">
          {formatCurrency(rule.max)}
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
            Configure cashback percentages for different recharge amount ranges
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

      {/* Helper Information */}
      {cashbackRules.length > 0 && (
        <Card className="bg-blue-50">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">📍 Existing Cashback Ranges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {[...cashbackRules]
                .sort((a, b) => a.min - b.min)
                .map((rule, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg p-3 border border-blue-200"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(rule.min)} - {formatCurrency(rule.max)}
                    </div>
                    <div className="text-xs text-blue-600">
                      {formatPercentage(rule.percent)} cashback
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-blue-900 mb-2">💡 Available Ranges (No Conflicts)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {getSuggestedRanges().map((suggestion, index) => (
                <div 
                  key={index} 
                  className="bg-green-50 rounded-lg p-3 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => {
                    setFormData({
                      min: suggestion.min.toString(),
                      max: suggestion.max.toString(),
                      percent: ""
                    });
                    setShowModal(true);
                  }}
                  title="Click to use this range"
                >
                  <div className="text-sm font-medium text-green-900">
                    {suggestion.description}
                  </div>
                  <div className="text-xs text-green-600">
                    Click to create rule for this range
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-2">⚠️</div>
              <div className="text-sm text-yellow-800">
                <strong>Important:</strong> Cashback ranges cannot overlap. For example, if you have a rule for ৳20-৳50, 
                you cannot create another rule for ৳30-৳60 or ৳40-৳80 as they would conflict. 
                Choose non-overlapping ranges to avoid conflicts.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cashback Rules Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Cashback Rules</h2>
        </div>

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
            <p className="text-sm mb-4">Add your first cashback rule to get started</p>
            
            {/* Getting Started Guide */}
            <div className="max-w-2xl mx-auto text-left bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-4">🚀 Getting Started with Cashback Rules</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 text-sm font-medium mr-3 mt-0.5">1</div>
                  <div>
                    <h4 className="font-medium text-blue-900">Create Your First Rule</h4>
                    <p className="text-sm text-blue-700">Start with a simple range like ৳20-৳50 with 2% cashback</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 text-sm font-medium mr-3 mt-0.5">2</div>
                  <div>
                    <h4 className="font-medium text-blue-900">Add More Ranges</h4>
                    <p className="text-sm text-blue-700">Create additional non-overlapping ranges like ৳51-৳100 with 3% cashback</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 text-sm font-medium mr-3 mt-0.5">3</div>
                  <div>
                    <h4 className="font-medium text-blue-900">How It Works</h4>
                    <p className="text-sm text-blue-700">When users recharge ৳25, they get ৳0.50 cashback (2%). For ৳75 recharge, they get ৳2.25 cashback (3%)</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> Higher recharge amounts usually get higher cashback percentages to encourage larger transactions.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingRule ? "Edit Cashback Rule" : "Add New Cashback Rule"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Example section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Example</h4>
            <p className="text-sm text-blue-800">
              If you create a rule: Min ৳100, Max ৳250, Cashback 7% — then when a user recharges ৳150, 
              they will receive ৳10.50 as cashback (7% of ৳150).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Amount (৳) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="min"
                value={formData.min}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                error={formErrors.min}
                min="1"
                step="1"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Lowest recharge amount for this cashback</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Amount (৳) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="max"
                value={formData.max}
                onChange={handleInputChange}
                placeholder="e.g., 500"
                error={formErrors.max}
                min="1"
                step="1"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Highest recharge amount for this cashback</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cashback Percentage (%) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="percent"
              value={formData.percent}
              onChange={handleInputChange}
              placeholder="e.g., 5"
              error={formErrors.percent}
              min="0.1"
              max="100"
              step="0.1"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Percentage of recharge amount to return as cashback</p>
          </div>

          {/* Range validation error */}
          {formErrors.range && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="text-red-500 mr-2">❌</div>
                <div className="text-sm text-red-800">
                  <strong>Range Conflict:</strong> {formErrors.range}
                </div>
              </div>
            </div>
          )}

          {/* Preview section */}
          {formData.min && formData.max && formData.percent && !formErrors.min && !formErrors.max && !formErrors.percent && !formErrors.range && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-green-900 mb-2">✅ Preview</h4>
              <p className="text-sm text-green-800">
                Users who recharge between <strong>৳{formData.min} - ৳{formData.max}</strong> will receive{" "}
                <strong>{formData.percent}% cashback</strong>.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Example: ৳{Math.floor((parseInt(formData.min) + parseInt(formData.max)) / 2)} recharge = ৳
                {((Math.floor((parseInt(formData.min) + parseInt(formData.max)) / 2) * parseFloat(formData.percent)) / 100).toFixed(2)} cashback
              </p>
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