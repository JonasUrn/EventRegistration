type MessageProps = {
  type: 'success' | 'error';
  children: React.ReactNode;
};

const Message = ({ type, children }: MessageProps) => {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-800',
    error: 'bg-red-50 text-red-800 border-red-800',
  };

  return (
    <div className={`border px-4 py-3 ${styles[type]}`}>
      {children}
    </div>
  );
};

export default Message;
