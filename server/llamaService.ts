import axios from 'axios';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ParsedIntent {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
}

class LlamaService {
  private groqApiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1';
  private isConnected = false;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    if (!this.groqApiKey) {
      console.log('❌ GROQ_API_KEY not found in environment variables');
      return;
    }
  }

  /**
   * Test connection to Groq API with LLAMA model
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: 'Hello, are you working?'
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      this.isConnected = response.status === 200;
      
      if (this.isConnected) {
        console.log('✅ Connected to LLAMA via Groq API');
      } else {
        console.log('❌ LLAMA connection failed - Invalid response');
      }
      
      return this.isConnected;
    } catch (error: any) {
      this.isConnected = false;
      console.log('❌ LLAMA connection failed:', error.response?.data?.error || error.message);
      return false;
    }
  }

  /**
   * Parse user query using LLAMA to extract intent and entities
   */
  async parseIntent(userQuery: string): Promise<ParsedIntent> {
    return this.parseIntentWithContext(userQuery, "");
  }

  /**
   * Parse user query using LLAMA with conversation context to extract intent and entities
   */
  async parseIntentWithContext(userQuery: string, conversationContext: string): Promise<ParsedIntent> {
    if (!this.isConnected) {
      throw new Error('LLAMA is not connected');
    }

    const systemPrompt = `You are an intelligent intent parser for a school management system called Chrona. 

Your task is to analyze user queries and extract:
1. Intent: The main action the user wants to perform
2. Entities: Key information needed to execute the action
3. Confidence: How confident you are in your parsing (0.0-1.0)

Available intents:
- MARK_ATTENDANCE: Mark student/teacher absent, present, or late
- CREATE_CLASS: Create/register a new class or section (phrases: "create class", "register class", "add class", "new class")
- VIEW_TIMETABLE: Show timetable for class, teacher, or subject
- MANAGE_FEES: Handle fee-related queries
- SCHEDULE_EXAM: Create or manage exams
- SEND_COMMUNICATION: Send messages, notifications, or announcements
- VIEW_REPORTS: Generate attendance, performance, or other reports
- CREATE_STUDENT: Create/register a new student record (phrases: "create student", "register student", "add student", "new student", "enroll student")
- VIEW_STUDENTS: Show list of students in school or specific class
- UPDATE_STUDENT: Modify student information
- CREATE_TEACHER: Create/register a new teacher record (phrases: "create teacher", "register teacher", "add teacher", "new teacher", "hire teacher")
- VIEW_TEACHERS: Show list of teachers in school or by subject
- UPDATE_TEACHER: Modify teacher information
- CREATE_SUBJECT: Create a new subject
- VIEW_SUBJECTS: Show list of subjects
- FIND_SUBSTITUTE: Find substitute teachers for absent teachers
- AUTO_ASSIGN_SUBSTITUTE: Automatically assign substitute teachers
- GENERATE_TIMETABLE: Generate AI-powered school timetable
- MODIFY_TIMETABLE: Make manual timetable adjustments
- TEACHER_WORKLOAD: View teacher workload analytics
- CHANGE_THEME: Change application theme/appearance (phrases: "change theme", "dark mode", "light mode", "switch to dark", "change to black")
- OPEN_SETTINGS: Open settings page
- DOWNLOAD_STUDENT_LIST: Download student list in Excel format (phrases: "download student list", "export students", "download students excel", "get student data")
- DOWNLOAD_TEACHER_LIST: Download teacher list in Excel format (phrases: "download teacher list", "export teachers", "download teachers excel", "get teacher data")
- ANALYTICS_QUERY: Execute analytics and data queries with natural language (phrases: "analytics", "show analytics", "view analytics", "open analytics", "show stats", "show attendance", "check attendance", "view attendance", "attendance today", "attendance of all teachers", "show me attendance", "teacher attendance", "student attendance", "attendance status", "attendance for students", "attendance for teachers", "top teachers absent", "class with highest absenteeism", "attendance report", "show me data", "which class", "who are the", "teachers who were absent", "find teachers", "attendance statistics", "analytics dashboard", "performance analytics")
- EXPORT_ANALYTICS: Export analytics results to Excel/CSV (phrases: "export this", "download this report", "export as excel", "export as csv", "save this data")
- UNKNOWN: When the intent doesn't match any of the above

Entity types to extract:
- person_name: Name of student/teacher
- person_type: Type of person ("students", "teachers", "student", "teacher") - VERY IMPORTANT for attendance queries
- class_name: Class or section (e.g., "8A", "7B", "Class 10")
- subject: Subject name
- date: Date mentioned (today, tomorrow, specific date)
- status: attendance status (present, absent, late)
- action_type: specific action within the intent
- theme_name: Theme preference (dark, light, black, white, system)
- mode: Mode preference (dark, light, system)
- time_period: Time range for analytics (e.g., "last month", "September", "last week", "this year")
- export_format: Export format preference ("excel", "csv", "xlsx")
- analytics_type: Type of analytics query ("absence", "attendance", "performance", "top N")
- number: Numeric value (e.g., "3" in "top 3 teachers")
- metric: What to measure/analyze ("absenteeism", "attendance rate", "performance")

IMPORTANT: Use the conversation context below to resolve references like "him", "her", "that teacher", "the class we discussed", etc.

${conversationContext}

Return ONLY a JSON object in this exact format:
{
  "intent": "INTENT_NAME",
  "entities": {
    "key": "value"
  },
  "confidence": 0.95
}

User Query: "${userQuery}"`;

    try {
      const response = await axios.post<GroqResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userQuery
            }
          ],
          max_tokens: 200,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const content = response.data.choices[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error('Empty response from LLAMA');
      }

      // Parse JSON response with robust handling
      try {
        // Try to extract JSON from response (handle code fences and markdown)
        let jsonContent = content;
        
        // Remove markdown code fences if present
        const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonContent = codeBlockMatch[1];
        }
        
        // Extract complete JSON object with proper brace matching
        const firstBrace = jsonContent.indexOf('{');
        if (firstBrace !== -1) {
          let braceCount = 0;
          let endIndex = firstBrace;
          
          for (let i = firstBrace; i < jsonContent.length; i++) {
            if (jsonContent[i] === '{') braceCount++;
            if (jsonContent[i] === '}') braceCount--;
            if (braceCount === 0) {
              endIndex = i;
              break;
            }
          }
          
          jsonContent = jsonContent.substring(firstBrace, endIndex + 1);
        }
        
        console.log('🔍 Attempting to parse JSON:', jsonContent.trim());
        const parsed = JSON.parse(jsonContent.trim());
        console.log('✅ JSON parsed successfully:', parsed);
        
        // Validate required fields with detailed logging
        if (!parsed.intent) {
          console.log('❌ Missing intent field');
          throw new Error('Missing intent field in LLAMA response');
        }
        if (!parsed.entities) {
          console.log('❌ Missing entities field');
          throw new Error('Missing entities field in LLAMA response');
        }
        if (typeof parsed.confidence !== 'number') {
          console.log('❌ Invalid confidence type:', typeof parsed.confidence, parsed.confidence);
          throw new Error('Invalid confidence type in LLAMA response');
        }
        
        console.log('✅ All validation passed for intent:', parsed.intent);
        return {
          intent: parsed.intent,
          entities: parsed.entities,
          confidence: Math.max(0, Math.min(1, parsed.confidence)) // Clamp between 0-1
        };
      } catch (jsonError) {
        console.log('❌ Failed to parse LLAMA JSON response (first 200 chars):', content.substring(0, 200) + '...');
        console.log('❌ JSON parsing error details:', jsonError instanceof Error ? jsonError.message : String(jsonError));
        
        // Fallback: Return UNKNOWN intent if parsing fails
        return {
          intent: 'UNKNOWN',
          entities: {},
          confidence: 0.0
        };
      }

    } catch (error: any) {
      console.log('❌ LLAMA intent parsing failed:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  /**
   * Classify if user query is conversational or school management task
   */
  async classifyQueryType(userQuery: string): Promise<'conversation' | 'school_management'> {
    if (!this.isConnected) {
      throw new Error('LLAMA is not connected');
    }

    const systemPrompt = `You are a query classifier for a school management system. 

Your task is to determine if the user query is:
1. "conversation" - Casual conversation, general questions, greetings, asking about date/time, weather, how are you, etc.
2. "school_management" - Tasks related to school operations like attendance, timetables, students, teachers, classes, etc.

Examples of CONVERSATION:
- "Hi", "Hello", "How are you?"
- "What's the date today?", "What time is it?"
- "Good morning", "How's your day?"
- "What's the weather like?"
- "Tell me a joke"
- "How are things going?"

Examples of SCHOOL_MANAGEMENT:
- "Mark John absent today"
- "Show me class 8A timetable"
- "Create a new student"
- "Who are the teachers for Math?"
- "Generate attendance report"
- "Change theme to dark", "Switch to light mode"
- "Change to black theme", "Set theme to dark"
- "Open settings", "Show settings"

Respond with ONLY one word: "conversation" or "school_management"

User Query: "${userQuery}"`;

    try {
      const response = await axios.post<GroqResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userQuery
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      let content = response.data.choices[0]?.message?.content?.trim() || '';
      
      // Normalize content: remove quotes, punctuation, and convert to lowercase
      content = content.replace(/['".,!?]/g, '').toLowerCase();
      
      if (content.includes('conversation')) {
        return 'conversation';
      } else if (content.includes('school_management') || content.includes('school management')) {
        return 'school_management';
      } else {
        // More intelligent fallback: default to conversation for better UX
        console.log('⚠️ Unclear classification response:', content, 'defaulting to conversation for better UX');
        return 'conversation';
      }

    } catch (error: any) {
      console.log('❌ LLAMA query classification failed:', error.response?.data?.error || error.message);
      // Fallback: assume school_management if classification fails
      return 'school_management';
    }
  }

  /**
   * Generate natural conversational response for UNKNOWN intents
   */
  async generateConversationalResponse(message: string, userRole: string, schoolId: string, conversationContext?: string): Promise<string> {
    try {
      const currentDateTime = new Date().toISOString();
      const currentDateFormatted = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const currentTimeFormatted = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const systemPrompt = `You are Chroney, a friendly and intelligent AI assistant for school management. You can help with:

🏫 **School Management Tasks:**
- Managing attendance (mark teachers/students present/absent)
- Creating and managing classes 
- Viewing timetables and schedules
- School administration tasks

👋 **Conversational Guidelines:**
- Be warm, helpful, and friendly
- Use natural language like ChatGPT
- Ask follow-up questions when appropriate
- Offer specific examples of what you can help with
- Keep responses concise but personable
- Remember previous conversation context to provide coherent responses
- For date/time questions, use the current information provided below

📅 **Current Date & Time Information:**
- Current date: ${currentDateFormatted}
- Current time: ${currentTimeFormatted}
- ISO timestamp: ${currentDateTime}

Current user role: ${userRole}

${conversationContext || ""}

Respond naturally to: "${message}"`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const content = response.data.choices[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error('Empty response from LLAMA');
      }

      return content;

    } catch (error: any) {
      console.log('❌ LLAMA conversational response failed:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Initialize the service and test connection
   */
  async initialize(): Promise<boolean> {
    if (!this.groqApiKey) {
      console.log('❌ Cannot initialize LLAMA service: GROQ_API_KEY not found');
      return false;
    }

    console.log('🔄 Initializing LLAMA service...');
    return await this.testConnection();
  }
}

// Create singleton instance
export const llamaService = new LlamaService();

// Initialize on module load
llamaService.initialize().catch(error => {
  console.log('❌ Failed to initialize LLAMA service:', error.message);
});

export default llamaService;