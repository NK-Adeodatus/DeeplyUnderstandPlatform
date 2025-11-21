import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Users, Award, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getContributors, followUser, type Contributor, type User } from "../utils/api";
import { toast } from "sonner";

interface ContributorsPageProps {
  currentUser: User | null;
  onAuthClick: (mode: 'login' | 'register') => void;
}

function ContributorCard({ contributor, currentUser, onAuthClick }: { contributor: Contributor; currentUser: User | null; onAuthClick: (mode: 'login' | 'register') => void }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFollow = async () => {
    if (!currentUser) {
      onAuthClick('login');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await followUser(contributor.id);
      setIsFollowing(result.isFollowing);
      toast.success(result.isFollowing ? `Following ${contributor.name}` : `Unfollowed ${contributor.name}`);
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsProcessing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={contributor.avatar} />
            <AvatarFallback>{getInitials(contributor.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="mb-1">{contributor.name}</CardTitle>
            <CardDescription>{contributor.country}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Posts</p>
            <p>{contributor.posts}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Upvotes</p>
            <p>{contributor.totalUpvotes}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => toast.info('Profile view coming soon!')}
          >
            View Profile
          </Button>
          <Button 
            className="flex-1"
            onClick={handleFollow}
            disabled={isProcessing || !currentUser || contributor.id === currentUser?.id}
            variant={isFollowing ? 'outline' : 'default'}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ContributorsPage({ currentUser, onAuthClick }: ContributorsPageProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContributors();
  }, []);

  const loadContributors = async () => {
    setIsLoading(true);
    try {
      const { contributors: fetchedContributors } = await getContributors();
      setContributors(fetchedContributors);
    } catch (error) {
      console.error('Failed to load contributors:', error);
      toast.error('Failed to load contributors');
    } finally {
      setIsLoading(false);
    }
  };

  const totalContributors = contributors.length;
  const topContributors = contributors.filter(c => c.posts >= 3).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container py-8 px-4">
          <h1 className="mb-2">Contributors</h1>
          <p className="text-muted-foreground">
            Meet the developers sharing their knowledge with the community
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="border-b bg-background">
        <div className="container py-6 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contributors</p>
                    <p>{totalContributors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Contributors</p>
                    <p>{contributors.filter(c => c.posts > 0).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Top Contributors</p>
                    <p>{topContributors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contributors List */}
      <div className="container py-8 px-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-16 w-16 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : contributors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No contributors yet. Be the first to contribute!
          </div>
        ) : (
          <Tabs defaultValue="top" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="top">Top Contributors</TabsTrigger>
              <TabsTrigger value="active">Most Active</TabsTrigger>
            </TabsList>

            <TabsContent value="top" className="space-y-4">
              {contributors.map((contributor) => (
                <ContributorCard 
                  key={contributor.id} 
                  contributor={contributor} 
                  currentUser={currentUser}
                  onAuthClick={onAuthClick}
                />
              ))}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {[...contributors]
                .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
                .map((contributor) => (
                  <ContributorCard 
                    key={contributor.id} 
                    contributor={contributor} 
                    currentUser={currentUser}
                    onAuthClick={onAuthClick}
                  />
                ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}