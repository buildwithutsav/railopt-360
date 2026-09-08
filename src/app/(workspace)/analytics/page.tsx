import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { PageHeader } from "@/components/shared/PageHeader";
import { moduleCopy } from "@/config/modules";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title={moduleCopy.analytics.title}
        subtitle={moduleCopy.analytics.subtitle}
      />

      <AnalyticsDashboard />
    </>
  );
}