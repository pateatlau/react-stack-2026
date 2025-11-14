import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@react-stack/shared-ui';
import { Sparkles, MessageSquare, Brain, Zap, Database, Clock } from 'lucide-react';

const ChatInterface: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Coming Soon Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-3xl font-bold">AI Chatbot</h1>
              <Badge variant="warning" className="bg-yellow-400 text-yellow-900">
                Coming Soon
              </Badge>
            </div>
            <p className="text-blue-100 text-lg">
              Your intelligent assistant for managing todos and more
            </p>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Natural Language Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Interact with your todos using natural language. Just ask to create, update, or search
              tasks.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Context-Aware Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              The chatbot understands context and maintains conversation history for intelligent
              assistance.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Zap className="w-5 h-5 mr-2 text-yellow-600" />
              Real-time Streaming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Experience real-time streaming responses powered by WebSocket connections.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Database className="w-5 h-5 mr-2 text-green-600" />
              RAG-Enhanced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Retrieval-Augmented Generation provides accurate responses based on your data.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mock Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 opacity-60">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-md">
                <p className="text-sm">Show me my high priority tasks</p>
              </div>
            </div>

            {/* Bot response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-md">
                <p className="text-sm text-gray-800">
                  I found 3 high priority tasks for you:
                  <br />
                  <br />
                  1. Complete project proposal
                  <br />
                  2. Review team feedback
                  <br />
                  3. Prepare presentation slides
                  <br />
                  <br />
                  Would you like me to show more details about any of these?
                </p>
              </div>
            </div>

            {/* Disabled input */}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <input
                type="text"
                placeholder="Type your message... (Coming Soon)"
                disabled
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 bg-gray-50 cursor-not-allowed"
              />
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Implementation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
              <div>
                <p className="font-medium text-gray-900">Phase 4 (Weeks 7-8)</p>
                <p className="text-sm text-gray-600">
                  AI Microservice setup with OpenAI/Claude integration
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
              <div>
                <p className="font-medium text-gray-900">Phase 5 (Weeks 9-10)</p>
                <p className="text-sm text-gray-600">
                  Vector database, RAG implementation, and chatbot frontend
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">
              <strong>Tech Stack:</strong> AI Microservice (Node.js/Python), OpenAI/Claude API,
              Pinecone/Weaviate Vector DB, WebSocket Streaming, Redis Caching
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
