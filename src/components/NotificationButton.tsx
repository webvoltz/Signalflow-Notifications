import type { FC } from 'react';
import type { NotificationType } from '../types/notification';

interface NotificationButtonProps {
  type: NotificationType;
  onSend: (type: NotificationType) => void;
}

/**
 * Button that fires off a sample notification of the given type.
 */
const NotificationButton: FC<NotificationButtonProps> = ({ type, onSend }) => (
  <button
    type="button"
    className="notification-button"
    onClick={() => {
      onSend(type);
    }}
  >
    {`Send ${type}`}
  </button>
);

export default NotificationButton;
