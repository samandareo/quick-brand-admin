import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ImageUpload from "../components/ui/ImageUpload";
import { PencilIcon, TrashIcon } from "../components/icons";
import config from "../config/config";

import {
  createMobileBanking,
  getMobileBankings,
  getMobileBankingById,
  updateMobileBanking,
  deleteMobileBanking,
} from "../apis";

const MobileBanking = () => {
  const navigate = useNavigate();
  const [mobileBankings, setMobileBankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    logo: null,
    isActive: true,
  });

  const logoPreview = useMemo(() => {
    if (formData.logo) {
      return URL.createObjectURL(formData.logo);
    }
    if (editingItem?.logo) {
      return `${config.apiUrl}/api/uploads/mobile-banking/${editingItem.logo}`;
    }
    return null;
  }, [formData.logo, editingItem?.logo]);

  useEffect(() => {
    fetchMobileBankings();
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview && formData.logo) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview, formData.logo]);

  const fetchMobileBankings = async () => {
    try {
      setLoading(true);
      const { data } = await getMobileBankings();
      setMobileBankings(data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch mobile banking operators");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("isActive", formData.isActive);
      if (formData.logo) {
        submitData.append("logo", formData.logo);
      }

      if (editingItem) {
        await updateMobileBanking(editingItem._id, submitData);
        setSuccess("Mobile banking operator updated successfully");
      } else {
        await createMobileBanking(submitData);
        setSuccess("Mobile banking operator created successfully");
      }

      setShowModal(false);
      resetForm();
      fetchMobileBankings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save mobile banking operator");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      logo: null,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mobile banking operator?")) return;

    try {
      await deleteMobileBanking(id);
      setSuccess("Mobile banking operator deleted successfully");
      fetchMobileBankings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete mobile banking operator");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo: null,
      isActive: true,
    });
    setEditingItem(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mobile Banking Operators</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/manual-withdrawals')}>
            Back to Withdrawals
          </Button>
          <Button onClick={() => setShowModal(true)}>
            Add Operator
          </Button>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mobileBankings.map((item) => (
          <Card key={item._id} className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex-shrink-0">
                {item.logo ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                    src={`${config.apiUrl}/api/uploads/mobile-banking/${item.logo}`}
                    alt={item.name}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-100 shadow-lg">
                    <span className="text-2xl font-bold text-gray-700">
                      {item.name?.charAt(0)?.toUpperCase() || "M"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span
                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                    item.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="flex space-x-2 w-full justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                  className="flex items-center justify-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(item._id)}
                  className="flex items-center justify-center"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {mobileBankings.length === 0 && !loading && (
        <Card className="p-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No mobile banking operators</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new mobile banking operator.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowModal(true)}>
                Add Operator
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingItem ? "Edit Mobile Banking Operator" : "Add Mobile Banking Operator"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter operator name"
              required
            />
          </div>

          <div>
            <ImageUpload
              label="Logo"
              preview={logoPreview}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({ ...formData, logo: file });
                }
              }}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MobileBanking; 