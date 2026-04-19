import { PageWrapper } from "../components/layout/PageWrapper";
import type { ActivityEvent } from "@neuro/shared";
import { ActivityFeed } from "../components/activity/ActivityFeed";
import { useAppStore } from "../store/appStore";
/** Stable fallback — `?? []` in a selector returns a new array every render and triggers infinite updates (React #185). */
const EMPTY_ACTIVITY: ActivityEvent[] = [];

export function ActivityScreen() {
  const activity = useAppStore((state) => state.portfolio?.activity ?? EMPTY_ACTIVITY);
  const isPortfolioHydrating = useAppStore((state) => state.isPortfolioHydrating);

  if (isPortfolioHydrating) {
    return (
      <PageWrapper className="page-stack">
        <section className="card">
          <p className="eyebrow">Meaningful updates only</p>
          <h1 className="headline-sm">Loading activity</h1>
          <p className="muted">
            NEURO is restoring your most recent plan events from the control plane.
          </p>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="page-stack">
      <section className="card">
        <p className="eyebrow">Meaningful updates only</p>
        <h1 className="headline-sm">Activity feed</h1>
        <p className="muted">
          Clear updates about what NEURO prepared, protected, or adjusted for your plan.
        </p>
      </section>
      <ActivityFeed items={activity} />
    </PageWrapper>
  );
}
