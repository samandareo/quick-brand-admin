import React, { useState, useEffect } from 'react';
import { 
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '../../components/icons';
import { 
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  refundDeliveryCost,
  getOrderStats
} from '../../apis';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ orderId: '', currentStatus: '', newStatus: '', reason: '', notes: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        getAllOrders({ page: 1, limit: 50 }),
        getOrderStats()
      ]);

      console.log('Orders API Response:', ordersRes.data);
      console.log('Stats API Response:', statsRes.data);

      if (ordersRes.data?.success) {
        // Handle the correct response structure from getAllOrders
        const ordersData = ordersRes.data.data;
        if (ordersData?.orders && Array.isArray(ordersData.orders)) {
          setOrders(ordersData.orders);
        } else if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          console.warn('Unexpected orders data structure:', ordersData);
          setOrders([]);
        }
      } else {
        console.warn('Orders API failed:', ordersRes.data);
        setOrders([]);
      }

      if (statsRes.data?.success) {
        const statsData = statsRes.data.data || {};
        
        // Use simplified stats directly
        setStats({
          pendingOrders: statsData.pendingOrders || 0,
          confirmedOrders: statsData.confirmedOrders || 0,
          cancelledOrders: statsData.cancelledOrders || 0,
          shippingOrders: statsData.shippingOrders || 0,
          deliveringOrders: statsData.deliveringOrders || 0,
          deliveredOrders: statsData.deliveredOrders || 0,
          totalOrders: statsData.totalOrders || 0
        });
      } else {
        console.warn('Stats API failed:', statsRes.data);
        setStats({
          pendingOrders: 0,
          confirmedOrders: 0,
          cancelledOrders: 0,
          shippingOrders: 0,
          deliveringOrders: 0,
          deliveredOrders: 0,
          totalOrders: 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setOrders([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status, reason = '', notes = '') => {
    try {
      await updateOrderStatus(orderId, { status, reason: reason || `Status updated to ${status}`, notes });
      fetchData();
      setShowStatusModal(false);
      setStatusUpdateData({ orderId: '', currentStatus: '', newStatus: '', reason: '', notes: '' });
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenStatusModal = (order, newStatus) => {
    setStatusUpdateData({
      orderId: order._id,
      currentStatus: order.status,
      newStatus: newStatus,
      reason: '',
      notes: ''
    });
    setShowStatusModal(true);
  };

  const getValidStatusTransitions = (currentStatus) => {
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipping', 'cancelled'],
      'shipping': ['delivering', 'cancelled'],
      'delivering': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    return validTransitions[currentStatus] || [];
  };

  const handleRefund = async (orderId) => {
    if (window.confirm('Are you sure you want to refund the delivery cost?')) {
      try {
        await refundDeliveryCost(orderId, { reason: 'Delivery cost refunded by admin' });
        fetchData();
      } catch (error) {
        console.error('Error refunding delivery cost:', error);
      }
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await getOrderById(orderId);
      if (response.data?.success) {
        setSelectedOrder(response.data.data);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.invoice?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'delivering': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canRefund = (order) => {
    return (order.status === 'confirmed' || order.status === 'cancelled') && !order.deliveryCostRefunded;
  };

  const hasRefunded = (order) => {
    return order.deliveryCostRefunded;
  };

  const getStatusActionColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 hover:text-green-900';
      case 'cancelled': return 'text-red-600 hover:text-red-900';
      case 'shipping': return 'text-purple-600 hover:text-purple-900';
      case 'delivering': return 'text-orange-600 hover:text-orange-900';
      case 'delivered': return 'text-emerald-600 hover:text-emerald-900';
      default: return 'text-gray-600 hover:text-gray-900';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckIcon className="h-4 w-4" />;
      case 'cancelled': return <XMarkIcon className="h-4 w-4" />;
      case 'shipping': return <span className="text-xs font-bold">📦</span>;
      case 'delivering': return <span className="text-xs font-bold">🚚</span>;
      case 'delivered': return <span className="text-xs font-bold">✅</span>;
      default: return <span className="text-xs font-bold">?</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage customer orders and track their status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-500">
              <span className="text-white text-sm font-bold">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">{stats.pendingOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-500">
              <CheckIcon className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Confirmed</p>
              <p className="text-lg font-semibold text-gray-900">{stats.confirmedOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-500">
              <span className="text-white text-sm font-bold">📦</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Shipping</p>
              <p className="text-lg font-semibold text-gray-900">{stats.shippingOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-orange-500">
              <span className="text-white text-sm font-bold">🚚</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Delivering</p>
              <p className="text-lg font-semibold text-gray-900">{stats.deliveringOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-500">
              <span className="text-white text-sm font-bold">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Delivered</p>
              <p className="text-lg font-semibold text-gray-900">{stats.deliveredOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-500">
              <XMarkIcon className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Cancelled</p>
              <p className="text-lg font-semibold text-gray-900">{stats.cancelledOrders || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID, customer name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipping">Shipping</option>
              <option value="delivering">Delivering</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
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
              <option value="orderTotal-desc">Highest Amount</option>
              <option value="orderTotal-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.invoice || `#${order._id.slice(-8)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.address?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.address?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(order.deliveryCost + (order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {/* Debug: Show current status and valid transitions */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-gray-500" title={`Status: ${order.status}, Transitions: ${getValidStatusTransitions(order.status).join(', ')}`}>
                            🐛
                          </div>
                        )}
                        
                        {/* Status update buttons based on valid transitions */}
                        {getValidStatusTransitions(order.status).map((validStatus) => (
                          <button
                            key={validStatus}
                            onClick={() => {
                              console.log('Status button clicked:', {
                                orderId: order._id,
                                currentStatus: order.status,
                                newStatus: validStatus
                              });
                              handleOpenStatusModal(order, validStatus);
                            }}
                            className={`${getStatusActionColor(validStatus)} hover:opacity-80 border border-current rounded px-1`}
                            title={`Change to ${validStatus}`}
                          >
                            {getStatusIcon(validStatus)}
                          </button>
                        ))}
                        
                        {/* Debug: Show if no buttons available */}
                        {getValidStatusTransitions(order.status).length === 0 && (
                          <span className="text-xs text-gray-400 italic">No actions</span>
                        )}
                        
                        {canRefund(order) && (
                          <button
                            onClick={() => handleRefund(order._id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Refund Delivery Cost"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        {hasRefunded(order) && (
                          <span className="text-green-600 text-xs font-medium">Refunded</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details - {selectedOrder.invoice || `#${selectedOrder._id.slice(-8)}`}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Order Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Invoice:</span>
                        <span className="text-sm font-medium">{selectedOrder.invoice || `#${selectedOrder._id.slice(-8)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Method:</span>
                        <span className="text-sm font-medium">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Address</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium">{selectedOrder.address?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.address?.phone || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.address?.fullAddress || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.address?.district || 'N/A'}, {selectedOrder.address?.thana || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product?.name}</p>
                            {item.variant && (
                              <p className="text-xs text-gray-600">
                                Variant: {Object.entries(item.variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                              </p>
                            )}
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">${item.price}</p>
                            <p className="text-xs text-gray-600">Total: ${item.total}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${(selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Cost:</span>
                        <span>${selectedOrder.deliveryCost?.toFixed(2) || 0}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>${(selectedOrder.deliveryCost + (selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refunds */}
                {selectedOrder.refunds && selectedOrder.refunds.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Refunds</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedOrder.refunds.map((refund, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">${refund.amount}</p>
                            <p className="text-xs text-gray-600">{refund.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">
                              {new Date(refund.refundedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Order Status
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Change status from <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(statusUpdateData.currentStatus)}`}>
                    {statusUpdateData.currentStatus}
                  </span> to <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(statusUpdateData.newStatus)}`}>
                    {statusUpdateData.newStatus}
                  </span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Update *
                </label>
                <input
                  type="text"
                  value={statusUpdateData.reason}
                  onChange={(e) => setStatusUpdateData({...statusUpdateData, reason: e.target.value})}
                  placeholder="Enter reason for status change"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={statusUpdateData.notes}
                  onChange={(e) => setStatusUpdateData({...statusUpdateData, notes: e.target.value})}
                  placeholder="Add any additional notes..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusUpdateData({ orderId: '', currentStatus: '', newStatus: '', reason: '', notes: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!statusUpdateData.reason.trim()) {
                      alert('Please provide a reason for the status change');
                      return;
                    }
                    handleStatusUpdate(
                      statusUpdateData.orderId, 
                      statusUpdateData.newStatus, 
                      statusUpdateData.reason,
                      statusUpdateData.notes
                    );
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

