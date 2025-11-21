import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Health check endpoint
app.get("/make-server-a65856ea/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup
app.post("/make-server-a65856ea/signup", async (c) => {
  try {
    const { email, password, name, country } = await c.req.json();

    if (!email || !password || !name || !country) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, country },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log(`Signup error: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store additional user data in KV store
    const userId = authData.user.id;
    const userData = {
      id: userId,
      email,
      name,
      country,
      createdAt: new Date().toISOString(),
      avatar: null,
    };

    await kv.set(`user:${userId}`, userData);

    return c.json({ user: userData });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// User signin
app.post("/make-server-a65856ea/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Signin error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Get user data from KV store
    const userId = data.user.id;
    const userData = await kv.get(`user:${userId}`);

    return c.json({ 
      accessToken: data.session.access_token,
      user: userData 
    });
  } catch (error) {
    console.log(`Signin error: ${error}`);
    return c.json({ error: "Signin failed" }, 500);
  }
});

// Get current user
app.get("/make-server-a65856ea/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    return c.json({ user: userData });
  } catch (error) {
    console.log(`Get user error: ${error}`);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// Create post
app.post("/make-server-a65856ea/posts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { title, description, content, category, tags } = await c.req.json();

    if (!title || !description || !content) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const postId = crypto.randomUUID();
    const authorData = await kv.get(`user:${user.id}`);
    
    const post = {
      id: postId,
      title,
      description,
      content,
      category: category || 'Uncategorized',
      tags: tags || [],
      authorId: user.id,
      author: {
        name: authorData.name,
        country: authorData.country,
        avatar: authorData.avatar,
      },
      upvotes: 0,
      comments: 0,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`post:${postId}`, post);

    // Add to posts index
    const allPosts = await kv.getByPrefix('post:');
    
    return c.json({ post });
  } catch (error) {
    console.log(`Create post error: ${error}`);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// Get posts
app.get("/make-server-a65856ea/posts", async (c) => {
  try {
    const sort = c.req.query('sort') || 'recent';
    const category = c.req.query('category');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    // Try to get current user (but don't require authentication)
    let currentUserId = null;
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (user) {
          currentUserId = user.id;
        }
      } catch (e) {
        // Ignore auth errors for public viewing
      }
    }

    // Get all posts
    const posts = await kv.getByPrefix('post:');

    if (!posts || posts.length === 0) {
      return c.json({ posts: [] });
    }

    let filteredPosts = posts;

    // Filter by category if specified
    if (category && category !== 'All Topics') {
      filteredPosts = posts.filter(p => p.category === category);
    }

    // Sort posts
    if (sort === 'upvotes') {
      filteredPosts.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sort === 'comments') {
      filteredPosts.sort((a, b) => b.comments - a.comments);
    } else {
      // Default: sort by timestamp (most recent)
      filteredPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    // Add upvote/bookmark status for current user if authenticated
    if (currentUserId) {
      const enrichedPosts = await Promise.all(filteredPosts.map(async (post) => {
        const isUpvoted = await kv.get(`upvote:${currentUserId}:${post.id}`);
        const isBookmarked = await kv.get(`bookmark:${currentUserId}:${post.id}`);
        
        return {
          ...post,
          timestamp: getRelativeTime(post.timestamp),
          isUpvoted: !!isUpvoted,
          isBookmarked: !!isBookmarked,
        };
      }));
      
      return c.json({ posts: enrichedPosts });
    }

    // Add relative timestamps
    filteredPosts = filteredPosts.map(post => ({
      ...post,
      timestamp: getRelativeTime(post.timestamp),
    }));

    return c.json({ posts: filteredPosts });
  } catch (error) {
    console.log(`Get posts error: ${error}`);
    return c.json({ error: "Failed to get posts" }, 500);
  }
});

// Upvote post
app.post("/make-server-a65856ea/posts/:id/upvote", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const postId = c.req.param('id');
    const upvoteKey = `upvote:${user.id}:${postId}`;

    // Check if already upvoted
    const existingUpvote = await kv.get(upvoteKey);
    const post = await kv.get(`post:${postId}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    if (existingUpvote) {
      // Remove upvote
      await kv.del(upvoteKey);
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else {
      // Add upvote
      await kv.set(upvoteKey, true);
      post.upvotes += 1;
    }

    await kv.set(`post:${postId}`, post);

    return c.json({ upvotes: post.upvotes, isUpvoted: !existingUpvote });
  } catch (error) {
    console.log(`Upvote error: ${error}`);
    return c.json({ error: "Failed to upvote post" }, 500);
  }
});

// Bookmark post
app.post("/make-server-a65856ea/posts/:id/bookmark", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const postId = c.req.param('id');
    const bookmarkKey = `bookmark:${user.id}:${postId}`;

    // Check if already bookmarked
    const existingBookmark = await kv.get(bookmarkKey);

    if (existingBookmark) {
      // Remove bookmark
      await kv.del(bookmarkKey);
      return c.json({ isBookmarked: false });
    } else {
      // Add bookmark
      await kv.set(bookmarkKey, { postId, timestamp: new Date().toISOString() });
      return c.json({ isBookmarked: true });
    }
  } catch (error) {
    console.log(`Bookmark error: ${error}`);
    return c.json({ error: "Failed to bookmark post" }, 500);
  }
});

