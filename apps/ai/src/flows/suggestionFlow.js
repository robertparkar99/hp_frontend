import { genkit } from 'genkit';
import { googleAIPlugin } from '../genkit.config.js';

// Initialize genkit
const gk = genkit({
  plugins: [googleAIPlugin]
});

// Define input schema for suggestions
const SuggestionInputSchema = {
  type: 'object',
  properties: {
    module: { type: 'string', description: 'The LMS module (course, assessment, learning, question-bank)' },
    context: { type: 'string', description: 'Additional context about the current page' }
  },
  required: ['module']
};

// Define output schema for suggestions
const SuggestionOutputSchema = {
  type: 'object',
  properties: {
    suggestions: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Array of suggested questions'
    },
    module: { type: 'string', description: 'The module that suggestions were generated for' }
  }
};

// Create the suggestion generation flow
export const suggestionFlow = gk.defineFlow(
  {
    name: 'suggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: SuggestionOutputSchema
  },
  async (input) => {
    const { module, context } = input;
    
    // Map LMS modules to descriptive names
    const moduleNames = {
      'course': 'Course Management - for administrators and instructors to create and manage courses',
      'assessment': 'Assessment - for creating and managing quizzes and exams',
      'learning': 'My Learning - for employees to view and complete their assigned courses',
      'question-bank': 'Question Bank - for managing question repositories'
    };
    
    const moduleName = moduleNames[module] || 'LMS';
    
    const prompt = `You are an AI assistant for a Learning Management System (LMS).
The user is currently on the ${moduleName} page.

Generate 3-4 highly relevant, practical questions that users typically ask on this page.
These questions should help users accomplish common tasks and answer frequent queries.

Requirements:
- Questions should be practical and action-oriented
- Include a mix of informational and task-focused questions
- Keep questions concise (under 60 characters if possible)
- Questions should be specific to this LMS module
- Format your response as a JSON array of 4 strings ONLY
- Do NOT include any other text, explanations, or markdown

Example for Course page:
["How do I create a new course?","What are the best practices for course design?","How can I track employee progress?","How do I add assessments to a course?"]`;

    const llmResponse = await gk.generate({
      prompt: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });
    
    // Parse the response
    const text = llmResponse.text();
    
    // Try to extract JSON array from the response
    try {
      // Look for JSON array in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          return {
            suggestions: suggestions.slice(0, 4),
            module
          };
        }
      }
    } catch (parseError) {
      console.error('Error parsing Genkit response:', parseError);
    }
    
    // Fallback to default suggestions if parsing fails
    const fallbackSuggestions = {
      'course': ["How do I create a new course?", "What are the best practices for course design?", "How can I track employee progress?", "How do I add assessments to a course?"],
      'assessment': ["How do I create an assessment?", "What question types are available?", "How do I set assessment deadlines?", "How can I view assessment results?"],
      'learning': ["How do I enroll in a course?", "What courses are available for me?", "How do I track my learning progress?", "How do I complete a course?"],
      'question-bank': ["How do I add questions to the bank?", "How do I organize questions by category?", "Can I import questions from other sources?", "How do I edit existing questions?"]
    };
    
    return {
      suggestions: fallbackSuggestions[module] || [],
      module
    };
  }
);

export default gk;
