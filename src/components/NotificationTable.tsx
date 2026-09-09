import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Notification } from '../App';
import { Table, Button, Tag } from 'antd';
import NotificationModal from './NotificationModal';

interface NotificationTableProps {
  data: Notification[];
}

/**
 * Component to render a table of notifications with functionality to view and mark notifications as read.
 */
const NotificationTable: FC<NotificationTableProps> = ({ data }) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = async (notification: Notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);

    const notificationDocRef = doc(db, 'notifications', notification.id);
    await updateDoc(notificationDocRef, { read: true });
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
      render: (text: string, record: Notification) => (
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
      render: (_: unknown, record: Notification) => (
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
