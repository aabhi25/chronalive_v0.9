import { Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import llamaService from "./llamaService";
import intentMappingService from "./intentMapping";
import conversationMemory from "./conversationMemory";

// Chat request schema
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty")
});

// Intent recognition patterns
const INTENT_PATTERNS = {
  // Class management
  CREATE_CLASS: [
    /create\s+(a\s+)?(new\s+)?class/i,
    /add\s+(a\s+)?(new\s+)?class/i,
    /make\s+(a\s+)?(new\s+)?class/i
  ],
  
  // Teacher attendance
  MARK_TEACHER_ABSENT: [
    /mark\s+(.+?)\s+absent/i,
    /(.+?)\s+is\s+absent/i,
    /set\s+(.+?)\s+as\s+absent/i
  ],
  
  MARK_TEACHER_PRESENT: [
    /mark\s+(.+?)\s+present/i,
    /(.+?)\s+is\s+present/i,
    /set\s+(.+?)\s+as\s+present/i
  ],
  
  // Data queries
  TEACHER_ATTENDANCE_COUNT: [
    /how\s+many\s+teachers?\s+(are\s+)?(present|absent)/i,
    /tell\s+me\s+(the\s+)?number\s+of\s+teachers?\s+(present|absent)/i,
    /count\s+(of\s+)?(present|absent)\s+teachers?/i
  ],
  
  SHOW_TIMETABLE: [
    // Class-specific patterns first (most specific)
    /show\s+(me\s+)?(the\s+)?timetable\s+(of\s+|for\s+)?class\s+(\d+)/i,
    /display\s+timetable\s+(of\s+|for\s+)?class\s+(\d+)/i,
    /view\s+timetable\s+(of\s+|for\s+)?class\s+(\d+)/i,
    /class\s+(\d+)\s+timetable/i,
    /timetable\s+(of\s+|for\s+)?class\s+(\d+)/i,
    // Generic patterns last
    /show\s+(me\s+)?(the\s+)?timetable/i,
    /display\s+timetable/i,
    /view\s+timetable/i,
    /timetable/i
  ],
  
  // Theme and settings
  CHANGE_THEME: [
    /change\s+(the\s+)?theme/i,
    /switch\s+(to\s+)?(dark|light|black|white)\s+(mode|theme)/i,
    /set\s+(theme|mode)\s+(to\s+)?(dark|light|black|white)/i,
    /(dark|light|black|white)\s+(mode|theme)/i,
    /toggle\s+(theme|mode)/i,
    /change\s+(to\s+)?(black|white)/i
  ],
  
  OPEN_SETTINGS: [
    /open\s+settings/i,
    /go\s+to\s+settings/i,
    /show\s+(me\s+)?settings/i,
    /settings/i,
    /preferences/i,
    /configuration/i
  ],
  
  // General queries
  HELP: [
    /help/i,
    /what\s+can\s+you\s+do/i,
    /commands/i,
    /options/i
  ]
};

interface ChatIntent {
  type: string;
  confidence: number;
  extractedData?: any;
}

// Simple intent recognition function
function recognizeIntent(message: string): ChatIntent | null {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check each intent pattern
  for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        let extractedData = {};
        
        // Extract specific data based on intent
        switch (intentType) {
          case 'MARK_TEACHER_ABSENT':
          case 'MARK_TEACHER_PRESENT':
            if (match[1]) {
              extractedData = { teacherName: match[1].trim() };
            }
            break;
          case 'TEACHER_ATTENDANCE_COUNT':
            if (match[2]) {
              extractedData = { status: match[2].toLowerCase() };
            }
            break;
          case 'CHANGE_THEME':
            // Extract theme preference (dark/light/black/white) if specified
            const themeMatch = message.match(/(dark|light|black|white)/i);
            if (themeMatch) {
              let theme = themeMatch[1].toLowerCase();
              // Map black to dark and white to light
              if (theme === 'black') theme = 'dark';
              if (theme === 'white') theme = 'light';
              extractedData = { theme };
            }
            break;
          case 'SHOW_TIMETABLE':
            // Extract class number if specified
            const classMatch = message.match(/class\s+(\d+)/i);
            if (classMatch) {
              extractedData = { classNumber: classMatch[1] };
            }
            break;
        }
        
        return {
          type: intentType,
          confidence: 0.9,
          extractedData
        };
      }
    }
  }
  
  return null;
}

