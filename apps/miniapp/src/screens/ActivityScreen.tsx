import { ActivityFeed } from "../components/activity/ActivityFeed";
import { useAppStore } from "../store/appStore";

export function ActivityScreen() {
  const activity = useAppStore((state) => state.portfolio?.activity ?? []);
  const isPortfolioHydrating = useAppStore((state) => state.isPortfolioHydrating);

  if (isPortfolioHydrating) {
    return (
      <div className="page-stack">
        <section className="card">
          <p className="eyebrow">Meaningful updates only</p>
          <h1 className="headline-sm">Loading activity</h1>
          <p className="muted">
            NEURO is restoring your most recent plan events from the control plane.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="card">
        <p className="eyebrow">Meaningful updates only</p>
        <h1 className="headline-sm">Activity feed</h1>
        <p className="muted">
          Clear updates about what NEURO prepared, protected, or adjusted for your plan.
        </p>
      </section>
      <ActivityFeed items={activity} />
    </div>
  );
}
