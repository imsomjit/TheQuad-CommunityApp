import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search as SearchIcon,
  BookOpen,
  MessageSquare,
  FileText,
  Target,
  ArrowRight,
  Loader2,
  TrendingUp,
  Code,
  Palette,
  BrainCircuit,
  Zap
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { resourcesApi, questionsApi, postsApi, booksApi, opportunitiesApi } from "../services/api";

import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import PostCard from "../components/PostCard";
import BookCard from "../components/BookCard";
import OpportunityCard from "../components/OpportunityCard";
import EmptyPlaceholder from "../components/EmptyPlaceholder";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

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
          postsApi.list({ q: query, limit: 4 }).catch(() => ({ data: [] })),
          booksApi.list({ search: query, limit: 4 }).catch(() => ({ data: [] })),
          opportunitiesApi.list({ q: query, limit: 4 }).catch(() => ({ data: [] })),
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
    <div className="w-full min-h-screen pb-24 px-2 sm:px-8 xl:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 pt-2 sm:pt-12 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl mb-4 flex items-center gap-3">
            <SearchIcon className="w-8 h-8 sm:w-10 sm:h-10 text-accent drop-shadow-md" strokeWidth={2.5} />
            <span className="bg-gradient-to-br from-ink via-ink to-ink-3 bg-clip-text text-transparent drop-shadow-sm pb-1">
              Search
            </span>
          </h1>
          <p className="text-ink-2 text-lg mb-10 max-w-2xl leading-relaxed">
            Discover resources, community questions, books, and exciting new opportunities.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative w-full mb-6 group">
            {/* Animated Glow Behind Search Bar */}
            <div className="absolute -inset-1 bg-gradient-to-r from-accent via-syntax-purple to-syntax-cyan rounded-3xl blur-md opacity-20 group-hover:opacity-40 group-focus-within:opacity-60 transition duration-500"></div>
            
            <div className="relative bg-paper/80 backdrop-blur-xl border-2 border-rule hover:border-rule-2 focus-within:border-accent rounded-2xl shadow-sm hover:shadow-lg focus-within:shadow-lg transition-all duration-300 flex items-center">
              <div className="pl-5 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-ink-3 group-focus-within:text-accent transition-colors duration-300" />
              </div>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="What are you looking for?"
                className="block w-full pl-4 pr-16 py-4 bg-transparent text-ink focus:ring-0 focus:outline-none transition-all duration-300 placeholder:text-ink-3 text-lg"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button 
                  type="submit" 
                  className="p-2.5 bg-accent text-paper hover:bg-accent/90 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
                  title="Search"
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>

          {/* Quick suggestions when empty, otherwise showing results status */}
          <div className="h-auto min-h-[2rem]">
            {query ? (
              <p className="text-ink-2 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-1 duration-300">
                Showing results for <span className="font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">"{query}"</span>
              </p>
            ) : (
              <div className="animate-in fade-in duration-500 pb-4">
                <p className="text-ink-3 text-sm font-medium mb-3">Trending now:</p>
                <div className="flex flex-wrap gap-2 mb-10">
                  {["React", "Machine Learning", "Hackathon", "Data Structures", "Next.js"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchInput(term);
                        setSearchParams({ q: term });
                      }}
                      className="px-4 py-1.5 text-xs sm:text-sm font-medium bg-paper-2 hover:bg-paper-3 text-ink-2 hover:text-ink rounded-full border border-rule transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow flex items-center gap-1.5 group/btn"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-accent/70 group-hover/btn:text-accent transition-colors" />
                      {term}
                    </button>
                  ))}
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-bold text-ink mb-5">Browse Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                   {[
                     { name: "Development", icon: Code, color: "text-syntax-cyan", bg: "bg-syntax-cyan/10", query: "development" },
                     { name: "Design", icon: Palette, color: "text-syntax-rose", bg: "bg-syntax-rose/10", query: "design" },
                     { name: "AI & ML", icon: BrainCircuit, color: "text-syntax-purple", bg: "bg-syntax-purple/10", query: "machine learning" },
                     { name: "Productivity", icon: Zap, color: "text-syntax-amber", bg: "bg-syntax-amber/10", query: "productivity" },
                   ].map((cat) => (
                     <button
                       key={cat.name}
                       onClick={() => {
                         setSearchInput(cat.query);
                         setSearchParams({ q: cat.query });
                       }}
                       className="flex flex-col items-start p-4 sm:p-5 rounded-2xl border border-rule bg-paper hover:bg-paper-2 hover:border-accent/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg text-left"
                     >
                       <div className={`p-3 rounded-xl ${cat.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                         <cat.icon className={`w-6 h-6 ${cat.color}`} />
                       </div>
                       <span className="font-semibold text-ink group-hover:text-accent transition-colors">{cat.name}</span>
                       <span className="text-xs text-ink-3 mt-1 font-medium">Explore resources &rarr;</span>
                     </button>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {query && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 flex flex-wrap gap-2 bg-transparent w-full justify-start h-auto pb-2">
            <TabsTrigger
              value="all"
              className="group whitespace-nowrap rounded-xl transition-all duration-300 hover:bg-paper-2/80 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm data-[state=active]:text-accent text-ink-2 px-5 py-2.5 font-medium border border-transparent data-[state=active]:border-rule/50"
            >
              All Results
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
              value="questions"
              className="group whitespace-nowrap rounded-xl transition-all duration-300 hover:bg-paper-2/80 active:scale-95 data-[state=active]:bg-paper-2 data-[state=active]:shadow-sm data-[state=active]:text-accent text-ink-2 px-5 py-2.5 font-medium border border-transparent data-[state=active]:border-rule/50"
            >
              <MessageSquare className="w-4 h-4 mr-2 inline transition-transform group-data-[state=active]:scale-110" /> Questions
              <span className="ml-2.5 rounded-full bg-paper-3/50 px-2.5 py-0.5 text-xs font-mono transition-colors group-data-[state=active]:bg-accent/10 group-data-[state=active]:text-accent">{results.questions.length}</span>
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
              <span className="ml-2.5 rounded-full bg-paper-3/50 px-2.5 py-0.5 text-xs font-mono transition-colors group-data-[state=active]:bg-accent/10 group-data-[state=active]:text-accent">{booksData.length}</span>
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
                        <OpportunityCard key={opp.id} opportunity={opp} />
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
                    <OpportunityCard key={opp.id} opportunity={opp} />
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
