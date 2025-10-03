const StatusBadge = ({ status, className }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    sent: "bg-green-100 text-green-800",
    draft: "bg-gray-100 text-gray-800",
  };

  const statusText = {
    pending: "Pending",
    processing: "Processing",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
    failed: "Failed",
    success: "Success",
    active: "Active",
    inactive: "Inactive",
    sent: "Sent",
    draft: "Draft",
  };

  // Use custom className if provided, otherwise use default
  const badgeClassName = className || statusColors[status] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClassName}`}
    >
      {statusText[status] || status}
    </span>
  );
};

export default StatusBadge;
