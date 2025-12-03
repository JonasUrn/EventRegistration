import styles from './Button.module.css';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false }: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
