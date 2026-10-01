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
      expect(toolNames).toContain('dzd_create_project');
      expect(toolNames).toContain('dzd_update_project');
      expect(toolNames).toContain('dzd_create_article');
      expect(toolNames).toContain('dzd_update_article');
      expect(toolNames).toContain('dzd_create_studio_log');
      expect(toolNames.length).toBe(17);
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

      expect(res.status).toBe(200);
      const data = await res.json<any>();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32601);
    });

    it('handles MCP notifications and handshake smoothly', async () => {
      const token = await signJWT({ role: 'admin', scope: 'mcp' }, JWT_SECRET);
      
      // initialize
      const initRes = await app.request(
        '/api/mcp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: { protocolVersion: '2024-11-05' },
          }),
        },
        mockEnv,
      );
      expect(initRes.status).toBe(200);
      expect(initRes.headers.get('mcp-session-id')).toBeDefined();

      // notifications/initialized
      const notifyRes = await app.request(
        '/api/mcp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'notifications/initialized',
          }),
        },
        mockEnv,
      );
      expect(notifyRes.status).toBe(200);
    });

    it('generates 12-hour MCP access token via POST /api/admin/mcp/token', async () => {
      const adminToken = await signJWT({ role: 'admin' }, JWT_SECRET);
      const res = await app.request(
        '/api/admin/mcp/token',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
        mockEnv,
      );

      expect(res.status).toBe(200);
      const data = await res.json<any>();
      expect(data.token).toBeDefined();
      expect(data.expires_in_hours).toBe(12);
      expect(data.expires_at).toBeDefined();
      expect(data.server_url).toBeDefined();

      // Test using this generated 12-hour token in X-MCP-Key header
      const mcpRes = await app.request(
        '/api/mcp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MCP-Key': data.token,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'test-12h',
            method: 'tools/list',
          }),
        },
        mockEnv,
      );

      expect(mcpRes.status).toBe(200);
      const mcpData = await mcpRes.json<any>();
      expect(mcpData.result.tools).toBeDefined();
    });

    it('rejects expired MCP token with 401', async () => {
      // Create a token expired in the past (-10 seconds)
      const expiredToken = await signJWT({ role: 'admin', scope: 'mcp' }, JWT_SECRET, -10);
      const res = await app.request(
        '/api/mcp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MCP-Key': expiredToken,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'expired-1',
            method: 'tools/list',
          }),
        },
        mockEnv,
      );

      expect(res.status).toBe(401);
      const data = await res.json<any>();
      expect(data.error.code).toBe(-32000);
    });

    it('validates required fields when calling dzd_create_project', async () => {
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
            id: 'create-proj-1',
            method: 'tools/call',
            params: {
              name: 'dzd_create_project',
              arguments: { name: 'Test' }, // missing slug, tagline, description, category
            },
          }),
        },
        mockEnv,
      );

      expect(res.status).toBe(200);
      const data = await res.json<any>();
      expect(data.result.isError).toBe(true);
      expect(data.result.content[0].text).toContain('Error: name, slug, tagline, description, and category are required.');
    });

    it('validates required fields when calling dzd_create_article', async () => {
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
            id: 'create-art-1',
            method: 'tools/call',
            params: {
              name: 'dzd_create_article',
              arguments: { title: 'Test Article' }, // missing slug, summary, content
            },
          }),
        },
        mockEnv,
      );

      expect(res.status).toBe(200);
      const data = await res.json<any>();
      expect(data.result.isError).toBe(true);
      expect(data.result.content[0].text).toContain('Error: title, slug, summary, and content are required.');
    });

    it('provides server discovery info via GET /api/mcp', async () => {
      const res = await app.request('/api/mcp', { method: 'GET' }, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json<any>();
      expect(data.status).toBe('ok');
      expect(data.server).toBe('demonz-development-admin-mcp');
      expect(data.tools_count).toBe(17);
    });
  });
});
