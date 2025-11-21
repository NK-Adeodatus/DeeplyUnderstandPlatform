import { useState, useEffect } from "react";
import { PostCard } from "./post-card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { getPosts, type Post, type User } from "../utils/api";
import { toast } from "sonner";

interface ExplorePageProps {
  currentUser: User | null;
  onAuthClick: (mode: 'login' | 'register') => void;
  initialCategory?: string;
}

const categories = [
  "All Topics",
  "Web Development",
  "Programming Languages",
  "Databases",
  "Frameworks & Libraries",
  "DevOps & Infrastructure",
  "Security",
  "Data Structures & Algorithms",
];

export function ExplorePage({ currentUser, onAuthClick, initialCategory }: ExplorePageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "All Topics");
  const [sortBy, setSortBy] = useState<string>("recent");

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, sortBy]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const category = selectedCategory === "All Topics" ? undefined : selectedCategory;
      const { posts: fetchedPosts } = await getPosts(sortBy, category);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDeleted = () => {
    loadPosts();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container py-8 px-4">
          <h1 className="mb-2">Explore</h1>
          <p className="text-muted-foreground">
            Discover in-depth explanations across all technology topics
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-background">
        <div className="container py-4 px-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm text-muted-foreground">Filter by:</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="container py-4 px-4">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `Showing ${posts.length} explanation${posts.length !== 1 ? 's' : ''}`}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="upvotes">Most Upvoted</SelectItem>
              <SelectItem value="comments">Most Discussed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts */}
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
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No posts found for this category. Try a different filter!
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}