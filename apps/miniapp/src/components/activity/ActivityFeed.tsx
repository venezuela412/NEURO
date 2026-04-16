import type { ActivityEvent } from "@neuro/shared";
import { motion } from "framer-motion";

interface ActivityFeedProps {
  items: ActivityEvent[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="card page-stack center-stack">
        <h3>No activity yet</h3>
        <p className="muted">Generate and activate a plan to start a clear activity history.</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {items.map((item, index) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`activity-item activity-item-${item.tone}`}
        >
          <div className="activity-item-header">
            <h3>{item.title}</h3>
            <span>{item.timestampLabel}</span>
          </div>
          <p>{item.description}</p>
        </motion.article>
      ))}
    </div>
  );
}
