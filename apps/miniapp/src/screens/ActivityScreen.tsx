import { ActivityFeed } from "../components/activity/ActivityFeed";
import { useAppStore } from "../store/appStore";

export function ActivityScreen() {
  const activity = useAppStore((state) => state.portfolio?.activity ?? []);

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
