import { useEffect, useState } from "react";
import {
    createSocialMedia,
    getSocialMedia,
    updateSocialMedia,
    deleteSocialMedia,
} from "../apis";               
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import DeleteConfirmation from "../components/ui/DeleteConfirmation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import ImageUpload from "../components/ui/ImageUpload";
import config from "../config/config";

const SocialMedia = () => {
    const [socialMedia, setSocialMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    const [formData, setFormData] = useState({
        name: "",
        url: "",
        logo: null,
    });
    const [logoPreview, setLogoPreview] = useState(null);

    const { user } = useAuth();

    // Fetch social media data
    const fetchSocialMedia = async () => {
        try {
            setLoading(true);
            const response = await getSocialMedia();
            setSocialMedia(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch social media");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSocialMedia();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                logo: file
            }));
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
        }
    };

    // Open modal for create/edit
    const openModal = (item = null) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                name: item.name,
                url: item.url,
                logo: null,
            });
            // Set preview for existing logo
            setLogoPreview(item.logo ? `${config.apiUrl}/api/uploads/social-media/${item.logo}` : null);
        } else {
            setSelectedItem(null);
            setFormData({
                name: "",
                url: "",
                logo: null,
            });
            setLogoPreview(null);
        }
        setModalOpen(true);
        setError("");
        setSuccess("");
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.url.trim()) {
            setError("Name and URL are required");
            return;
        }

        try {
            setFormLoading(true);
            setError("");
            
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("url", formData.url);
            if (formData.logo) {
                submitData.append("logo", formData.logo);
            }

            if (selectedItem) {
                // Update existing
                await updateSocialMedia(selectedItem._id, submitData);
                setSuccess("Social media updated successfully");
            } else {
                // Create new
                await createSocialMedia(submitData);
                setSuccess("Social media created successfully");
            }

            fetchSocialMedia();
            setModalOpen(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Operation failed");
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete
    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            await deleteSocialMedia(selectedItem._id);
            setSocialMedia(prev => prev.filter(item => item._id !== selectedItem._id));
            setDeleteModalOpen(false);
            setSuccess("Social media deleted successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Social Media Management</h1>
                <Button onClick={() => openModal()}>Add Social Media</Button>
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
                {socialMedia.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No social media platforms found</p>
                        <Button 
                            onClick={() => openModal()} 
                            className="mt-4"
                        >
                            Add First Platform
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {socialMedia.map((item) => (
                            <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3 mb-3">
                                    {item.logo && (
                                        <img
                                            src={`${config.apiUrl}/api/uploads/social-media/${item.logo}`}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                        <a 
                                            href={item.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                                        >
                                            {item.url}
                                        </a>
                                    </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openModal(item)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleDeleteClick(item)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? "Edit Social Media" : "Add Social Media"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Platform Name *
                        </label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., YouTube, Facebook, Twitter"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL *
                        </label>
                        <Input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/your-profile"
                            required
                        />
                    </div>

                    <div>
                        <ImageUpload
                            label="Logo"
                            onChange={handleImageChange}
                            preview={logoPreview}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                            disabled={formLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={formLoading}
                        >
                            {selectedItem ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmation
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={deleteLoading}
                title="Delete Social Media"
                message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default SocialMedia;
    