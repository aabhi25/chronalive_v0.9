import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Users, BookOpen, MapPin, ChevronDown, Upload } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

interface Class {
  id: string;
  grade: string;
  section: string;
  studentCount: number;
  requiredSubjects: string[];
  schoolId: string;
  room?: string;
  createdAt: string;
  updatedAt: string;
}

const classFormSchema = z.object({
  grade: z.string().min(1, "Class is required"),
  section: z.string().optional().refine(
    (val) => !val || !val.includes(","),
    "Section cannot contain commas. Use 'Add Sections to Class' for multiple sections."
  ),
  room: z.string().optional(),
});

type ClassFormData = z.infer<typeof classFormSchema>;

export default function ClassesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [sectionsToAdd, setSectionsToAdd] = useState<string>("A,B,C");
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const {
    data: classes = [],
    isLoading,
    error,
  } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const addForm = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      grade: "",
      section: "",
      room: "",
    },
  });


  const createClassMutation = useMutation({
    mutationFn: async (data: ClassFormData) => {
      const response = await apiRequest("POST", "/api/classes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Success",
        description: "Class created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    },
  });


  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      // Find the class being deleted
      const classToDelete = classes.find(c => c.id === id);
      if (!classToDelete) {
        throw new Error("Class not found");
      }

      // Delete the class
      await apiRequest("DELETE", `/api/classes/${id}`);

      // If the deleted class had a section, check for cleanup
      if (classToDelete.section) {
        const remainingSections = classes
          .filter(c => c.grade === classToDelete.grade && c.id !== id && c.section);
        
        // If only one section remains for this grade, rename it to have no section
        if (remainingSections.length === 1) {
          const lastSection = remainingSections[0];
          await apiRequest("PUT", `/api/classes/${lastSection.id}`, {
            grade: lastSection.grade,
            section: '', // Remove the section
            room: lastSection.room || ''
          });
          
          return { 
            deletedClass: classToDelete, 
            renamedClass: lastSection,
            wasAutoRenamed: true 
          };
        }
      }

      return { 
        deletedClass: classToDelete, 
        wasAutoRenamed: false 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      
      if (result.wasAutoRenamed && result.renamedClass) {
        toast({
          title: "Success",
          description: `Deleted ${result.deletedClass.section ? 
            `Class ${result.deletedClass.grade}${result.deletedClass.section}` : 
            `Class ${result.deletedClass.grade}`
          } and renamed remaining section back to Class ${result.renamedClass.grade}`,
        });
      } else {
        toast({
          title: "Success",
          description: "Class and section deleted successfully",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    },
  });

  const generateInstantClassesMutation = useMutation({
    mutationFn: async () => {
      const classesToCreate = [];
      
      // Generate classes from 1 to 12 without sections
      for (let grade = 1; grade <= 12; grade++) {
        classesToCreate.push({
          grade: grade.toString(),
          section: "",
          room: ""
        });
      }
      
      // Create all classes in parallel
      const promises = classesToCreate.map(classData => 
        apiRequest("POST", "/api/classes", classData).then(res => res.json())
      );
      
      return Promise.all(promises);
    },
    onSuccess: (createdClasses) => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setIsGenerateDialogOpen(false);
      toast({
        title: "Success",
        description: `Successfully generated ${createdClasses.length} classes (Classes 1-12)`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate classes",
        variant: "destructive",
      });
    },
  });

  const createSectionsMutation = useMutation({
    mutationFn: async ({ grade, sections }: { grade: string; sections: string[] }) => {
      // Check if there's an existing class for this grade without a section
      const existingClass = classes.find(c => c.grade === grade && !c.section);
      
      const promises = [];
      
      if (existingClass && sections.length > 0) {
        // Update the existing class to have the first section
        const firstSection = sections[0];
        promises.push(
          apiRequest("PUT", `/api/classes/${existingClass.id}`, {
            grade,
            section: firstSection,
            room: existingClass.room || ""
          }).then(res => res.json())
        );
        
        // Create new classes for the remaining sections
        sections.slice(1).forEach(section => {
          promises.push(
            apiRequest("POST", "/api/classes", {
              grade,
              section,
              room: ""
            }).then(res => res.json())
          );
        });
      } else {
        // No existing class found, create all sections as new classes
        sections.forEach(section => {
          promises.push(
            apiRequest("POST", "/api/classes", {
              grade,
              section,
              room: ""
            }).then(res => res.json())
          );
        });
      }
      
      return Promise.all(promises);
    },
    onSuccess: (createdClasses, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setIsSectionDialogOpen(false);
      setSectionsToAdd("A,B,C");
      setSelectedClass("");
      toast({
        title: "Success",
        description: `Successfully created ${createdClasses.length} sections for Class ${variables.grade}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sections",
        variant: "destructive",
      });
    },
  });

  const handleCreateSections = () => {
    if (!selectedClass.trim()) {
      toast({
        title: "Error",
        description: "Please enter a grade",
        variant: "destructive",
      });
      return;
    }
    
    const sections = sectionsToAdd
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    if (sections.length === 0) {
      toast({
        title: "Error", 
        description: "Please enter at least one section",
        variant: "destructive",
      });
      return;
    }
    
    createSectionsMutation.mutate({ grade: selectedClass, sections });
  };

  const handleAddClass = (data: ClassFormData) => {
    createClassMutation.mutate(data);
  };

  const handleDeleteClass = (id: string) => {
    deleteClassMutation.mutate(id);
  };

  const getNextSection = (grade: string): string => {
    // Get all existing sections for this grade
    const existingSections = classes
      .filter(c => c.grade === grade && c.section)
      .map(c => c.section)
      .sort();
    
    if (existingSections.length === 0) {
      // No sections exist, return A (for renaming original) and B (for new creation)
      return 'A';
    }
    
    // Find the next alphabetical section
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // First try single letters A-Z
    for (let i = 0; i < alphabet.length; i++) {
      const letter = alphabet[i];
      if (!existingSections.includes(letter)) {
        return letter;
      }
    }
    
    // If all single letters are used, try double letters AA, AB, AC, etc.
    for (let i = 0; i < alphabet.length; i++) {
      for (let j = 0; j < alphabet.length; j++) {
        const letter = alphabet[i] + alphabet[j];
        if (!existingSections.includes(letter)) {
          return letter;
        }
      }
    }
    
    // If somehow all double letters are used (676 sections!), use a timestamp-based fallback
    return 'X' + Date.now().toString().slice(-3);
  };

  const handleAutoAddSection = async (grade: string) => {
    const existingSections = classes.filter(c => c.grade === grade && c.section);
    const classWithoutSection = classes.find(c => c.grade === grade && !c.section);
    
    if (classWithoutSection && existingSections.length === 0) {
      // Special case: Class has no sections yet
      // Rename original class to have section A, then create section B
      try {
        // First rename the existing class to have section A
        const response1 = await apiRequest("PUT", `/api/classes/${classWithoutSection.id}`, {
          grade: classWithoutSection.grade,
          section: 'A',
          room: classWithoutSection.room || ''
        });
        
        // Then create section B  
        const response2 = await apiRequest("POST", "/api/classes", {
          grade: grade,
          section: 'B',
          room: ''
        });
        
        // Invalidate queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
        
        toast({
          title: "Success",
          description: `Class ${grade} converted to sections. Created ${grade}A and ${grade}B`,
        });
      } catch (error) {
        toast({
          title: "Error", 
          description: "Failed to create sections",
          variant: "destructive",
        });
      }
    } else {
      // Normal case: Add the next section
      const nextSection = getNextSection(grade);
      try {
        const response = await apiRequest("POST", "/api/classes", {
          grade: grade,
          section: nextSection,
          room: ''
        });
        
        // Invalidate queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
        
        toast({
          title: "Success",
          description: `Added section ${nextSection} to Class ${grade}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add section",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading classes: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your school's classes and sections
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-testid="button-add-class-dropdown" className="h-10 md:h-9">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Class</span>
                <span className="sm:hidden">Add</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setIsAddDialogOpen(true)}
                data-testid="menu-add-single-class"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Single Class
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLocation('/classes/bulk-upload')}
                data-testid="menu-bulk-import-classes"
              >
                <Upload className="h-4 w-4 mr-2" />
                Add multiple classes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Single Class Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddClass)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 9, 10, 11, 12" 
                            {...field} 
                            data-testid="input-grade"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., A (single section only, or leave empty)" 
                            {...field} 
                            data-testid="input-section"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="room"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Room 101" 
                            {...field} 
                            data-testid="input-room"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel-add"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createClassMutation.isPending}
                    data-testid="button-submit-add"
                  >
                    {createClassMutation.isPending ? "Creating..." : "Create Class"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
          <SearchBar className="w-full md:w-64" />
        </div>
      </div>

      {/* Quick Class Navigation */}
      {classes.length > 0 && (
        <div 
          className="sticky top-16 md:top-0 z-50 mb-6 bg-background/95 backdrop-blur-sm border-b"
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6 py-3">
            <div className="bg-muted/30 rounded-lg p-2 md:p-3">
              <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Quick Navigation</h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {Array.from(new Set(classes.map(c => c.grade)))
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map((grade) => (
                    <Button
                      key={grade}
                      variant="outline"
                      size="sm"
                      className="h-9 md:h-8 text-xs md:text-xs px-3 md:px-2 min-w-0"
                      onClick={() => {
                        const element = document.getElementById(`grade-${grade}`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      Class {grade}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classes List */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first class
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-class">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Class
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(
            classes
              .sort((a, b) => parseInt(a.grade) - parseInt(b.grade))
              .reduce((groups, classItem) => {
                const grade = classItem.grade;
                if (!groups[grade]) groups[grade] = [];
                groups[grade].push(classItem);
                return groups;
              }, {} as Record<string, Class[]>)
          ).map(([grade, gradeClasses]) => (
            <div key={grade} id={`grade-${grade}`}>
              <h3 className="text-xl font-semibold mb-3 text-primary">Class {grade}</h3>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gradeClasses
                  .sort((a, b) => {
                    // Sort by section, with empty sections first
                    if (!a.section && !b.section) return 0;
                    if (!a.section) return -1;
                    if (!b.section) return 1;
                    return a.section.localeCompare(b.section);
                  })
                  .map((classItem) => (
                    <Card key={classItem.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary group relative touch-manipulation">
                      <CardHeader className="pb-1 pt-2 px-3">
                        <div className="flex items-center justify-between">
                          <Link href={`/classes/${classItem.id}`} className="flex-1 cursor-pointer">
                            <CardTitle className="text-sm md:text-base group-hover:text-primary transition-colors">
                              {classItem.section ? 
                                `Class ${classItem.grade}${classItem.section}` : 
                                `Class ${classItem.grade}`
                              }
                            </CardTitle>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                data-testid={`button-delete-class-${classItem.id}`}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Class and Section</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {classItem.section ? 
                                      `Class ${classItem.grade}${classItem.section}` : 
                                      `Class ${classItem.grade}`
                                    }? 
                                    This action cannot be undone and will also remove all associated timetable entries.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteClass(classItem.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-testid="button-confirm-delete"
                                  >
                                    Yes, Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent className="cursor-pointer pt-0 pb-1 px-3" onClick={() => window.location.href = `/classes/${classItem.id}`}>
                        {classItem.section && (
                          <div className="flex items-center justify-center mb-1">
                            <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary py-0 px-2">
                              Section {classItem.section}
                            </Badge>
                          </div>
                        )}
                        {classItem.room && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{classItem.room}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                
                {/* Add Section Card */}
                <Card 
                  className="hover:shadow-md transition-all duration-200 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer bg-muted/20 hover:bg-muted/40 group"
                  onClick={() => handleAutoAddSection(grade)}
                >
                  <CardContent className="pt-3 pb-3 px-3">
                    <div className="flex flex-col items-center justify-center text-center min-h-[60px]">
                      <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                      <h4 className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Add Section
                      </h4>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        Class {grade}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {/* Generate Classes Confirmation Dialog */}
      <AlertDialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Instant Classes</AlertDialogTitle>
            <AlertDialogDescription>
              This action will automatically generate classes from Class 1 to Class 12 for this school. 
              Each class will have a default student count of 30. You can add sections to each class later.
              <br /><br />
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-generate">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => generateInstantClassesMutation.mutate()}
              disabled={generateInstantClassesMutation.isPending}
              data-testid="button-confirm-generate"
            >
              {generateInstantClassesMutation.isPending ? "Generating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Sections Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sections to Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="grade-select">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger data-testid="select-sections-grade">
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(classes.map(c => c.grade)))
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        Class {grade}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sections-input">Sections (comma separated)</Label>
              <Input
                id="sections-input"
                placeholder="e.g., A,B,C or A,B,C,D"
                value={sectionsToAdd}
                onChange={(e) => setSectionsToAdd(e.target.value)}
                data-testid="input-sections-list"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter sections separated by commas. Each will become a separate class (e.g., 1A, 1B, 1C)
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSectionDialogOpen(false)}
              data-testid="button-cancel-sections"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSections}
              disabled={createSectionsMutation.isPending}
              data-testid="button-create-sections"
            >
              {createSectionsMutation.isPending ? "Creating..." : "Create Sections"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Fixed position button at bottom right - Only show if 7 or fewer classes exist */}
      {classes.length <= 7 && (
        <Button 
          size="sm"
          variant="outline" 
          className="fixed bottom-4 right-4 bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700 shadow-lg"
          onClick={() => setIsGenerateDialogOpen(true)}
          data-testid="button-generate-instant-classes"
        >
          Generate Instant Classes (till 12)
        </Button>
      )}

    </div>
  );
}