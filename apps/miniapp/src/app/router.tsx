/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { RouterErrorPage } from "./RouterErrorPage";

import { TelegramBridge } from "../components/telegram/TelegramBridge";

function ShellLayout() {
  return (
    <AppShell>
      <TelegramBridge />
      <Outlet />
    </AppShell>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <ShellLayout />,
    errorElement: <RouterErrorPage />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { OnboardingWizard } = await import("../components/core/OnboardingWizard");
          return { Component: OnboardingWizard };
        },
      },
      {
        path: "onboarding",
        lazy: async () => {
          const { WalletOnboardingScreen } = await import("../screens/WalletOnboardingScreen");
          return { Component: WalletOnboardingScreen };
        },
      },
      {
        path: "plans",
        lazy: async () => {
          const { PlanSelectorRoute } = await import("../screens/PlanSelectorRoute");
          return { Component: PlanSelectorRoute };
        },
      },
      {
        path: "result",
        lazy: async () => {
          const { PlanResultRoute } = await import("../screens/PlanResultRoute");
          return { Component: PlanResultRoute };
        },
      },
      {
        path: "active",
        lazy: async () => {
          const { ActivePlanScreen } = await import("../screens/ActivePlanScreen");
          return { Component: ActivePlanScreen };
        },
      },
      {
        path: "activity",
        lazy: async () => {
          const { ActivityScreen } = await import("../screens/ActivityScreen");
          return { Component: ActivityScreen };
        },
      },
      {
        path: "terms",
        lazy: async () => {
          const { TermsScreen } = await import("../screens/TermsScreen");
          return { Component: TermsScreen };
        },
      },
      {
        path: "privacy",
        lazy: async () => {
          const { PrivacyScreen } = await import("../screens/PrivacyScreen");
          return { Component: PrivacyScreen };
        },
      },
      {
        path: "admin",
        lazy: async () => {
          const { AdminScreen } = await import("../screens/AdminScreen");
          return { Component: AdminScreen };
        },
      },
      {
        path: "*",
        lazy: async () => {
          const { NotFoundScreen } = await import("../screens/NotFoundScreen");
          return { Component: NotFoundScreen };
        },
      },
    ],
  },
]);
