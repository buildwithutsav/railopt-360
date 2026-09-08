import { MaintenanceHub } from "@/components/maintenance/MaintenanceHub";
import { PageHeader } from "@/components/shared/PageHeader";
import { moduleCopy } from "@/config/modules";

export default function MaintenancePage() {
  return (
    <>
      <PageHeader
        title={moduleCopy.maintenance.title}
        subtitle={moduleCopy.maintenance.subtitle}
      />

      <MaintenanceHub />
    </>
  );
}