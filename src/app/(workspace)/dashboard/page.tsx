import { CorridorOperations } from "@/components/command-center/CorridorOperations";
import { OperationalSummary } from "@/components/command-center/OperationalSummary";
import { PageHeader } from "@/components/shared/PageHeader";
import { moduleCopy } from "@/config/modules";
import { PlanningWorkspace } from "@/components/command-center/PlanningWorkspace";
import { CommandFooter } from "@/components/command-center/CommandFooter";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title={moduleCopy.dashboard.title}
        subtitle={moduleCopy.dashboard.subtitle}
      />

      <OperationalSummary />
      <CorridorOperations />
      <PlanningWorkspace />
      <CommandFooter />
    </>
  );
}