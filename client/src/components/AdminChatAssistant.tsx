import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Minimize2,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ChatTimetableDisplay } from "./ChatTimetableDisplay";
import { FieldSelectionDialog } from "./FieldSelectionDialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TimetableData {
  classInfo: {
    grade: string;
    section: string;
  };
  weekStart: string;
  weekEnd: string;
  timetableData: any[];
  timeSlots: any[];
  workingDays: string[];
}

interface AnalyticsData {
  query: string;
  data: Record<string, any>[];
  rowCount: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  timetableData?: TimetableData;
  analyticsData?: AnalyticsData;
}

interface AdminChatAssistantProps {
  onSystemAction?: (action: string, data?: any) => void;
}

// Chroney's rotating intro messages for better user engagement
const getRandomIntroMessage = () => {
  const introMessages = [
    "Hey there! I'm Chroney, your AI assistant. I do classes, attendance, timetables… basically everything except homework. Don't even try 😏",
    "What's up! Chroney here 🚀. I run your school system smoother than a principal on a Friday afternoon. What's the mission today?",
    "Yo! I'm Chroney, your school's brainy sidekick 🤓. Wanna take attendance or should I just mark everyone present and go home early?",
    "Sup, human? Chroney reporting for duty 🤖. Tell me what you want—attendance, classes, timetable—or I'll just start rapping the ABCs.",
    "Hey hey! Chroney here 🕶️. Think of me as the class topper who actually does your work. What do you need today?"
  ];
  
  return introMessages[Math.floor(Math.random() * introMessages.length)];
};

