import { ResourceCenter } from "@/components/resources/ResourceCenter";
import { PageHeader } from "@/components/shared/PageHeader";
import { moduleCopy } from "@/config/modules";

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        title={moduleCopy.resources.title}
        subtitle={moduleCopy.resources.subtitle}
      />

      <ResourceCenter />
    </>
  );
}