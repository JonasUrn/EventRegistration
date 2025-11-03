import styles from './Message.module.css';

type MessageProps = {
  type: 'success' | 'error';
  children: React.ReactNode;
};

const Message = ({ type, children }: MessageProps) => {
  return (
    <div className={`${styles.message} ${styles[type]}`}>
      {children}
    </div>
  );
};

export default Message;
