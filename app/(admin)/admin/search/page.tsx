'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, BookOpen, FileText, ClipboardList, HelpCircle, Video, FolderOpen, Users, Loader2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { searchService } from '@/services/searchService';
import type { SearchResults } from '@/services/searchService';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams?.get('q') || '';
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const data = await searchService.globalSearch(searchQuery);
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results 
    ? Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && query && (
        <>
          <div className="mb-6">
            <p className="text-muted">
              {totalResults > 0 
                ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`
              }
            </p>
          </div>

          {results && totalResults > 0 && (
            <div className="space-y-8">
              {/* Courses */}
              {results.courses && results.courses.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Courses ({results.courses.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.courses.map((course: any) => (
                      <Link key={course.id} href={`/admin/courses/${course.id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <CardContent className="p-4">
                            {course.thumbnail_url && (
                              <img 
                                src={course.thumbnail_url} 
                                alt={course.title}
                                className="w-full h-40 object-cover rounded-lg mb-3"
                              />
                            )}
                            <h3 className="font-semibold text-foreground mb-2">{course.title}</h3>
                            <p className="text-sm text-muted line-clamp-2 mb-2">{course.description}</p>
                            <div className="flex items-center gap-2">
                              {course.category_name && (
                                <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                                  {course.category_name}
                                </span>
                              )}
                              <span className={`inline-block px-2 py-1 text-xs rounded ${
                                course.status === 'published' ? 'bg-green-500/10 text-green-500' :
                                course.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-gray-500/10 text-gray-500'
                              }`}>
                                {course.status}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Users */}
              {results.users && results.users.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Users ({results.users.length})
                  </h2>
                  <div className="space-y-3">
                    {results.users.map((user: any) => (
                      <Link key={user.id} href={`/admin/instructors/${user.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">{user.name}</h3>
                                <p className="text-sm text-muted">{user.email}</p>
                              </div>
                              <span className={`px-3 py-1 text-xs rounded-full ${
                                user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                                user.role === 'instructor' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-green-500/10 text-green-500'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Lessons */}
              {results.lessons && results.lessons.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Lessons ({results.lessons.length})
                  </h2>
                  <div className="space-y-3">
                    {results.lessons.map((lesson: any) => (
                      <Link key={lesson.id} href={`/admin/courses/${lesson.course_id}/lessons`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">{lesson.title}</h3>
                            <p className="text-sm text-muted mb-2">{lesson.description}</p>
                            <p className="text-xs text-muted">
                              Course: {lesson.course_title} • Section: {lesson.section_title}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Assignments */}
              {results.assignments && results.assignments.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Assignments ({results.assignments.length})
                  </h2>
                  <div className="space-y-3">
                    {results.assignments.map((assignment: any) => (
                      <Link key={assignment.id} href={`/admin/assignments`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">{assignment.title}</h3>
                            <p className="text-sm text-muted mb-2">{assignment.description}</p>
                            <p className="text-xs text-muted">
                              Course: {assignment.course_title}
                              {assignment.due_date && ` • Due: ${new Date(assignment.due_date).toLocaleDateString()}`}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Quizzes */}
              {results.quizzes && results.quizzes.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Quizzes ({results.quizzes.length})
                  </h2>
                  <div className="space-y-3">
                    {results.quizzes.map((quiz: any) => (
                      <Link key={quiz.id} href={`/admin/courses/${quiz.course_id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">{quiz.title}</h3>
                            <p className="text-sm text-muted mb-2">{quiz.description}</p>
                            <p className="text-xs text-muted">
                              Course: {quiz.course_title}
                              {quiz.time_limit && ` • Time: ${quiz.time_limit} min`}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Live Classes */}
              {results.liveClasses && results.liveClasses.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Live Classes ({results.liveClasses.length})
                  </h2>
                  <div className="space-y-3">
                    {results.liveClasses.map((liveClass: any) => (
                      <Link key={liveClass.id} href={`/admin/live-class-management`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">{liveClass.title}</h3>
                            <p className="text-sm text-muted mb-2">{liveClass.description}</p>
                            <p className="text-xs text-muted">
                              Course: {liveClass.course_title}
                              {liveClass.scheduled_at && ` • ${new Date(liveClass.scheduled_at).toLocaleString()}`}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Categories */}
              {results.categories && results.categories.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    Categories ({results.categories.length})
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {results.categories.map((category: any) => (
                      <Link key={category.id} href={`/admin/categories`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-muted">{category.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {!loading && !query && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-muted mx-auto mb-4" />
          <p className="text-muted">Enter a search term to find courses, users, lessons, and more</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
