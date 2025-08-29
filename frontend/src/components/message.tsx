"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, User, Bot } from "lucide-react";
import { Message, WorkflowResponse } from "@/lib/api";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  message: Message;
}

export function MessageComponent({ message }: MessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 md:gap-3 p-3 md:p-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar className="h-7 w-7 md:h-8 md:w-8 mt-1 shrink-0">
        <AvatarFallback>
          {isUser ? <User className="h-3 w-3 md:h-4 md:w-4" /> : <Bot className="h-3 w-3 md:h-4 md:w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[85%] md:max-w-[80%] ${isUser ? "flex flex-col items-end" : ""}`}>
        <Card className={`${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          <CardContent className="p-2 md:p-3">
            <div className="text-sm md:text-base leading-relaxed">
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 pl-4">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 pl-4">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
              )}
            </div>

            {/* Workflow Recommendations */}
            {message.workflows && message.workflows.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-sm">Recommended Workflows:</h4>
                {message.workflows.map((workflow, index) => (
                  <WorkflowCard key={index} workflow={workflow} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message actions */}
        <div className="flex items-center gap-1 mt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-xs touch-manipulation"
          >
            <Copy className="h-3 w-3 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: WorkflowResponse }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = workflow.description.length > 150;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-2 md:p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-xs md:text-sm mb-1">{workflow.name}</h5>
            <p className={`text-xs text-muted-foreground ${isExpanded ? '' : 'line-clamp-3 md:line-clamp-2'
              }`}>
              {workflow.description}
            </p>
            {isLongDescription && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-2 mt-1 text-xs text-blue-600 hover:text-blue-800"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0 shrink-0 touch-manipulation"
          >
            <a
              href={workflow.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${workflow.name} workflow`}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}