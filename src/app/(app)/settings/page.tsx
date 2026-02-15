import { PreferencesForm } from '@/components/settings/preferences-form';

export default function SettingsPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your child&apos;s profile and content preferences.
        </p>
      </div>
      <PreferencesForm />
    </div>
  );
}
