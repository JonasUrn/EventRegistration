type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
};

const Button = ({ children, onClick, type = 'button', variant = 'primary' }: ButtonProps) => {
  const baseStyles = 'px-4 py-2 border transition-colors';

  const variantStyles = {
    primary: 'bg-black text-white border-black hover:bg-gray-800',
    secondary: 'bg-white text-black border-black hover:bg-gray-100',
    danger: 'bg-white text-red-600 border-red-600 hover:bg-red-50',
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
