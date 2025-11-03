import styles from './Input.module.css';

type InputProps = {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

const Input = ({ label, type = 'text', value, onChange, placeholder, required }: InputProps) => {
  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label className={styles.label}>{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={styles.input}
      />
    </div>
  );
};

export default Input;
