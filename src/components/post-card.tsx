import { ArrowBigUp, MessageSquare, Bookmark, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";
import { upvotePost, bookmarkPost, deletePost, type Post, type User } from "../utils/api";
import { toast } from "sonner";
import { CommentDialog } from "./comment-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onAuthClick: (mode: 'login' | 'register') => void;
  onPostDeleted?: () => void;
}

export function PostCard({ post, currentUser, onAuthClick, onPostDeleted }: PostCardProps) {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(post.isUpvoted || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleUpvote = async () => {
    if (!currentUser) {
      onAuthClick('login');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await upvotePost(post.id);
      setUpvotes(result.upvotes);
      setIsUpvoted(result.isUpvoted);
    } catch (error) {
      console.error('Failed to upvote:', error);
      toast.error('Failed to upvote post');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      onAuthClick('login');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await bookmarkPost(post.id);
      setIsBookmarked(result.isBookmarked);
      toast.success(result.isBookmarked ? 'Post bookmarked' : 'Bookmark removed');
    } catch (error) {
      console.error('Failed to bookmark:', error);
      toast.error('Failed to bookmark post');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await deletePost(post.id);
      toast.success('Post deleted successfully');
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentCount(commentCount + 1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isAuthor = currentUser?.id === post.authorId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <Button
              variant={isUpvoted ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleUpvote}
              disabled={isProcessing}
            >
              <ArrowBigUp className="h-5 w-5" />
            </Button>
            <span className="text-sm">{upvotes}</span>
          </div>
          
          <div className="flex-1 space-y-2">
            <CardTitle className="cursor-pointer hover:text-primary">
              {post.title}
            </CardTitle>
            <CardDescription>{post.description}</CardDescription>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {post.author.name} • {post.author.country} • {post.timestamp}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-muted"
              onClick={() => setShowComments(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm">{commentCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleBookmark}
              disabled={isProcessing}
            >
              <Bookmark 
                className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} 
              />
            </Button>
            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <CommentDialog
        open={showComments}
        onOpenChange={setShowComments}
        postId={post.id}
        postTitle={post.title}
        currentUser={currentUser}
        onAuthClick={onAuthClick}
        onCommentAdded={handleCommentAdded}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}