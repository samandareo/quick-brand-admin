const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  className = "",
  disabled = false,
  error = "",
  parentClassName = "",
  ...props
}) => {
  return (
    <div className={`${parentClassName}`}>
      <label htmlFor={name} className="capitalize">
        {name}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`block w-64 rounded-md border border-gray-300 shadow-sm outline-none ring-0 p-1 ${
          error
            ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
            : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