export function AdminChatAssistant({ onSystemAction }: AdminChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: getRandomIntroMessage(),
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fieldSelectionData, setFieldSelectionData] = useState<{
    type: 'students' | 'teachers';
    count: number;
    availableFields: any[];
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        // Use scrollTop for more stable scrolling
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Use setTimeout to ensure DOM has updated before scrolling
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await apiRequest('POST', '/api/chat/process', {
        message: userMessage.content
      });

      const data = await response.json() as {reply: string, action?: string, actionData?: any};

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      // Handle display-timetable action specially
      if (data.action === 'display-timetable' && data.actionData) {
        // Map backend data to frontend component structure
        const { timetableEntries, className, workingDays, timeSlots, ...rest } = data.actionData;
        
        // Parse className to get grade and section
        const classMatch = className.match(/^(\d+)([A-Z]?)$/);
        const grade = classMatch ? classMatch[1] : className;
        const section = classMatch ? classMatch[2] : '';
        
        // Get current week dates
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday
        
        const timetableData = {
          classInfo: { grade, section },
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          timetableData: timetableEntries,
          timeSlots,
          workingDays,
          ...rest
        };
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
          timetableData
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data.action === 'analytics_results' && data.actionData) {
        // Handle analytics results action
        const analyticsData: AnalyticsData = {
          query: data.actionData.query,
          data: data.actionData.data || [],
          rowCount: data.actionData.rowCount || 0
        };
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
          analyticsData
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data.action === 'show_field_selection' && data.actionData) {
        // Handle field selection dialog
        setFieldSelectionData({
          type: data.actionData.type,
          count: data.actionData.count,
          availableFields: data.actionData.availableFields
        });
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Handle other system actions
        if (data.action && onSystemAction) {
          onSystemAction(data.action, data.actionData);
        }
      }

    } catch (error) {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Compact/Collapsed State - Futuristic AI Robot
  if (!isExpanded) {
    return (
      <div className="relative mb-6">
        {/* Clean AI Bot Container */}
        <div 
          className="relative bg-gradient-to-br from-card via-purple-50/30 dark:via-purple-900/20 to-blue-50/20 dark:to-blue-900/20 rounded-xl p-6 shadow-lg border border-border overflow-hidden cursor-pointer hover:shadow-xl hover:border-purple-300/50 dark:hover:border-purple-600/50 transition-all duration-200"
          onClick={() => setIsExpanded(true)}
        >
          {/* Subtle Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 dark:from-purple-800/10 via-transparent to-blue-100/20 dark:to-blue-800/10"></div>
          
          <div className="relative flex items-center space-x-4 z-10">
            {/* AI Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <Bot className="w-8 h-8 text-white" />
              </div>
              {/* Status Indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* AI Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-semibold text-foreground">
                  Hi Chroney
                </h3>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 border border-green-200 dark:border-green-700">
                  ONLINE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">AI School Management Assistant</p>
              <p className="text-xs text-muted-foreground/80">Click anywhere to start chatting with your assistant</p>
            </div>
            
            {/* Expand Button */}
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded State - Full Chat Interface
  return (
    <div className="relative mb-6">
      {/* Clean Expanded Chat Container */}
      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Hi Chroney
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-xs text-purple-100">AI Assistant Active</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto bg-muted/30 rounded-lg p-4 mb-4 space-y-4 border border-border">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white ml-4 shadow-sm'
                      : 'bg-card text-card-foreground border border-border mr-4 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-2' : ''}`}>
                      {message.role === 'user' ? (
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          {message.isTyping ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                          ) : (
                            <Bot className="w-3 h-3 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === 'user' ? 'order-1' : ''}`}>
                      {message.isTyping ? (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {/* Render timetable if present */}
                          {message.timetableData && (
                            <div className="mt-3">
                              <ChatTimetableDisplay {...message.timetableData} />
                            </div>
                          )}
                          {/* Render analytics table if present */}
                          {message.analyticsData && (
                            <div className="mt-3">
                              <div className="bg-card border rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center">
                                    📊 <span className="ml-1">Analytics Results</span>
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {message.analyticsData.rowCount} records
                                  </Badge>
                                </div>
                                
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="hover:bg-transparent">
                                        {message.analyticsData.data.length > 0 && 
                                          Object.keys(message.analyticsData.data[0]).map((header) => (
                                            <TableHead key={header} className="bg-muted/50 font-semibold text-foreground capitalize">
                                              {header.replace(/_/g, ' ')}
                                            </TableHead>
                                          ))
                                        }
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {message.analyticsData.data.map((row, index) => (
                                        <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                          {Object.entries(row).map(([key, value], cellIndex) => (
                                            <TableCell key={cellIndex} className="font-medium">
                                              {value === null || value === undefined ? (
                                                <span className="text-muted-foreground">-</span>
                                              ) : (
                                                <span className={key === 'status' && value === 'absent' ? 'text-red-600 font-semibold' : 
                                                              key === 'status' && value === 'present' ? 'text-green-600 font-semibold' :
                                                              key === 'status' && value === 'late' ? 'text-yellow-600 font-semibold' : ''}>
                                                  {value.toString()}
                                                </span>
                                              )}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                              
                              <div className="mt-2 text-xs text-muted-foreground text-center">
                                💡 Need to export this data? Ask me to "export this as Excel" or "export as CSV"
                              </div>
                            </div>
                          )}
                          <div className={`text-xs mt-1 opacity-60 ${
                            message.role === 'user' ? 'text-right' : 'text-left'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex space-x-3 mb-4">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Hi Chroney anything... (e.g., 'Create a new class', 'Check attendance')"
                disabled={isLoading}
                className="bg-background border-border text-foreground placeholder-muted-foreground rounded-lg pl-4 pr-12 py-3 focus:border-purple-500 focus:ring-purple-500/20"
              />
              <Zap className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 rounded-lg px-6 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Action Suggestions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("How many teachers are present today?")}
              disabled={isLoading}
              className="bg-muted border-border text-muted-foreground hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-600 rounded-lg"
            >
              Check Attendance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Create a new class")}
              disabled={isLoading}
              className="bg-muted border-border text-muted-foreground hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-600 rounded-lg"
            >
              Create Class
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Mark a teacher absent today")}
              disabled={isLoading}
              className="bg-muted border-border text-muted-foreground hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-600 rounded-lg"
            >
              Mark Absent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Show me the timetable")}
              disabled={isLoading}
              className="bg-muted border-border text-muted-foreground hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-600 rounded-lg"
            >
              View Timetable
            </Button>
          </div>
        </div>
      </div>
      
      {/* Field Selection Dialog */}
      {fieldSelectionData && (
        <FieldSelectionDialog
          type={fieldSelectionData.type}
          count={fieldSelectionData.count}
          availableFields={fieldSelectionData.availableFields}
          onClose={() => setFieldSelectionData(null)}
        />
      )}
    </div>
  );
}