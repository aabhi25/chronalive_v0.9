import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  MoreHorizontal,
  Edit,
  Trash2,
  School,
  Users,
  X,
  FileText,
  Image,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostAttachmentsGrid } from "@/components/PostAttachmentsGrid";

interface Post {
  id: string;
  content: string;
  attachments: Array<{fileId: string; filename: string; mimetype: string}>;
  postedById: string;
  feedScope: 'school' | 'class';
  classId?: string | null;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields from join (if available)
  authorName?: string;
  authorRole?: string;
}

interface NewsfeedProps {
  feedScope: 'school' | 'class';
  classId?: string;
  className?: string;
  showPostForm?: boolean;
}

export default function Newsfeed({ 
  feedScope, 
  classId, 
  className = "", 
  showPostForm = true 
}: NewsfeedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [selectedAttachments, setSelectedAttachments] = useState<Array<{
    file: File;
    fileId?: string;
    filename?: string;
    mimetype?: string;
    uploading?: boolean;
  }>>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const canPost = user?.role === 'admin' || user?.role === 'teacher';

  // Fetch posts with infinite scroll pagination
  const {
    data: postsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Post[]>({
    queryKey: ["/api/posts", { feedScope, classId }],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = typeof pageParam === 'number' ? pageParam : 0;
      const params = new URLSearchParams({ 
        feedScope,
        offset: offset.toString(),
        limit: '5' // Load 5 posts per page
      });
      if (classId) params.append('classId', classId);
      
      const response = await apiRequest("GET", `/api/posts?${params.toString()}`);
      return response.json() as Promise<Post[]>;
    },
    getNextPageParam: (lastPage, allPages) => {
      // More robust pagination: sum all loaded items to avoid skipping
      if (lastPage && lastPage.length === 5) {
        // Calculate total items loaded so far
        const totalLoaded = allPages.reduce((sum, page) => sum + page.length, 0);
        return totalLoaded; // Use sum as next offset
      }
      return undefined; // No more pages
    },
    initialPageParam: 0,
    // Remove periodic refetch to avoid duplication/jumps in infinite scroll
    // refetchInterval: 30000,
  });

  // Flatten all pages into a single array of posts
  const posts = postsData?.pages.flat() || [];

  // Intersection observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Auto-load more posts when reaching second-to-last post
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Set up intersection observer for auto-loading
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '100px', // Start loading 100px before the element comes into view
      }
    );

    // Observe the second-to-last post element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, posts.length]); // Re-run when posts change

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('attachment', file);
      
      // Use direct fetch for file uploads with proper authentication
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/posts/upload-attachment', {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      return response.json();
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { 
      content: string; 
      feedScope: string; 
      classId?: string; 
      attachments?: Array<{fileId: string; filename: string; mimetype: string}> 
    }) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      setSelectedAttachments([]);
      setIsPosting(false);
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await apiRequest("PUT", `/api/posts/${id}`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setEditingPost(null);
      setEditContent("");
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("DELETE", `/api/posts/${postId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success", 
        description: "Post deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Validate file types before upload
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocTypes = ['application/pdf', 'text/plain'];
    const allAllowedTypes = [...allowedImageTypes, ...allowedDocTypes];

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      if (allAllowedTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    // Show error for invalid files
    if (invalidFiles.length > 0) {
      toast({
        title: "Some Files Not Supported",
        description: `These files cannot be displayed in the grid: ${invalidFiles.join(', ')}. Only JPEG, PNG, GIF, WebP images and PDF/TXT documents are supported.`,
        variant: "destructive",
      });
    }

    // Only process valid files
    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }

    setIsUploadingFiles(true);
    const newAttachments = validFiles.map(file => ({ file, uploading: true }));
    setSelectedAttachments(prev => [...prev, ...newAttachments]);

    // Upload files one by one
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const result = await uploadFileMutation.mutateAsync(file);
        setSelectedAttachments(prev => 
          prev.map(attachment => 
            attachment.file === file 
              ? { 
                  ...attachment, 
                  fileId: result.fileId, 
                  filename: result.filename,
                  mimetype: result.mimetype,
                  uploading: false 
                }
              : attachment
          )
        );
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        setSelectedAttachments(prev => prev.filter(attachment => attachment.file !== file));
      }
    }
    setIsUploadingFiles(false);
    
    // Clear the input
    event.target.value = '';
  };

  const removeAttachment = (fileToRemove: File) => {
    setSelectedAttachments(prev => prev.filter(attachment => attachment.file !== fileToRemove));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedAttachments.length === 0) return;
    
    // Check if all files are uploaded
    const hasUploadingFiles = selectedAttachments.some(attachment => attachment.uploading);
    if (hasUploadingFiles) {
      toast({
        title: "Please Wait",
        description: "Please wait for all files to finish uploading",
        variant: "destructive",
      });
      return;
    }
    
    setIsPosting(true);
    const attachmentObjects = selectedAttachments
      .filter(attachment => attachment.fileId && attachment.filename && attachment.mimetype)
      .map(attachment => ({
        fileId: attachment.fileId!,
        filename: attachment.filename!,
        mimetype: attachment.mimetype!
      }));
    
    createPostMutation.mutate({
      content: newPostContent.trim(),
      feedScope,
      classId: feedScope === 'class' ? classId : undefined,
      attachments: attachmentObjects,
    });
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleUpdatePost = () => {
    if (!editContent.trim() || !editingPost) return;
    
    updatePostMutation.mutate({
      id: editingPost,
      content: editContent.trim(),
    });
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const getAuthorInitials = (post: Post) => {
    if (post.authorName) {
      const names = post.authorName.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    }
    return post.postedById.slice(0, 2).toUpperCase();
  };

  const canEditPost = (post: Post) => {
    return post.postedById === user?.id || user?.role === 'admin';
  };

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load posts. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-purple-50/70 via-white/80 to-purple-100/60 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-700/20 border-purple-200/50 dark:border-slate-600/30 ${className}`}>
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-100/60 via-purple-50/40 to-violet-100/50 dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-600/30 rounded-t-xl border-b dark:border-slate-600/30">
        <CardTitle className="flex items-center space-x-2">
          {feedScope === 'school' ? (
            <>
              <School className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-800 dark:text-slate-100">School Newsfeed</span>
            </>
          ) : (
            <>
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-800 dark:text-slate-100">Class Newsfeed</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Post Creation Form */}
        {showPostForm && canPost && (
          <div className="space-y-3 pb-4 border-b border-purple-200/50 dark:border-slate-600/40 bg-gradient-to-r from-purple-50/50 via-white/60 to-violet-50/40 dark:from-slate-800/40 dark:via-slate-700/30 dark:to-slate-600/20 rounded-lg p-4">
            <Textarea
              placeholder={`Share something with the ${feedScope === 'school' ? 'school' : 'class'}...`}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[80px] resize-none bg-white/80 dark:bg-slate-800/50 border-purple-200/60 dark:border-slate-600/50 focus:border-purple-400 dark:focus:border-purple-400 dark:text-slate-100"
            />
            
            {/* Selected Attachments Display */}
            {selectedAttachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Attachments:</div>
                <div className="space-y-2">
                  {selectedAttachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-100/60 via-purple-50/40 to-violet-100/50 dark:from-slate-700/50 dark:via-slate-600/40 dark:to-slate-500/30 rounded-lg border border-purple-200/40 dark:border-slate-500/40">
                      <div className="flex items-center space-x-2">
                        {attachment.file.type.startsWith('image/') ? (
                          <Image className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="text-sm dark:text-slate-200">{attachment.file.name}</span>
                        {attachment.uploading && (
                          <div className="text-xs text-blue-600">Uploading...</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.file)}
                        className="h-6 w-6 p-0"
                        disabled={attachment.uploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploadingFiles}
                >
                  <Paperclip className="h-4 w-4" />
                  <span>{isUploadingFiles ? 'Uploading...' : 'Attach File'}</span>
                </Button>
                <Badge variant="outline" className="text-xs">
                  {feedScope === 'school' ? 'School' : 'Class'} Feed
                </Badge>
              </div>
              <Button
                onClick={handleCreatePost}
                disabled={(!newPostContent.trim() && selectedAttachments.length === 0) || isPosting || isUploadingFiles}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{isPosting ? 'Posting...' : 'Post'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet. {canPost ? 'Be the first to share something!' : ''}</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <div 
                key={post.id} 
                className="space-y-3 p-4 border border-purple-200/60 dark:border-slate-600/40 rounded-lg bg-gradient-to-br from-purple-50/40 via-white/70 to-violet-50/30 dark:from-slate-800/40 dark:via-slate-700/30 dark:to-slate-600/20 shadow-sm hover:shadow-md transition-shadow duration-200"
                ref={posts.length > 2 && index === posts.length - 2 ? loadMoreRef : null} // Add ref to second-to-last post (only if we have more than 2 posts)
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-medium">
                        {getAuthorInitials(post)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm dark:text-slate-100">
                          {post.authorName || `User ${post.postedById.slice(0, 8)}`}
                        </p>
                        {post.authorRole && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {post.authorRole.replace('_', ' ')}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            post.feedScope === 'school' 
                              ? 'border-blue-200 text-blue-700' 
                              : 'border-green-200 text-green-700'
                          }`}
                        >
                          {post.feedScope === 'school' ? 'School' : 'Class'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Post Actions */}
                  {canEditPost(post) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPost(post)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Post Content */}
                <div className="pl-13">
                  {editingPost === post.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] resize-none bg-white/90 dark:bg-slate-800/50 border-purple-200/60 dark:border-slate-600/50 focus:border-purple-400 dark:focus:border-purple-400 dark:text-slate-100"
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={handleUpdatePost}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingPost(null);
                            setEditContent("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap dark:text-slate-200">
                      {post.content}
                    </p>
                  )}
                  
                  {/* Attachments (if any) */}
                  {post.attachments && post.attachments.length > 0 && (
                    <PostAttachmentsGrid attachments={post.attachments} />
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator for infinite scroll */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}