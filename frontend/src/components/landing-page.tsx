"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Bot,
    Zap,
    Database,
    MessageSquare,
    ArrowRight,
    Sparkles,
    Clock,
    CheckCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ProfileHeader } from "./profile-header";
import FooterSection from "./footer";
import StarCounter from "./star-counter";

interface LandingPageProps {
    onStartChat: () => void;
}

export function LandingPage({ onStartChat }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <StarCounter />
            <ProfileHeader />
            {/* Hero Section */}
            <div className="container mx-auto px-4 pt-8 sm:pt-12 md:pt-16 pb-8">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        AI-Powered n8n Workflow Discovery
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4">
                        Find the Perfect{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            n8n Workflow
                        </span>{" "}
                        in Seconds
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                        Chat with our AI assistant to discover relevant automation workflows from our database of 1,987+ n8n templates. Get instant recommendations with explanations.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
                        <Button
                            onClick={onStartChat}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
                        >
                            Start Chatting
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>

                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            No signup required • Instant access
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-12 sm:mb-16 px-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,987+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">n8n Workflows</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">AI-Powered</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Smart Search</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">Instant</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Recommendations</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Bento Grid Section */}
            <div className="container mx-auto px-4 pb-12 sm:pb-16">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
                        Why Choose Our AI Assistant?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
                        Experience the future of workflow discovery with intelligent search, real-time streaming, and comprehensive recommendations.
                    </p>
                </div>

                <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem] sm:auto-rows-[18rem] auto-rows-[16rem]">
                    <BentoGridItem
                        title="AI-Powered Search"
                        description="Our advanced AI understands your automation needs and finds the most relevant workflows from thousands of options."
                        header={<SkeletonOne />}
                        className="md:col-span-2"
                        icon={<Bot className="h-4 w-4 text-neutral-500" />}
                    />
                    <BentoGridItem
                        title="Real-time Streaming"
                        description="Get responses instantly with ChatGPT-like streaming. Watch as recommendations appear in real-time."
                        header={<SkeletonTwo />}
                        icon={<Zap className="h-4 w-4 text-neutral-500" />}
                    />
                    <BentoGridItem
                        title="Extensive Database"
                        description="Access 1,987+ curated n8n workflows covering every automation scenario you can imagine."
                        header={<SkeletonThree />}
                        icon={<Database className="h-4 w-4 text-neutral-500" />}
                    />
                    <BentoGridItem
                        title="Smart Explanations"
                        description="Each recommendation comes with detailed explanations of why it's perfect for your specific use case."
                        header={<SkeletonFour />}
                        className="md:col-span-2"
                        icon={<MessageSquare className="h-4 w-4 text-neutral-500" />}
                    />
                </BentoGrid>

                {/* CTA Section */}
                <div className="text-center mt-12 sm:mt-16 px-4">
                    <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6 sm:p-8">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                Ready to Find Your Perfect Workflow?
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                                Start chatting with our AI assistant and discover automation workflows tailored to your needs.
                            </p>
                            <Button
                                onClick={onStartChat}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto"
                            >
                                <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-sm sm:text-base">Start Discovering Workflows</span>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <FooterSection />
        </div>
    );
}

// Demo data - moved outside component to prevent recreation
const DEMO_QUERY = "How do I integrate Slack with Google Sheets?";
const DEMO_RESPONSE = "**Slack to Google Sheets Logger**\n- Why: Automatically logs messages to spreadsheet\n\n**Google Sheets Slack Notifier**\n- Why: Sends notifications when data changes";
const DEMO_WORKFLOWS = [
    { name: "Slack to Google Sheets Logger", description: "Automatically capture Slack messages" },
    { name: "Google Sheets Slack Notifier", description: "Send Slack notifications on updates" }
];

