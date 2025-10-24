import { SeedPanel } from "@/components/admin/seed/seed-panel";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function SeedPage() {
  return (
    <ProtectedComponent permission="permission.create">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Database Initialization</h1>
          <p className="text-muted-foreground mt-2">
            Manage default roles and permissions for the system
          </p>
        </div>

        <SeedPanel />

        <div className="max-w-4xl mx-auto text-sm text-muted-foreground">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Important Notes:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Seeding will create default roles and permissions</li>
              <li>Clearing will remove all roles and permissions data</li>
              <li>
                Reseeding will clear existing data and create new defaults
              </li>
              <li>This action requires appropriate permissions</li>
              <li>
                Always backup your database before performing these actions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedComponent>
  );
}
