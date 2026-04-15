import { OmnistonBridge } from "../components/stonfi/OmnistonBridge";
import { PlanResultScreen } from "./PlanResultScreen";

export function PlanResultRoute() {
  return (
    <OmnistonBridge>
      <PlanResultScreen />
    </OmnistonBridge>
  );
}
