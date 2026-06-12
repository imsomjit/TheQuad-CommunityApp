import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  Bookmark,
  BookOpen,
  FileText,
  Target,
  Loader2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { postsApi, booksApi, opportunitiesApi, bookmarksApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

import ResourceCard from "../components/ResourceCard";
import PostCard from "../components/PostCard";
import BookCard from "../components/BookCard";
import OpportunityCard from "../components/OpportunityCard";

export default function Bookmarks() {
  const { username } = useParams();
  const { isAuthenticated } = useAuth();
  const { currentUser, resources, bookmarks } = useApp();

  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const [results, setResults] = useState({
    resources: [],
    posts: [],
    books: [],
    opportunities: [],
  });

  const isOwnProfile = isAuthenticated && currentUser?.username === username;

  useEffect(() => {
    if (!isOwnProfile) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch bookmarked IDs for posts and books
        const [postIds, bookIds] = await Promise.all([
          bookmarksApi.list("blog").catch(() => []),
          bookmarksApi.list("book").catch(() => [])
        ]);

        // Resources use the context 'bookmarks' state, so we filter them
        const savedResources = resources.filter(r => bookmarks.has(`resource:${r.id}`));

        // Fetch actual items
        const [postsData, booksData, oppsData] = await Promise.all([
          Promise.all(postIds.map(id => postsApi.getById(id).catch(() => null))),
          Promise.all(bookIds.map(id => booksApi.get(id).catch(() => null))),
          opportunitiesApi.getBookmarked({ limit: 50 }).then(res => res.data).catch(() => [])
        ]);

        setResults({
          resources: savedResources,
          posts: postsData.filter(Boolean),
          books: booksData.filter(Boolean),
          opportunities: oppsData,
        });
      } catch (err) {
        console.error("Failed to load saved items", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isOwnProfile, resources, bookmarks]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOwnProfile) return <Navigate to={`/u/${username}`} replace />;

  const totalResults =
    results.resources.length +
    results.posts.length +
    results.books.length +
    results.opportunities.length;

  return (
    <div className="w-full min-h-screen pb-24 px-4 sm:px-8 xl:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 pt-8 sm:pt-12 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl mb-4 flex items-center gap-3">
            <Bookmark className="w-8 h-8 sm:w-10 sm:h-10 text-accent drop-shadow-md text-syntax-rose" strokeWidth={2.5} />
            <span className="drop-shadow-sm pb-1">
              My <span className="marker">Bookmarks.</span>
            </span>
          </h1>
          <p className="text-ink-2 text-lg mb-6 max-w-2xl leading-relaxed">
            All your saved resources, posts, books, and opportunities in one place.
          </p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 flex flex-wrap gap-2 bg-transparent w-full justify-start h-auto pb-2">
          <TabsTrigger
            value="all"
            className="group whitespace-nowrap rounded-xl transition-all duration-300 hover:bg-paper-2/80 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm data-[state=active]:text-accent text-ink-2 px-5 py-2.5 font-medium border border-transparent data-[state=active]:border-rule/50"
          >
            All Bookmarks
            <span className="ml-2.5 rounded-full bg-paper-3/50 px-2.5 py-0.5 text-xs font-mono transition-colors group-data-[state=active]:bg-accent/10 group-data-[state=active]:text-accent">{totalResults}</span>
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="group whitespace-nowrap rounded-xl transition-all duration-300 hover:bg-paper-2/80 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm data-[state=active]:text-accent text-ink-2 px-5 py-2.5 font-medium border border-transparent data-[state=active]:border-rule/50"
          >
            <BookOpen className="w-4 h-4 mr-2 inline transition-transform group-data-[state=active]:scale-110" /> Resources
            <span className="ml-2.5 rounded-full bg-paper-3/50 px-2.5 py-0.5 text-xs font-mono transition-colors group-data-[state=active]:bg-accent/10 group-data-[state=active]:text-accent">{results.resources.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="group whitespace-nowrap rounded-xl transition-all duration-300 hover:bg-paper-2/80 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm data-[state=active]:text-accent text-ink-2 px-5 py-2.5 font-medium border border-transparent data-[state=active]:border-rule/50"
          >
            <FileText className="w-4 h-4 mr-2 inline transition-transform group-data-[state=active]:scale-110" /> Posts
            <span className="ml-2.5 rounded-full bg-paper-3/50 px-2.5 py-0.5 text-xs font-mono transition-colors group-data-[state=active]:bg-accent/10 group-data-[state=active]:text-accent">{results.posts.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="books"
            className="group whitespace-nowrap rounded-xl transition-all duration-300 hover:bg-paper-2/80 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm data-[state=active]:text-accent text-ink-2 px-5 py-2.5 font-medium border border-transparent data-[state=active]:border-rule/50"
          >
            <BookOpen className="w-4 h-4 mr-2 inline transition-transform group-data-[state=active]:scale-110" /> Library
            <span className="ml-2.5 rounded-full bg-paper-3/50 px-2.5 py-0.5 text-xs font-mono transition-colors group-data-[state=active]:bg-accent/10 group-data-[state=active]:text-accent">{results.books.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className="group whitespace-nowrap rounded-xl transition-all duration-300 hover:bg-paper-2/80 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm data-[state=active]:text-accent text-ink-2 px-5 py-2.5 font-medium border border-transparent data-[state=active]:border-rule/50"
          >
            <Target className="w-4 h-4 mr-2 inline transition-transform group-data-[state=active]:scale-110" /> Opportunities
            <span className="ml-2.5 rounded-full bg-paper-3/50 px-2.5 py-0.5 text-xs font-mono transition-colors group-data-[state=active]:bg-accent/10 group-data-[state=active]:text-accent">{results.opportunities.length}</span>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : totalResults === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-rule rounded-2xl bg-paper-2/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-paper border border-rule mb-4 shadow-sm">
              <Bookmark className="w-8 h-8 text-ink-3" />
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">No Bookmarks Yet</h3>
            <p className="text-ink-2 max-w-md mx-auto">
              You haven't saved any items yet. Browse around and click the bookmark icon to save items for later.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TabsContent value="all" className="space-y-12 m-0">
              {results.resources.length > 0 && (
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-syntax-amber rounded-full inline-block"></span>
                    Resources
                  </h3>
                  <div className="flex flex-col gap-4">
                    {results.resources.map((res) => (
                      <ResourceCard key={res.id} resource={res} />
                    ))}
                  </div>
                </div>
              )}
              {results.posts.length > 0 && (
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-syntax-violet rounded-full inline-block"></span>
                    Posts
                  </h3>
                   <div className="flex flex-col gap-6">
                    {results.posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
              {results.books.length > 0 && (
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-syntax-mint rounded-full inline-block"></span>
                    Books
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.books.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </div>
              )}
              {results.opportunities.length > 0 && (
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-syntax-lime rounded-full inline-block"></span>
                    Opportunities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.opportunities.map((opp) => (
                      <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="m-0">
              <div className="flex flex-col gap-4">
                {results.resources.map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="m-0">
              <div className="flex flex-col gap-6">
                {results.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="books" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.opportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  );
}
