import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Settings, Edit, Trash2, Shield, Users, BookOpen } from "lucide-react";

interface SystemModule {
  id: string;
  name: string;
  displayName: string;
  description: string;
  routePath: string;
  category: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface RolePermission {
  id: string;
  schoolId: string;
  role: string;
  moduleId: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    export: boolean;
  };
  isActive: boolean;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
  school?: {
    name: string;
  };
  module?: {
    displayName: string;
  };
}

const roleColors = {
  admin: "bg-blue-100 text-blue-800",
  teacher: "bg-green-100 text-green-800", 
  student: "bg-purple-100 text-purple-800",
  parent: "bg-orange-100 text-orange-800"
};

const categories = [
  "Dashboard", "Academic", "Administration", "Reports", "Communication", "System"
];

const iconOptions = [
  "fas fa-tachometer-alt", "fas fa-calendar-alt", "fas fa-chalkboard-teacher", 
  "fas fa-users", "fas fa-book", "fas fa-cog", "fas fa-chart-bar", 
  "fas fa-envelope", "fas fa-file-alt", "fas fa-graduation-cap"
];

export default function SystemModulesPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<SystemModule | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  
  const [moduleFormData, setModuleFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    routePath: "",
    category: "",
    icon: "",
    sortOrder: 0
  });

  // Fetch system modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/system-modules"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/system-modules");
      return await response.json();
    }
  });

  // Fetch schools for permission management
  const { data: schools = [] } = useQuery({
    queryKey: ["/api/schools"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/schools");
      return await response.json();
    }
  });

  // Fetch role permissions
  const { data: rolePermissions = [] } = useQuery({
    queryKey: ["/api/role-permissions", selectedSchoolId, selectedRole],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSchoolId) params.append("schoolId", selectedSchoolId);
      if (selectedRole) params.append("role", selectedRole);
      
      const response = await apiRequest("GET", `/api/role-permissions?${params}`);
      return await response.json();
    },
    enabled: !!selectedSchoolId && !!selectedRole
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: any) => {
      const response = await apiRequest("POST", "/api/system-modules", moduleData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-modules"] });
      setIsCreateDialogOpen(false);
      setModuleFormData({
        name: "", displayName: "", description: "", routePath: "", 
        category: "", icon: "", sortOrder: 0
      });
      toast({
        title: "Success",
        description: "System module created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create system module",
        variant: "destructive"
      });
    }
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, ...moduleData }: any) => {
      const response = await apiRequest("PUT", `/api/system-modules/${id}`, moduleData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-modules"] });
      setEditingModule(null);
      toast({
        title: "Success",
        description: "System module updated successfully"
      });
    }
  });

  // Toggle module status mutation
  const toggleModuleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/system-modules/${id}`, { isActive });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-modules"] });
      toast({
        title: "Success",
        description: "Module status updated successfully"
      });
    }
  });

  // Update role permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ schoolId, role, moduleId, permissions }: any) => {
      // Check if permission exists
      const existing = rolePermissions.find((p: any) => 
        p.schoolId === schoolId && p.role === role && p.moduleId === moduleId
      );
      
      if (existing) {
        const response = await apiRequest("PUT", `/api/role-permissions/${existing.id}`, {
          permissions, isActive: true
        });
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/role-permissions", {
          schoolId, role, moduleId, permissions, isActive: true
        });
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/role-permissions"] });
      toast({
        title: "Success",
        description: "Permissions updated successfully"
      });
    }
  });

  const handleCreateModule = () => {
    createModuleMutation.mutate(moduleFormData);
  };

  const handleUpdateModule = () => {
    if (editingModule) {
      updateModuleMutation.mutate({ 
        id: editingModule.id, 
        ...moduleFormData 
      });
    }
  };

  const handleEditModule = (module: SystemModule) => {
    setEditingModule(module);
    setModuleFormData({
      name: module.name,
      displayName: module.displayName,
      description: module.description,
      routePath: module.routePath,
      category: module.category,
      icon: module.icon,
      sortOrder: module.sortOrder
    });
  };

  const handlePermissionChange = (moduleId: string, permissionType: string, value: boolean) => {
    if (!selectedSchoolId || !selectedRole) return;
    
    const existingPermission = rolePermissions.find((p: any) => 
      p.schoolId === selectedSchoolId && p.role === selectedRole && p.moduleId === moduleId
    );
    
    const currentPermissions = existingPermission?.permissions || {
      read: false, write: false, delete: false, export: false
    };
    
    const updatedPermissions = {
      ...currentPermissions,
      [permissionType]: value
    };
    
    updatePermissionMutation.mutate({
      schoolId: selectedSchoolId,
      role: selectedRole,
      moduleId,
      permissions: updatedPermissions
    });
  };

  if (modulesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            System Module Management
          </h1>
          <p className="text-muted-foreground">Configure system modules and role permissions</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create System Module</DialogTitle>
              <DialogDescription>
                Add a new module to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Module Name</Label>
                <Input
                  id="name"
                  value={moduleFormData.name}
                  onChange={(e) => setModuleFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., user_management"
                />
              </div>
              
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={moduleFormData.displayName}
                  onChange={(e) => setModuleFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g., User Management"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={moduleFormData.description}
                  onChange={(e) => setModuleFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Module description"
                />
              </div>
              
              <div>
                <Label htmlFor="routePath">Route Path</Label>
                <Input
                  id="routePath"
                  value={moduleFormData.routePath}
                  onChange={(e) => setModuleFormData(prev => ({ ...prev, routePath: e.target.value }))}
                  placeholder="/users"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={moduleFormData.category}
                  onValueChange={(value) => setModuleFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={moduleFormData.icon}
                  onValueChange={(value) => setModuleFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(icon => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <i className={icon}></i>
                          {icon}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={moduleFormData.sortOrder}
                  onChange={(e) => setModuleFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateModule} disabled={createModuleMutation.isPending}>
                {createModuleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              System Modules
            </CardTitle>
            <CardDescription>
              Manage available system modules and their configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {modules.map((module: SystemModule) => (
                <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className={module.icon}></i>
                    <div>
                      <div className="font-medium">{module.displayName}</div>
                      <div className="text-sm text-muted-foreground">{module.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={module.isActive}
                      onCheckedChange={(checked) => 
                        toggleModuleStatusMutation.mutate({ id: module.id, isActive: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditModule(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              Configure what each role can access per school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>School</Label>
                  <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school: any) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">School Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedSchoolId && selectedRole && (
                <div className="space-y-3">
                  {modules.filter((m: any) => m.isActive).map((module: SystemModule) => {
                    const permission = rolePermissions.find((p: any) => 
                      p.moduleId === module.id && p.schoolId === selectedSchoolId && p.role === selectedRole
                    );
                    
                    return (
                      <div key={module.id} className="border rounded-lg p-3">
                        <div className="font-medium mb-2">{module.displayName}</div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          {['read', 'write', 'delete', 'export'].map(permType => (
                            <label key={permType} className="flex items-center gap-1">
                              <Checkbox
                                checked={permission?.permissions?.[permType as keyof typeof permission.permissions] || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(module.id, permType, checked as boolean)
                                }
                              />
                              <span className="capitalize">{permType}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit System Module</DialogTitle>
            <DialogDescription>
              Update module configuration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={moduleFormData.displayName}
                onChange={(e) => setModuleFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={moduleFormData.description}
                onChange={(e) => setModuleFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={moduleFormData.category}
                onValueChange={(value) => setModuleFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingModule(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateModule} disabled={updateModuleMutation.isPending}>
              {updateModuleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}