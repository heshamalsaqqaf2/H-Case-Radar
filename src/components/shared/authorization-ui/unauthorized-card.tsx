import { IconLockAccess } from "@tabler/icons-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function getUnauthorizedComponent(customMessage?: string): React.ReactNode {
  const defaultMessage = "ليس لديك صلاحية للوصول إلى هذه الصفحة";
  return (
    <main className="min-h-screen flex items-center justify-evenly">
      <div className="">
        <IconLockAccess className="h-80 w-80 mx-auto text-red-600" />
      </div>
      <Card className="w-full max-w-md bg-gradient-to-t from-red-500 to-red-100 border-none">
        <CardHeader>
          <CardTitle className="text-red-900"> الوصول الغير مصرح به</CardTitle>
        </CardHeader>

        <CardContent>
          <IconLockAccess className="h-20 w-20 mx-auto text-red-600" />
          <div className="container mx-auto p-6 text-center">
            <h1 className="text-2xl mb-3 font-bold capitalize text-red-600">Unauthorized Access</h1>
            <p className="text-red-950">{customMessage || defaultMessage}</p>
            <Button asChild>
              <Link
                href="/"
                className="inline-flex items-center mt-4 rounded px-12 py-2 text-sm font-bold
              bg-red-600 text-foreground hover:bg-red-700"
              >
                Back to Home <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="mx-auto flex flex-col justify-center items-center">
            <p className="text-neutral-800 mt-2">Please contact our support team</p>
            <a
              href="mailto:hcaseradarSupport@hcr.com"
              className="text-neutral-200 border-b border-neutral-200 text-xs mt-2"
            >
              hcaseradarSupport@hcr.com
            </a>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
