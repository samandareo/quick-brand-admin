import { XMarkIcon } from "../icons";

const Alert = ({ children, variant = "info", onClose, className = "" }) => {
  const variants = {
    info: "bg-blue-50 text-blue-800",
    success: "bg-green-50 text-green-800",
    warning: "bg-yellow-50 text-yellow-800",
    danger: "bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-md p-4 mb-4 ${variants[variant]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0"></div>
        <div className="ml-3 flex-1">
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`-mx-1.5 -my-1.5 inline-flex rounded-md p-1.5 focus:outline-none ${
                variant === "info"
                  ? "hover:bg-blue-100"
                  : variant === "success"
                  ? "hover:bg-green-100"
                  : variant === "warning"
                  ? "hover:bg-yellow-100"
                  : "hover:bg-red-100"
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
