"use client";

import { useEffect } from "react";
import { useCurrentUser } from "@/lib/authorization/hooks/use-auth";

export default function TestAuthPage() {
  const { data: user, isLoading, error, status } = useCurrentUser();

  useEffect(() => {
    console.log("🔄 TestAuthPage - Status:", status);
    console.log("🔄 TestAuthPage - Loading:", isLoading);
    console.log("🔄 TestAuthPage - User:", user);
    console.log("🔄 TestAuthPage - Error:", error);
  }, [user, isLoading, error, status]);

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h2 className="font-bold">🔄 Loading...</h2>
          <p>Status: {status}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">❌ Error</h2>
          <p>Message: {error.message}</p>
          <p>Status: {status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>

      {user ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold">✅ Logged In Successfully!</h2>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Status:</strong> {status}
          </p>
        </div>
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">❌ Not Logged In</h2>
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>User object is null or undefined</p>
          <div className="mt-4 text-sm">
            <p>Possible issues:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Better Auth session not working</li>
              <li>Server Action not returning user data</li>
              <li>Cookies not being sent to Server Action</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
