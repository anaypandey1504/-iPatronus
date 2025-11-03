interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}