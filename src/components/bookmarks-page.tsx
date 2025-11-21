import { useState, useEffect } from "react";
import { PostCard } from "./post-card";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Bookmark } from "lucide-react";
import { getBookmarks, type Post, type User } from "../utils/api";
import { toast } from "sonner";

interface BookmarksPageProps {
  currentUser: User | null;
  onAuthClick: (mode: 'login' | 'register') => void;
}

export function BookmarksPage({ currentUser, onAuthClick }: BookmarksPageProps) {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [currentUser]);

  const loadBookmarks = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { posts } = await getBookmarks();
      setBookmarkedPosts(posts);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDeleted = () => {
    loadBookmarks();
  };

  if (!currentUser) {
    return (
      <div className="w-full">
        <div className="border-b bg-muted/50">
          <div className="container py-8 px-4">
            <h1 className="mb-2">My Bookmarks</h1>
            <p className="text-muted-foreground">
              Save and organize explanations for later reference
            </p>
          </div>
        </div>
        <div className="container py-8 px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">Sign in to view bookmarks</h3>
              <p className="text-muted-foreground mb-4">
                Create an account or sign in to start saving explanations
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => onAuthClick('login')}>Sign In</Button>
                <Button variant="outline" onClick={() => onAuthClick('register')}>
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container py-8 px-4">
          <h1 className="mb-2">My Bookmarks</h1>
          <p className="text-muted-foreground">
            Save and organize explanations for later reference
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
        ) : bookmarkedPosts.length > 0 ? (
          <div className="space-y-4">
            {bookmarkedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onAuthClick={onAuthClick}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No bookmarks yet</h3>
              <p className="text-muted-foreground mb-4">
                Start bookmarking explanations to save them for later
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}