// System action handlers
async function handleSystemAction(intent: ChatIntent, schoolId: string, userRole: string): Promise<{
  reply: string;
  action?: string;
  actionData?: any;
}> {
  // Check if user has permission for mutating operations
  const MUTATING_INTENTS = ['CREATE_CLASS', 'MARK_TEACHER_ABSENT', 'MARK_TEACHER_PRESENT'];
  if (MUTATING_INTENTS.includes(intent.type) && userRole !== 'admin' && userRole !== 'super_admin') {
    return {
      reply: "I'm sorry, but only school administrators can perform this action. Please contact your school admin if you need assistance with managing classes or teacher attendance."
    };
  }
  try {
    switch (intent.type) {
      case 'CREATE_CLASS':
        return {
          reply: "I'll help you create a new class. Opening the class creation dialog...",
          action: 'open-create-class-dialog',
          actionData: { schoolId }
        };
        
      case 'MARK_TEACHER_ABSENT': {
        const teacherName = intent.extractedData?.teacherName?.trim();
        if (!teacherName) {
          return { reply: "Please specify which teacher you'd like to mark as absent." };
        }
        
        // Find teacher by name with improved matching
        const teachers = await storage.getTeachers(schoolId);
        const potentialMatches = teachers.filter(t => 
          t.name.toLowerCase().includes(teacherName.toLowerCase()) ||
          teacherName.toLowerCase().includes(t.name.toLowerCase())
        );
        
        if (potentialMatches.length === 0) {
          return { 
            reply: `I couldn't find a teacher named "${teacherName}" in your school. Please check the spelling or try with the full name. Available teachers: ${teachers.map(t => t.name).join(', ')}.` 
          };
        }
        
        if (potentialMatches.length > 1) {
          return { 
            reply: `I found multiple teachers matching "${teacherName}": ${potentialMatches.map(t => t.name).join(', ')}. Please be more specific with the full teacher name.` 
          };
        }
        
        const teacher = potentialMatches[0];
        
        if (!teacher) {
          return { 
            reply: `I couldn't find a teacher named "${teacherName}" in your school. Please check the spelling or try with the full name.` 
          };
        }
        
        // Mark teacher as absent for today
        const today = new Date().toISOString().split('T')[0];
        await storage.markTeacherAttendance({
          teacherId: teacher.id,
          schoolId: schoolId!,
          attendanceDate: today,
          status: 'absent',
          reason: 'Marked absent via AI assistant',
          markedBy: 'ai-assistant'
        });
        
        return {
          reply: `Successfully marked ${teacher.name} as absent for today. The system will automatically look for substitute teachers if needed.`,
          action: 'refresh-attendance-data'
        };
      }
        
      case 'MARK_TEACHER_PRESENT': {
        const teacherName = intent.extractedData?.teacherName?.trim();
        if (!teacherName) {
          return { reply: "Please specify which teacher you'd like to mark as present." };
        }
        
        // Find teacher by name with improved matching
        const teachers = await storage.getTeachers(schoolId);
        const potentialMatches = teachers.filter(t => 
          t.name.toLowerCase().includes(teacherName.toLowerCase()) ||
          teacherName.toLowerCase().includes(t.name.toLowerCase())
        );
        
        if (potentialMatches.length === 0) {
          return { 
            reply: `I couldn't find a teacher named "${teacherName}" in your school. Please check the spelling or try with the full name. Available teachers: ${teachers.map(t => t.name).join(', ')}.` 
          };
        }
        
        if (potentialMatches.length > 1) {
          return { 
            reply: `I found multiple teachers matching "${teacherName}": ${potentialMatches.map(t => t.name).join(', ')}. Please be more specific with the full teacher name.` 
          };
        }
        
        const teacher = potentialMatches[0];
        
        if (!teacher) {
          return { 
            reply: `I couldn't find a teacher named "${teacherName}" in your school. Please check the spelling or try with the full name.` 
          };
        }
        
        const today = new Date().toISOString().split('T')[0];
        await storage.markTeacherAttendance({
          teacherId: teacher.id,
          schoolId: schoolId!,
          attendanceDate: today,
          status: 'present',
          markedBy: 'ai-assistant'
        });
        
        return {
          reply: `Successfully marked ${teacher.name} as present for today.`,
          action: 'refresh-attendance-data'
        };
      }
        
      case 'TEACHER_ATTENDANCE_COUNT': {
        const status = intent.extractedData?.status || 'present';
        const today = new Date().toISOString().split('T')[0];
        const attendance = await storage.getTeacherAttendance(schoolId, today);
        const totalTeachers = (await storage.getTeachers(schoolId)).length;
        
        if (status === 'present') {
          const presentCount = attendance.filter(a => a.status === 'present').length;
          const absentCount = attendance.filter(a => a.status === 'absent').length;
          const unmarkedCount = totalTeachers - attendance.length;
          
          if (attendance.length === 0) {
            return {
              reply: `No attendance has been recorded for today yet. There are ${totalTeachers} teachers in your school. You can mark attendance by saying "Mark [Teacher Name] present" or "Mark [Teacher Name] absent".`,
              action: 'highlight-attendance-stats'
            };
          } else if (unmarkedCount > 0) {
            return {
              reply: `Today, ${presentCount} teachers are marked present, ${absentCount} are marked absent, and ${unmarkedCount} haven't been marked yet out of ${totalTeachers} total teachers.`,
              action: 'highlight-attendance-stats'
            };
          } else {
            return {
              reply: `Today, ${presentCount} teachers are present out of ${totalTeachers} total teachers in your school.`,
              action: 'highlight-attendance-stats'
            };
          }
        } else {
          const absentCount = attendance.filter(a => a.status === 'absent').length;
          return {
            reply: `Today, ${absentCount} teachers are absent out of ${totalTeachers} total teachers in your school.`,
            action: 'highlight-attendance-stats'
          };
        }
      }
        
      case 'SHOW_TIMETABLE': {
        const classNumber = intent.extractedData?.classNumber;
        if (classNumber) {
          try {
            // Find the class by grade number (ensure type compatibility)
            const classes = await storage.getClasses(schoolId);
            const targetClass = classes.find(c => String(c.grade) === String(classNumber));
            
            if (!targetClass) {
              return {
                reply: `I couldn't find Class ${classNumber} in your school. Available classes: ${classes.map(c => c.grade + (c.section ? `-${c.section}` : '')).join(', ')}.`
              };
            }

            // Get current week dates (properly handle Sunday edge case)
            const today = new Date();
            const dayOfWeek = (today.getDay() + 6) % 7; // Convert to Monday=0 basis
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - dayOfWeek); // Monday of current week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // Sunday

            // Get weekly timetable data
            let weeklyTimetable = await storage.getWeeklyTimetable(targetClass.id, weekStart);
            
            // If no weekly timetable exists, get global timetable data for this class
            if (!weeklyTimetable) {
              const globalEntries = await storage.getTimetableForClass(targetClass.id);
              
              // Create timetable data structure from global entries
              const timetableData = globalEntries.map(entry => ({
                day: entry.day,
                period: entry.period,
                startTime: entry.startTime,
                endTime: entry.endTime,
                teacherId: entry.teacherId,
                subjectId: entry.subjectId,
                room: entry.room,
                isModified: false
              }));

              weeklyTimetable = {
                id: `temp-${targetClass.id}-${weekStart.toISOString().split('T')[0]}`,
                classId: targetClass.id,
                weekStart: weekStart.toISOString().split('T')[0],
                weekEnd: weekEnd.toISOString().split('T')[0],
                timetableData,
                modifiedBy: '',
                modificationCount: 0,
                basedOnGlobalVersion: 'current',
                schoolId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            }

            // Get teacher and subject details
            const [teachers, subjects, timetableStructure] = await Promise.all([
              storage.getTeachers(schoolId),
              storage.getSubjects(schoolId),
              storage.getTimetableStructure(schoolId)
            ]);

            // Debug logging
            console.log('[CHAT TIMETABLE] Timetable structure:', timetableStructure);
            console.log('[CHAT TIMETABLE] Time slots:', timetableStructure?.timeSlots);
            console.log('[CHAT TIMETABLE] Working days:', timetableStructure?.workingDays);

            // Enrich timetable data with teacher and subject details
            const enrichedTimetableData = weeklyTimetable.timetableData.map(entry => ({
              ...entry,
              teacher: teachers.find(t => t.id === entry.teacherId),
              subject: subjects.find(s => s.id === entry.subjectId)
            }));

            // Default time slots if none found
            const defaultTimeSlots = [
              { period: 1, startTime: "07:30", endTime: "08:15" },
              { period: 2, startTime: "08:15", endTime: "09:00" },
              { period: 3, startTime: "09:00", endTime: "09:45" },
              { period: 4, startTime: "09:45", endTime: "10:15" },
              { period: 5, startTime: "10:15", endTime: "11:00", isBreak: true },
              { period: 6, startTime: "11:00", endTime: "11:45" },
              { period: 7, startTime: "11:45", endTime: "12:30" },
              { period: 8, startTime: "12:30", endTime: "13:15" }
            ];

            const timeSlots = timetableStructure?.timeSlots || defaultTimeSlots;
            const workingDays = timetableStructure?.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

            console.log('[CHAT TIMETABLE] Final time slots:', timeSlots);
            console.log('[CHAT TIMETABLE] Enriched timetable data:', enrichedTimetableData);

            return {
              reply: `Here's the current week timetable for Class ${classNumber}${targetClass.section ? `-${targetClass.section}` : ''}:`,
              action: 'display-timetable',
              actionData: {
                classInfo: {
                  grade: targetClass.grade,
                  section: targetClass.section
                },
                weekStart: weeklyTimetable.weekStart,
                weekEnd: weeklyTimetable.weekEnd,
                timetableData: enrichedTimetableData,
                timeSlots,
                workingDays
              }
            };
          } catch (error) {
            console.error('Error fetching timetable for chat:', error);
            return {
              reply: `I encountered an error while fetching the timetable for Class ${classNumber}. Please try again later.`
            };
          }
        } else {
          return {
            reply: "I'll show you the school timetable. Opening the timetable view...",
            action: 'open-timetable-view'
          };
        }
      }
        
      case 'CHANGE_THEME': {
        const requestedTheme = intent.extractedData?.theme;
        if (requestedTheme) {
          return {
            reply: `I'll change the theme to ${requestedTheme} mode for you. Opening settings to apply the theme change...`,
            action: 'change-theme',
            actionData: { theme: requestedTheme }
          };
        } else {
          return {
            reply: "I'll open the settings page where you can change the theme. You can choose between light, dark, or system theme.",
            action: 'open-settings',
            actionData: { section: 'theme' }
          };
        }
      }
      
      case 'OPEN_SETTINGS':
        return {
          reply: "I'll open the settings page for you. There you can manage your preferences, change themes, and configure your account.",
          action: 'open-settings'
        };
        
      case 'HELP':
        return {
          reply: `I'm here to help you manage your school efficiently! Here are some things I can do:

📚 **Class Management:**
• "Create a new class" - Opens the class creation dialog
• "Add a class for grade 5" - Creates a new class

👥 **Teacher Management:**
• "Mark [Teacher Name] absent today" - Records teacher absence
• "Mark Surbhi present today" - Records teacher presence
• "How many teachers are present today?" - Shows attendance stats

📅 **Timetable & Scheduling:**
• "Show me the timetable" - Opens the timetable view
• "View teacher schedule" - Shows teacher schedules

📊 **Reports & Data:**
• "Tell me the number of teachers absent" - Provides attendance statistics
• "Show attendance overview" - Highlights attendance data

⚙️ **Settings & Theme:**
• "Change theme to dark" - Switches to dark mode
• "Open settings" - Opens the settings page
• "Go to settings" - Navigate to preferences

Just type your request naturally, and I'll help you get things done quickly!`
        };
        
      default:
        return {
          reply: "I understand you're asking about school management, but I'm not sure exactly what you'd like me to do. Could you please rephrase your request? You can say things like 'Create a new class', 'Mark [Teacher Name] absent', or 'Show me the timetable'."
        };
    }
  } catch (error) {
    console.error('Error handling system action:', error);
    return {
      reply: "I encountered an error while processing your request. Please try again or contact support if the issue persists."
    };
  }
}

