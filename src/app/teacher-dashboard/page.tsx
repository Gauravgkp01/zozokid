import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  
  export default function TeacherDashboardPage() {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Teacher!</CardTitle>
            <CardDescription>
              This is your dedicated dashboard. More features coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You can manage your classes and students from here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
