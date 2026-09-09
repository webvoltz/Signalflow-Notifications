import { useEffect, useId, useRef, useState } from 'react';
import type { FC, KeyboardEvent, SyntheticEvent } from 'react';
import type { NotificationType } from '../types/notification';
import { NOTIFICATION_TYPE_META, NOTIFICATION_TYPES } from '../utils/notificationTypeMeta';
import './modal.css';

const MAX_MESSAGE_LENGTH = 500;

interface CreateNotificationModalProps {
  onClose: () => void;
  onSubmit: (type: NotificationType, message: string) => Promise<boolean>;
}

function validateMessage(message: string): string | null {
  if (message.length === 0) {
    return 'Message is required.';
  }
  if (message.trim().length === 0) {
    return 'Message cannot contain only whitespace.';
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return `Message must be ${MAX_MESSAGE_LENGTH.toString()} characters or fewer.`;
  }
  return null;
}

/**
 * Notification creation dialog. Validation only appears after the
 * message field has been touched (blurred) or a submit was attempted -
 * never immediately on open. Keeps a dependency-free focus trap: focus
 * moves into the dialog on open, Tab/Shift+Tab cycle within it, Escape
 * closes it, and focus returns to whatever triggered it on close.
 */
const CreateNotificationModal: FC<CreateNotificationModalProps> = ({ onClose, onSubmit }) => {
  const [type, setType] = useState<NotificationType>('info');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const messageFieldId = useId();
  const messageStatusId = useId();

  const validationError = touched ? validateMessage(message) : null;

  useEffect(() => {
    triggerElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Prefer the message field specifically - querySelector('textarea,
    // button, input, ...') would return whichever matches first in
    // document order, which is one of the type radio buttons here.
    const focusable =
      dialogRef.current?.querySelector<HTMLElement>('textarea') ??
      dialogRef.current?.querySelector<HTMLElement>('button, input, select');
    focusable?.focus();

    // Deliberately no cleanup here that refocuses the trigger: React's
    // StrictMode double-invokes every effect (setup -> cleanup ->
    // setup) once in development, and a cleanup-driven focus change
    // would fire a real blur on the textarea before the user ever
    // touches it, marking the field "touched" and showing a validation
    // error the instant the dialog opens. Every real close path below
    // restores focus explicitly instead.
  }, []);

  const closeUnlessSubmitting = (): void => {
    if (!isSubmitting) {
      triggerElementRef.current?.focus();
      onClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      closeUnlessSubmitting();
      return;
    }

    if (event.key !== 'Tab' || dialogRef.current === null) {
      return;
    }

    const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    if (first === undefined || last === undefined) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setTouched(true);
    if (validateMessage(message) !== null) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    const success = await onSubmit(type, message);
    setIsSubmitting(false);

    if (success) {
      triggerElementRef.current?.focus();
      onClose();
    } else {
      setSubmitError('Unable to send notification. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <button
        type="button"
        className="modal-overlay-backdrop"
        aria-hidden="true"
        tabIndex={-1}
        onClick={closeUnlessSubmitting}
      />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- WAI-ARIA APG's Dialog pattern requires keydown handling (Escape, focus trap) on the dialog container itself; there is no interactive-role alternative for role="dialog". */}
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-notification-title"
        ref={dialogRef}
        onKeyDown={handleKeyDown}
      >
        <h2 id="create-notification-title">Create notification</h2>
        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <fieldset className="modal-type-fieldset">
            <legend>Notification type</legend>
            <div className="modal-type-options">
              {NOTIFICATION_TYPES.map((option) => (
                <label
                  key={option}
                  className={`modal-type-option ${type === option ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="notification-type"
                    value={option}
                    checked={type === option}
                    onChange={() => {
                      setType(option);
                    }}
                  />
                  <span aria-hidden="true">{NOTIFICATION_TYPE_META[option].icon}</span>
                  {NOTIFICATION_TYPE_META[option].label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="modal-field">
            <label htmlFor={messageFieldId}>Message</label>
            <textarea
              id={messageFieldId}
              value={message}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={4}
              onChange={(event) => {
                setMessage(event.target.value);
              }}
              onBlur={() => {
                setTouched(true);
              }}
              aria-invalid={validationError !== null}
              aria-describedby={messageStatusId}
            />
            <div className="modal-field-meta">
              <span
                id={messageStatusId}
                className={validationError !== null ? 'modal-field-error' : 'modal-field-valid'}
                role={validationError !== null ? 'alert' : undefined}
              >
                {validationError ?? (touched ? '✓ Valid' : '')}
              </span>
              <span className="modal-char-counter">
                {message.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>

          {submitError !== null && (
            <p className="modal-submit-error" role="alert">
              {submitError}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => {
                closeUnlessSubmitting();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="modal-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="modal-submit-spinner" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                'Send notification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
