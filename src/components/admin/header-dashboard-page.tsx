import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}
export function HeaderDashboardPage({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex items-center">
            <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground mt-2">{description}</p>}
            </div>
            {actions && <div className="ml-8">{actions}</div>}
        </div>
    );
}