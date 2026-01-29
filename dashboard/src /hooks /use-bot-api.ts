import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Helper to handle API responses that might fail validation silently if we aren't careful
async function fetchAndValidate<T>(url: string, schema: z.ZodSchema<T>) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  const data = await res.json();
  return schema.parse(data);
}

// === AUTH ===
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }
      
      return api.auth.login.responses[200].parse(await res.json());
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: api.auth.logout.method });
    }
  });
}

// === STATS ===
export function useBotStats() {
  return useQuery({
    queryKey: [api.bot.stats.path],
    queryFn: () => fetchAndValidate(api.bot.stats.path, api.bot.stats.responses[200]),
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

// === CONTROL ===
export function useBotControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.bot.control.input>) => {
      const res = await fetch(api.bot.control.path, {
        method: api.bot.control.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Control command failed");
      return api.bot.control.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bot.stats.path] });
    },
  });
}

// === LOGS ===
export function useLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: () => fetchAndValidate(api.logs.list.path, api.logs.list.responses[200]),
    refetchInterval: 3000,
  });
}

export function useClearLogs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.logs.clear.path, { method: api.logs.clear.method });
      if (!res.ok) throw new Error("Failed to clear logs");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
    },
  });
}

// === FEATURES ===
export function useFeatures() {
  return useQuery({
    queryKey: [api.features.list.path],
    queryFn: () => fetchAndValidate(api.features.list.path, api.features.list.responses[200]),
  });
}

export function useToggleFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isEnabled }: { id: number, isEnabled: boolean }) => {
      const url = buildUrl(api.features.toggle.path, { id });
      const res = await fetch(url, {
        method: api.features.toggle.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle feature");
      return api.features.toggle.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.features.list.path] });
    },
  });
}

// === GROUPS ===
export function useGroups() {
  return useQuery({
    queryKey: [api.groups.list.path],
    queryFn: () => fetchAndValidate(api.groups.list.path, api.groups.list.responses[200]),
  });
}

// === FILES ===
export function useFiles() {
  return useQuery({
    queryKey: [api.files.list.path],
    queryFn: () => fetchAndValidate(api.files.list.path, api.files.list.responses[200]),
  });
}

export function useFileContent(id: number | null) {
  return useQuery({
    queryKey: [api.files.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.files.get.path, { id });
      return fetchAndValidate(url, api.files.get.responses[200]);
    },
    enabled: !!id,
  });
}

export function useUpdateFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: number, content: string }) => {
      const url = buildUrl(api.files.update.path, { id });
      const res = await fetch(url, {
        method: api.files.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to save file");
      return api.files.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.files.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
    },
  });
}
