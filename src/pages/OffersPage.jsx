import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import {
  deleteOffer,
  getOffers,
  getOperators,
  toggleOfferStatus,
} from "../apis";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import DeleteConfirmation from "../components/ui/DeleteConfirmation";

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    operator: "",
    offerType: "",
    isActive: "true",
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await getOffers(filters);
      const operators = await getOperators({ isActive: true });
      setOffers(response.data.data);
      setOperators(operators.data.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = async (offerId) => {
    try {
      await toggleOfferStatus(offerId);
      fetchOffers();
    } catch (error) {
      console.error("Error toggling offer status:", error);
    }
  };

  const handleDeleteClick = (offer) => {
    setOfferToDelete(offer);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      // Call API to delete offer
      const { data } = await deleteOffer(offerToDelete._id);

      if (!data.success) {
        return;
      }
      setOffers(offers.filter((o) => o._id !== offerToDelete._id));
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting offer:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Telecom Offers</h1>
        <Button onClick={() => navigate("/offers/new")}>Add New Offer</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator
            </label>
            <select
              name="operator"
              value={filters.operator}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">All Companies</option>

              {operators?.length > 0 &&
                operators?.map((operator) => (
                  <option
                    key={operator?.operatorId}
                    value={operator?._id}
                    className="capitalize"
                  >
                    {operator?.operatorId + " - " + operator?.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offer Type
            </label>
            <select
              name="offerType"
              value={filters.offerType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="internet">Internet</option>
              <option value="combo">Combo</option>
              <option value="minutes">Minutes</option>
            </select>
          </div>
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <Table
            headers={[
              "Title",
              "Operator",
              "Type",
              "Price",
              "Discount",
              "Actual Price",
              "Status",
              "Actions",
            ]}
            data={offers}
            renderRow={(offer) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{offer.title}</div>
                  <div className="text-sm text-gray-500">
                    {offer.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {offer.operator?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {offer.offerType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {offer.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {offer.discountAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {offer.actualPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      offer.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {offer.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleStatusToggle(offer._id)}
                    className={`mr-2 ${
                      offer.isActive
                        ? "text-yellow-600 hover:text-yellow-900"
                        : "text-green-600 hover:text-green-900"
                    }`}
                  >
                    {offer.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => navigate(`/offers/edit/${offer._id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(offer)}
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
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={offerToDelete?.title}
      />
    </div>
  );
};

export default OffersPage;
