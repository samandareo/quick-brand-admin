import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { EyeIcon, TrashIcon } from "../components/icons";
import { DeleteUserById, getUsers, getUserTransactions } from "../apis";
import { PencilAltIcon } from "@heroicons/react/outline";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const navigator = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        users?.length == 0 && setLoading(true);
        let params = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (searchTerm.trim() !== "") {
          params.search = searchTerm;
          params.page = 1;
        }
        const { data } = await getUsers(params);
        if (isMounted) {
          setUsers(data?.data.users);
          setTotalPages(data?.data.pages);
          if (searchTerm.trim() !== "") setCurrentPage(1);
        }
      } catch (err) {
        if (isMounted)
          setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const handler = setTimeout(fetchUsers, 500);

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
    // eslint-disable-next-line
  }, [currentPage, searchTerm]);

  const viewTransactions = async (userId) => {
    try {
      const { data } = await getUserTransactions(userId, { limit: 10 });
      setUserTransactions(data.data.transactions);
      setSelectedUser(users.find((u) => u._id === userId));
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const { data } = await DeleteUserById(userId);
      if (!data.success) setError("Failed to delete user");
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading && !showModal) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search users by name or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Table
          headers={[
            "Name",
            "Phone",
            "Balance",
            "Joined",
            "Status",
            "Verified",
            "Actions",
          ]}
          data={users}
          renderRow={(user) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.phoneNo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.wallet?.balance?.toLocaleString() || "0"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Blocked"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isVerified ? "Verified" : "Pending"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-start text-sm font-medium">
                <button
                  onClick={() => viewTransactions(user._id)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                  title="View Transactions"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigator(`/users/edit/${user?._id}`)}
                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                  title="View Transactions"
                >
                  <PencilAltIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </>
          )}
        />

        <div className="flex items-center justify-between mt-4 px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing page{" "}
            <span className="font-medium">
              {totalPages == 0 ? 0 : currentPage}
            </span>{" "}
            of <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Recent Transactions - ${selectedUser?.name}`}
        size="2xl"
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userTransactions?.length > 0 ? (
                  userTransactions?.map((txn) => (
                    <tr key={txn._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(txn.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {txn.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            txn.type === "credit"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {txn.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {txn.reference}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
