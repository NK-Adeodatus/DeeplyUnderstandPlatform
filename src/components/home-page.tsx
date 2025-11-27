import { useState, useEffect } from "react";
import { PostCard } from "./post-card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PlusCircle, TrendingUp, Clock, Star } from "lucide-react";
import { getPosts, type Post, type User } from "../utils/api";
import { toast } from "sonner";

interface HomePageProps {
  onAuthClick: (mode: 'login' | 'register') => void;
  currentUser: User | null;
  onNavigate: (page: 'home' | 'explore' | 'create-post' | 'contributors' | 'bookmarks' | 'settings') => void;
}

export function HomePage({ onAuthClick, currentUser, onNavigate }: HomePageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState<'recent' | 'upvotes' | 'comments'>('recent');

  useEffect(() => {
    loadPosts(currentSort);
  }, [currentSort]);

  const loadPosts = async (sort: string) => {
    setIsLoading(true);
    try {
      const { posts: fetchedPosts } = await getPosts(sort);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDeleted = () => {
    loadPosts(currentSort);
  };

  const renderPosts = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No posts yet. Be the first to share your knowledge!</p>
          {currentUser && (
            <Button onClick={() => onNavigate('create-post')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Post
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={currentUser} 
            onAuthClick={onAuthClick}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="border-b bg-muted/50">
        <div className="container py-12 px-4">
          <div className="max-w-3xl">
            <h1 className="mb-4">Learn How Technology Really Works</h1>
            <p className="text-muted-foreground mb-6">
              Join African developers in deep-diving into the inner workings of technologies, 
              libraries, and programming concepts. Move beyond tutorials to true understanding.
            </p>
            <div className="flex gap-3">
              {currentUser ? (
                <Button size="lg" onClick={() => onNavigate('create-post')}>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Share Your Knowledge
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => onAuthClick('register')}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Share Your Knowledge
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => onAuthClick('login')}>
                    Join the Community
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 px-4">
        <Tabs 
          defaultValue="recent" 
          className="w-full"
          onValueChange={(value: 'recent' | 'upvotes' | 'comments') => setCurrentSort(value)}
        >
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="upvotes" className="gap-2">
                <Star className="h-4 w-4" />
                Top Rated
              </TabsTrigger>
              <TabsTrigger value="comments" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Most Discussed
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="recent">
            {renderPosts()}
          </TabsContent>

          <TabsContent value="upvotes">
            {renderPosts()}
          </TabsContent>

          <TabsContent value="comments">
            {renderPosts()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}