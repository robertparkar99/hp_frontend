import { useState } from 'react';
import ChatbotCopilot from './ChatbotCopilot';

export default function GlobalFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* Chatbot positioned in bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <ChatbotCopilot
          position="bottom-right"
          apiEndpoint="/api/chat"
        />
      </div>
    </footer>
  );
}