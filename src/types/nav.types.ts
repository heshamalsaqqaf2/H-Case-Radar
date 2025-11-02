export type NavItem = {
  title: string;
  href: string;
  icon: string;
  requiredPermission?: string; // مثل: "users.read", "roles.manage"
};
