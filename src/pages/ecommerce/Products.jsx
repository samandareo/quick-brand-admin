import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  CubeIcon,
  FireIcon,
  StarIcon,
  ExclamationTriangleIcon,
  TagIcon
} from '../../components/icons';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  updateProductData,
  deleteProduct, 
  toggleProductStatus,
  setFlashSale,
  deactivateFlashSale,
  getCategories,
  getAllBrands,
  getAllTags
} from '../../apis';
import { getImageUrl } from '../../utils/imageUtils';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    brand: '',
    tags: [],
    categories: [],
    attributes: {},
    attributePairs: [], // New field for key-value pairs
    deliveryCost: {
      insideCity: '',
      outsideCity: ''
    },
    isActive: true,
    isFlashSale: false,
    flashSalePrice: '',
    flashSaleStartTime: '',
    flashSaleEndTime: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes, tagsRes] = await Promise.all([
        getProducts({ page: 1, limit: 50 }),
        getCategories(),
        getAllBrands(),
        getAllTags()
      ]);

      if (productsRes.data?.success) {
        setProducts(productsRes.data.data.products || []);
      }
      if (categoriesRes.data?.success) {
        setCategories(categoriesRes.data.data || []);
      }
      if (brandsRes.data?.success) {
        setBrands(brandsRes.data.data || []);
      }
      if (tagsRes.data?.success) {
        setTags(tagsRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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


  // Handle attribute pairs
  const addAttributePair = () => {
    setFormData({
      ...formData,
      attributePairs: [...formData.attributePairs, { key: '', value: '' }]
    });
  };

  const updateAttributePair = (index, field, value) => {
    const newPairs = [...formData.attributePairs];
    newPairs[index][field] = value;
    setFormData({
      ...formData,
      attributePairs: newPairs
    });
  };

  const removeAttributePair = (index) => {
    const newPairs = formData.attributePairs.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      attributePairs: newPairs
    });
  };

  const convertAttributePairsToObject = () => {
    const attributes = {};
    formData.attributePairs.forEach(pair => {
      if (pair.key && pair.value) {
        attributes[pair.key] = pair.value;
      }
    });
    return attributes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.quantity) {
        alert('Please fill in all required fields (Name, Price, Quantity)');
        return;
      }

      if (!formData.deliveryCost.insideCity || !formData.deliveryCost.outsideCity) {
        alert('Please fill in delivery costs for both inside and outside city');
        return;
      }

      if (formData.isFlashSale && (!formData.flashSalePrice || !formData.flashSaleStartTime || !formData.flashSaleEndTime)) {
        alert('Please fill in all flash sale fields');
        return;
      }

      let submitData = { ...formData };
      
      // Convert attribute pairs to object
      submitData.attributes = convertAttributePairsToObject();
      delete submitData.attributePairs; // Remove the pairs array
      
      // Validate and format data before sending
      if (submitData.price) submitData.price = parseFloat(submitData.price);
      if (submitData.quantity) submitData.quantity = parseInt(submitData.quantity);
      if (submitData.deliveryCost.insideCity) submitData.deliveryCost.insideCity = parseFloat(submitData.deliveryCost.insideCity);
      if (submitData.deliveryCost.outsideCity) submitData.deliveryCost.outsideCity = parseFloat(submitData.deliveryCost.outsideCity);
      
      // Ensure isActive is properly set
      submitData.isActive = Boolean(submitData.isActive);
      
      if (submitData.isFlashSale) {
        submitData.flashSale = {
          price: parseFloat(submitData.flashSalePrice),
          startTime: new Date(submitData.flashSaleStartTime),
          endTime: new Date(submitData.flashSaleEndTime)
        };
      }
      delete submitData.isFlashSale;
      delete submitData.flashSalePrice;
      delete submitData.flashSaleStartTime;
      delete submitData.flashSaleEndTime;

      console.log('Submitting product data:', submitData);

      if (editingProduct) {
        if (selectedFiles.length > 0) {
          // Use PUT with images - send FormData with images
          const formData = new FormData();
          
          // Add all product data
          Object.keys(submitData).forEach(key => {
            if (key === 'categories' || key === 'tags') {
              // Handle arrays
              submitData[key].forEach(item => formData.append(`${key}[]`, item));
            } else if (key === 'deliveryCost') {
              // Handle nested object
              formData.append('deliveryCost[insideCity]', submitData[key].insideCity);
              formData.append('deliveryCost[outsideCity]', submitData[key].outsideCity);
            } else if (key === 'attributes') {
              // Handle attributes object
              Object.keys(submitData[key]).forEach(attrKey => {
                formData.append(`attributes[${attrKey}]`, submitData[key][attrKey]);
              });
            } else if (key === 'flashSale' && submitData[key]) {
              // Handle flash sale object
              formData.append('flashSale[price]', submitData[key].price);
              formData.append('flashSale[startTime]', submitData[key].startTime);
              formData.append('flashSale[endTime]', submitData[key].endTime);
            } else if (key !== 'pictures') {
              // Handle regular fields
              formData.append(key, submitData[key]);
            }
          });
          
          // Add images
          selectedFiles.forEach((file, index) => {
            formData.append('pictures', file);
            formData.append(`alt_${index}`, file.name);
            formData.append(`isPrimary_${index}`, index === primaryImageIndex ? 'true' : 'false');
          });
          
          // Call updateProduct with FormData
          await updateProduct(editingProduct._id, formData);
        } else {
          // Use PATCH without images
          await updateProductData(editingProduct._id, submitData);
        }
      } else {
        if (selectedFiles.length > 0) {
          // Create product with images - send FormData with images
          const formData = new FormData();
          
          // Add all product data
          Object.keys(submitData).forEach(key => {
            if (key === 'categories' || key === 'tags') {
              // Handle arrays
              submitData[key].forEach(item => formData.append(`${key}[]`, item));
            } else if (key === 'deliveryCost') {
              // Handle nested object
              formData.append('deliveryCost[insideCity]', submitData[key].insideCity);
              formData.append('deliveryCost[outsideCity]', submitData[key].outsideCity);
            } else if (key === 'attributes') {
              // Handle attributes object
              Object.keys(submitData[key]).forEach(attrKey => {
                formData.append(`attributes[${attrKey}]`, submitData[key][attrKey]);
              });
            } else if (key === 'flashSale' && submitData[key]) {
              // Handle flash sale object
              formData.append('flashSale[price]', submitData[key].price);
              formData.append('flashSale[startTime]', submitData[key].startTime);
              formData.append('flashSale[endTime]', submitData[key].endTime);
            } else if (key !== 'pictures') {
              // Handle regular fields
              formData.append(key, submitData[key]);
            }
          });
          
          // Add images
          selectedFiles.forEach((file, index) => {
            formData.append('pictures', file);
            formData.append(`alt_${index}`, file.name);
            formData.append(`isPrimary_${index}`, index === primaryImageIndex ? 'true' : 'false');
          });
          
          // Call createProduct with FormData
          await createProduct(formData);
        } else {
          // Create product without images
          await createProduct(submitData);
        }
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Error saving product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    // Convert attributes object to pairs array
    const attributePairs = [];
    if (product.attributes) {
      Object.entries(product.attributes).forEach(([key, value]) => {
        attributePairs.push({ key, value });
      });
    }
    
    // Find primary image index
    const primaryIndex = product.pictures?.findIndex(pic => pic.isPrimary) || 0;
    setPrimaryImageIndex(primaryIndex);
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      brand: product.brand,
      tags: product.tags || [],
      categories: product.categories || [],
      attributes: product.attributes || {},
      attributePairs: attributePairs,
      deliveryCost: {
        insideCity: product.deliveryCost?.insideCity || '',
        outsideCity: product.deliveryCost?.outsideCity || ''
      },
      isActive: product.isActive,
      isFlashSale: product.flashSale?.isActive || false,
      flashSalePrice: product.flashSale?.price || '',
      flashSaleStartTime: product.flashSale?.startTime ? 
        new Date(product.flashSale.startTime).toISOString().slice(0, 16) : '',
      flashSaleEndTime: product.flashSale?.endTime ? 
        new Date(product.flashSale.endTime).toISOString().slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      await toggleProductStatus(productId);
      fetchData();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || 
                           product.categories.some(cat => cat._id === filterCategory);
    const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.isActive) ||
                         (filterStatus === 'inactive' && !product.isActive) ||
                         (filterStatus === 'flash' && product.flashSale?.isActive) ||
                         (filterStatus === 'outofstock' && product.quantity === 0);
    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      brand: '',
      tags: [],
      categories: [],
      attributes: {},
      attributePairs: [],
      deliveryCost: {
        insideCity: '',
        outsideCity: ''
      },
      isActive: true,
      isFlashSale: false,
      flashSalePrice: '',
      flashSaleStartTime: '',
      flashSaleEndTime: ''
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setPrimaryImageIndex(0);
    setEditingProduct(null);
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage products, variants, and inventory</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
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
              <option value="flash">Flash Sale</option>
              <option value="outofstock">Out of Stock</option>
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
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="quantity-desc">Stock High-Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.pictures && product.pictures.length > 0 ? (
                            <>
                              {product.pictures[0] && (
                                <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={getImageUrl(product.pictures[0].thumbnail || product.pictures[0].url)}
                                alt={product.name}
                                />
                              )}
                            </>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <CubeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.price}
                        {product.flashSale?.isActive && (
                          <div className="text-red-600 font-semibold">
                            Flash: ${product.flashSale.price}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        product.quantity === 0 ? 'text-red-600' : 
                        product.quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {product.flashSale?.isActive && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Flash Sale
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        {product.rating?.average || 0}
                        <span className="text-gray-500 ml-1">({product.rating?.count || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/ecommerce/products/${product._id}/variants`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Manage Variants"
                        >
                          <TagIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(product._id)}
                          className={`${
                            product.isActive
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {product.isActive ? (
                            <XMarkIcon className="h-4 w-4" />
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
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
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
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
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
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
                  {editingProduct && editingProduct.pictures && editingProduct.pictures.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Current images (click to set as primary):</p>
                      <div className="grid grid-cols-4 gap-2">
                        {editingProduct.pictures.map((picture, index) => {
                          const isCurrentPrimary = picture.isPrimary;
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
                                src={getImageUrl(picture.thumbnail || picture.url)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <select
                      multiple
                      value={formData.categories}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        categories: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Cost - Inside City *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.deliveryCost.insideCity}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        deliveryCost: { ...formData.deliveryCost, insideCity: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Cost - Outside City *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.deliveryCost.outsideCity}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        deliveryCost: { ...formData.deliveryCost, outsideCity: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Attributes
                    </label>
                    <button
                      type="button"
                      onClick={addAttributePair}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Attribute
                    </button>
                  </div>
                  
                  {formData.attributePairs.length === 0 ? (
                    <div className="text-gray-500 text-sm italic p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                      No attributes added. Click "Add Attribute" to add product attributes.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.attributePairs.map((pair, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Attribute name (e.g., Color, Size, Material)"
                            value={pair.key}
                            onChange={(e) => updateAttributePair(index, 'key', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-500">:</span>
                          <input
                            type="text"
                            placeholder="Value (e.g., Red, Large, Cotton)"
                            value={pair.value}
                            onChange={(e) => updateAttributePair(index, 'value', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttributePair(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove attribute"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Add product attributes like Color, Size, Material, etc. These will help customers find and filter products.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFlashSale}
                      onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Flash Sale</span>
                  </div>
                  {formData.isFlashSale && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Flash Sale Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.flashSalePrice}
                          onChange={(e) => setFormData({ ...formData, flashSalePrice: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Flash Sale Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.flashSaleStartTime}
                          onChange={(e) => setFormData({ ...formData, flashSaleStartTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Flash Sale End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.flashSaleEndTime}
                          onChange={(e) => setFormData({ ...formData, flashSaleEndTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
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
                    disabled={uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : (editingProduct ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