// Get user's bookmarks
app.get("/make-server-a65856ea/bookmarks", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all bookmarks for this user
    const bookmarks = await kv.getByPrefix(`bookmark:${user.id}:`);

    if (!bookmarks || bookmarks.length === 0) {
      return c.json({ posts: [] });
    }

    // Get the actual posts
    const posts = [];
    for (const bookmark of bookmarks) {
      const post = await kv.get(`post:${bookmark.postId}`);
      if (post) {
        posts.push({
          ...post,
          timestamp: getRelativeTime(post.timestamp),
        });
      }
    }

    return c.json({ posts });
  } catch (error) {
    console.log(`Get bookmarks error: ${error}`);
    return c.json({ error: "Failed to get bookmarks" }, 500);
  }
});

// Get contributors
app.get("/make-server-a65856ea/contributors", async (c) => {
  try {
    // Get all users
    const users = await kv.getByPrefix('user:');

    if (!users || users.length === 0) {
      return c.json({ contributors: [] });
    }

    // Get all posts to count contributions
    const posts = await kv.getByPrefix('post:');

    const contributorsMap = new Map();

    users.forEach(user => {
      contributorsMap.set(user.id, {
        id: user.id,
        name: user.name,
        country: user.country,
        avatar: user.avatar,
        posts: 0,
        totalUpvotes: 0,
      });
    });

    posts.forEach(post => {
      const contributor = contributorsMap.get(post.authorId);
      if (contributor) {
        contributor.posts += 1;
        contributor.totalUpvotes += post.upvotes;
      }
    });

    const contributors = Array.from(contributorsMap.values())
      .filter(c => c.posts > 0)
      .sort((a, b) => b.posts - a.posts);

    return c.json({ contributors });
  } catch (error) {
    console.log(`Get contributors error: ${error}`);
    return c.json({ error: "Failed to get contributors" }, 500);
  }
});

// Delete post
app.delete("/make-server-a65856ea/posts/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const postId = c.req.param('id');
    const post = await kv.get(`post:${postId}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    // Check if user is the author
    if (post.authorId !== user.id) {
      return c.json({ error: "You can only delete your own posts" }, 403);
    }

    // Delete the post
    await kv.del(`post:${postId}`);

    // Delete associated upvotes and bookmarks
    const upvotes = await kv.getByPrefix(`upvote:`);
    const bookmarks = await kv.getByPrefix(`bookmark:`);
    
    for (const upvote of upvotes) {
      const key = Object.keys(upvote)[0];
      if (key && key.endsWith(`:${postId}`)) {
        await kv.del(key);
      }
    }

    for (const bookmark of bookmarks) {
      const key = Object.keys(bookmark)[0];
      if (key && key.endsWith(`:${postId}`)) {
        await kv.del(key);
      }
    }

    // Delete associated comments
    const comments = await kv.getByPrefix(`comment:${postId}:`);
    for (const comment of comments) {
      const key = Object.keys(comment)[0];
      if (key) {
        await kv.del(key);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete post error: ${error}`);
    return c.json({ error: "Failed to delete post" }, 500);
  }
});

