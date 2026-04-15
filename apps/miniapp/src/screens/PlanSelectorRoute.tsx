import { OmnistonBridge } from "../components/stonfi/OmnistonBridge";
import { PlanSelectorScreen } from "./PlanSelectorScreen";

export function PlanSelectorRoute() {
  return (
    <OmnistonBridge>
      <PlanSelectorScreen />
    </OmnistonBridge>
  );
}
