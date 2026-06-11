import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search as SearchIcon,
  BookOpen,
  MessageSquare,
  FileText,
  Target,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { resourcesApi, questionsApi, postsApi, booksApi, opportunitiesApi } from "../services/api";

import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import PostCard from "../components/PostCard";
import BookCard from "../components/BookCard";
import EmptyPlaceholder from "../components/EmptyPlaceholder";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const [results, setResults] = useState({
    resources: [],
    questions: [],
    posts: [],
    books: [],
    opportunities: [],
  });

  useEffect(() => {
    if (!query) {
      setResults({
        resources: [],
        questions: [],
        posts: [],
        books: [],
        opportunities: [],
      });
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [resRes, qRes, pRes, bRes, oRes] = await Promise.all([
          resourcesApi.list({ q: query, limit: 10 }).catch(() => ({ data: [] })),
          questionsApi.list({ q: query, limit: 8 }).catch(() => ({ data: [] })),
          postsApi.list({ search: query, limit: 4 }).catch(() => ({ data: [] })),
          booksApi.list({ q: query, limit: 4 }).catch(() => ({ data: [] })),
          opportunitiesApi.list({ search: query, limit: 4 }).catch(() => ({ data: [] })),
        ]);

        setResults({
          resources: resRes.data || [],
          questions: qRes.data || [],
          posts: pRes.data || [],
          books: bRes.data || (bRes.books ? bRes.books : []), // booksApi might return raw array or object
          opportunities: oRes.data || [],
        });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [query]);

  // Fix books response structure if needed
  const booksData = Array.isArray(results.books) ? results.books : (results.books?.data || []);

  const totalResults =
    results.resources.length +
    results.questions.length +
    results.posts.length +
    booksData.length +
    results.opportunities.length;

  return (
    <div className="w-full min-h-screen pb-24 px-4 sm:px-8 xl:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 pt-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Search Results
        </h1>
        <p className="mt-2 text-ink-2 flex items-center gap-2">
          <SearchIcon className="h-4 w-4" />
          {query ? (
            <>
              Showing results for <span className="font-semibold text-ink">"{query}"</span>
            </>
          ) : (
            "Enter a search query to explore the platform."
          )}
        </p>
      </header>

      {query && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 flex flex-wrap gap-2 bg-transparent border-b border-rule pb-px h-auto rounded-none w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="all"
              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-ink text-ink-3 px-4 py-2"
            >
              All Results
              <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-mono">{totalResults}</span>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-ink text-ink-3 px-4 py-2"
            >
              <BookOpen className="w-4 h-4 mr-2 inline" /> Resources
              <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-mono">{results.resources.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-ink text-ink-3 px-4 py-2"
            >
              <MessageSquare className="w-4 h-4 mr-2 inline" /> Questions
              <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-mono">{results.questions.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-ink text-ink-3 px-4 py-2"
            >
              <FileText className="w-4 h-4 mr-2 inline" /> Posts
              <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-mono">{results.posts.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="books"
              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-ink text-ink-3 px-4 py-2"
            >
              <BookOpen className="w-4 h-4 mr-2 inline" /> Library
              <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-mono">{booksData.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="opportunities"
              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-ink text-ink-3 px-4 py-2"
            >
              <Target className="w-4 h-4 mr-2 inline" /> Opportunities
              <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-mono">{results.opportunities.length}</span>
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : totalResults === 0 ? (
            <EmptyPlaceholder
              icon={SearchIcon}
              title="No results found"
              description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
            />
          ) : (
            <>
              <TabsContent value="all" className="space-y-16">
                {results.resources.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-syntax-mint" />
                        Resources
                      </h2>
                      <Link to={`/resources?q=${query}`} className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {results.resources.slice(0, 4).map(res => (
                        <ResourceCard key={res.id} resource={res} />
                      ))}
                    </div>
                  </section>
                )}

                {results.questions.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-syntax-cyan" />
                        Questions
                      </h2>
                      <Link to={`/questions?q=${query}`} className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {results.questions.slice(0, 4).map(q => (
                        <QuestionCard key={q.id} question={q} />
                      ))}
                    </div>
                  </section>
                )}

                {results.posts.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-syntax-amber" />
                        Posts
                      </h2>
                      <Link to={`/posts?q=${query}`} className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex flex-col gap-6">
                      {results.posts.slice(0, 2).map(post => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                )}

                {booksData.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-syntax-purple" />
                        Library
                      </h2>
                      <Link to={`/library?q=${query}`} className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {booksData.slice(0, 4).map(book => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  </section>
                )}

                {results.opportunities.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                        <Target className="w-5 h-5 text-syntax-rose" />
                        Opportunities
                      </h2>
                      <Link to={`/opportunities?q=${query}`} className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    {/* Placeholder for opportunities, or we can just render simple cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.opportunities.slice(0, 4).map(opp => (
                        <div key={opp.id} className="p-4 border border-rule rounded-md bg-paper">
                          <h3 className="font-bold text-lg">{opp.title}</h3>
                          <p className="text-sm text-ink-2">{opp.organizer}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              {/* Individual Tabs */}
              <TabsContent value="resources" className="space-y-4">
                {results.resources.length > 0 ? (
                  results.resources.map(res => <ResourceCard key={res.id} resource={res} />)
                ) : (
                  <div className="col-span-full"><EmptyPlaceholder icon={BookOpen} title="No resources found" /></div>
                )}
              </TabsContent>

              <TabsContent value="questions" className="grid grid-cols-1 gap-4">
                {results.questions.length > 0 ? (
                  results.questions.map(q => <QuestionCard key={q.id} question={q} />)
                ) : (
                  <div className="col-span-full"><EmptyPlaceholder icon={MessageSquare} title="No questions found" /></div>
                )}
              </TabsContent>

              <TabsContent value="posts" className="flex flex-col gap-6">
                {results.posts.length > 0 ? (
                  results.posts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                  <div className="col-span-full"><EmptyPlaceholder icon={FileText} title="No posts found" /></div>
                )}
              </TabsContent>

              <TabsContent value="books" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {booksData.length > 0 ? (
                  booksData.map(book => <BookCard key={book.id} book={book} />)
                ) : (
                  <div className="col-span-full"><EmptyPlaceholder icon={BookOpen} title="No books found" /></div>
                )}
              </TabsContent>

              <TabsContent value="opportunities" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.opportunities.length > 0 ? (
                  results.opportunities.map(opp => (
                    <div key={opp.id} className="p-4 border border-rule rounded-md bg-paper">
                      <h3 className="font-bold text-lg">{opp.title}</h3>
                      <p className="text-sm text-ink-2">{opp.organizer}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full"><EmptyPlaceholder icon={Target} title="No opportunities found" /></div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      )}
    </div>
  );
}