// Create comment
app.post("/make-server-a65856ea/posts/:id/comments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const postId = c.req.param('id');
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: "Comment content is required" }, 400);
    }

    const post = await kv.get(`post:${postId}`);
    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    const commentId = crypto.randomUUID();
    const authorData = await kv.get(`user:${user.id}`);
    
    const comment = {
      id: commentId,
      postId,
      content,
      authorId: user.id,
      author: {
        name: authorData.name,
        country: authorData.country,
        avatar: authorData.avatar,
      },
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`comment:${postId}:${commentId}`, comment);

    // Update comment count on post
    post.comments = (post.comments || 0) + 1;
    await kv.set(`post:${postId}`, post);

    return c.json({ comment: {
      ...comment,
      timestamp: getRelativeTime(comment.timestamp),
    } });
  } catch (error) {
    console.log(`Create comment error: ${error}`);
    return c.json({ error: "Failed to create comment" }, 500);
  }
});

// Get comments for a post
app.get("/make-server-a65856ea/posts/:id/comments", async (c) => {
  try {
    const postId = c.req.param('id');
    const comments = await kv.getByPrefix(`comment:${postId}:`);

    if (!comments || comments.length === 0) {
      return c.json({ comments: [] });
    }

    // Sort by timestamp (newest first)
    const sortedComments = comments
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map(comment => ({
        ...comment,
        timestamp: getRelativeTime(comment.timestamp),
      }));

    return c.json({ comments: sortedComments });
  } catch (error) {
    console.log(`Get comments error: ${error}`);
    return c.json({ error: "Failed to get comments" }, 500);
  }
});

// Save draft
app.post("/make-server-a65856ea/drafts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { title, description, content, category, tags } = await c.req.json();

    const draftId = crypto.randomUUID();
    
    const draft = {
      id: draftId,
      title: title || '',
      description: description || '',
      content: content || '',
      category: category || '',
      tags: tags || [],
      authorId: user.id,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`draft:${user.id}:${draftId}`, draft);

    return c.json({ draft });
  } catch (error) {
    console.log(`Save draft error: ${error}`);
    return c.json({ error: "Failed to save draft" }, 500);
  }
});

// Get user drafts
app.get("/make-server-a65856ea/drafts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const drafts = await kv.getByPrefix(`draft:${user.id}:`);

    return c.json({ drafts: drafts || [] });
  } catch (error) {
    console.log(`Get drafts error: ${error}`);
    return c.json({ error: "Failed to get drafts" }, 500);
  }
});

// Follow/unfollow user
app.post("/make-server-a65856ea/users/:id/follow", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const targetUserId = c.req.param('id');
    const followKey = `follow:${user.id}:${targetUserId}`;

    // Check if already following
    const existingFollow = await kv.get(followKey);

    if (existingFollow) {
      // Unfollow
      await kv.del(followKey);
      return c.json({ isFollowing: false });
    } else {
      // Follow
      await kv.set(followKey, { timestamp: new Date().toISOString() });
      return c.json({ isFollowing: true });
    }
  } catch (error) {
    console.log(`Follow error: ${error}`);
    return c.json({ error: "Failed to follow user" }, 500);
  }
});

// Update user profile
app.put("/make-server-a65856ea/user/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, country, bio, website } = await c.req.json();

    const userData = await kv.get(`user:${user.id}`);
    
    const updatedUser = {
      ...userData,
      name: name || userData.name,
      country: country || userData.country,
      bio: bio || userData.bio || '',
      website: website || userData.website || '',
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, updatedUser);

    return c.json({ user: updatedUser });
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Search posts
app.get("/make-server-a65856ea/search", async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase();
    
    if (!query) {
      return c.json({ posts: [] });
    }

    const posts = await kv.getByPrefix('post:');

    if (!posts || posts.length === 0) {
      return c.json({ posts: [] });
    }

    // Search in title, description, tags, and category
    const filteredPosts = posts.filter(post => {
      const searchableText = `${post.title} ${post.description} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
      return searchableText.includes(query);
    });

    // Add relative timestamps
    const postsWithTimestamps = filteredPosts.map(post => ({
      ...post,
      timestamp: getRelativeTime(post.timestamp),
    }));

    return c.json({ posts: postsWithTimestamps });
  } catch (error) {
    console.log(`Search error: ${error}`);
    return c.json({ error: "Failed to search posts" }, 500);
  }
});

// Helper function to convert timestamp to relative time
function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
}

Deno.serve(app.fetch);