import { useState, useEffect } from "react";
import { PostCard } from "./post-card";
import { searchPosts, type Post, type User } from "../utils/api";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface SearchResultsPageProps {
  searchQuery: string;
  currentUser: User | null;
  onAuthClick: (mode: 'login' | 'register') => void;
}

export function SearchResultsPage({ searchQuery, currentUser, onAuthClick }: SearchResultsPageProps) {
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (searchQuery) {
      loadResults();
    }
  }, [searchQuery]);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const { posts } = await searchPosts(searchQuery);
      setResults(posts);
    } catch (error) {
      console.error('Failed to search posts:', error);
      toast.error('Failed to search posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDeleted = () => {
    loadResults();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container py-8 px-4">
          <h1 className="mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            Showing results for "{searchQuery}"
          </p>
        </div>
      </div>

      <div className="container py-8 px-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try different keywords or browse our categories
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {results.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onAuthClick={onAuthClick}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
