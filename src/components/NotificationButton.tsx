import type { FC } from 'react';
import { toast } from 'react-toastify';
import { createNotification } from '../services/notificationService';
import NotificationToast from './NotificationToast';
import type { NotificationType } from '../types/notification';

interface NotificationButtonProps {
  type: NotificationType;
}

/**
 * Button component for sending notifications based on type.
 */
const NotificationButton: FC<NotificationButtonProps> = ({ type }) => {
  const handleClick = async () => {
    try {
      const notification = await createNotification(type);
      toast(
        <NotificationToast
          title={notification.title}
          body={notification.message}
          notificationId={notification.id}
        />,
      );
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <button
      type="button"
      className="btn-primary"
      onClick={() => {
        void handleClick();
      }}
    >
      {`Send ${type}`}
    </button>
  );
};

export default NotificationButton;
