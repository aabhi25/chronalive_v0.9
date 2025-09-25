import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Clock, Save, Plus, Trash2, Grid3X3, List, ArrowLeft, Snowflake, RefreshCw, Shield, Lock, Globe, User } from "lucide-react";
import { useLocation } from "wouter";
import type { TimetableStructure, InsertTimetableStructure } from "@shared/schema";

interface TimeSlot {
  period: number;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

const defaultWorkingDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Function to sort working days in proper order
const sortWorkingDays = (days: string[]): string[] => {
  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return dayOrder.filter(day => days.includes(day));
};

const defaultTimeSlots: TimeSlot[] = [
  { period: 1, startTime: "07:30", endTime: "08:15" },
  { period: 2, startTime: "08:15", endTime: "09:00" },
  { period: 3, startTime: "09:00", endTime: "09:45" },
  { period: 4, startTime: "09:45", endTime: "10:15" },
  { period: 5, startTime: "10:15", endTime: "11:00", isBreak: true },
  { period: 6, startTime: "11:00", endTime: "11:45" },
  { period: 7, startTime: "11:45", endTime: "12:30" },
  { period: 8, startTime: "12:30", endTime: "13:15" },
];

export default function TimetableSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'settings' | 'grid'>('settings');
  
  // Default periods management state
  const [periodsData, setPeriodsData] = useState<{[key: string]: number}>({});
  const [hasPeriodsChanges, setHasPeriodsChanges] = useState(false);
  const [globalDefaultPeriods, setGlobalDefaultPeriods] = useState<number>(5);
  const [updateExistingAssignments, setUpdateExistingAssignments] = useState(false);
  
  // Freeze timetable state
  const [isFreezeConfirmDialogOpen, setIsFreezeConfirmDialogOpen] = useState(false);
  const [isUnfreezeConfirmDialogOpen, setIsUnfreezeConfirmDialogOpen] = useState(false);
  const [structure, setStructure] = useState<InsertTimetableStructure>({
    schoolId: user?.schoolId || "", 
    periodsPerDay: 8,
    workingDays: defaultWorkingDays,
    timeSlots: defaultTimeSlots,
  });

  // Update structure when user context changes
  useEffect(() => {
    if (user?.schoolId) {
      setStructure(prev => ({
        ...prev,
        schoolId: user.schoolId
      }));
    }
  }, [user?.schoolId]);

  // Fetch current timetable structure
  const { data: currentStructure, isLoading: isStructureLoading } = useQuery({
    queryKey: ["/api/timetable-structure"],
    enabled: !!user?.schoolId,
  });

