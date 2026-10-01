import { Hono } from 'hono';
import { query, queryOne, execute } from '../lib/db';
import { verifyJWT } from '../lib/jwt';
import type { Env } from '../types';

const mcpRoutes = new Hono<{ Bindings: Env }>();

const MCP_TOOLS = [
  {
    name: 'dzd_list_projects',
    description: 'List all software projects, mods, and tools created by DemonZ Development.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category filter (e.g. "game", "tool", "library")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of projects to return (default 20)',
        },
      },
    },
  },
  {
    name: 'dzd_get_project',
    description: 'Get detailed information about a specific project by slug including download URL and recent changelogs.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Unique project slug (e.g. "dzeconomy")',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'dzd_check_update',
    description: 'Check for software updates for a specific project given the client\'s installed version.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Unique project slug (e.g. "dzeconomy")',
        },
        current_version: {
          type: 'string',
          description: 'The version currently installed by the client',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'dzd_list_articles',
    description: 'List published articles, tutorials, and announcements from DemonZ Development.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional article category filter',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of articles to return (default 10)',
        },
      },
    },
  },
  {
    name: 'dzd_get_article',
    description: 'Read the full markdown content of an article by slug.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Unique article slug',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'dzd_search',
    description: 'Search projects and articles across the entire DemonZ Development knowledge base.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'dzd_get_stats',
    description: 'Get total project count, article count, comment count, and download metrics.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'dzd_list_unread_messages',
    description: 'List unread contact and inquiry messages sent by users.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of messages to return (default 10)',
        },
      },
    },
  },
  {
    name: 'dzd_list_pending_comments',
    description: 'List user comments waiting for moderation approval.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'dzd_approve_comment',
    description: 'Approve a pending comment so it displays publicly on the project page.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Comment ID to approve',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dzd_update_project_version',
    description: 'Update the released version of a project.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Project slug (e.g. "dzeconomy")',
        },
        version: {
          type: 'string',
          description: 'New version string (e.g. "2.1.3")',
        },
      },
      required: ['slug', 'version'],
    },
  },
  {
    name: 'dzd_create_changelog',
    description: 'Publish a new changelog / release note entry for a project.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Project slug (e.g. "dzeconomy")',
        },
        version: {
          type: 'string',
          description: 'Release version (e.g. "2.1.3")',
        },
        title: {
          type: 'string',
          description: 'Release title',
        },
        changes: {
          type: 'string',
          description: 'Markdown formatted release notes/changes',
        },
      },
      required: ['slug', 'version', 'title', 'changes'],
    },
  },
  {
    name: 'dzd_create_project',
    description: 'Create and publish a new software project, game, or tool on DemonZ Development.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Display name of the project' },
        slug: { type: 'string', description: 'Unique URL slug (e.g. "my-tool")' },
        tagline: { type: 'string', description: 'One-line summary of the project' },
        description: { type: 'string', description: 'Full description (Markdown supported)' },
        category: { type: 'string', description: 'Category (e.g. "game", "tool", "library", "other")' },
        version: { type: 'string', description: 'Initial version string (default "1.0.0")' },
        downloads: { type: 'number', description: 'Initial download counter (default 0)' },
        redirect_url: { type: 'string', description: 'External download/redirect URL' },
        file_path: { type: 'string', description: 'Hosted download file path' },
        image_url: { type: 'string', description: 'Hero/banner image URL' },
        source_url: { type: 'string', description: 'GitHub/source repository URL' },
        author: { type: 'string', description: 'Author name (default "DemonZ Development")' },
        is_featured: { type: 'boolean', description: 'Whether to feature on the homepage' },
      },
      required: ['name', 'slug', 'tagline', 'description', 'category'],
    },
  },
  {
    name: 'dzd_update_project',
    description: 'Update metadata or links of an existing project by slug.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Slug of the project to update' },
        name: { type: 'string', description: 'New display name' },
        tagline: { type: 'string', description: 'New tagline' },
        description: { type: 'string', description: 'New description' },
        category: { type: 'string', description: 'New category' },
        version: { type: 'string', description: 'New version' },
        redirect_url: { type: 'string', description: 'New redirect URL' },
        file_path: { type: 'string', description: 'New file path' },
        image_url: { type: 'string', description: 'New image URL' },
        source_url: { type: 'string', description: 'New source URL' },
        author: { type: 'string', description: 'New author' },
        is_featured: { type: 'boolean', description: 'Update featured status' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'dzd_create_article',
    description: 'Create and publish a new technical article, tutorial, or announcement on DemonZ Development.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the article' },
        slug: { type: 'string', description: 'Unique URL slug (e.g. "building-with-gemini")' },
        summary: { type: 'string', description: 'Brief abstract or excerpt' },
        content: { type: 'string', description: 'Full article body in Markdown format' },
        category: { type: 'string', description: 'Article category or topic' },
        image_url: { type: 'string', description: 'Header image URL' },
        published: { type: 'boolean', description: 'Set true to publish immediately (default true)' },
      },
      required: ['title', 'slug', 'summary', 'content'],
    },
  },
  {
    name: 'dzd_update_article',
    description: 'Update the content, summary, or publish status of an existing article by slug.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Slug of the article to update' },
        title: { type: 'string', description: 'New article title' },
        summary: { type: 'string', description: 'New abstract/summary' },
        content: { type: 'string', description: 'New markdown content' },
        category: { type: 'string', description: 'New category' },
        image_url: { type: 'string', description: 'New header image URL' },
        published: { type: 'boolean', description: 'Update published state' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'dzd_create_studio_log',
    description: 'Create a new entry in the DemonZ studio development log timeline.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Log title' },
        body: { type: 'string', description: 'Log details/notes (Markdown supported)' },
        tag: { type: 'string', description: 'Tag category: "game", "lib", "ai", "site", or "other"' },
        entry_date: { type: 'string', description: 'Date string YYYY-MM-DD (defaults to today)' },
        display_order: { type: 'number', description: 'Ordering index (default 0)' },
        published: { type: 'boolean', description: 'Whether to show on timeline (default true)' },
      },
      required: ['title', 'body'],
    },
  },
];

