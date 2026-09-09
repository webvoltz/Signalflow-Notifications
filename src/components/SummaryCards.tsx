import type { FC } from 'react';

interface SummaryCardsProps {
  total: number;
  unread: number;
  read: number;
}

/**
 * Each value remounts (via `key`) when it changes, so the CSS mount
 * animation on .summary-card-value plays as a subtle "pop" on update
 * without needing a JS animation/counting library.
 */
const SummaryCards: FC<SummaryCardsProps> = ({ total, unread, read }) => (
  <div className="summary-cards" role="group" aria-label="Notification summary">
    <div className="summary-card">
      <span className="summary-card-label">Total</span>
      <span className="summary-card-value" key={`total-${total.toString()}`}>
        {total}
      </span>
    </div>
    <div className="summary-card summary-card--unread">
      <span className="summary-card-label">Unread</span>
      <span className="summary-card-value" key={`unread-${unread.toString()}`}>
        {unread}
      </span>
    </div>
    <div className="summary-card">
      <span className="summary-card-label">Read</span>
      <span className="summary-card-value" key={`read-${read.toString()}`}>
        {read}
      </span>
    </div>
  </div>
);

export default SummaryCards;
