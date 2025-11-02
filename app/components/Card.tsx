type CardProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

const Card = ({ children, onClick }: CardProps) => {
  const className = `border border-black p-4 bg-white ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`;

  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
