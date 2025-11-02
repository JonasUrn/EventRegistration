type CardProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

const Card = ({ children, onClick }: CardProps) => {
  const className = `bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer hover:bg-gray-750 hover:border-gray-600 hover:shadow-xl transform hover:scale-[1.02]' : ''}`;

  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
