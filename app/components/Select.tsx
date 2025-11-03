import styles from './Select.module.css';

type SelectProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
};

const Select = ({ label, value, onChange, options, required }: SelectProps) => {
  return (
    <div className={styles.selectWrapper}>
      {label && (
        <label className={styles.label}>{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={styles.select}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
