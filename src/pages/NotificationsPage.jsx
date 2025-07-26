import React, { useEffect, useState } from "react";
import {
  getPushNotifications,
  createPushNotification,
  updatePushNotification,
  deletePushNotification,
  sendPushNotification,
  getPushNotificationStats,
} from "../apis";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Alert from "../components/ui/Alert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatusBadge from "../components/ui/StatusBadge";

import { EyeIcon, TrashIcon, PencilIcon, PaperAirplaneIcon} from "../components/icons";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipientType: "all",
  });

  // Table headers
  const headers = [
    "Title",
    "Message",
    "Recipient",
    "Status",
    "Read",
    "Delivered",
    "Created By",
    "Actions",
  ];

  // Fetch notifications
  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getPushNotifications({ page, limit: 10 });
      setNotifications(res.data.data.notifications);
      setTotalPages(res.data.data.pagination.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selected) {
                await updatePushNotification(selected._id, selected);
            } else {
                await createPushNotification(formData);
            }
            setSuccess("Notification created successfully");
            fetchNotifications(page);
            setModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create notification");
        }
    }
    const handleView = (item) => {
        setSelected(item);
        setModalOpen(true);
    };
    const handleEdit = (item) => {
        setSelected(item);
        setModalOpen(true);
    };
    const handleDelete = async (item) => {
        if (!window.confirm("Are you sure you want to delete this notification?")) return;
        try {
        await deletePushNotification(item._id);
        setSuccess("Notification deleted successfully");
        fetchNotifications(page);
        } catch (err) {
        setError(err.response?.data?.message || "Failed to delete notification");
        }
    };
    const handleSend = async (item) => {
        try {
        await sendPushNotification(item._id);
        setSuccess("Notification sent successfully");
        fetchNotifications(page);
        } catch (err) {
        setError(err.response?.data?.message || "Failed to send notification");
        }
    };

  // Render a row for the Table component
  const renderRow = (row) => [
    <td key="title" className="px-6 py-4 whitespace-nowrap">{row.title}</td>,
    <td key="message" className="px-6 py-4 whitespace-nowrap">{row.message}</td>,
    <td key="recipientType" className="px-6 py-4 whitespace-nowrap">{row.recipientType}</td>,
    <td key="status" className="px-6 py-4 whitespace-nowrap"><StatusBadge status={row.status} /></td>,
    <td key="readCount" className="px-6 py-4 whitespace-nowrap">{row.readCount}</td>,
    <td key="deliveryCount" className="px-6 py-4 whitespace-nowrap">{row.deliveryCount}</td>,
    <td key="createdBy" className="px-6 py-4 whitespace-nowrap">{row.createdBy?.name || "-"}</td>,
    <td key="actions" className="px-6 py-4 whitespace-nowrap">
      <div className="flex gap-1">
        <button onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-900 mr-3" title="View"><EyeIcon className="h-5 w-5" /></button>
        {row.status !== "sent" && <button onClick={() => handleEdit(row)} className="text-yellow-600 hover:text-yellow-900 mr-3" title="Edit"><PencilIcon className="h-5 w-5" /></button>}
        {row.status !== "sent" && <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-900" title="Delete"><TrashIcon className="h-5 w-5" /></button>}
        {row.status !== "sent" && <button onClick={() => handleSend(row)} className="text-green-600 hover:text-green-900 flex items-center gap-1 border border-green-600 rounded-md px-2 py-1" title="Send">Send <PaperAirplaneIcon className="h-5 w-5" /></button>}
      </div>
    </td>,
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Push Notifications</h1>
      {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}
      <Button onClick={() => { setSelected(null); setModalOpen(true); }}>Create Notification</Button>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table
          headers={headers}
          data={notifications}
          renderRow={renderRow}
        />
      )}

      {/* Pagination controls */}
      <div className="flex justify-center space-x-2">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
        <span>Page {page} of {totalPages}</span>
        <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>


      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? "Notification Details" : "Create Notification"}>
        {selected ? (
          <div className="space-y-2">
            <div><b>Title:</b> {selected.title}</div>
            <div><b>Message:</b> {selected.message}</div>
            <div><b>Recipient:</b> {selected.recipientType}</div>
            <div><b>Status:</b> {selected.status}</div>
            <div><b>Read Count:</b> {selected.readCount}</div>
            <div><b>Delivery Count:</b> {selected.deliveryCount}</div>
            <div><b>Created By:</b> {selected.createdBy?.name} ({selected.createdBy?.email})</div>
            <div><b>Created At:</b> {selected.createdAt}</div>
            <div><b>Updated At:</b> {selected.updatedAt}</div>
            {selected.sentAt && <div><b>Sent At:</b> {selected.sentAt}</div>}
          </div>
        ) : selected === null ? (
          <div>
            <div className="flex flex-col gap-3 mb-4">
                <Input name="title" value={formData.title} onChange={handleInputChange} required />
                <Input name="message" value={formData.message} onChange={handleInputChange} required />

                <div className="flex flex-col gap-2">
                    <label htmlFor="recipientType" className="block text-md font-medium mt-2">Recipient Type</label>
                    <select id="recipientType" name="recipientType" value={formData.recipientType} onChange={handleInputChange} required className="block w-64 rounded-md border border-gray-300 shadow-sm outline-none ring-0 p-1">
                        <option value="all">All users</option>
                        <option value="subscribed">Subscribed users</option>
                        <option value="non_subscribed">Non Subscribed users</option>
                    </select>
                </div>
            </div>
            <Button onClick={handleSubmit}>Create</Button>
          </div>
        ): (
            <div className="flex flex-col gap-3 mb-4">
                    <Input name="title" value={selected.title} onChange={(e) => {setSelected({...selected, title: e.target.value})}} required />
                    <Input name="message" value={selected.message} onChange={(e) => {setSelected({...selected, message: e.target.value})}} required />

                    <div className="flex flex-col gap-2">
                        <label htmlFor="recipientType" className="block text-md font-medium mt-2">Recipient Type</label>
                        <select id="recipientType" name="recipientType" value={selected.recipientType} onChange={(e) => {setSelected({...selected, recipientType: e.target.value})}} required className="block w-64 rounded-md border border-gray-300 shadow-sm outline-none ring-0 p-1">
                            <option value="all">All users</option>
                            <option value="subscribed">Subscribed users</option>
                            <option value="non_subscribed">Non Subscribed users</option>
                        </select>
                    </div>
                <Button onClick={handleSubmit}>Update</Button>
            </div>
        )}
      </Modal>
    </div>
  );
}