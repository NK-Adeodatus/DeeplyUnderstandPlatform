import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getComments, createComment, type Comment, type User } from "../utils/api";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postTitle: string;
  currentUser: User | null;
  onAuthClick: (mode: 'login' | 'register') => void;
  onCommentAdded?: () => void;
}

export function CommentDialog({ 
  open, 
  onOpenChange, 
  postId, 
  postTitle, 
  currentUser,
  onAuthClick,
  onCommentAdded 
}: CommentDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const { comments: fetchedComments } = await getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      onAuthClick('login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const { comment } = await createComment(postId, newComment.trim());
      setComments([comment, ...comments]);
      setNewComment("");
      toast.success('Comment added');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>{postTitle}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.author.country}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4 space-y-3">
          <Textarea
            placeholder={currentUser ? "Write a comment..." : "Sign in to comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!currentUser || isSubmitting}
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!currentUser || isSubmitting || !newComment.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              {currentUser ? 'Post Comment' : 'Sign in to Comment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
