"use client";

import { useState, useRef, useEffect } from "react";
import { ProfileHeader } from "./profile-header";
import { MessageComponent } from "./message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Message, WorkflowResponse, queryWorkflows, streamWorkflows } from "@/lib/api";


interface ChatProps {
  onBackToLanding?: () => void;
}

export function Chat({ onBackToLanding }: ChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev: Message[]) => [...prev, assistantMessage]);

    try {
      let streamedContent = "";
      let workflows: WorkflowResponse[] = [];

      try {
        // Try streaming first
        for await (const chunk of streamWorkflows({ query: content })) {
          if (chunk.type === 'source_documents') {
            workflows = chunk.data as WorkflowResponse[];
          } else if (chunk.type === 'content') {
            streamedContent += chunk.data as string;
            setMessages((prev: Message[]) => prev.map((msg: Message) =>
              msg.id === assistantMessageId
                ? { ...msg, content: streamedContent, workflows }
                : msg
            ));
          } else if (chunk.type === 'done') {
            setMessages((prev: Message[]) => prev.map((msg: Message) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            ));
          }
        }
      } catch (streamError) {
        console.warn("Streaming failed, falling back to regular query:", streamError);

        // Fallback to non-streaming
        const response = await queryWorkflows({ query: content });
        setMessages((prev: Message[]) => prev.map((msg: Message) =>
          msg.id === assistantMessageId
            ? {
              ...msg,
              content: response.result,
              workflows: response.source_documents,
              isStreaming: false
            }
            : msg
        ));
      }
    } catch (error) {
      console.error("Error querying workflows:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      // Remove the failed message
      setMessages((prev: Message[]) => prev.filter((msg: Message) => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    console.log('🔄 Clearing error state...');
    setError(null);
  };

  // Chat interface loads immediately - no blocking health checks

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ProfileHeader />
      {/* Header */}
      <div className="border-b bg-card p-3 md:p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToLanding}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">n8n Workflow Assistant</h1>
              <p className="text-muted-foreground text-xs md:text-sm">
                Ask me about n8n workflows and I&apos;ll help you find relevant automations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 text-center">
              <h2 className="text-lg md:text-xl font-semibold mb-2">Welcome to n8n Workflow Chat!</h2>
              <p className="text-muted-foreground mb-4 text-sm md:text-base max-w-md">
                I can help you discover n8n workflows based on your needs. Try asking something like:
              </p>
              <div className="space-y-2 text-xs md:text-sm text-muted-foreground max-w-lg">
                <p>• &quot;How do I integrate Slack with Google Sheets?&quot;</p>
                <p>• &quot;Show me workflows for social media automation&quot;</p>
                <p>• &quot;I need to process emails automatically&quot;</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message: Message) => (
                <div key={message.id} className="group">
                  <MessageComponent message={message} />
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="border-t bg-destructive/10 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-destructive text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear Error
            </Button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="border-t bg-muted/50 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3 text-muted-foreground text-sm">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Searching through 1,987 n8n workflows and generating AI response...</span>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}