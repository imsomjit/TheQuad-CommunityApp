import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import Resources from "./Resources";
import Questions from "./Questions";
import PostsFeed from "./PostsFeed";
import Opportunities from "./Opportunities";
import { BookOpen, MessageSquare, FileText, Target } from "lucide-react";

export default function Explore() {
    return (
        <div className="w-full h-full min-h-screen pb-24 px-4 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <Tabs defaultValue="resources" className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-14 mb-12 bg-transparent border border-paper-2 rounded-2xl p-1 shadow-sm">
                    <TabsTrigger value="resources" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-2/50 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm">
                        <BookOpen className="w-5 h-5 mb-0.5 transition-all duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:text-accent text-ink-3" />
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-2/50 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm">
                        <MessageSquare className="w-5 h-5 mb-0.5 transition-all duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:text-accent text-ink-3" />
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-2/50 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm">
                        <FileText className="w-5 h-5 mb-0.5 transition-all duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:text-accent text-ink-3" />
                    </TabsTrigger>
                    <TabsTrigger value="opportunities" className="group h-full rounded-xl transition-all duration-300 hover:bg-paper-2/50 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm">
                        <Target className="w-5 h-5 mb-0.5 transition-all duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:text-accent text-ink-3" />
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="resources" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                    <Resources />
                </TabsContent>
                <TabsContent value="questions" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                    <Questions />
                </TabsContent>
                <TabsContent value="posts" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                    <PostsFeed />
                </TabsContent>
                <TabsContent value="opportunities" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 zoom-in-[0.98] duration-500 ease-out">
                    <Opportunities />
                </TabsContent>
            </Tabs>
        </div>
    );
}
