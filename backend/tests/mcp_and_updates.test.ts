import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { signJWT } from '../src/lib/jwt';

describe('Public & MCP endpoints', () => {
  const JWT_SECRET = 'test-secret-key-32-bytes-minimum-length-dzd';
  const TEST_MOCK_KEY = 'mock_mcp_test_token';
  const mockEnv = {
    JWT_SECRET,
    ADMIN_PASSWORD_HASH: 'hash',
    CORS_ORIGIN: 'https://demonz.org',
    MCP_SECRET: TEST_MOCK_KEY,
  };

  it('responds with health check status', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const data = await res.json<any>();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  describe('MCP Protocol Server (/api/mcp)', () => {
    it('handles unauthenticated ping request', async () => {
      const res = await app.request('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'ping',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json<any>();
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(1);
      expect(data.result).toEqual({});
    });

    it('rejects unauthenticated tools/list with 401', async () => {
      const res = await app.request(
        '/api/mcp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
          }),
        },
        mockEnv,
      );

      expect(res.status).toBe(401);
      const data = await res.json<any>();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32000);
      expect(data.error.message).toContain('Unauthorized');
    });

    it('allows initialize request with admin JWT', async () => {
      const token = await signJWT({ role: 'admin' }, JWT_SECRET);
      const res = await app.request(
        '/api/mcp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'init-1',
            method: 'initialize',
          }),
        },
        mockEnv,
      );

      expect(res.status).toBe(200);
      const data = await res.json<any>();
      expect(data.jsonrpc).toBe('2.0');
      expect(data.result.serverInfo.name).toBe('demonz-development-admin-mcp');
      expect(data.result.capabilities.tools).toBeDefined();
    });

    it('lists available MCP tools with X-MCP-Key header', async () => {
      const res = await app.request(
        '/api/mcp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MCP-Key': TEST_MOCK_KEY,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/list',
          }),
        },
        mockEnv,
      );

      expect(res.status).toBe(200);
      const data = await res.json<any>();
      expect(data.jsonrpc).toBe('2.0');
      expect(Array.isArray(data.result.tools)).toBe(true);

      const toolNames = data.result.tools.map((t: any) => t.name);
      expect(toolNames).toContain('dzd_list_projects');
      expect(toolNames).toContain('dzd_get_project');
      expect(toolNames).toContain('dzd_check_update');
      expect(toolNames).toContain('dzd_list_articles');
      expect(toolNames).toContain('dzd_get_article');
      expect(toolNames).toContain('dzd_search');
      expect(toolNames).toContain('dzd_get_stats');
      expect(toolNames).toContain('dzd_list_unread_messages');
      expect(toolNames).toContain('dzd_list_pending_comments');
      expect(toolNames).toContain('dzd_approve_comment');
      expect(toolNames).toContain('dzd_create_changelog');
      expect(toolNames).toContain('dzd_update_project_version');
    });

    it('returns error for unknown tool when authenticated', async () => {
      const token = await signJWT({ role: 'admin' }, JWT_SECRET);
      const res = await app.request(
        '/api/mcp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 99,
            method: 'tools/call',
            params: { name: 'non_existent_tool', arguments: {} },
          }),
        },
        mockEnv,
      );

      expect(res.status).toBe(404);
      const data = await res.json<any>();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32601);
    });

    it('rejects malformed jsonrpc request', async () => {
      const res = await app.request('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '1.0',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json<any>();
      expect(data.error.code).toBe(-32600);
    });
  });
});
