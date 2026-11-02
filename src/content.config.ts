import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const posts = defineCollection({
	loader: glob({
		pattern: '**/*.{md,mdx}',
		base: './data/blog',
		generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
	}),
	schema: z.object({
		// YAML parses unquoted date titles as Date objects in existing posts.
		title: z.union([
			z.string(),
			z.date().transform((date) => date.toISOString().slice(0, 10)),
		]),
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		lastmod: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		summary: z.string().optional(),
		images: z.array(z.string()).optional(),
		authors: z.array(z.string()).default(['default']),
		layout: z.string().optional(),
		bibliography: z.string().optional(),
		canonicalUrl: z.string().optional(),
		private: z.boolean().default(false),
		password: z.string().nullable().optional(),
		pinned: z.boolean().default(false),
	}),
})
const authors = defineCollection({
	loader: glob({
		pattern: '**/*.mdx',
		base: './data/authors',
		generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
	}),
	schema: z.object({
		name: z.string(),
		avatar: z.string().optional(),
		occupation: z.string().optional(),
		company: z.string().optional(),
		email: z.string().optional(),
		twitter: z.string().optional(),
		linkedin: z.string().optional(),
		github: z.string().optional(),
		layout: z.string().optional(),
	}),
})
export const collections = { posts, authors }
