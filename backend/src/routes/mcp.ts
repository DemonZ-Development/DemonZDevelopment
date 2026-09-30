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

  // Check signed admin JWT token
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (token) {
      const valid = await verifyJWT(token, c.env?.JWT_SECRET || '');
      if (valid) {
        return true;
      }
    }
  }

  return false;
}

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

  // Initialize
  if (body.method === 'initialize') {
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

      return c.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool "${name}" not found` },
      }, 404);
    } catch (err) {
      return c.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: (err as Error).message },
      }, 500);
    }
  }

  return c.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method "${body.method}" not found` },
  }, 404);
});

export default mcpRoutes;
