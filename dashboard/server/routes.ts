import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === AUTH ===
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      res.json({ token, user: { username: user.username, isAdmin: user.isAdmin ?? false } });
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    res.json({ message: "Logged out" });
  });

  // === BOT STATS & CONTROL ===
  app.get(api.bot.stats.path, async (req, res) => {
    const stats = await storage.getBotStats();
    res.json(stats);
  });

  app.post(api.bot.control.path, async (req, res) => {
    try {
      const { action } = api.bot.control.input.parse(req.body);
      
      let newStatus = "online";
      if (action === "stop") newStatus = "offline";
      if (action === "restart") newStatus = "restarting";

      await storage.updateBotStats({ status: newStatus as any });
      await storage.addLog("info", `Bot ${action} command executed by user`);
      
      if (action === "restart") {
        setTimeout(async () => {
          await storage.updateBotStats({ status: "online", uptime: "0d 0h 0m" });
          await storage.addLog("success", "Bot restarted successfully");
        }, 3000);
      }

      res.json({ success: true, message: `Bot ${action}ed successfully`, newStatus });
    } catch (e) {
      res.status(400).json({ message: "Invalid action" });
    }
  });

  // === LOGS ===
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.delete(api.logs.clear.path, async (req, res) => {
    await storage.clearLogs();
    res.status(204).send();
  });

  // === FEATURES ===
  app.get(api.features.list.path, async (req, res) => {
    const features = await storage.getFeatureToggles();
    res.json(features);
  });

  app.patch(api.features.toggle.path, async (req, res) => {
    const id = Number(req.params.id);
    const { isEnabled } = api.features.toggle.input.parse(req.body);
    
    const updated = await storage.toggleFeature(id, isEnabled);
    if (!updated) return res.status(404).json({ message: "Feature not found" });
    
    await storage.addLog("warn", `Feature '${updated.key}' ${isEnabled ? 'enabled' : 'disabled'}`);
    res.json(updated);
  });

  // === GROUPS ===
  app.get(api.groups.list.path, async (req, res) => {
    const groups = await storage.getGroups();
    res.json(groups);
  });

  // === FILES ===
  app.get(api.files.list.path, async (req, res) => {
    const files = await storage.getFiles();
    res.json(files);
  });

  app.get(api.files.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const file = await storage.getFile(id);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.json(file);
  });

  app.put(api.files.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const { content } = api.files.update.input.parse(req.body);
    const success = await storage.updateFile(id, content);
    if (!success) return res.status(404).json({ message: "File not found" });
    
    await storage.addLog("info", `File updated: ID ${id}`);
    res.json({ success: true });
  });

  // === APIS ===
  app.get(api.apis.list.path, async (req, res) => {
    const apisList = await storage.getApis();
    res.json(apisList);
  });

  app.post(api.apis.create.path, async (req, res) => {
    try {
      const input = api.apis.create.input.parse(req.body);
      const newApi = await storage.createApi(input);
      res.status(201).json(newApi);
    } catch (e) {
      res.status(400).json({ message: "Invalid API data" });
    }
  });

  app.patch(api.apis.toggle.path, async (req, res) => {
    const id = Number(req.params.id);
    const { isEnabled } = api.apis.toggle.input.parse(req.body);
    const updated = await storage.toggleApi(id, isEnabled);
    if (!updated) return res.status(404).json({ message: "API not found" });
    res.json(updated);
  });

  app.delete(api.apis.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const success = await storage.deleteApi(id);
    if (!success) return res.status(404).json({ message: "API not found" });
    res.status(204).send();
  });

  // === DOWNLOADS ===
  app.get(api.downloads.list.path, async (req, res) => {
    const downloadList = await storage.getDownloads();
    res.json(downloadList);
  });

  app.post(api.downloads.create.path, async (req, res) => {
    try {
      const input = api.downloads.create.input.parse(req.body);
      const newDownload = await storage.createDownload(input);
      res.status(201).json(newDownload);
    } catch (e) {
      res.status(400).json({ message: "Invalid download data" });
    }
  });

  // === AI CHAT ===
  app.post(api.ai.chat.path, async (req, res) => {
    const { message, lang } = api.ai.chat.input.parse(req.body);
    
    // Simple simulated AI responses
    let response = "";
    if (lang === 'bn') {
      response = `আমি শৌরভ এআই। আপনি জিজ্ঞেস করেছেন: "${message}"। আমি আপনাকে ড্যাশবোর্ড নিয়ন্ত্রণে সাহায্য করতে পারি।`;
    } else {
      response = `I am Shourov AI. You asked: "${message}". I can help you manage your dashboard features and bot controls.`;
    }
    
    res.json({ response });
  });

  // === SEED DATA ===
  await seedData();

  return httpServer;
}

async function seedData() {
  const existingUser = await storage.getUserByUsername("admin");
  if (!existingUser) {
    await storage.createUser({ 
      username: "admin", 
      password: "password123",
      isAdmin: true 
    });

    await storage.addLog("success", "System initialized");
    await storage.addLog("info", "Connected to database");

    await storage.createFeatureToggle({ 
      key: "auto_reply", 
      label: "Auto Reply", 
      description: "Automatically reply to new messages", 
      isEnabled: true,
      neonColor: "#39ff14"
    });

    await storage.createGroup({ name: "Developers Hub", memberCount: 1250, status: "active" });

    await storage.createFile({ 
      filename: "config.json", 
      size: "2 KB", 
      content: JSON.stringify({ version: "1.0.0", theme: "dark" }, null, 2) 
    });

    // Seed some APIs
    await storage.createApi({
      name: "Video Download API v1",
      endpoint: "https://api.shourov.com/v1/video",
      key: "sk_live_xxxx",
      type: "video",
      isEnabled: true,
      neonColor: "#00ffff"
    });

    await storage.createApi({
      name: "Image Search AI",
      endpoint: "https://api.shourov.com/v1/image",
      key: "api_key_yyyy",
      type: "image",
      isEnabled: true,
      neonColor: "#ff00ff"
    });

    // Seed some downloads
    await storage.createDownload({
      filename: "bot_backup_jan.zip",
      type: "file",
      url: "/downloads/backup.zip",
      size: "45 MB",
      status: "completed"
    });
  }
}
