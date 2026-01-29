import { 
  users, logs, featureToggles, groups, botFiles, apis, downloads,
  type User, type Log, type FeatureToggle, type Group, type BotFile, type BotStats,
  type InsertUser, type ApiEntry, type DownloadEntry
} from "@shared/schema";

export interface IStorage {
  // User
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Logs
  getLogs(): Promise<Log[]>;
  addLog(level: string, message: string): Promise<Log>;
  clearLogs(): Promise<void>;

  // Stats
  getBotStats(): Promise<BotStats>;
  updateBotStats(stats: Partial<BotStats>): Promise<BotStats>;

  // Features
  getFeatureToggles(): Promise<FeatureToggle[]>;
  toggleFeature(id: number, isEnabled: boolean): Promise<FeatureToggle | undefined>;
  createFeatureToggle(toggle: Omit<FeatureToggle, "id">): Promise<FeatureToggle>;

  // Groups
  getGroups(): Promise<Group[]>;
  createGroup(group: Omit<Group, "id" | "joinedAt">): Promise<Group>;

  // Files
  getFiles(): Promise<BotFile[]>;
  getFile(id: number): Promise<BotFile | undefined>;
  updateFile(id: number, content: string): Promise<boolean>;
  createFile(file: Omit<BotFile, "id" | "lastModified">): Promise<BotFile>;

  // APIs
  getApis(): Promise<ApiEntry[]>;
  createApi(api: Omit<ApiEntry, "id">): Promise<ApiEntry>;
  toggleApi(id: number, isEnabled: boolean): Promise<ApiEntry | undefined>;
  deleteApi(id: number): Promise<boolean>;

  // Downloads
  getDownloads(): Promise<DownloadEntry[]>;
  createDownload(download: Omit<DownloadEntry, "id" | "timestamp">): Promise<DownloadEntry>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private logs: Map<number, Log>;
  private featureToggles: Map<number, FeatureToggle>;
  private groups: Map<number, Group>;
  private files: Map<number, BotFile>;
  private apis: Map<number, ApiEntry>;
  private downloads: Map<number, DownloadEntry>;
  private botStats: BotStats;
  
  private userIdCounter = 1;
  private logIdCounter = 1;
  private featureIdCounter = 1;
  private groupIdCounter = 1;
  private fileIdCounter = 1;
  private apiIdCounter = 1;
  private downloadIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.logs = new Map();
    this.featureToggles = new Map();
    this.groups = new Map();
    this.files = new Map();
    this.apis = new Map();
    this.downloads = new Map();
    this.botStats = {
      status: "online",
      uptime: "0d 0h 0m",
      activeThreads: 0,
      totalMessages: 0,
      cpuUsage: 0,
      memoryUsage: 0,
    };
  }

  // User
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, isAdmin: true };
    this.users.set(id, user);
    return user;
  }

  // Logs
  async getLogs(): Promise<Log[]> {
    return Array.from(this.logs.values()).sort((a, b) => b.id - a.id);
  }

  async addLog(level: string, message: string): Promise<Log> {
    const id = this.logIdCounter++;
    const log: Log = { id, level, message, timestamp: new Date() };
    this.logs.set(id, log);
    return log;
  }

  async clearLogs(): Promise<void> {
    this.logs.clear();
  }

  // Stats
  async getBotStats(): Promise<BotStats> {
    this.botStats.cpuUsage = Math.floor(Math.random() * 30) + 10;
    this.botStats.memoryUsage = Math.floor(Math.random() * 200) + 100;
    this.botStats.totalMessages += Math.floor(Math.random() * 5);
    return this.botStats;
  }

  async updateBotStats(stats: Partial<BotStats>): Promise<BotStats> {
    this.botStats = { ...this.botStats, ...stats };
    return this.botStats;
  }

  // Features
  async getFeatureToggles(): Promise<FeatureToggle[]> {
    return Array.from(this.featureToggles.values());
  }

  async toggleFeature(id: number, isEnabled: boolean): Promise<FeatureToggle | undefined> {
    const toggle = this.featureToggles.get(id);
    if (!toggle) return undefined;
    const updated = { ...toggle, isEnabled };
    this.featureToggles.set(id, updated);
    return updated;
  }

  async createFeatureToggle(toggle: Omit<FeatureToggle, "id">): Promise<FeatureToggle> {
    const id = this.featureIdCounter++;
    const newToggle = { ...toggle, id };
    this.featureToggles.set(id, newToggle);
    return newToggle;
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async createGroup(group: Omit<Group, "id" | "joinedAt">): Promise<Group> {
    const id = this.groupIdCounter++;
    const newGroup = { ...group, id, joinedAt: new Date() };
    this.groups.set(id, newGroup);
    return newGroup;
  }

  // Files
  async getFiles(): Promise<BotFile[]> {
    return Array.from(this.files.values());
  }

  async getFile(id: number): Promise<BotFile | undefined> {
    return this.files.get(id);
  }

  async updateFile(id: number, content: string): Promise<boolean> {
    const file = this.files.get(id);
    if (!file) return false;
    this.files.set(id, { ...file, content });
    return true;
  }

  async createFile(file: Omit<BotFile, "id" | "lastModified">): Promise<BotFile> {
    const id = this.fileIdCounter++;
    const newFile = { ...file, id, lastModified: new Date() };
    this.files.set(id, newFile);
    return newFile;
  }

  // APIs
  async getApis(): Promise<ApiEntry[]> {
    return Array.from(this.apis.values());
  }

  async createApi(api: Omit<ApiEntry, "id">): Promise<ApiEntry> {
    const id = this.apiIdCounter++;
    const newApi = { ...api, id };
    this.apis.set(id, newApi);
    return newApi;
  }

  async toggleApi(id: number, isEnabled: boolean): Promise<ApiEntry | undefined> {
    const apiEntry = this.apis.get(id);
    if (!apiEntry) return undefined;
    const updated = { ...apiEntry, isEnabled };
    this.apis.set(id, updated);
    return updated;
  }

  async deleteApi(id: number): Promise<boolean> {
    return this.apis.delete(id);
  }

  // Downloads
  async getDownloads(): Promise<DownloadEntry[]> {
    return Array.from(this.downloads.values());
  }

  async createDownload(download: Omit<DownloadEntry, "id" | "timestamp">): Promise<DownloadEntry> {
    const id = this.downloadIdCounter++;
    const newDownload = { ...download, id, timestamp: new Date() };
    this.downloads.set(id, newDownload);
    return newDownload;
  }
}

export const storage = new MemStorage();