// Helper to authenticate admin
async function isAuthorizedAdmin(c: any): Promise<boolean> {
  const auth = c.req.header('Authorization');
  const mcpKey = c.req.header('x-mcp-key') || c.req.header('x-api-key');

  // Check explicit MCP API key if set in environment
  if (c.env?.MCP_SECRET && (mcpKey === c.env.MCP_SECRET || auth === `Bearer ${c.env.MCP_SECRET}`)) {
    return true;
  }

  // Check if token matches JWT_SECRET directly as an admin API key
  if (c.env?.JWT_SECRET && (mcpKey === c.env.JWT_SECRET || auth === `Bearer ${c.env.JWT_SECRET}`)) {
    return true;
  }

  // Check signed admin JWT token in Authorization: Bearer <token>
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (token) {
      const valid = await verifyJWT(token, c.env?.JWT_SECRET || '');
      if (valid) {
        return true;
      }
    }
  }

  // Check signed admin/MCP JWT token passed via X-MCP-Key or X-API-Key
  if (mcpKey) {
    const valid = await verifyJWT(mcpKey, c.env?.JWT_SECRET || '');
    if (valid) {
      return true;
    }
  }

  return false;
}

// Information & health endpoint for MCP client discovery / SSE fallback
mcpRoutes.get('/', async (c) => {
  const accept = c.req.header('Accept') || '';
  if (accept.includes('text/event-stream')) {
    const url = new URL(c.req.url);
    const postEndpoint = `${url.origin}/api/mcp`;
    return new Response(`event: endpoint\ndata: ${postEndpoint}\n\n`, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  }

  const authorized = await isAuthorizedAdmin(c);
  return c.json({
    status: 'ok',
    server: 'demonz-development-admin-mcp',
    version: '1.0.0',
    protocol: 'jsonrpc-2.0',
    transport: 'streamable-http',
    endpoint: '/api/mcp',
    authenticated: authorized,
    message: authorized
      ? 'Authenticated: MCP server is active and ready for tool execution.'
      : 'Authentication required: provide a valid 12-hour secret key via Authorization: Bearer <token> or X-MCP-Key header.',
    tools_count: MCP_TOOLS.length,
    tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
  });
});

// Handles JSON-RPC 2.0 MCP protocol with admin authentication
mcpRoutes.post('/', async (c) => {
  const body = await c.req.json<{
    jsonrpc?: string;
    id?: string | number | null;
    method?: string;
    params?: any;
  }>();

  const id = body.id ?? null;

  if (body.jsonrpc !== '2.0' || !body.method) {
    return c.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32600, message: 'Invalid Request: expected JSON-RPC 2.0' },
    }, 400);
  }

  // Ping is allowed for basic liveness check
  if (body.method === 'ping') {
    return c.json({ jsonrpc: '2.0', id, result: {} });
  }

  // Handle client notifications (MCP spec / JSON-RPC 2.0 notifications require no error response)
  if (body.method.startsWith('notifications/') || body.method === 'initialized') {
    return c.json({ jsonrpc: '2.0', id, result: {} });
  }

  // All other methods require Admin authentication
  const authorized = await isAuthorizedAdmin(c);
  if (!authorized) {
    return c.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: 'Unauthorized: MCP server is restricted to administrators. Provide Authorization: Bearer <admin_jwt> or X-MCP-Key header.',
      },
    }, 401);
  }

  // Initialize (MCP handshake)
  if (body.method === 'initialize') {
    const sessionId = crypto.randomUUID();
    c.header('mcp-session-id', sessionId);
    return c.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'demonz-development-admin-mcp',
          version: '1.0.0',
        },
      },
    });
  }

  // List tools
  if (body.method === 'tools/list') {
    return c.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS,
      },
    });
  }

  // Call tool
  if (body.method === 'tools/call') {
    const { name, arguments: args } = body.params || {};

    try {
      if (name === 'dzd_list_projects') {
        const limit = typeof args?.limit === 'number' ? args.limit : 20;
        const category = args?.category;
        const params: unknown[] = [limit];
        let where = '';
        if (category) {
          params.unshift(category);
          where = 'WHERE category = $1';
        }
        const projects = await query(
          c.env,
          `SELECT slug, name, tagline, category, version, downloads, is_featured, updated_at
           FROM projects ${where} ORDER BY downloads DESC LIMIT $${params.length}`,
          params,
        );
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
          },
        });
      }

      if (name === 'dzd_get_project') {
        const slug = args?.slug;
        const project = await queryOne(c.env, 'SELECT * FROM projects WHERE slug = $1 LIMIT 1', [slug]);
        if (!project) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Project "${slug}" not found.` }],
              isError: true,
            },
          });
        }
        const changelogs = await query(
          c.env,
          `SELECT version, title, changes, created_at as release_date
           FROM changelogs WHERE project_id = $1 ORDER BY created_at DESC LIMIT 5`,
          [(project as any).id],
        );
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify({ ...project, recent_changelogs: changelogs }, null, 2),
            }],
          },
        });
      }

      if (name === 'dzd_check_update') {
        const slug = args?.slug;
        const currentVersion = args?.current_version;
        const project = await queryOne<{
          id: string;
          slug: string;
          name: string;
          version: string | null;
          updated_at: string;
        }>(c.env, 'SELECT id, slug, name, version, updated_at FROM projects WHERE slug = $1 LIMIT 1', [slug]);

        if (!project) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Project "${slug}" not found.` }],
              isError: true,
            },
          });
        }

        const latestVersion = project.version || '1.0.0';
        const hasUpdate = currentVersion ? currentVersion !== latestVersion : true;

        const changelogs = await query(
          c.env,
          `SELECT version, title, changes, created_at as release_date
           FROM changelogs WHERE project_id = $1 ORDER BY created_at DESC LIMIT 3`,
          [project.id],
        );

        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project: project.name,
                slug: project.slug,
                current_version: currentVersion ?? null,
                latest_version: latestVersion,
                has_update: hasUpdate,
                download_url: `https://demonz.org/api/projects/download/${project.slug}`,
                release_date: project.updated_at,
                changelog: changelogs,
              }, null, 2),
            }],
          },
        });
      }

      if (name === 'dzd_list_articles') {
        const limit = typeof args?.limit === 'number' ? args.limit : 10;
        const category = args?.category;
        const params: unknown[] = [limit];
        let where = 'WHERE published = true';
        if (category) {
          params.unshift(category);
          where += ' AND category = $1';
        }
        const articles = await query(
          c.env,
          `SELECT slug, title, summary, category, published_at FROM articles ${where} ORDER BY published_at DESC LIMIT $${params.length}`,
          params,
        );
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(articles, null, 2) }],
          },
        });
      }

      if (name === 'dzd_get_article') {
        const slug = args?.slug;
        const article = await queryOne(
          c.env,
          'SELECT slug, title, summary, content, category, published_at FROM articles WHERE slug = $1 AND published = true LIMIT 1',
          [slug],
        );
        if (!article) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Article "${slug}" not found.` }],
              isError: true,
            },
          });
        }
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(article, null, 2) }],
          },
        });
      }

      if (name === 'dzd_search') {
        const q = `%${args?.query || ''}%`;
        const [projects, articles] = await Promise.all([
          query(c.env, 'SELECT slug, name, tagline FROM projects WHERE name ILIKE $1 OR tagline ILIKE $1 LIMIT 5', [q]),
          query(c.env, 'SELECT slug, title, summary FROM articles WHERE published = true AND (title ILIKE $1 OR summary ILIKE $1) LIMIT 5', [q]),
        ]);
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({ projects, articles }, null, 2) }],
          },
        });
      }

      if (name === 'dzd_get_stats') {
        const stats = await queryOne<{
          project_count: number;
          article_count: number;
          comment_count: number;
          total_downloads: number;
        }>(
          c.env,
          `SELECT
            (SELECT count(*)::int FROM projects) as project_count,
            (SELECT count(*)::int FROM articles WHERE published = true) as article_count,
            (SELECT count(*)::int FROM comments WHERE approved = true) as comment_count,
            (SELECT COALESCE(sum(downloads), 0)::int FROM projects) as total_downloads`,
        );
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
          },
        });
      }

      if (name === 'dzd_list_unread_messages') {
        const limit = typeof args?.limit === 'number' ? args.limit : 10;
        const messages = await query(
          c.env,
          'SELECT id, name, email, message, created_at FROM contact_messages WHERE read = false ORDER BY created_at DESC LIMIT $1',
          [limit],
        );
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(messages, null, 2) }],
          },
        });
      }

      if (name === 'dzd_list_pending_comments') {
        const comments = await query(
          c.env,
          `SELECT c.id, p.name as project_name, c.user_name, c.user_email, c.comment_text, c.created_at
           FROM comments c
           JOIN projects p ON c.project_id = p.id
           WHERE c.approved = false
           ORDER BY c.created_at DESC`,
        );
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(comments, null, 2) }],
          },
        });
      }

      if (name === 'dzd_approve_comment') {
        const commentId = args?.id;
        const count = await execute(c.env, 'UPDATE comments SET approved = true WHERE id = $1', [commentId]);
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{
              type: 'text',
              text: count > 0 ? `Comment ${commentId} approved successfully.` : `Comment ${commentId} not found.`,
            }],
          },
        });
      }

      if (name === 'dzd_update_project_version') {
        const { slug, version } = args || {};
        const count = await execute(
          c.env,
          'UPDATE projects SET version = $1, updated_at = NOW() WHERE slug = $2',
          [version, slug],
        );
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{
              type: 'text',
              text: count > 0 ? `Project "${slug}" version updated to ${version}.` : `Project "${slug}" not found.`,
            }],
          },
        });
      }

      if (name === 'dzd_create_changelog') {
        const { slug, version, title, changes } = args || {};
        const project = await queryOne<{ id: string }>(c.env, 'SELECT id FROM projects WHERE slug = $1 LIMIT 1', [slug]);
        if (!project) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Project "${slug}" not found.` }],
              isError: true,
            },
          });
        }
        await execute(
          c.env,
          'INSERT INTO changelogs (project_id, version, title, changes) VALUES ($1, $2, $3, $4)',
          [project.id, version, title, changes],
        );
        // Also update project version
        await execute(
          c.env,
          'UPDATE projects SET version = $1, updated_at = NOW() WHERE id = $2',
          [version, project.id],
        );
        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Changelog for ${slug} v${version} published successfully.` }],
          },
        });
      }

      if (name === 'dzd_create_project') {
        const {
          name: projName,
          slug,
          tagline,
          description,
          category,
          version = '1.0.0',
          downloads = 0,
          redirect_url = null,
          file_path = null,
          image_url = null,
          source_url = null,
          author = 'DemonZ Development',
          is_featured = false,
        } = args || {};

        if (!projName || !slug || !tagline || !description || !category) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: 'Error: name, slug, tagline, description, and category are required.' }],
              isError: true,
            },
          });
        }

        const existing = await queryOne(c.env, 'SELECT id FROM projects WHERE slug = $1', [slug]);
        if (existing) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Error: Project with slug "${slug}" already exists.` }],
              isError: true,
            },
          });
        }

        const created = await queryOne(
          c.env,
          `INSERT INTO projects (name, slug, tagline, description, category, version, downloads, redirect_url, file_path, image_url, source_url, author, is_featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id, slug, name, category, version`,
          [projName, slug, tagline, description, category, version, downloads, redirect_url, file_path, image_url, source_url, author, is_featured],
        );

        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Project "${projName}" (${slug}) created successfully!\n\n${JSON.stringify(created, null, 2)}` }],
          },
        });
      }

      if (name === 'dzd_update_project') {
        const { slug, ...updates } = args || {};
        if (!slug) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: 'Error: slug is required.' }], isError: true },
          });
        }

        const allowedFields = [
          'name', 'tagline', 'description', 'category', 'version',
          'downloads', 'redirect_url', 'file_path', 'image_url', 'source_url',
          'author', 'is_featured',
        ];
        const keys = Object.keys(updates).filter((k) => allowedFields.includes(k) && updates[k] !== undefined);
        if (keys.length === 0) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: 'No valid update fields provided.' }], isError: true },
          });
        }

        const values = keys.map((k) => updates[k]);
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        values.push(slug);
        const updated = await queryOne(
          c.env,
          `UPDATE projects SET ${setClauses}, updated_at = NOW() WHERE slug = $${values.length} RETURNING id, slug, name, category, version, updated_at`,
          values,
        );

        if (!updated) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: `Project "${slug}" not found.` }], isError: true },
          });
        }

        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Project "${slug}" updated successfully!\n\n${JSON.stringify(updated, null, 2)}` }],
          },
        });
      }

      if (name === 'dzd_create_article') {
        const {
          title,
          slug,
          summary,
          content,
          category = 'General',
          image_url = null,
          published = true,
        } = args || {};

        if (!title || !slug || !summary || !content) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: 'Error: title, slug, summary, and content are required.' }],
              isError: true,
            },
          });
        }

        const existing = await queryOne(c.env, 'SELECT id FROM articles WHERE slug = $1', [slug]);
        if (existing) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Error: Article with slug "${slug}" already exists.` }],
              isError: true,
            },
          });
        }

        const publishedAt = published ? new Date().toISOString() : null;
        const created = await queryOne(
          c.env,
          `INSERT INTO articles (title, slug, summary, content, category, image_url, published, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, slug, title, category, published`,
          [title, slug, summary, content, category, image_url, published, publishedAt],
        );

        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Article "${title}" (${slug}) created successfully!\n\n${JSON.stringify(created, null, 2)}` }],
          },
        });
      }

      if (name === 'dzd_update_article') {
        const { slug, ...updates } = args || {};
        if (!slug) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: 'Error: slug is required.' }], isError: true },
          });
        }

        const allowedFields = ['title', 'summary', 'content', 'category', 'image_url', 'published'];
        const keys = Object.keys(updates).filter((k) => allowedFields.includes(k) && updates[k] !== undefined);
        if (keys.length === 0) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: 'No valid update fields provided.' }], isError: true },
          });
        }

        const values = keys.map((k) => updates[k]);
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        values.push(slug);
        const updated = await queryOne(
          c.env,
          `UPDATE articles SET ${setClauses} WHERE slug = $${values.length} RETURNING id, slug, title, category, published`,
          values,
        );

        if (!updated) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: `Article "${slug}" not found.` }], isError: true },
          });
        }

        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Article "${slug}" updated successfully!\n\n${JSON.stringify(updated, null, 2)}` }],
          },
        });
      }

      if (name === 'dzd_create_studio_log') {
        const {
          title,
          body: logBody,
          tag = 'other',
          entry_date = new Date().toISOString().slice(0, 10),
          display_order = 0,
          published = true,
        } = args || {};

        if (!title || !logBody) {
          return c.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: 'Error: title and body are required.' }],
              isError: true,
            },
          });
        }

        const created = await queryOne(
          c.env,
          `INSERT INTO studio_log (entry_date, tag, title, body, display_order, published)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, entry_date, tag, title, published`,
          [entry_date, tag, title, logBody, display_order, published],
        );

        return c.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Studio log entry "${title}" created successfully!\n\n${JSON.stringify(created, null, 2)}` }],
          },
        });
      }

      return c.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool "${name}" not found` },
      }, 200);
    } catch (err) {
      return c.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: (err as Error).message },
      }, 200);
    }
  }

  return c.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method "${body.method}" not found` },
  }, 200);
});

// Supports MCP session termination (SEP-2350 / Streamable HTTP)
mcpRoutes.delete('/', async (c) => {
  return c.json({ jsonrpc: '2.0', result: { status: 'terminated' } }, 200);
});

export default mcpRoutes;
