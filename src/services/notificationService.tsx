import { addDoc, collection, updateDoc, type DocumentReference } from 'firebase/firestore';
import { useState } from 'react';
import type { FC } from 'react';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { Modal, Button } from 'antd';

interface ToastifyNotificationProps {
  title: string;
  body: string;
  docRef: DocumentReference;
}

/**
 * Displays a notification with options to mark it as read.
 */
export const ToastifyNotification: FC<ToastifyNotificationProps> = ({ title, body, docRef }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = async () => {
    setIsModalVisible(true);
    await markNotificationAsRead(docRef);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    toast.dismiss();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleMarkAsRead = async () => {
    await markNotificationAsRead(docRef);
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

/**
 * Generates a random three-digit number.
 */
function generateRandom3DigitNumber(): number {
  return Math.floor(Math.random() * 900) + 100;
}

/**
 * Sends a notification of a given type and adds it to Firestore.
 */
export const sendNotification = async (type: string): Promise<void> => {
  try {
    const title = type === 'info' ? 'Info' : type === 'alert' ? 'Alert' : 'Message';
    const randomDigits = generateRandom3DigitNumber();
    const message = `This is a sample ${title} text - ${randomDigits.toString()}`;
    const docRef = await addDoc(collection(db, 'notifications'), {
      type,
      message,
      read: false,
      timestamp: new Date(),
    });

    toast(<ToastifyNotification title={`New ${title}`} body={message} docRef={docRef} />);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

/**
 * Marks a notification as read in Firestore.
 */
export const markNotificationAsRead = async (docRef: DocumentReference): Promise<void> => {
  try {
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error('Error updating document: ', error);
  }
};
