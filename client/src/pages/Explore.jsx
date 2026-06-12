import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import Resources from "./Resources";
import Questions from "./Questions";
import PostsFeed from "./PostsFeed";
import Opportunities from "./Opportunities";
import LibraryPage from "./Library";
import { BookOpen, MessageSquare, FileText, Target, Library, Compass } from "lucide-react";

export default function Explore() {
    const [activeTab, setActiveTab] = useState("resources");

    return (
        <div className="w-full min-h-screen pb-24 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                
                {/* Sticky Header with Glassmorphism */}
                <div className="sticky top-0 z-40 bg-transparent pb-6 px-4 mb-6 shadow-sm">

                    <TabsList className="w-full grid grid-cols-5 h-[3.5rem] bg-paper-2/50 backdrop-blur-md border border-rule/60 rounded-xl p-1.5 shadow-inner">
                        <TabsTrigger value="resources" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Resources">
                            <BookOpen className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-accent" />
                        </TabsTrigger>
                        <TabsTrigger value="questions" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Questions">
                            <MessageSquare className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-accent" />
                        </TabsTrigger>
                        <TabsTrigger value="posts" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Posts">
                            <FileText className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-accent" />
                        </TabsTrigger>
                        <TabsTrigger value="library" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Library">
                            <Library className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-accent" />
                        </TabsTrigger>
                        <TabsTrigger value="opportunities" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-3/50 active:scale-95 data-[state=active]:bg-paper data-[state=active]:shadow-md data-[state=active]:text-accent z-10" title="Opportunities">
                            <Target className="w-5 h-5 transition-all duration-300 group-data-[state=active]:scale-110 text-ink-3 group-data-[state=active]:text-accent" />
                        </TabsTrigger>
                    </TabsList>

                </div>

                {/* Tab Content Wrappers */}
                <div className="px-2">
                    <TabsContent value="resources" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <Resources />
                    </TabsContent>
                    <TabsContent value="questions" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <Questions />
                    </TabsContent>
                    <TabsContent value="posts" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <PostsFeed />
                    </TabsContent>
                    <TabsContent value="library" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <LibraryPage />
                    </TabsContent>
                    <TabsContent value="opportunities" className="-mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                        <Opportunities />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
