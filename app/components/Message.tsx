type MessageProps = {
  type: 'success' | 'error';
  children: React.ReactNode;
};

const Message = ({ type, children }: MessageProps) => {
  const styles = {
    success: 'bg-green-950 text-green-300 border-green-800',
    error: 'bg-red-950 text-red-300 border-red-800',
  };

  return (
    <div className={`border px-5 py-4 rounded-lg shadow-md ${styles[type]}`}>
      {children}
    </div>
  );
};

export default Message;
