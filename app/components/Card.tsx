import styles from './Card.module.css';

type CardProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

const Card = ({ children, onClick }: CardProps) => {
  const className = `${styles.card} ${onClick ? styles.clickable : ''}`;

  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
