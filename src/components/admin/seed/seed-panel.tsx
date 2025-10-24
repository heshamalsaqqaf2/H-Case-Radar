"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  clearDatabase,
  reseedDatabase,
  seedDatabase,
} from "@/lib/actions/seed-actions";

export function SeedPanel() {
  const [loading, setLoading] = useState<"seed" | "clear" | "reseed" | null>(
    null,
  );

  const handleAction = async (action: "seed" | "clear" | "reseed") => {
    setLoading(action);

    try {
      let result = { success: false, message: "" };

      switch (action) {
        case "seed":
          result = await seedDatabase();
          break;
        case "clear":
          result = await clearDatabase();
          break;
        case "reseed":
          result = await reseedDatabase();
          break;
      }

      if (result.success) {
        toast.success("Success", {
          description: result.message,
        });
      } else {
        toast.error("Error", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Database Initialization</CardTitle>
        <CardDescription>
          Initialize the database with default roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleAction("seed")}
            disabled={!!loading}
            variant="default"
            className="w-full"
          >
            {loading === "seed" ? "Seeding..." : "Seed Database"}
          </Button>

          <Button
            onClick={() => handleAction("clear")}
            disabled={!!loading}
            variant="outline"
            className="w-full"
          >
            {loading === "clear" ? "Clearing..." : "Clear Data"}
          </Button>

          <Button
            onClick={() => handleAction("reseed")}
            disabled={!!loading}
            variant="destructive"
            className="w-full"
          >
            {loading === "reseed" ? "Reseeding..." : "Reseed Database"}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Available Actions:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <strong>Seed Database:</strong> Add default roles and
                permissions
              </li>
              <li>
                <strong>Clear Data:</strong> Remove all roles and permissions
              </li>
              <li>
                <strong>Reseed Database:</strong> Clear and seed again
              </li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">Default Roles:</h4>
            <ul className="space-y-1">
              <li>
                • <strong>super_admin:</strong> Full system access
              </li>
              <li>
                • <strong>admin:</strong> Extensive administrative access
              </li>
              <li>
                • <strong>moderator:</strong> Content management
              </li>
              <li>
                • <strong>user:</strong> Regular user permissions
              </li>
              <li>
                • <strong>viewer:</strong> Read-only access
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