// Enhanced LLM response generator with theme understanding
async function generateLLMResponse(message: string, schoolId: string): Promise<{ reply: string; action?: string; actionData?: any }> {
  try {
    const context = `You are Hi Chroney, an intelligent school management assistant. You can help with:

**School Management:**
- Creating and managing classes
- Tracking teacher attendance 
- Viewing timetables and schedules
- General school administration

**System Actions:**
- Theme changes (dark, light, black means dark)
- Opening settings and preferences
- Navigation to different sections

When users ask about themes:
- "black theme" or "dark theme" = dark mode
- "light theme" or "white theme" = light mode
- "change theme" without specifying = open settings

For theme requests, respond naturally and suggest the action. For other requests, provide helpful guidance.

User message: "${message}"

Response format: If this is a theme-related request, include action suggestions. Otherwise, provide helpful school management guidance.`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: context,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.response?.trim() || "I'm here to help with your school management needs. What can I assist you with?";
    
    // Enhanced intent detection from LLM response and original message
    const lowerMessage = message.toLowerCase();
    const lowerReply = reply.toLowerCase();
    
    // Check for theme-related requests
    if (lowerMessage.includes('theme') || lowerMessage.includes('dark') || lowerMessage.includes('light') || lowerMessage.includes('black') || lowerMessage.includes('white')) {
      if (lowerMessage.includes('black') || lowerMessage.includes('dark')) {
        return {
          reply: "I'll change the theme to dark mode for you! Dark themes are great for reducing eye strain. Let me open the settings where this change will be applied.",
          action: 'change-theme',
          actionData: { theme: 'dark' }
        };
      } else if (lowerMessage.includes('light') || lowerMessage.includes('white')) {
        return {
          reply: "I'll change the theme to light mode for you! Light themes provide excellent readability. Let me open the settings where this change will be applied.",
          action: 'change-theme',
          actionData: { theme: 'light' }
        };
      } else {
        return {
          reply: "I'll open the settings page where you can choose your preferred theme. You can select from light, dark, or system theme options.",
          action: 'open-settings',
          actionData: { section: 'theme' }
        };
      }
    }
    
    // Check for settings requests
    if (lowerMessage.includes('settings') || lowerMessage.includes('preferences') || lowerMessage.includes('configuration')) {
      return {
        reply: "I'll open the settings page for you where you can manage your preferences, change themes, and configure your account.",
        action: 'open-settings'
      };
    }
    
    return { reply };
  } catch (error) {
    console.error('Ollama connection error:', error);
    throw error;
  }
}

