import { EmptyModuleState } from "@/components/shared/EmptyModuleState";
import { PageHeader } from "@/components/shared/PageHeader";
import type { ModuleCopy } from "@/config/modules";

interface ModuleFoundationPageProps {
  copy: ModuleCopy;
}

export function ModuleFoundationPage({ copy }: ModuleFoundationPageProps) {
  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <EmptyModuleState moduleName={copy.title} />
    </>
  );
}
