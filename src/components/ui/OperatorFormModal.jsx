import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ImageUpload from "../ui/ImageUpload";
import config from "../../config/config";

const OperatorFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  operator,
}) => {
  const [name, setName] = useState("");
  const [themeColor, setThemeColor] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (operator) {
      setName(operator.name);
      setThemeColor(operator.themeColor || "#000000");
      setPreviewImage(
        operator.image
          ? `${config.apiUrl}/api/uploads/operators/${operator.image}`
          : ""
      );
    } else {
      setName("");
      setThemeColor("#000000");
      setImage(null);
      setPreviewImage("");
    }
  }, [operator]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("themeColor", themeColor);
    if (image) {
      formData.append("image", image);
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={operator ? "Edit Operator" : "Add New Operator"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <ImageUpload
            preview={previewImage}
            onChange={handleImageChange}
            label="Operator Logo"
            required={!operator}
          />
        </div>

        <Input
          label="Operator Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Add Color Picker */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="themeColor"
          >
            Theme Color
          </label>
          <input
            type="color"
            id="themeColor"
            name="themeColor"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="w-12 h-8 p-0 border-0 bg-transparent"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {operator ? "Update Operator" : "Add Operator"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OperatorFormModal;
