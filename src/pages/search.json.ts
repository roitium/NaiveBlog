import type { APIRoute } from 'astro'
import { allPosts } from '@/services/content/core'
import { createSearchIndex } from '@/services/content/metaGen'
export const GET: APIRoute = () => Response.json(createSearchIndex(allPosts))
