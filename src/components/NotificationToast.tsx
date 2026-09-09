import { useState } from 'react';
import type { FC } from 'react';
import { toast } from 'react-toastify';
import { Modal, Button } from 'antd';
import { markNotificationAsRead } from '../services/notificationService';

interface NotificationToastProps {
  title: string;
  body: string;
  notificationId: string;
}

/**
 * Displays a notification with options to mark it as read.
 */
const NotificationToast: FC<NotificationToastProps> = ({ title, body, notificationId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = async () => {
    setIsModalVisible(true);
    await markNotificationAsRead(notificationId);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    toast.dismiss();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleMarkAsRead = async () => {
    await markNotificationAsRead(notificationId);
    toast.dismiss();
  };

  return (
    <>
      <div
        className="push-notification"
        role="button"
        tabIndex={0}
        onClick={() => {
          void handleClick();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void handleClick();
          }
        }}
      >
        <h2 className="push-notification-title">{title}</h2>
        <p className="push-notification-text">{body}</p>
      </div>
      <Button
        onClick={(event) => {
          event.stopPropagation();
          void handleMarkAsRead();
        }}
      >
        Mark as Read
      </Button>

      <Modal
        title="Notification Details"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="ok" onClick={handleOk}>
            OK
          </Button>,
        ]}
      >
        <p>
          <strong>Title:</strong> {title}
        </p>
        <p>
          <strong>Message:</strong> {body}
        </p>
      </Modal>
    </>
  );
};

export default NotificationToast;
