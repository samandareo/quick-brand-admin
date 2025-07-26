import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import {
  getOperators,
  createOperator,
  updateOperator,
  deleteOperator,
  toggleOperatorStatus,
} from "../apis";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import DeleteConfirmation from "../components/ui/DeleteConfirmation";
import OperatorFormModal from "../components/ui/OperatorFormModal";
import StatusBadge from "../components/ui/StatusBadge";
import config from "../config/config";

const OperatorsPage = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState(null);
  const [operatorToEdit, setOperatorToEdit] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    isActive: "true",
    search: "",
  });

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const response = await getOperators(filters);

      setOperators(response.data.data);
    } catch (error) {
      console.error("Error fetching operators:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = async (operatorId) => {
    try {
      await toggleOperatorStatus(operatorId);
      fetchOperators();
    } catch (error) {
      console.error("Error toggling operator status:", error);
    }
  };

  const handleDeleteClick = (operator) => {
    setOperatorToDelete(operator);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteOperator(operatorToDelete._id);
      fetchOperators();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting operator:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (operatorToEdit) {
        // Update existing operator
        await updateOperator(operatorToEdit._id, formData);
      } else {
        // Create new operator
        await createOperator(formData);
      }

      fetchOperators();
      setFormModalOpen(false);
      setOperatorToEdit(null);
    } catch (error) {
      console.error("Error saving operator:", error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Telecom Operators</h1>
        <Button onClick={() => setFormModalOpen(true)}>Add New Operator</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="isActive"
              value={filters.isActive}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
              <option value="">All</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by operator name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
              "Logo",
              "Operator ID",
              "Name",
              "Theme Color",
              "Status",
              "Actions",
            ]}
            data={operators}
            renderRow={(operator) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={`${config.apiUrl}/api/uploads/operators/${operator.image}`}
                    alt={operator.name}
                    className="h-10 w-10 rounded-full object-contain"
                    onError={() => "/images/operator-default.png"}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{operator.operatorId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {operator.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span
                      className="inline-block w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: operator.themeColor }}
                      title={operator.themeColor}
                    ></span>
                    <span className="text-sm text-gray-700">
                      {operator.themeColor}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    status={operator.isActive ? "active" : "inactive"}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left space-x-4 text-sm font-medium">
                  <button
                    onClick={() => handleStatusToggle(operator._id)}
                    className={`mr-2 ${
                      operator.isActive
                        ? "text-yellow-600 hover:text-yellow-900"
                        : "text-green-600 hover:text-green-900"
                    }`}
                  >
                    {operator.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => {
                      setOperatorToEdit(operator);
                      setFormModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(operator)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </>
            )}
          />
        )}
      </Card>

      {/* Operator Form Modal */}
      <OperatorFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setOperatorToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        operator={operatorToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={operatorToDelete?.name}
      />
    </div>
  );
};

export default OperatorsPage;
