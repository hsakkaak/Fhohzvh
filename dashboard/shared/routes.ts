import { z } from 'zod';
import { insertUserSchema, insertLogSchema, insertFeatureToggleSchema, insertGroupSchema, insertBotFileSchema, insertApiSchema, insertDownloadSchema, apis, downloads } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ token: z.string(), user: z.object({ username: z.string(), isAdmin: z.boolean() }) }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    }
  },
  bot: {
    stats: {
      method: 'GET' as const,
      path: '/api/bot/stats',
      responses: {
        200: z.object({
          status: z.enum(["online", "offline", "maintenance", "restarting"]),
          uptime: z.string(),
          activeThreads: z.number(),
          totalMessages: z.number(),
          cpuUsage: z.number(),
          memoryUsage: z.number(),
        }),
      },
    },
    control: {
      method: 'POST' as const,
      path: '/api/bot/control',
      input: z.object({
        action: z.enum(['start', 'stop', 'restart']),
      }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string(), newStatus: z.string() }),
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          level: z.string(),
          message: z.string(),
          timestamp: z.string().or(z.date()),
        })),
      },
    },
    clear: {
      method: 'DELETE' as const,
      path: '/api/logs',
      responses: {
        204: z.void(),
      },
    }
  },
  features: {
    list: {
      method: 'GET' as const,
      path: '/api/features',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          key: z.string(),
          label: z.string(),
          description: z.string().optional().nullable(),
          isEnabled: z.boolean().nullable(),
          neonColor: z.string().nullable(),
        })),
      },
    },
    toggle: {
      method: 'PATCH' as const,
      path: '/api/features/:id',
      input: z.object({
        isEnabled: z.boolean(),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          isEnabled: z.boolean(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  groups: {
    list: {
      method: 'GET' as const,
      path: '/api/groups',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          name: z.string(),
          memberCount: z.number().nullable(),
          status: z.string().nullable(),
        })),
      },
    },
  },
  files: {
    list: {
      method: 'GET' as const,
      path: '/api/files',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          filename: z.string(),
          size: z.string(),
          lastModified: z.string().or(z.date()).nullable(),
        })),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/files/:id',
      responses: {
        200: z.object({
          id: z.number(),
          filename: z.string(),
          content: z.string().nullable(),
        }),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/files/:id',
      input: z.object({
        content: z.string(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    }
  },
  apis: {
    list: {
      method: 'GET' as const,
      path: '/api/apis',
      responses: {
        200: z.array(z.custom<typeof apis.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/apis',
      input: insertApiSchema,
      responses: {
        201: z.custom<typeof apis.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    toggle: {
      method: 'PATCH' as const,
      path: '/api/apis/:id',
      input: z.object({ isEnabled: z.boolean() }),
      responses: {
        200: z.custom<typeof apis.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/apis/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  downloads: {
    list: {
      method: 'GET' as const,
      path: '/api/downloads',
      responses: {
        200: z.array(z.custom<typeof downloads.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/downloads',
      input: insertDownloadSchema,
      responses: {
        201: z.custom<typeof downloads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  ai: {
    chat: {
      method: 'POST' as const,
      path: '/api/ai/chat',
      input: z.object({ message: z.string(), lang: z.enum(['en', 'bn']) }),
      responses: {
        200: z.object({ response: z.string() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