// Skeleton components for the bento grid
const SkeletonOne = () => {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [workflows, setWorkflows] = useState<Array<{ name: string, description: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDemo, setIsDemo] = useState(true);

    const runDemo = useCallback(async () => {
        // Reset state
        setQuery("");
        setResponse("");
        setWorkflows([]);
        setIsSearching(false);

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Type query
        setIsSearching(true);
        for (let i = 0; i <= DEMO_QUERY.length; i++) {
            setQuery(DEMO_QUERY.slice(0, i));
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Show workflows first
        setWorkflows(DEMO_WORKFLOWS);
        await new Promise(resolve => setTimeout(resolve, 300));

        // Stream response
        for (let i = 0; i <= DEMO_RESPONSE.length; i++) {
            setResponse(DEMO_RESPONSE.slice(0, i));
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        setIsSearching(false);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }, []);

    useEffect(() => {
        if (!isDemo) return;

        const interval = setInterval(runDemo, 8000);
        runDemo(); // Run immediately

        return () => clearInterval(interval);
    }, [isDemo, runDemo]);

    const handleClick = () => {
        setIsDemo(!isDemo);
    };

    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden p-4">
            <div className="w-full space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSearching ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`}></div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            AI Workflow Search - Live Demo
                        </div>
                    </div>
                    <button
                        onClick={handleClick}
                        className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                    >
                        {isDemo ? "Pause" : "Resume"}
                    </button>
                </div>

                {/* Search Input */}
                <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="text-sm text-neutral-700 dark:text-neutral-300 flex-1">
                            {query || "Ask about n8n workflows..."}
                            {isSearching && query && <span className="animate-pulse">|</span>}
                        </div>
                    </div>
                </div>

                {/* Workflows Results */}
                {workflows.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Found Workflows
                        </div>
                        {workflows.map((workflow) => (
                            <div
                                key={workflow.name}
                                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-2"
                            >
                                <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
                                    {workflow.name}
                                </div>
                                <div className="text-xs text-blue-700 dark:text-blue-300">
                                    {workflow.description}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI Response */}
                {response && (
                    <div className="space-y-1">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            AI Explanation
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md p-2">
                            <div className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                                {response.split('\n').map((line, index) => {
                                    // Handle bold markdown **text**
                                    const parts = line.split(/(\*\*.*?\*\*)/g);
                                    return (
                                        <div key={index}>
                                            {parts.map((part, partIndex) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return (
                                                        <strong key={partIndex} className="font-semibold">
                                                            {part.slice(2, -2)}
                                                        </strong>
                                                    );
                                                }
                                                return part;
                                            })}
                                        </div>
                                    );
                                })}
                                {isSearching && <span className="animate-pulse">|</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${isSearching ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'}`}></div>
                    {isSearching ? "AI Processing..." : "Ready"}
                </div>
            </div>
        </div>
    );
};

const SkeletonTwo = () => {
    const [streamText, setStreamText] = useState("");
    const fullText = "I found several workflows for Slack integration:\n\n1. **Slack Message Logger** - Perfect for archiving\n2. **Automated Notifications** - Real-time alerts";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= fullText.length) {
                setStreamText(fullText.slice(0, index));
                index++;
            } else {
                // Reset after completion
                setTimeout(() => {
                    setStreamText("");
                    index = 0;
                }, 2000);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden p-4">
            <div className="w-full space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Streaming Response...
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 min-h-[80px]">
                    <div className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                        {streamText.split('\n').map((line, index) => {
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                                <div key={index}>
                                    {parts.map((part, partIndex) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return (
                                                <strong key={partIndex} className="font-semibold">
                                                    {part.slice(2, -2)}
                                                </strong>
                                            );
                                        }
                                        return part;
                                    })}
                                </div>
                            );
                        })}
                        <span className="animate-pulse">|</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SkeletonThree = () => {
    const [count, setCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const animateCount = () => {
            setIsAnimating(true);
            setCount(0);

            const duration = 2000; // 2 seconds
            const targetCount = 1987;
            const increment = targetCount / (duration / 50); // Update every 50ms

            let currentCount = 0;
            const timer = setInterval(() => {
                currentCount += increment;
                if (currentCount >= targetCount) {
                    setCount(targetCount);
                    setIsAnimating(false);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(currentCount));
                }
            }, 50);

            return () => clearInterval(timer);
        };

        // Start animation immediately
        animateCount();

        // Repeat animation every 5 seconds
        const interval = setInterval(animateCount, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden">
            {/* n8n Background Image with Animation */}
            <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-5 transition-all duration-2000 ${isAnimating ? 'scale-110 opacity-20 dark:opacity-10' : 'scale-100'
                    }`}
                style={{
                    backgroundImage: 'url(/n8n.png)',
                    filter: 'grayscale(50%) brightness(1.2)'
                }}
            />

            {/* Animated overlay gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-2000 ${isAnimating
                ? 'from-blue-500/20 via-purple-500/10 to-transparent'
                : 'from-transparent via-transparent to-transparent'
                }`} />

            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center text-neutral-600 dark:text-neutral-400">
                    <div
                        className={`transition-transform duration-1000 ${isAnimating ? 'animate-pulse scale-110' : 'scale-100'
                            }`}
                    >
                        <Database className={`h-8 w-8 mx-auto mb-2 transition-all duration-500 ${isAnimating ? 'scale-125 text-blue-500 drop-shadow-lg' : 'scale-100'
                            }`} />
                    </div>

                    <div className={`text-2xl font-bold transition-all duration-300 ${isAnimating ? 'scale-110 text-blue-600 dark:text-blue-400 drop-shadow-md' : 'scale-100'
                        }`}>
                        {count.toLocaleString()}+
                    </div>

                    <div className={`text-sm transition-all duration-300 ${isAnimating ? 'text-blue-500 font-medium' : ''
                        }`}>
                        Workflows
                    </div>

                    {/* Animated background circles */}
                    <div className="absolute inset-0 -z-10">
                        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            w-20 h-20 border-2 border-blue-200 dark:border-blue-800 rounded-full 
                            transition-all duration-2000 ${isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-30'
                            }`}
                        />
                        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            w-16 h-16 border-2 border-purple-200 dark:border-purple-800 rounded-full 
                            transition-all duration-1500 delay-200 ${isAnimating ? 'scale-125 opacity-0' : 'scale-100 opacity-40'
                            }`}
                        />
                        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            w-12 h-12 border border-orange-200 dark:border-orange-800 rounded-full 
                            transition-all duration-1000 delay-400 ${isAnimating ? 'scale-100 opacity-0' : 'scale-100 opacity-50'
                            }`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SkeletonFour = () => {
    const [currentExplanation, setCurrentExplanation] = useState(0);

    const explanations = [
        {
            workflow: "Slack to Google Sheets",
            reason: "Perfect for your team communication tracking needs",
            icon: "💬"
        },
        {
            workflow: "Email to CRM Sync",
            reason: "Automatically captures leads from your inbox",
            icon: "📧"
        },
        {
            workflow: "Social Media Monitor",
            reason: "Tracks mentions across all platforms in real-time",
            icon: "📱"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentExplanation((prev) => (prev + 1) % explanations.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const current = explanations[currentExplanation];

    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden p-4">
            <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Smart Explanations
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                        <div className="text-lg">{current.icon}</div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                                {current.workflow}
                            </div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                                <strong className="text-purple-600 dark:text-purple-400">Why:</strong> {current.reason}
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <div className="text-xs text-green-600 dark:text-green-400">Perfect match</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-1">
                    {explanations.map((_, index) => (
                        <div
                            key={index}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentExplanation
                                ? 'bg-purple-500'
                                : 'bg-neutral-300 dark:bg-neutral-600'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};