// Simple LLM fallback for general conversation
function generateFallbackResponse(message: string): string {
  const responses = [
    "I'm here to help you manage your school. You can ask me to create classes, mark teacher attendance, show timetables, and more. What would you like to do?",
    
    "As your school management assistant, I can help with tasks like creating classes, managing teacher attendance, viewing schedules, and getting reports. How can I assist you today?",
    
    "I specialize in school administration tasks. Try asking me to 'Create a new class', 'Mark [Teacher Name] absent', 'Show the timetable', or 'How many teachers are present today?'",
    
    "I'm designed to help with school management tasks. You can ask me about teacher attendance, class creation, timetable viewing, and more. What would you like me to help you with?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Local pattern matching fallback for common commands when API is rate-limited
 */
function tryLocalPatternMatching(message: string): any {
  const lowerMessage = message.toLowerCase().trim();
  
  // CREATE CLASS patterns
  if (/create\s+(a\s+)?(new\s+)?class/i.test(lowerMessage) || 
      /add\s+(a\s+)?(new\s+)?class/i.test(lowerMessage) ||
      /make\s+(a\s+)?(new\s+)?class/i.test(lowerMessage)) {
    return {
      intent: 'CREATE_CLASS',
      entities: {
        action_type: 'create'
      },
      confidence: 0.9
    };
  }
  
  // CREATE TEACHER patterns
  if (/create\s+(a\s+)?(new\s+)?teacher/i.test(lowerMessage) || 
      /add\s+(a\s+)?(new\s+)?teacher/i.test(lowerMessage) ||
      /register\s+(a\s+)?(new\s+)?teacher/i.test(lowerMessage) ||
      /hire\s+(a\s+)?(new\s+)?teacher/i.test(lowerMessage)) {
    return {
      intent: 'CREATE_TEACHER',
      entities: {
        action_type: 'create'
      },
      confidence: 0.9
    };
  }
  
  // SHOW TIMETABLE patterns (using correct intent name)
  if (/show\s+(me\s+)?(the\s+)?timetable/i.test(lowerMessage) ||
      /view\s+(the\s+)?timetable/i.test(lowerMessage) ||
      /display\s+(the\s+)?timetable/i.test(lowerMessage)) {
    return {
      intent: 'SHOW_TIMETABLE',
      entities: {
        action_type: 'view'
      },
      confidence: 0.9
    };
  }
  
  // No patterns matched
  return null;
}

// Main chat processing function
/**
 * NEW LLAMA-powered chat endpoint with conversation memory - processes natural language using Groq API
 */
export async function processChatMessage(req: Request, res: Response) {
  try {
    const { message } = chatRequestSchema.parse(req.body);
    
    // Get user info from authenticated request
    const user = (req as any).user;
    if (!user || !user.schoolId) {
      return res.status(401).json({ 
        reply: "You must be logged in to a school to use the chat assistant." 
      });
    }
    
    const userId = user.id;
    const userRole = user.role;
    const schoolId = user.schoolId;
    
    // Step 1: Check if LLAMA is connected
    if (!llamaService.getConnectionStatus()) {
      console.log('❌ LLAMA not connected, attempting to reconnect...');
      const connected = await llamaService.initialize();
      
      if (!connected) {
        // Fallback: Try local pattern matching for connection failures
        console.log('🔄 LLAMA unavailable, attempting local pattern matching...');
        const fallbackIntent = tryLocalPatternMatching(message);
        
        if (fallbackIntent) {
          console.log(`✅ Local pattern matched (LLAMA offline): ${fallbackIntent.intent}`);
          
          // Execute the intent directly using mapping service
          const result = await intentMappingService.executeIntent(
            fallbackIntent.intent,
            fallbackIntent.entities,
            schoolId,
            userRole,
            message,
            ""  // No conversation context available
          );
          
          // Store conversation
          conversationMemory.storeConversation(
            userId,
            message,
            result.message,
            fallbackIntent.intent,
            fallbackIntent.entities
          );
          
          return res.json({
            reply: result.message,
            action: result.action,
            actionData: result.actionData
          });
        } else {
          const errorReply = "⚠️ Oops! My brain is not functioning right now… maybe try again later.";
          conversationMemory.storeConversation(userId, message, errorReply);
          
          return res.json({
            reply: errorReply
          });
        }
      }
    }
    
    // Step 2: Get conversation context for better understanding
    const conversationContext = conversationMemory.formatConversationContext(userId);
    console.log(`[CHAT] Processing message with ${conversationMemory.getConversationHistory(userId).length} previous conversations`);
    
    // Step 3: First classify if this is conversation or school management
    let queryType;
    let parsedIntent: any = null; // Declare at broader scope
    try {
      queryType = await llamaService.classifyQueryType(message);
      console.log(`✅ LLAMA classified query as: ${queryType}`);
    } catch (error: any) {
      console.log('❌ LLAMA classification failed:', error.message);
      
      // Fallback: Try local pattern matching for classification failures too
      console.log('🔄 Attempting local pattern matching fallback for classification...');
      const fallbackIntent = tryLocalPatternMatching(message);
      
      if (fallbackIntent) {
        console.log(`✅ Local pattern matched during classification: ${fallbackIntent.intent}`);
        // Force as school_management and use the fallback intent (skip redundant LLAMA parsing)
        queryType = 'school_management';
        parsedIntent = fallbackIntent;
      } else {
        const errorReply = "⚠️ Oops! My brain is not functioning right now… maybe try again later.";
        conversationMemory.storeConversation(userId, message, errorReply);
        
        return res.json({
          reply: errorReply
        });
      }
    }
    
    let result;
    
    if (queryType === 'conversation') {
      // Step 4a: Handle as conversational query directly
      try {
        const conversationalResponse = await llamaService.generateConversationalResponse(message, userRole, schoolId, conversationContext);
        result = {
          success: true,
          message: conversationalResponse
        };
        console.log(`✅ Generated conversational response`);
      } catch (error: any) {
        console.log('❌ LLAMA conversational response failed:', error.message);
        result = {
          success: true,
          message: "Hi there! 👋 I'm Chroney, your school management assistant. I'm here to help you with attendance, timetables, classes, and more. What can I do for you today?"
        };
      }
    } else {
      // Step 4b: Handle as school management query - parse intent then execute
      try {
        parsedIntent = await llamaService.parseIntentWithContext(message, conversationContext);
        console.log(`✅ LLAMA parsed intent: ${parsedIntent.intent} (confidence: ${parsedIntent.confidence})`);
      } catch (error: any) {
        console.log('❌ LLAMA intent parsing failed:', error.message);
        
        // Fallback: Use local pattern matching for common commands when API is rate-limited
        console.log('🔄 Attempting local pattern matching fallback...');
        const fallbackIntent = tryLocalPatternMatching(message);
        
        if (fallbackIntent) {
          console.log(`✅ Local pattern matched: ${fallbackIntent.intent}`);
          parsedIntent = fallbackIntent;
        } else {
          // Only return error if we can't handle it locally
          const errorReply = "⚠️ Oops! My brain is not functioning right now… maybe try again later.";
          conversationMemory.storeConversation(userId, message, errorReply);
          
          return res.json({
            reply: errorReply
          });
        }
      }
      
      // Execute intent using the mapping service
      result = await intentMappingService.executeIntent(
        parsedIntent.intent,
        parsedIntent.entities,
        schoolId,
        userRole,
        message,  // Pass original message for natural conversation
        conversationContext  // Pass conversation context for better responses
      );
    }
    
    // Step 5: Store successful conversation in memory
    if (queryType === 'conversation') {
      conversationMemory.storeConversation(
        userId,
        message,
        result.message
      );
    } else {
      // For school management queries, we have parsed intent data
      conversationMemory.storeConversation(
        userId,
        message,
        result.message,
        parsedIntent.intent,
        parsedIntent.entities
      );
    }
    
    // Step 6: Return human-friendly response
    return res.json({
      reply: result.message,
      action: result.action,
      actionData: result.actionData
    });
    
  } catch (error) {
    console.error('Chat processing error:', error);
    
    const errorReply = error instanceof z.ZodError 
      ? "I need a valid message to process. Please try again with your request."
      : "⚠️ Something went wrong while processing your request. Please try again.";
    
    // Store error conversation if we have user info
    const user = (req as any).user;
    if (user?.id) {
      const { message } = req.body;
      conversationMemory.storeConversation(user.id, message || "Invalid request", errorReply);
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ reply: errorReply });
    }
    
    res.status(500).json({ reply: errorReply });
  }
}