import { OmnistonBridge } from "../components/stonfi/OmnistonBridge";
import { IntentMenu } from "../components/plans/IntentMenu";

export function PlanSelectorRoute() {
  return (
    <OmnistonBridge>
      <div className="screen-frame" style={{ paddingTop: "24px", minHeight: "100vh", overflowY: "auto" }}>
         <IntentMenu />
      </div>
    </OmnistonBridge>
  );
}