  // Fetch subjects with default periods for admin users
  const { data: subjectsWithPeriods, isLoading: loadingSubjects } = useQuery({
    queryKey: ["subjects", "default-periods", user?.schoolId],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subjects/default-periods");
      return await response.json();
    },
    enabled: user?.role === 'admin' || user?.role === 'super_admin'
  });

  // Fetch timetable freeze status for admin users
  const { data: freezeStatus, isLoading: loadingFreezeStatus, refetch: refetchFreezeStatus } = useQuery({
    queryKey: ["timetable-freeze-status", user?.schoolId],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/settings/timetable-freeze-status");
      return await response.json();
    },
    enabled: user?.role === 'admin' || user?.role === 'super_admin'
  });

  // Update local structure when data is fetched
  useEffect(() => {
    if (currentStructure && typeof currentStructure === 'object' && 'id' in currentStructure && currentStructure.id) {
      const typedStructure = currentStructure as TimetableStructure;
      setStructure({
        schoolId: typedStructure.schoolId,
        periodsPerDay: typedStructure.periodsPerDay,
        workingDays: typedStructure.workingDays,
        timeSlots: typedStructure.timeSlots,
        isActive: typedStructure.isActive,
      });
    }
  }, [currentStructure]);

  // Update global default periods when subjects data changes
  useEffect(() => {
    if (subjectsWithPeriods && subjectsWithPeriods.length > 0) {
      // Find the most common periods per week value
      const periodsCount: {[key: number]: number} = {};
      subjectsWithPeriods.forEach((subject: any) => {
        periodsCount[subject.periodsPerWeek] = (periodsCount[subject.periodsPerWeek] || 0) + 1;
      });
      
      // Get the most frequent value
      const mostCommonPeriods = Object.keys(periodsCount).reduce((a, b) => 
        periodsCount[Number(a)] > periodsCount[Number(b)] ? a : b
      );
      
      setGlobalDefaultPeriods(Number(mostCommonPeriods));
    }
  }, [subjectsWithPeriods]);

  // Update structure mutation
  const updateStructureMutation = useMutation({
    mutationFn: (data: InsertTimetableStructure) =>
      apiRequest("POST", "/api/timetable-structure", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timetable structure updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timetable-structure"] });
      setEditMode(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update timetable structure",
        variant: "destructive",
      });
    },
  });

  // Update default periods mutation
  const updatePeriodsMutation = useMutation({
    mutationFn: async (updates: {id: string, periodsPerWeek: number}[]) => {
      const response = await apiRequest("PUT", "/api/subjects/default-periods", { updates });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Default periods updated successfully",
      });
      setHasPeriodsChanges(false);
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update default periods",
        variant: "destructive",
      });
    },
  });

  // Global default periods mutation
  const updateGlobalDefaultMutation = useMutation({
    mutationFn: async (data: {defaultPeriods: number, updateExisting: boolean}) => {
      const response = await apiRequest("PUT", "/api/settings/global-default-periods", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Global default periods updated successfully",
      });
      // Invalidate all related queries to refresh the display
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subjects", "default-periods"] });
      queryClient.invalidateQueries({ queryKey: ["class-subject-assignments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update global default periods",
        variant: "destructive",
      });
    },
  });

  // Freeze timetable mutation
  const freezeTimetableMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", "/api/settings/freeze-timetable");
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      refetchFreezeStatus();
      // Invalidate cache to sync with timetable page
      queryClient.invalidateQueries({ queryKey: ["timetable-freeze-status", user?.schoolId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to freeze timetable changes",
        variant: "destructive",
      });
    },
  });

  // Unfreeze timetable mutation
  const unfreezeTimetableMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", "/api/settings/unfreeze-timetable");
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      refetchFreezeStatus();
      // Invalidate cache to sync with timetable page
      queryClient.invalidateQueries({ queryKey: ["timetable-freeze-status", user?.schoolId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unfreeze timetable changes",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateStructureMutation.mutate(structure);
  };

  const handleGoBack = () => {
    setLocation("/timetable");
  };

  const handlePeriodsChange = (subjectId: string, newPeriods: number) => {
    setPeriodsData(prev => ({
      ...prev,
      [subjectId]: newPeriods
    }));
    setHasPeriodsChanges(true);
  };

  const handleSavePeriods = async () => {
    const updates = Object.entries(periodsData).map(([id, periodsPerWeek]) => ({
      id,
      periodsPerWeek
    }));
    
    if (updates.length === 0) return;
    
    updatePeriodsMutation.mutate(updates);
  };

  const handleGlobalDefaultUpdate = () => {
    updateGlobalDefaultMutation.mutate({
      defaultPeriods: globalDefaultPeriods,
      updateExisting: updateExistingAssignments
    });
  };

  // Handle freeze timetable confirmation
  const handleFreezeTimetable = () => {
    setIsFreezeConfirmDialogOpen(false);
    freezeTimetableMutation.mutate();
  };

  // Handle unfreeze timetable confirmation
  const handleUnfreezeTimetable = () => {
    setIsUnfreezeConfirmDialogOpen(false);
    unfreezeTimetableMutation.mutate();
  };

  // Format time to 12-hour format with AM/PM
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to calculate teaching period number (excluding breaks)
  const getTeachingPeriodNumber = (actualPeriod: number): number => {
    if (!structure?.timeSlots) return actualPeriod;
    
    // Count only non-break periods up to the current period
    let teachingPeriodCount = 0;
    for (const slot of structure.timeSlots) {
      if (slot.period <= actualPeriod && !slot.isBreak) {
        teachingPeriodCount++;
      }
    }
    return teachingPeriodCount;
  };

  const addTimeSlot = () => {
    const timeSlots = structure.timeSlots || [];
    const newPeriod = timeSlots.length + 1;
    const lastSlot = timeSlots[timeSlots.length - 1];
    const newStartTime = lastSlot ? lastSlot.endTime : "09:00";
    
    setStructure(prev => ({
      ...prev,
      timeSlots: [
        ...(prev.timeSlots || []),
        { period: newPeriod, startTime: newStartTime, endTime: "09:45" }
      ],
      periodsPerDay: (prev.periodsPerDay || 0) + 1,
    }));
  };

  const removeTimeSlot = (index: number) => {
    setStructure(prev => ({
      ...prev,
      timeSlots: (prev.timeSlots || []).filter((_, i) => i !== index),
      periodsPerDay: (prev.periodsPerDay || 0) - 1,
    }));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string | boolean) => {
    setStructure(prev => ({
      ...prev,
      timeSlots: (prev.timeSlots || []).map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const toggleWorkingDay = (day: string) => {
    const workingDays = structure.workingDays || [];
    setStructure(prev => ({
      ...prev,
      workingDays: (prev.workingDays || []).includes(day)
        ? (prev.workingDays || []).filter(d => d !== day)
        : [...(prev.workingDays || []), day],
    }));
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Timetable Settings
              </h2>
              <p className="text-muted-foreground">Configure your school's timetable structure</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="structure" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="structure" data-testid="tab-structure">
                <Clock className="h-4 w-4 mr-2" />
                Structure Configuration
              </TabsTrigger>
              <TabsTrigger value="other" data-testid="tab-other">
                Other Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="structure" className="space-y-4">
              {isStructureLoading ? (
                <div className="text-center py-8">Loading timetable structure...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Timetable Structure</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? "default" : "outline"}
                        onClick={() => setViewMode('grid')}
                        data-testid="button-grid-view"
                      >
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        Grid View
                      </Button>
                      
                      {viewMode === 'settings' && (
                        <>
                          <Button
                            variant={editMode ? "outline" : "default"}
                            onClick={() => setEditMode(!editMode)}
                            data-testid="button-edit-mode"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {editMode ? "Cancel" : "Edit Structure"}
                          </Button>
                          {editMode && (
                            <Button
                              onClick={handleSave}
                              disabled={updateStructureMutation.isPending}
                              data-testid="button-save-structure"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          )}
                        </>
                      )}
                      
                      {viewMode === 'grid' && (
                        <Button
                          variant="outline"
                          onClick={() => setViewMode('settings')}
                          data-testid="button-back-to-settings"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {viewMode === 'settings' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Working Days Configuration */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Working Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {defaultWorkingDays.map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={day}
                                  checked={(structure.workingDays || []).includes(day)}
                                  onChange={() => editMode && toggleWorkingDay(day)}
                                  disabled={!editMode}
                                  className="rounded"
                                  data-testid={`checkbox-${day}`}
                                />
                                <Label htmlFor={day} className="capitalize">
                                  {day}
                                </Label>
                                {(structure.workingDays || []).includes(day) && (
                                  <Badge variant="secondary" className="text-xs">Active</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                              Total Working Days: <span className="font-medium">{(structure.workingDays || []).length}</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Summary Statistics */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Schedule Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Periods per Day</span>
                              <Badge variant="outline">{structure.periodsPerDay || 0}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Working Days</span>
                              <Badge variant="outline">{(structure.workingDays || []).length}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Total Periods/Week</span>
                              <Badge variant="default">{(structure.periodsPerDay || 0) * (structure.workingDays || []).length}</Badge>
                            </div>
                            {(structure.timeSlots || []).length > 0 && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">School Starts</span>
                                  <span className="font-medium">{formatTime12Hour((structure.timeSlots || [])[0]?.startTime || '07:30')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">School Ends</span>
                                  <span className="font-medium">{formatTime12Hour((structure.timeSlots || [])[(structure.timeSlots || []).length - 1]?.endTime || '15:30')}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Period Structure */}
                      <Card className="lg:col-span-1">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Period Structure
                            {editMode && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={addTimeSlot}
                                data-testid="button-add-period"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Period
                              </Button>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {(structure.timeSlots || []).map((slot, index) => (
                              <div
                                key={index}
                                className={`p-3 border rounded-lg ${slot.isBreak ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}
                                data-testid={`period-slot-${index}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">
                                    {slot.isBreak ? 'Break' : `Period ${getTeachingPeriodNumber(slot.period)}`}
                                  </span>
                                  {editMode && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeTimeSlot(index)}
                                      data-testid={`button-remove-period-${index}`}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor={`start-${index}`} className="text-xs">Start Time</Label>
                                    <Input
                                      id={`start-${index}`}
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                                      disabled={!editMode}
                                      className="text-sm"
                                      data-testid={`input-start-time-${index}`}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`end-${index}`} className="text-xs">End Time</Label>
                                    <Input
                                      id={`end-${index}`}
                                      type="time"
                                      value={slot.endTime}
                                      onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                                      disabled={!editMode}
                                      className="text-sm"
                                      data-testid={`input-end-time-${index}`}
                                    />
                                  </div>
                                </div>
                                
                                {editMode && (
                                  <div className="mt-2">
                                    <label className="flex items-center space-x-2 text-xs">
                                      <input
                                        type="checkbox"
                                        checked={slot.isBreak || false}
                                        onChange={(e) => updateTimeSlot(index, 'isBreak', e.target.checked)}
                                        data-testid={`checkbox-break-${index}`}
                                      />
                                      <span>Mark as Break</span>
                                    </label>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Grid View
                    <div className="w-full">
                      <Card>
                        <CardHeader>
                          <CardTitle>Timetable Structure Grid</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-blue-100">
                                  <th className="border border-gray-300 p-2 text-left font-semibold">Period</th>
                                  <th className="border border-gray-300 p-2 text-left font-semibold">Time</th>
                                  {sortWorkingDays(structure.workingDays || []).map((day) => (
                                    <th key={day} className="border border-gray-300 p-2 text-center font-semibold capitalize bg-blue-500 text-white">
                                      {day}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(structure.timeSlots || []).map((slot, index) => (
                                  <tr key={index} className={slot.isBreak ? 'bg-orange-50' : 'bg-gray-50'}>
                                    <td className="border border-gray-300 p-2 font-medium">
                                      {slot.isBreak ? 'Break' : getTeachingPeriodNumber(slot.period)}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm">
                                      {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                                    </td>
                                    {sortWorkingDays(structure.workingDays || []).map((day) => (
                                      <td key={day} className="border border-gray-300 p-2 text-center">
                                        {slot.isBreak ? (
                                          <div className="text-orange-600 font-medium">BREAK</div>
                                        ) : (
                                          <div className="h-8 bg-blue-100 rounded flex items-center justify-center text-xs">
                                            Period {getTeachingPeriodNumber(slot.period)}
                                          </div>
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Grid Summary */}
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold mb-2">Structure Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Periods per Day:</span>
                                <span className="font-medium ml-1">{structure.periodsPerDay || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Working Days:</span>
                                <span className="font-medium ml-1">{(structure.workingDays || []).length}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Periods/Week:</span>
                                <span className="font-medium ml-1">{(structure.periodsPerDay || 0) * (structure.workingDays || []).length}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Teaching Periods:</span>
                                <span className="font-medium ml-1">
                                  {(structure.timeSlots || []).filter(slot => !slot.isBreak).length}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              {/* Default Periods Management */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Default Periods Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Global Default Section */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-blue-900">Set Global Default</h3>
                            <p className="text-sm text-blue-700">Apply the same default periods to all subjects at once</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="globalDefault">Default periods/week:</Label>
                            <Input
                              id="globalDefault"
                              type="number"
                              min="1"
                              max="20"
                              className="w-20 text-center"
                              value={globalDefaultPeriods}
                              onChange={(e) => setGlobalDefaultPeriods(parseInt(e.target.value) || 1)}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="updateExisting"
                              checked={updateExistingAssignments}
                              onChange={(e) => setUpdateExistingAssignments(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="updateExisting" className="text-sm">
                              Update existing class assignments
                            </Label>
                          </div>
                          
                          <Button
                            onClick={handleGlobalDefaultUpdate}
                            disabled={updateGlobalDefaultMutation.isPending}
                            className="flex items-center space-x-2"
                          >
                            {updateGlobalDefaultMutation.isPending ? "Updating..." : "Apply to All"}
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">How Default Periods Work:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Default periods are used when creating new class-subject assignments</li>
                          <li>• You can override these defaults for specific classes as needed</li>
                          <li>• Periods per week should be between 1 and 20</li>
                          <li>• Changes will apply to new assignments, existing ones remain unchanged</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Freeze Timetable Changes */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Snowflake className="h-5 w-5" />
                      <span>Freeze Timetable Changes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loadingFreezeStatus ? (
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Loading freeze status...</span>
                        </div>
                      ) : (
                        <>
                          <div className={`border rounded-lg p-4 ${freezeStatus?.timetableFrozen ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className={`font-medium ${freezeStatus?.timetableFrozen ? 'text-blue-900' : 'text-gray-900'}`}>
                                  Timetable Changes {freezeStatus?.timetableFrozen ? 'Frozen' : 'Active'}
                                </h3>
                                <p className={`text-sm ${freezeStatus?.timetableFrozen ? 'text-blue-700' : 'text-gray-600'}`}>
                                  {freezeStatus?.timetableFrozen 
                                    ? 'Timetable refresh functionality is currently disabled'
                                    : 'Teachers and admins can refresh and regenerate timetables'
                                  }
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {freezeStatus?.timetableFrozen ? (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    <Snowflake className="h-3 w-3 mr-1" />
                                    Frozen
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {freezeStatus?.timetableFrozen 
                                ? 'Click "Unfreeze" to allow timetable changes again'
                                : 'Click "Freeze Changes" to prevent timetable modifications'
                              }
                            </div>
                            
                            <Button
                              onClick={() => freezeStatus?.timetableFrozen 
                                ? setIsUnfreezeConfirmDialogOpen(true) 
                                : setIsFreezeConfirmDialogOpen(true)
                              }
                              disabled={freezeTimetableMutation.isPending || unfreezeTimetableMutation.isPending}
                              variant={freezeStatus?.timetableFrozen ? "default" : "destructive"}
                              className="flex items-center space-x-2"
                            >
                              {freezeStatus?.timetableFrozen ? (
                                <>
                                  <RefreshCw className="h-4 w-4" />
                                  <span>
                                    {unfreezeTimetableMutation.isPending ? "Unfreezing..." : "Unfreeze Changes"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Snowflake className="h-4 w-4" />
                                  <span>
                                    {freezeTimetableMutation.isPending ? "Freezing..." : "Freeze Changes"}
                                  </span>
                                </>
                              )}
                            </Button>
                          </div>

                          <Separator />

                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">About Timetable Freeze:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li>• Freezing prevents all timetable refresh and regeneration operations</li>
                              <li>• The "Refresh Table" button will be hidden from the timetable page when frozen</li>
                              <li>• Manual timetable assignments can still be made using drag & drop</li>
                              <li>• Useful during exam periods or when the timetable is finalized</li>
                              <li>• Only administrators can freeze or unfreeze timetable changes</li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Freeze Confirmation Dialog */}
        <Dialog open={isFreezeConfirmDialogOpen} onOpenChange={setIsFreezeConfirmDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Snowflake className="h-5 w-5 text-blue-600" />
                <span>Freeze Timetable Changes</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Are you sure you want to freeze all timetable changes? This will:
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <ul className="text-sm space-y-1 text-blue-800">
                  <li className="flex items-center space-x-2">
                    <Snowflake className="h-4 w-4 text-blue-600" />
                    <span>Hide the "Refresh Table" button from the timetable page</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span>Prevent automatic timetable regeneration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Protect the current timetable from accidental changes</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <strong>Note:</strong> Manual assignments using drag & drop will still work. You can unfreeze anytime.
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsFreezeConfirmDialogOpen(false)}
                  disabled={freezeTimetableMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFreezeTimetable}
                  disabled={freezeTimetableMutation.isPending}
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <Snowflake className="h-4 w-4" />
                  <span>{freezeTimetableMutation.isPending ? "Freezing..." : "Freeze Changes"}</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Unfreeze Confirmation Dialog */}
        <Dialog open={isUnfreezeConfirmDialogOpen} onOpenChange={setIsUnfreezeConfirmDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                <span>Unfreeze Timetable Changes</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Are you sure you want to unfreeze timetable changes? This will:
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <ul className="text-sm space-y-1 text-green-800">
                  <li className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-green-600" />
                    <span>Show the "Refresh Table" button on the timetable page</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    <span>Allow timetable refresh and regeneration operations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span>Enable all timetable management features</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <strong>Note:</strong> Users will be able to refresh and regenerate timetables again.
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUnfreezeConfirmDialogOpen(false)}
                  disabled={unfreezeTimetableMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUnfreezeTimetable}
                  disabled={unfreezeTimetableMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>{unfreezeTimetableMutation.isPending ? "Unfreezing..." : "Unfreeze Changes"}</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}