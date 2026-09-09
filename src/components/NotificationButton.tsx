import type { FC } from 'react';
import { sendNotification } from '../services/notificationService';

interface NotificationButtonProps {
  type: 'info' | 'alert' | 'message';
}

/**
 * Button component for sending notifications based on type.
 */
const NotificationButton: FC<NotificationButtonProps> = ({ type }) => {
  const handleClick = () => {
    void sendNotification(type);
  };

  return (
    <button type="button" className="btn-primary" onClick={handleClick}>
      {`Send ${type}`}
    </button>
  );
};

export default NotificationButton;
