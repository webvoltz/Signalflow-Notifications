import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { Table, Button, Tag } from 'antd';
import type { NotificationRecord } from '../types/notification';
import { markNotificationAsRead } from '../services/notificationService';
import NotificationModal from './NotificationModal';

interface NotificationTableProps {
  data: NotificationRecord[];
}

/**
 * Component to render a table of notifications with functionality to view and mark notifications as read.
 */
const NotificationTable: FC<NotificationTableProps> = ({ data }) => {
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = async (notification: NotificationRecord) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    await markNotificationAsRead(notification.id);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const columns = [
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text: string, record: NotificationRecord) => (
        <>
          {text}
          {!record.read && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              New
            </Tag>
          )}
        </>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Read',
      dataIndex: 'read',
      key: 'read',
      render: (read: boolean) => (
        <Tag color={read ? 'green' : 'volcano'}>{read ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: { seconds: number; nanoseconds: number }) =>
        new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: NotificationRecord) => (
        <Button
          onClick={() => {
            void openModal(record);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds),
    [data],
  );

  return (
    <>
      <h1>Notifications</h1>
      <Table dataSource={sortedData} columns={columns} rowKey="id" />
      {selectedNotification && (
        <NotificationModal
          visible={modalVisible}
          onClose={closeModal}
          notification={selectedNotification}
        />
      )}
    </>
  );
};

export default NotificationTable;
