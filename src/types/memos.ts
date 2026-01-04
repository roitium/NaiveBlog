export interface ApiResponse<TData> {
  data: TData | null;
  error: string | null;
  traceId: string;
  code: number;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string | null;
}

export interface Resource {
  id: string;
  externalLink: string | null;
  type: string;
  size: number;
  createdAt: string;
  filename: string;
  memoId: string | null;
}

export type Visibility = 'public' | 'private'

// 4. 引用内容的特殊结构
export interface ApiQuotedMemo {
  id: string;
  content: string;
  userId: string;
  visibility: Visibility;
  isPinned: boolean;
  createdAt: string;
  author: User;
  updatedAt: string;
  parentId: string | null;
  quoteId: string | null;
}

export interface ApiMemo {
  id: string;
  content: string;
  userId: string;
  visibility: Visibility;
  isPinned: boolean;
  createdAt: string;
  author: User;
  resources: Resource[];
  replies: (Exclude<ApiMemo, "replies"> & {subReplyCount: number})[];
  quotedMemo: ApiQuotedMemo | null;
  updatedAt: string;
  parentId: string | null;
}

export interface Cursor {
  createdAt: string;
  id: string;
}

export interface TimelineResponse {
  data: ApiMemo[];
  nextCursor: Cursor | null;
}