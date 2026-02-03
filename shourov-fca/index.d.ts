declare module 'shourov-fca' {
  export interface AppState {
    key: string;
    value: string;
  }

  export interface Credentials {
    appState?: AppState[];
    email?: string;
    password?: string;
  }

  export interface LoginOptions {
    logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
    selfListen?: boolean;
    listenEvents?: boolean;
    updatePresence?: boolean;
    online?: boolean;
    autoReconnect?: boolean;
    reconnectDelay?: number;
    maxRetries?: number;
    retryDelay?: number;
    userAgent?: string;
    proxy?: string;
    forceLogin?: boolean;
    pauseLog?: boolean;
    enableHumanBehavior?: boolean;
    enableActivityPatterns?: boolean;
    activityProfile?: 'conservative' | 'balanced' | 'aggressive';
    dailyMessageLimit?: number;
    fingerprintPath?: string;
    typingSpeed?: { min: number; max: number };
    readDelay?: { min: number; max: number };
    actionDelay?: { min: number; max: number };
    thinkDelay?: { min: number; max: number };
    sessionDuration?: { min: number; max: number };
  }

  export interface ActivityStats {
    messagesThisHour: number;
    messagesThisDay: number;
    sessionStartTime: number;
    consecutiveActions: number;
    profile: string;
    limits: {
      hourly: number;
      daily: number;
    };
    usage: {
      hourlyPercent: number;
      dailyPercent: number;
    };
  }

  export interface CheckpointStats {
    totalDetections: number;
    lastDetection: number | null;
    timeSinceLastDetection: number | null;
  }

  export interface DeviceInfo {
    deviceId: string;
    clientId: string;
    machineId: string;
    sessionId: string;
    browser: {
      name: string;
      version: string;
    };
    screen: {
      width: number;
      height: number;
      colorDepth: number;
    };
    timezone: string;
    language: string;
    platform: string;
  }

  export interface MqttStats {
    connected: boolean;
    quality: number;
    reconnectAttempts: number;
    messageCount: number;
    lastMessageTime: number;
    timeSinceLastMessage: number;
  }

  export interface AntiBanStats {
    activity: ActivityStats;
    checkpoint: CheckpointStats;
    device: DeviceInfo;
    mqtt: MqttStats | null;
    accountHealth: boolean;
  }

  export interface Message {
    body?: string;
    attachment?: any | any[];
    sticker?: string;
    url?: string;
  }

  export interface MessageEvent {
    type: 'message' | 'typ' | 'presence' | 'event';
    threadID: string;
    messageID?: string;
    senderID?: string;
    body?: string;
    timestamp?: number;
    attachments?: any[];
    mentions?: any[];
    isGroup?: boolean;
  }

  export interface ApiResult {
    success: boolean;
    data?: any;
    error?: string;
  }

  export interface SendMessageResult {
    success: boolean;
    threadID?: string;
    messageID?: string;
    error?: string;
  }

  export interface ThreadInfo {
    success: boolean;
    data?: any;
    error?: string;
  }

  export interface UserInfo {
    success: boolean;
    data?: any;
    error?: string;
  }

  export class ShourovAPI {
    constructor(appState: AppState[], options?: LoginOptions);
    
    initialize(): Promise<any>;
    
    sendMessage(message: string | Message, threadID: string, messageID?: string | null): Promise<SendMessageResult>;
    
    editMessage(newMessage: string, messageID: string): Promise<ApiResult>;
    
    unsendMessage(messageID: string): Promise<ApiResult>;
    
    setMessageReaction(reaction: string, messageID: string): Promise<ApiResult>;
    
    sendTypingIndicator(threadID: string, isTyping?: boolean): Promise<ApiResult>;
    
    markAsRead(threadID: string): Promise<ApiResult>;
    
    markAsSeen(threadID: string): Promise<ApiResult>;
    
    getThreadInfo(threadID: string): Promise<ThreadInfo>;
    
    getThreadHistory(threadID: string, amount?: number, timestamp?: number | null): Promise<ThreadInfo>;
    
    changeThreadColor(color: string, threadID: string): Promise<ApiResult>;
    
    changeThreadEmoji(emoji: string, threadID: string): Promise<ApiResult>;
    
    changeThreadNickname(nickname: string, threadID: string, userID: string): Promise<ApiResult>;
    
    addUserToGroup(userID: string, threadID: string): Promise<ApiResult>;
    
    removeUserFromGroup(userID: string, threadID: string): Promise<ApiResult>;
    
    muteThread(threadID: string, seconds?: number): Promise<ApiResult>;
    
    unmuteThread(threadID: string): Promise<ApiResult>;
    
    getUserInfo(userID: string | string[]): Promise<UserInfo>;
    
    searchUsers(searchText: string, limit?: number): Promise<UserInfo>;
    
    getFriendsList(): Promise<UserInfo>;
    
    blockUser(userID: string): Promise<ApiResult>;
    
    unblockUser(userID: string): Promise<ApiResult>;
    
    changePresence(online?: boolean): Promise<ApiResult>;
    
    listenMqtt(callback: (error: Error | null, event: MessageEvent | null) => void): () => void;
    
    getCurrentUserID(): string | null;
    
    getAppState(): AppState[];
    
    setOptions(options: Partial<LoginOptions>): void;
    
    getAntiBanStats(): AntiBanStats;
    
    setActivityProfile(profileName: 'conservative' | 'balanced' | 'aggressive'): void;
    
    logout(): void;
    
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
  }

  export type LoginCallback = (error: Error | null, api: ShourovAPI | null) => void;

  export interface LoginFunction {
    (credentials: Credentials, callback: LoginCallback): void;
    (credentials: Credentials, options: Partial<LoginOptions>, callback: LoginCallback): void;
    promises(credentials: Credentials, options?: Partial<LoginOptions>): Promise<ShourovxAPI>;
  }

  export const login: LoginFunction;
  export { ShourovAPI };
}
