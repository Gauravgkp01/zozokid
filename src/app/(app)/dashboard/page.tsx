import { ChildProfile } from '@/components/dashboard/child-profile';
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts';
import { childData, watchTimeData, categoryData } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-bold font-headline">Parent Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3 xl:col-span-2">
          <CardHeader>
            <CardTitle>Child Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ChildProfile child={childData} />
          </CardContent>
        </Card>
        <div className="lg:col-span-4 xl:col-span-5">
          <AnalyticsCharts
            watchTimeData={watchTimeData}
            categoryData={categoryData}
          />
        </div>
      </div>
    </div>
  );
}
