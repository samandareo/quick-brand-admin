import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { updateAdmin, updatePassword, getRewardInfo, updateRewardInfo } from "../apis";

const Settings = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    subscriptionAmount: user?.subscriptionAmount || "",
  });
  const [loading, setLoading] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rewardData, setRewardData] = useState({
    referalReward: 0,
    welcomeReward: 0,
  });

  useEffect(() => {
    fetchRewardInfo();
  }, []);

  const fetchRewardInfo = async () => {
    try {
      setRewardLoading(true);
      const { data } = await getRewardInfo();
      if (data?.data) {
        setRewardData({
          referalReward: data.data.referalReward || 0,
          welcomeReward: data.data.welcomeReward || 0,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reward information");
    } finally {
      setRewardLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRewardChange = (e) => {
    const { name, value } = e.target;
    setRewardData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateAdmin({
        name: formData.name,
        email: formData.email,
      });
      setSuccess("Profile updated successfully");
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess("Password updated successfully");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handelSubscriptionUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!formData.subscriptionAmount || isNaN(formData.subscriptionAmount)) {
      setError("Please enter a valid subscription amount");
      setLoading(false);
      return;
    }
    try {
      await updateAdmin({
        subscriptionAmount: Number(formData.subscriptionAmount),
      });
      setSuccess("Subscription amount updated successfully");
      setUser({
        ...user,
        subscriptionAmount: Number(formData.subscriptionAmount),
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update subscription amount"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRewardUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateRewardInfo({
        referalReward: rewardData.referalReward,
        welcomeReward: rewardData.welcomeReward,
      });
      setSuccess("Reward settings updated successfully");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update reward settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card title="Profile Information">
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={true}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Update Profile
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Update Password">
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" loading={loading}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Subscription Settings">
        <form onSubmit={handelSubscriptionUpdate} className="space-y-6">
          <Input
            label="Subscription Amount"
            type="number"
            name="subscriptionAmount"
            value={formData.subscriptionAmount || ""}
            onChange={handleChange}
            min={0}
            required
            className="w-auto mt-2"
          />
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Update Subscription
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Reward Settings">
        {rewardLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          <form onSubmit={handleRewardUpdate} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Referral Reward"
                type="number"
                name="referalReward"
                value={rewardData.referalReward}
                onChange={handleRewardChange}
                min={0}
                step={0.01}
                required
                placeholder="Enter referral reward amount"
              />
              <Input
                label="Welcome Reward"
                type="number"
                name="welcomeReward"
                value={rewardData.welcomeReward}
                onChange={handleRewardChange}
                min={0}
                step={0.01}
                required
                placeholder="Enter welcome reward amount"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Reward Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p><strong>Referral Reward:</strong> Amount given to users when they successfully refer someone</p>
                    <p><strong>Welcome Reward:</strong> Amount given to new users when they first register</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                Update Rewards
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Settings;
