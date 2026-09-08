import { ModuleFoundationPage } from "@/components/shared/ModuleFoundationPage";
import { moduleCopy } from "@/config/modules";

export default function SettingsPage() {
  return <ModuleFoundationPage copy={moduleCopy.settings} />;
}
