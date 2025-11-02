type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
};

const Button = ({ children, onClick, type = 'button', variant = 'primary' }: ButtonProps) => {
  const baseStyles = 'px-6 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95';

  const variantStyles = {
    primary: 'bg-white text-black hover:bg-gray-100 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 hover:border-gray-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-md hover:shadow-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;
