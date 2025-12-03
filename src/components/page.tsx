import ChatbotCopilot from "@";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Human Productivity Solution</h1>
        <p className="text-gray-600">Your AI Data Assistant is ready in the bottom-right corner</p>
      </div>

      <ChatbotCopilot
        position="bottom-right"
        apiEndpoint="/api/chat"
      />
    </div>
  );
}
