import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  LogOut, 
  Settings, 
  School, 
  Shield, 
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Users,
  UserCheck,
  Building,
  Cog,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const getNavigationItems = (userRole: string | undefined) => {
  // Super Admin: System-wide management and configuration
  if (userRole === "super_admin") {
    return [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/admin-dashboard", icon: Building, label: "School Administration" },
      { path: "/attendance", icon: ClipboardCheck, label: "Attendance" },
      { path: "/system-modules", icon: Cog, label: "System Modules" },
    ];
  }

  // School Admin: Manage day-to-day school operations
  if (userRole === "admin") {
    return [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/timetable", icon: Calendar, label: "Timetables" },
      { path: "/attendance", icon: ClipboardCheck, label: "Attendance" },
      { path: "/students", icon: GraduationCap, label: "Students" },
      { path: "/teachers", icon: UserCheck, label: "Teachers" },
      { path: "/classes", icon: Users, label: "Classes" },
    ];
  }

  // Student: Personal dashboard and profile management
  if (userRole === "student") {
    return [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/my-class", icon: Users, label: "My Class" },
      { path: "/my-profile", icon: User, label: "My Profile" },
    ];
  }

  // Default fallback
  return [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  ];
};

export default function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const navigationItems = getNavigationItems(user?.role);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return Shield;
      case "admin":
        return School;
      default:
        return User;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "School Admin";
      case "student":
        return "Student";
      default:
        return "User";
    }
  };

  const RoleIcon = getRoleIcon(user?.role || "");

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Chrona</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Smart Timetable Management
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* User info */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm" className="bg-accent/50">
                    <RoleIcon className="size-4" />
                    <div className="grid flex-1 text-left text-xs leading-tight">
                      <span className="truncate font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.path}
                      tooltip={item.label}
                    >
                      <Link href={item.path}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout}
              tooltip="Logout"
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}