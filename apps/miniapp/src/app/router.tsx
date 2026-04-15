/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ActivityScreen } from "../screens/ActivityScreen";
import { LandingScreen } from "../screens/LandingScreen";
import { PlanResultScreen } from "../screens/PlanResultScreen";
import { PlanSelectorScreen } from "../screens/PlanSelectorScreen";
import { ActivePlanScreen } from "../screens/ActivePlanScreen";
import { NotFoundScreen } from "../screens/NotFoundScreen";
import { WalletOnboardingScreen } from "../screens/WalletOnboardingScreen";

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <ShellLayout />,
    children: [
      { index: true, element: <LandingScreen /> },
      { path: "onboarding", element: <WalletOnboardingScreen /> },
      { path: "plans", element: <PlanSelectorScreen /> },
      { path: "result", element: <PlanResultScreen /> },
      { path: "active", element: <ActivePlanScreen /> },
      { path: "activity", element: <ActivityScreen /> },
      { path: "*", element: <NotFoundScreen /> },
    ],
  },
]);
