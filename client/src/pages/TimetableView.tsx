import TimetableGrid from "@/components/TimetableGrid";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function TimetableView() {
  const [, setLocation] = useLocation();

  const handleOpenSettings = () => {
    setLocation("/timetable/settings");
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Timetable Management</h2>
            <p className="text-muted-foreground">View and manage school timetables</p>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar className="w-64" />
            <Button 
              variant="outline" 
              onClick={handleOpenSettings}
              data-testid="button-timetable-settings"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="p-6">
        <TimetableGrid />
      </div>
    </div>
  );
}