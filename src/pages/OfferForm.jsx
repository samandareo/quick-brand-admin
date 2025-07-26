import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { createOffer, getOfferById, getOperators, updateOffer } from "../apis";

const OfferForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [operators, setOperators] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    operator: "",
    offerType: "internet",
    price: "",
    discountAmount: "",
    actualPrice: "",
    validity: "",
    isActive: true,
  });

  // Fetch offer data if in edit mode
  useEffect(() => {
    if (id) {
      const fetchOffer = async () => {
        try {
          setLoading(true);
          const { data: response } = await getOfferById(id);

          setFormData({
            title: response.data.title,
            description: response.data.description,
            operator: response.data.operator?._id,
            offerType: response.data.offerType,
            price: response.data.price,
            discountAmount: response.data.discountAmount,
            actualPrice: response.data.actualPrice,
            validity: response.data.validity,
            isActive: response.data.isActive,
          });
        } catch (err) {
          setError(err.response?.data?.message || "Failed to load offer");
        } finally {
          setLoading(false);
        }
      };

      fetchOffer();
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const { data } = await getOperators({ isActive: true });
        setOperators(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load operators");
      }
    };

    fetchOperators();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Calculate actual price when price or discount changes
      if (name === "price" || name === "discountAmount") {
        const price = name === "price" ? value : prev.price;
        const discount =
          name === "discountAmount" ? value : prev.discountAmount;
        newData.actualPrice = (
          parseFloat(price || 0) - parseFloat(discount || 0)
        ).toFixed(2);
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const offerData = {
        ...formData,
        price: parseFloat(formData.price),
        discountAmount: parseFloat(formData.discountAmount),
        actualPrice: parseFloat(formData.actualPrice),
        createdBy: user._id,
      };

      if (id) {
        // Update existing offer
        const { data } = await updateOffer(id, offerData);
        if (!data.success) {
          setError(data.message || "Failed to update offer");
          return;
        }
        setSuccess("Offer updated successfully");
      } else {
        // Create new offer
        const { data } = await createOffer(offerData);
        if (!data.success) {
          setError(data.message || "Failed to update offer");
          return;
        }
        setSuccess("Offer created successfully");
      }

      // Redirect after success
      setTimeout(() => {
        navigate("/offers");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
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
        <h1 className="text-2xl font-bold">
          {id ? "Edit Offer" : "Create New Offer"}
        </h1>
        <Button variant="outline" onClick={() => navigate("/offers")}>
          Back to Offers
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator *
              </label>
              <select
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value="" disabled>
                  Select Operator
                </option>
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
                Offer Type *
              </label>
              <select
                name="offerType"
                value={formData.offerType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value="internet">Internet</option>
                <option value="combo">Combo</option>
                <option value="minutes">Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price () *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount () *
              </label>
              <input
                type="number"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Price ()
              </label>
              <input
                type="number"
                name="actualPrice"
                value={formData.actualPrice}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validity (In Days) *
              </label>
              <input
                type="number"
                name="validity"
                value={formData.validity}
                onChange={handleChange}
                placeholder="e.g., 30 days"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {id && (
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active Offer
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/offers")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {id ? "Update Offer" : "Create Offer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OfferForm;
