import useDocumentTitle from '../hooks/useDocumentTitle';
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useMediaQuery } from "../hooks/useMediaQuery";
import Resources from "./Resources";
import Questions from "./Questions";
import PostsFeed from "./PostsFeed";
import Opportunities from "./Opportunities";
import LibraryPage from "./Library";
import { BookOpen, MessageSquare, FileText, Target, Library, Compass } from "lucide-react";

export default function Explore() {
  useDocumentTitle("Explore");
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const urlTab = searchParams.get("tab") || "resources";
    const [activeTab, setActiveTab] = useState(urlTab);

    // Sync state to URL
    useEffect(() => {
        if (activeTab !== urlTab) {
            setSearchParams({ tab: activeTab }, { replace: true });
        }
    }, [activeTab, urlTab, setSearchParams]);

    // Desktop redirect
    useEffect(() => {
        if (isDesktop) {
            const routeMap = {
                resources: "/resources",
                questions: "/questions",
                posts: "/posts",
                library: "/library",
                opportunities: "/opportunities"
            };
            navigate(routeMap[activeTab] || "/resources", { replace: true });
        }
    }, [isDesktop, navigate, activeTab]);

    // Return null while redirecting to avoid flashing mobile layout on desktop
    if (isDesktop) return null;

    return (
        <div className="w-full min-h-screen pb-24 px-2 sm:px-6 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                
                {/* Header Section */}
                <div className="pt-5 pb-6">
                    <div className="mb-8 max-w-3xl">
                        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl mb-3 flex items-center gap-3">
                            <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-accent drop-shadow-md" strokeWidth={2.5} />
                            <span className="bg-gradient-to-br from-ink via-ink to-ink-3 bg-clip-text text-transparent drop-shadow-sm pb-1">
                                Explore
                            </span>
                        </h1>

                        <p className="text-ink-2 text-md mb-4 max-w-2xl leading-relaxed">
                            Discover resources, discussions, posts, books and opportunities — all in one place.
                        </p>
                        
                    </div>

                    <TabsList className="w-full grid grid-cols-5 h-[3.5rem] bg-paper-2/50 backdrop-blur-md border border-rule/60 rounded-xl p-1.5 shadow-inner">
                        <TabsTrigger value="resources" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Resources">
                            <BookOpen className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-syntax-rose" />
                        </TabsTrigger>
                        <TabsTrigger value="questions" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Questions">
                            <MessageSquare className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-syntax-cyan" />
                        </TabsTrigger>
                        <TabsTrigger value="posts" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Posts">
                            <FileText className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-syntax-violet" />
                        </TabsTrigger>
                        <TabsTrigger value="library" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Library">
                            <Library className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-syntax-mint" />
                        </TabsTrigger>
                        <TabsTrigger value="opportunities" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Opportunities">
                            <Target className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-syntax-lime" />
                        </TabsTrigger>

                    </TabsList>
                </div>

                {/* Tab Content Wrappers */}
                <div className="mt-8">
                    <TabsContent value="resources" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <Resources inExplore={true} />
                    </TabsContent>
                    <TabsContent value="questions" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <Questions inExplore={true} />
                    </TabsContent>
                    <TabsContent value="posts" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <PostsFeed inExplore={true} />
                    </TabsContent>
                    <TabsContent value="library" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <LibraryPage inExplore={true} />
                    </TabsContent>
                    <TabsContent value="opportunities" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <Opportunities inExplore={true} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
