import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  XMarkIcon,
  CheckIcon,
  CubeIcon,
  SearchIcon,
  FunnelIcon,
  PhotographIcon
} from '../../components/icons';
import { 
  getProductById,
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  toggleVariantStatus,
  updateVariantInventory,
  addToInventory,
  removeFromInventory,
  getVariantsInStock,
  getOutOfStockVariants
} from '../../apis';
import { getImageUrl } from '../../utils/imageUtils';

const ProductVariants = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    attributes: {},
    price: '',
    quantity: '',
    isActive: true
  });
  const [newAttribute, setNewAttribute] = useState({ key: '', value: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryData, setInventoryData] = useState({ variantId: '', action: '', quantity: '' });

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for productId:', productId);
      
      const [productRes, variantsRes] = await Promise.all([
        getProductById(productId),
        getVariantsByProduct(productId)
      ]);

      console.log('Product response:', productRes.data);
      console.log('Variants response:', variantsRes.data);

      if (productRes.data?.success) {
        setProduct(productRes.data.data);
      }
      if (variantsRes.data?.success) {
        setVariants(variantsRes.data.data?.variants || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      alert(`Error fetching data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.price || !formData.quantity) {
        alert('Please fill in all required fields (Price, Quantity)');
        return;
      }

      if (Object.keys(formData.attributes).length === 0) {
        alert('Please add at least one attribute (e.g., Size, Color)');
        return;
      }

      let submitData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (editingVariant) {
        if (selectedFiles.length > 0) {
          // Update with images - send FormData
          const formDataObj = new FormData();
          
          // Add all variant data
          Object.keys(submitData).forEach(key => {
            if (key === 'attributes') {
              // Handle attributes object
              Object.keys(submitData[key]).forEach(attrKey => {
                formDataObj.append(`attributes[${attrKey}]`, submitData[key][attrKey]);
              });
            } else if (key !== 'images') {
              formDataObj.append(key, submitData[key]);
            }
          });
          
          // Add images
          selectedFiles.forEach((file, index) => {
            formDataObj.append('images', file);
            formDataObj.append(`alt_${index}`, file.name);
            formDataObj.append(`isPrimary_${index}`, index === primaryImageIndex ? 'true' : 'false');
          });
          
          await updateVariant(editingVariant._id, formDataObj);
        } else {
          // Update without images
          await updateVariant(editingVariant._id, submitData);
        }
      } else {
        if (selectedFiles.length > 0) {
          // Create with images - send FormData
          const formDataObj = new FormData();
          
          // Add all variant data
          Object.keys(submitData).forEach(key => {
            if (key === 'attributes') {
              // Handle attributes object
              Object.keys(submitData[key]).forEach(attrKey => {
                formDataObj.append(`attributes[${attrKey}]`, submitData[key][attrKey]);
              });
            } else if (key !== 'images') {
              formDataObj.append(key, submitData[key]);
            }
          });
          
          // Add images
          selectedFiles.forEach((file, index) => {
            formDataObj.append('images', file);
            formDataObj.append(`alt_${index}`, file.name);
            formDataObj.append(`isPrimary_${index}`, index === primaryImageIndex ? 'true' : 'false');
          });
          
          await createVariant(productId, formDataObj);
        } else {
          // Create without images
          await createVariant(productId, submitData);
        }
      }
      
      setShowModal(false);
      setEditingVariant(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving variant:', error);
      alert(`Error saving variant: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Create previews
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImagePreviews(previews);
    
    // Reset primary image to first image
    setPrimaryImageIndex(0);
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    setFormData({
      attributes: variant.attributes || {},
      price: variant.price,
      quantity: variant.quantity,
      isActive: variant.isActive
    });
    
    // Find primary image index
    const primaryIndex = variant.images?.findIndex(img => img.isPrimary) || 0;
    setPrimaryImageIndex(primaryIndex);
    
    setShowModal(true);
  };

  const handleDelete = async (variantId) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      try {
        await deleteVariant(variantId);
        fetchData();
      } catch (error) {
        console.error('Error deleting variant:', error);
      }
    }
  };

  const handleToggleStatus = async (variantId) => {
    try {
      await toggleVariantStatus(variantId);
      fetchData();
    } catch (error) {
      console.error('Error toggling variant status:', error);
    }
  };

  const addAttribute = () => {
    if (newAttribute.key && newAttribute.value) {
      setFormData({
        ...formData,
        attributes: {
          ...formData.attributes,
          [newAttribute.key]: newAttribute.value
        }
      });
      setNewAttribute({ key: '', value: '' });
    }
  };

  const removeAttribute = (key) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    setFormData({
      ...formData,
      attributes: newAttributes
    });
  };

  const handleInventoryAction = async (variantId, action, quantity) => {
    try {
      if (action === 'set') {
        await updateVariantInventory(variantId, { quantity: parseInt(quantity) });
      } else if (action === 'add') {
        await addToInventory(variantId, { quantity: parseInt(quantity) });
      } else if (action === 'remove') {
        await removeFromInventory(variantId, { quantity: parseInt(quantity) });
      }
      setShowInventoryModal(false);
      setInventoryData({ variantId: '', action: '', quantity: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert(`Error updating inventory: ${error.response?.data?.message || error.message}`);
    }
  };

  const openInventoryModal = (variantId, action) => {
    setInventoryData({ variantId, action, quantity: '' });
    setShowInventoryModal(true);
  };

  const resetForm = () => {
    setFormData({
      attributes: {},
      price: '',
      quantity: '',
      isActive: true
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setPrimaryImageIndex(0);
    setEditingVariant(null);
    setShowModal(false);
  };

  // Filter and sort variants
  const filteredVariants = variants.filter(variant => {
    const matchesSearch = Object.values(variant.attributes || {}).some(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && variant.isActive) ||
                         (filterStatus === 'inactive' && !variant.isActive);
    
    const matchesStock = filterStock === 'all' ||
                        (filterStock === 'in-stock' && variant.quantity > 0) ||
                        (filterStock === 'out-of-stock' && variant.quantity === 0) ||
                        (filterStock === 'low-stock' && variant.quantity > 0 && variant.quantity < 10);
    
    return matchesSearch && matchesStatus && matchesStock;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-gray-200 rounded-lg h-64"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <CubeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/ecommerce/products')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/ecommerce/products')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Variants</h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Manage variants and options for this product
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Variant
          </button>
        </div>
      </div>


      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Variants
            </label>
            <div className="relative">
              <SearchIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by attributes..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="quantity-desc">Stock High-Low</option>
              <option value="quantity-asc">Stock Low-High</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterStock('all');
                setSortBy('createdAt');
                setSortOrder('desc');
              }}
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-16">
            {product.pictures && product.pictures.length > 0 ? (
              <img
                className="h-16 w-16 rounded-lg object-cover"
                src={getImageUrl(product.pictures[0], 'product')}
                alt={product.name}
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <CubeIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>Base Price: ${product.price}</span>
              <span>Stock: {product.quantity}</span>
              <span>Brand: {product.brand}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Variants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredVariants.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {variants.length === 0 ? 'No variants found' : 'No variants match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {variants.length === 0 
                ? 'This product doesn\'t have any variants yet.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {variants.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add First Variant
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attributes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVariants.map((variant) => (
                  <tr key={variant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-10 w-10">
                        {variant.images && variant.images.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={getImageUrl(variant.images[0]?.url)}
                            alt="Variant"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <PhotographIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(variant.attributes || {}).map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${variant.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`font-semibold text-lg ${
                            variant.quantity === 0 ? 'text-red-600' : 
                            variant.quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {variant.quantity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {variant.quantity === 0 ? 'Out of Stock' : 
                             variant.quantity < 10 ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openInventoryModal(variant._id, 'add')}
                            className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="Add Stock"
                          >
                            + Add
                          </button>
                          <button
                            onClick={() => openInventoryModal(variant._id, 'remove')}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="Remove Stock"
                          >
                            - Remove
                          </button>
                          <button
                            onClick={() => openInventoryModal(variant._id, 'set')}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="Set Stock"
                          >
                            = Set
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          variant.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(variant._id)}
                          className={`${
                            variant.isActive
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={variant.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {variant.isActive ? (
                            <XMarkIcon className="h-4 w-4" />
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(variant)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variant._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingVariant ? 'Edit Variant' : 'Add New Variant'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Select primary image (click to set as main):</p>
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div 
                            key={index} 
                            className={`relative cursor-pointer rounded border-2 transition-all ${
                              index === primaryImageIndex 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => setPrimaryImageIndex(index)}
                          >
                            <img
                              src={preview.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                            {index === primaryImageIndex && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {editingVariant && editingVariant.images && editingVariant.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Current images (click to set as primary):</p>
                      <div className="grid grid-cols-4 gap-2">
                        {editingVariant.images.map((image, index) => {
                          const isCurrentPrimary = image.isPrimary;
                          return (
                            <div 
                              key={index} 
                              className={`relative cursor-pointer rounded border-2 transition-all ${
                                isCurrentPrimary 
                                  ? 'border-green-500 ring-2 ring-green-200' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <img
                                src={getImageUrl(image.url)}
                                alt={`Current ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              {isCurrentPrimary && (
                                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                  ✓
                                </div>
                              )}
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attributes
                  </label>
                  <div className="space-y-2">
                    {Object.entries(formData.attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {key}: {value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttribute(key)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newAttribute.key}
                        onChange={(e) => setNewAttribute({ ...newAttribute, key: e.target.value })}
                        placeholder="Attribute name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={newAttribute.value}
                        onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                        placeholder="Attribute value"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addAttribute}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingVariant ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Management Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {inventoryData.action === 'set' ? 'Set Stock Quantity' :
                   inventoryData.action === 'add' ? 'Add Stock' : 'Remove Stock'}
                </h3>
                <button
                  onClick={() => setShowInventoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    {inventoryData.action === 'set' ? 'Enter the new total quantity for this variant' :
                     inventoryData.action === 'add' ? 'Enter how many items to add to current stock' : 
                     'Enter how many items to remove from current stock'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={inventoryData.quantity}
                    onChange={(e) => setInventoryData({ ...inventoryData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                    min="0"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowInventoryModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleInventoryAction(inventoryData.variantId, inventoryData.action, inventoryData.quantity)}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                      inventoryData.action === 'add' ? 'bg-green-600 hover:bg-green-700' :
                      inventoryData.action === 'remove' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {inventoryData.action === 'set' ? 'Set Quantity' :
                     inventoryData.action === 'add' ? 'Add Stock' : 'Remove Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariants;

