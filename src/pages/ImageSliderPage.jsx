import React, { useState, useEffect } from 'react';

import {
    createImageSlider,
    getImageSliders,
    updateImageSlider,
    deleteImageSlider,
} from '../apis';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DeleteConfirmation from '../components/ui/DeleteConfirmation';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import Alert from '../components/ui/Alert';
import StatusBadge from '../components/ui/StatusBadge';
import config from '../config/config';

export default function ImageSliderPage() {
    const [imageSliders, setImageSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: null,
        link: "",
        type: "combo",
        isActive: true
    });
    const [imagePreview, setImagePreview] = useState(null);

    const fetchImageSliders = async () => {
        try {
            setLoading(true);
            const response = await getImageSliders();
            console.log('Fetched image sliders:', response.data);
            setImageSliders(response.data.data);
        } catch (err) {
            console.error('Error fetching image sliders:', err);
            setError(err.response?.data?.message || "Failed to fetch image sliders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImageSliders();
        
        // Cleanup function to revoke object URLs when component unmounts
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Clean up previous preview URL if it exists
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const openModal = (item = null) => {
        // Clean up previous preview URL if it exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        
        if (item) {
            setSelectedItem(item);
            setFormData({
                title: item.title,
                description: item.description,
                image: null,
                link: item.link,
                type: item.type,
                isActive: item.isActive
            });
            setImagePreview(item.image ? `${config.apiUrl}/api/uploads/sliders/${item.image}` : null);
        } else {
            setSelectedItem(null);
            setFormData({
                title: "",
                description: "",
                image: null,
                link: "",
                type: "combo",
                isActive: true
            });
            setImagePreview(null);
        }
        setModalOpen(true);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Enhanced validation
        const errors = [];
        if (!formData.title.trim()) errors.push("Title is required");
        if (!formData.description.trim()) errors.push("Description is required");
        if (!formData.link.trim()) errors.push("Link is required");
        if (!formData.type) errors.push("Type is required");
        
        // For new items, image is required
        if (!selectedItem && !formData.image) {
            errors.push("Image is required for new sliders");
        }

        if (errors.length > 0) {
            setError(errors.join(", "));
            return;
        }

        try {
            setFormLoading(true);
            setError("");

            const submitData = new FormData();
            submitData.append("title", formData.title.trim());
            submitData.append("description", formData.description.trim());
            submitData.append("link", formData.link.trim());
            submitData.append("type", formData.type);
            submitData.append("isActive", formData.isActive);
            if (formData.image) {
                submitData.append("image", formData.image);
            }

            console.log('Submitting data:', {
                title: formData.title,
                description: formData.description,
                link: formData.link,
                type: formData.type,
                isActive: formData.isActive,
                hasImage: !!formData.image,
                isUpdate: !!selectedItem
            });

            if (selectedItem) {
                await updateImageSlider(selectedItem._id, submitData);
                setSuccess("Image slider updated successfully");
            } else {
                await createImageSlider(submitData);
                setSuccess("Image slider created successfully");
            }

            // Fetch updated data and close modal only after successful API call
            await fetchImageSliders();
            setModalOpen(false);
            setFormData({
                title: "",
                description: "",
                image: null,
                link: "",
                type: "combo",
                isActive: true
            });
            setImagePreview(null);
        } catch (err) {
            console.error('Error submitting image slider:', err);
            setError(err.response?.data?.message || "Failed to submit image slider");
            // Don't close modal on error, let user fix the issue
        } finally {
            setFormLoading(false);
        }
    }

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setDeleteModalOpen(true);
    }

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            console.log('Deleting image slider:', selectedItem._id);
            await deleteImageSlider(selectedItem._id);
            setImageSliders(prev => prev.filter(item => item._id !== selectedItem._id));
            setDeleteModalOpen(false);
            setSuccess("Image slider deleted successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error('Error deleting image slider:', err);
            setError(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeleteLoading(false);
        }
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Image Slider Management</h1>
                <Button onClick={() => openModal()}>Add Image Slider</Button>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" onClose={() => setSuccess("")}>
                    {success}
                </Alert>
            )}

            <Card>
                {imageSliders.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No image sliders found</p>
                        <Button onClick={() => openModal()}>Add First Slider</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {imageSliders.map((slider) => (
                            <Card key={slider._id}>
                                <div className="flex flex-col items-center space-x-3 mb-3">
                                    <img
                                        src={`${config.apiUrl}/api/uploads/sliders/${slider.image}`}
                                        alt={slider.title}
                                        className="h-32 w-full object-fill"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{slider.title}</h3>
                                        <p className="text-sm text-gray-500">{slider.description}</p>
                                        <p className="text-sm text-blue-500">{slider.link}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <StatusBadge status={slider.isActive ? "active" : "inactive"} />
                                    <div className="flex items-center space-x-2">
                                        <Button variant="primary" onClick={() => openModal(slider)}>Edit</Button>
                                        <Button variant="danger" onClick={() => handleDeleteClick(slider)}>Delete</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedItem ? "Edit Image Slider" : "Add Image Slider"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Title" name="title" value={formData.title} onChange={handleInputChange} required />
                    <Input label="Description" name="description" value={formData.description} onChange={handleInputChange} required />
                    <Input label="Link" name="link" value={formData.link} onChange={handleInputChange} required />
                    <label htmlFor="type" className="block text-md font-medium">Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleInputChange} required className="block w-64 rounded-md border border-gray-300 shadow-sm outline-none ring-0 p-1">
                        <option value="all">All</option>
                        <option value="home">Home</option>
                        <option value="internet">Internet</option>
                        <option value="combo">Combo</option>
                        <option value="minute">Minute</option>
                    </select>
                    
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Active
                        </label>
                    </div>

                    <ImageUpload
                        label="Image"
                        onChange={handleImageChange}
                        preview={imagePreview}
                        required={!selectedItem}
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={formLoading}>Cancel</Button>
                        <Button type="submit" disabled={formLoading}>{selectedItem ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmation
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    )
}