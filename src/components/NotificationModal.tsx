import type { FC } from 'react';
import { Modal, Button } from 'antd';
import type { NotificationRecord } from '../types/notification';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notification: NotificationRecord | null;
}

/**
 * Modal component to display notification details.
 */
const NotificationModal: FC<NotificationModalProps> = ({ visible, onClose, notification }) => {
  if (notification === null) {
    return null;
  }

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) =>
    new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000).toLocaleString();

  return (
    <Modal
      title="Notification Details"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <p>
        <strong>Type:</strong> {notification.type}
      </p>
      <p>
        <strong>Message:</strong> {notification.message}
      </p>
      <p>
        <strong>Timestamp:</strong> {formatDate(notification.timestamp)}
      </p>
    </Modal>
  );
};

export default NotificationModal;
