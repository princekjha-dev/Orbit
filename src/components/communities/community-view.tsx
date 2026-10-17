"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Users2,
  Plus,
  MessageSquare,
  Bookmark,
  Pin,
  Trash2,
  Shield,
  Send,
  Calendar,
  FileText,
  Megaphone,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CommunityViewProps {
  community: any;
  currentUserId?: string;
}

const CATEGORY_TABS = [
  { id: "ALL", label: "All Posts" },
  { id: "DISCUSSION", label: "Discussions", icon: MessageSquare },
  { id: "RESOURCE", label: "Resources", icon: FileText },
  { id: "EVENT", label: "Events", icon: Calendar },
  { id: "ANNOUNCEMENT", label: "Announcements", icon: Megaphone },
];

export function CommunityView({
  community: initialCommunity,
  currentUserId,
}: CommunityViewProps) {
  const [community, setCommunity] = useState(initialCommunity);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // New post form
  const [isPosting, setIsPosting] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("DISCUSSION");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Active expanded comments by post ID
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Active main tab
  const [mainTab, setMainTab] = useState<"posts" | "members" | "rules">("posts");

  const isMember = community.isMember;
  const isAdminOrMod =
    community.creatorId === currentUserId ||
    community.currentUserRole === "ADMIN" ||
    community.currentUserRole === "MODERATOR";

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const url =
        activeCategory === "ALL"
          ? `/api/communities/${community.slug}/posts`
          : `/api/communities/${community.slug}/posts?category=${activeCategory}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  }, [community.slug, activeCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleToggleJoin = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`/api/communities/${community.slug}/members`, {
        method: isMember ? "DELETE" : "POST",
      });
      if (res.ok) {
        setCommunity((prev: any) => ({
          ...prev,
          isMember: !isMember,
          memberCount: isMember ? prev.memberCount - 1 : prev.memberCount + 1,
          currentUserRole: isMember ? null : "MEMBER",
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    setSubmittingPost(true);

    try {
      const res = await fetch(`/api/communities/${community.slug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          category: postCategory,
        }),
      });

      if (res.ok) {
        setPostTitle("");
        setPostContent("");
        setIsPosting(false);
        await fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to remove this post?")) return;
    try {
      const res = await fetch(`/api/communities/${community.slug}/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (postId: string, currentPinned: boolean) => {
    try {
      const res = await fetch(`/api/communities/${community.slug}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });
      if (res.ok) {
        await fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSave = async (postId: string) => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`/api/communities/${community.slug}/posts/${postId}/save`, {
        method: "POST",
      });
      if (res.ok) {
        const d = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isSaved: d.saved } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = async (postId: string) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !commentsByPost[postId]) {
      try {
        const res = await fetch(`/api/communities/${community.slug}/posts/${postId}/comments`);
        if (res.ok) {
          const d = await res.json();
          setCommentsByPost((prev) => ({ ...prev, [postId]: d.comments || [] }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !currentUserId) return;

    try {
      const res = await fetch(`/api/communities/${community.slug}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const d = await res.json();
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), d.comment],
        }));
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue" className="text-xs">
                {community.category}
              </Badge>
              {community.currentUserRole && (
                <Badge variant="neutral" className="text-xs font-semibold">
                  {community.currentUserRole}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {community.name}
            </h1>

            <p className="text-sm text-neutral-600 mt-1 max-w-3xl leading-relaxed">
              {community.description}
            </p>

            <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1 font-medium">
                <Users2 className="h-4 w-4 text-neutral-400" />
                {community.memberCount} members
              </span>
              <span>
                Created by{" "}
                <Link
                  href={`/u/${community.creator.username}`}
                  className="font-medium text-neutral-700 hover:underline"
                >
                  {community.creator.name}
                </Link>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            {currentUserId && (
              <Button
                variant={isMember ? "outline" : "primary"}
                size="sm"
                onClick={handleToggleJoin}
                className="text-xs"
              >
                {isMember ? "Leave Community" : "Join Community"}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-neutral-100 mt-6 pt-4 text-sm font-medium">
          <button
            onClick={() => setMainTab("posts")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              mainTab === "posts"
                ? "bg-neutral-900 text-white font-semibold"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Posts & Discussions
          </button>
          <button
            onClick={() => setMainTab("members")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              mainTab === "members"
                ? "bg-neutral-900 text-white font-semibold"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Members ({community.memberCount})
          </button>
          <button
            onClick={() => setMainTab("rules")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              mainTab === "rules"
                ? "bg-neutral-900 text-white font-semibold"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Guidelines & Rules
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {mainTab === "posts" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left 3 cols: Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Action Bar: Category tabs + New Post button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                      activeCategory === tab.id
                        ? "bg-brand-600 text-white font-semibold"
                        : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {isMember && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsPosting(!isPosting)}
                  className="text-xs gap-1.5 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  {isPosting ? "Close Form" : "Create Post"}
                </Button>
              )}
            </div>

            {/* Inline Post Form */}
            {isPosting && (
              <Card className="p-4 bg-white border border-neutral-200 shadow-xs">
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Post title..."
                      className="flex-1 text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="text-xs border border-neutral-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="DISCUSSION">Discussion</option>
                      <option value="RESOURCE">Resource</option>
                      <option value="EVENT">Event</option>
                      <option value="ANNOUNCEMENT">Announcement</option>
                    </select>
                  </div>

                  <textarea
                    required
                    rows={4}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share insights, architecture patterns, code resources, or ecosystem updates..."
                    className="w-full text-sm border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPosting(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={submittingPost || !postTitle || !postContent}
                      className="text-xs"
                    >
                      {submittingPost ? "Publishing..." : "Publish Post"}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Posts Feed */}
            {loadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-5 animate-pulse bg-white border border-neutral-200">
                    <div className="h-4 bg-neutral-200 rounded-sm w-1/4 mb-3" />
                    <div className="h-3 bg-neutral-100 rounded-sm w-3/4 mb-2" />
                    <div className="h-3 bg-neutral-100 rounded-sm w-1/2" />
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                title="No posts in this category"
                description={
                  isMember
                    ? "Start the conversation by publishing the first post."
                    : "Join this community to start posting and collaborating."
                }
                action={
                  isMember ? (
                    <Button size="sm" onClick={() => setIsPosting(true)}>
                      Create Post
                    </Button>
                  ) : currentUserId ? (
                    <Button size="sm" onClick={handleToggleJoin}>
                      Join Community
                    </Button>
                  ) : undefined
                }
                className="py-12 bg-white rounded-xl border border-neutral-200"
              />
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className={`p-5 bg-white border transition-colors shadow-xs ${
                      post.isPinned
                        ? "border-amber-200 bg-amber-50/20"
                        : "border-neutral-200"
                    }`}
                  >
                    {/* Top Row: Author & Metadata */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={post.author.image}
                          name={post.author.name}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/u/${post.author.username}`}
                              className="font-bold text-neutral-900 text-sm hover:underline"
                            >
                              {post.author.name}
                            </Link>
                            <span className="text-xs text-neutral-400">
                              @{post.author.username}
                            </span>
                            {post.isPinned && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                <Pin className="h-3 w-3" /> Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            {new Date(post.createdAt).toLocaleDateString()} · Category:{" "}
                            <span className="font-medium text-neutral-600">
                              {post.category}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Author & Mod actions */}
                      <div className="flex items-center gap-1">
                        {currentUserId && (
                          <button
                            onClick={() => handleToggleSave(post.id)}
                            className={`p-1.5 rounded hover:bg-neutral-100 transition-colors cursor-pointer ${
                              post.isSaved ? "text-brand-600" : "text-neutral-400"
                            }`}
                            title={post.isSaved ? "Saved" : "Save post"}
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                        )}

                        {isAdminOrMod && (
                          <button
                            onClick={() => handleTogglePin(post.id, post.isPinned)}
                            className={`p-1.5 rounded hover:bg-neutral-100 transition-colors cursor-pointer ${
                              post.isPinned ? "text-amber-600" : "text-neutral-400"
                            }`}
                            title={post.isPinned ? "Unpin post" : "Pin post"}
                          >
                            <Pin className="h-4 w-4" />
                          </button>
                        )}

                        {(post.isAuthor || isAdminOrMod) && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <h2 className="text-base font-bold text-neutral-900 mb-2">
                      {post.title}
                    </h2>
                    <p className="text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>

                    {/* Bottom action bar */}
                    <div className="pt-3 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {post.commentCount} comment{post.commentCount !== 1 ? "s" : ""}
                        {expandedComments[post.id] ? (
                          <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Comments section */}
                    {expandedComments[post.id] && (
                      <div className="mt-4 pt-3 border-t border-neutral-100 space-y-3">
                        {/* List */}
                        <div className="space-y-2">
                          {(commentsByPost[post.id] || []).length === 0 ? (
                            <p className="text-[11px] text-neutral-400 italic">
                              No comments yet. Be the first to reply.
                            </p>
                          ) : (
                            (commentsByPost[post.id] || []).map((c: any) => (
                              <div
                                key={c.id}
                                className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-xs"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Link
                                    href={`/u/${c.author.username}`}
                                    className="font-semibold text-neutral-900 hover:underline"
                                  >
                                    {c.author.name}
                                  </Link>
                                  <span className="text-[10px] text-neutral-400">
                                    {new Date(c.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="text-neutral-700 whitespace-pre-wrap">
                                  {c.content}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add comment input */}
                        {isMember ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddComment(post.id);
                              }}
                              placeholder="Write a reply..."
                              className="flex-1 text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleAddComment(post.id)}
                              className="text-xs gap-1"
                            >
                              <Send className="h-3 w-3" />
                              Reply
                            </Button>
                          </div>
                        ) : (
                          <p className="text-[11px] text-neutral-500">
                            Join this community to reply to posts.
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right 1 col: Rules & Community context */}
          <div className="space-y-4">
            <Card className="p-4 bg-white border border-neutral-200 shadow-xs">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-brand-600" />
                Community Guidelines
              </h3>
              {community.rules ? (
                <p className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed">
                  {community.rules}
                </p>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  No custom rules defined yet. Standard professional conduct applies.
                </p>
              )}
            </Card>

            <Card className="p-4 bg-white border border-neutral-200 shadow-xs">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
                Moderation
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Founder:</span>
                  <Link
                    href={`/u/${community.creator.username}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {community.creator.name}
                  </Link>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Moderator status:</span>
                  <span className="font-semibold text-neutral-800">
                    {isAdminOrMod ? "Active" : "Standard member"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {mainTab === "members" && (
        <Card className="p-6 bg-white border border-neutral-200 shadow-xs">
          <h2 className="text-base font-bold text-neutral-900 mb-4">
            Members ({community.members?.length || 0})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(community.members || []).map((m: any) => (
              <div
                key={m.id}
                className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={m.user.image} name={m.user.name} size="sm" />
                  <div className="min-w-0">
                    <Link
                      href={`/u/${m.user.username}`}
                      className="font-semibold text-neutral-900 text-xs hover:underline block truncate"
                    >
                      {m.user.name}
                    </Link>
                    <p className="text-[10px] text-neutral-400 truncate">
                      @{m.user.username}
                    </p>
                  </div>
                </div>
                <Badge variant={m.role === "ADMIN" ? "blue" : "neutral"} className="text-[10px]">
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Rules Tab */}
      {mainTab === "rules" && (
        <Card className="p-6 bg-white border border-neutral-200 shadow-xs max-w-3xl">
          <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            Community Rules & Mission
          </h2>
          <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
              <h3 className="font-bold text-neutral-900 mb-1">Purpose</h3>
              <p>{community.description}</p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
              <h3 className="font-bold text-neutral-900 mb-1">Standard Code</h3>
              <p>
                1. Focus on real architecture, projects, and verifiable work.
                <br />
                2. Do not spam links, promotional content, or vanity metrics.
                <br />
                3. Respect community members and provide constructive feedback.
              </p>
            </div>

            {community.rules && (
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                <h3 className="font-bold text-neutral-900 mb-1">Custom Guidelines</h3>
                <p className="whitespace-pre-wrap">{community.rules}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
