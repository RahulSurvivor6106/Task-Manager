import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { randomUUID } from "crypto";
import type { AuthUser } from "./contracts";

type LocalUserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "MEMBER";
  title?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type LocalAuthData = {
  users: LocalUserRecord[];
};

const STORE_PATH = join(process.cwd(), ".data", "auth-users.json");

async function readStore(): Promise<LocalAuthData> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as LocalAuthData;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { users: [] };
  }
}

async function writeStore(data: LocalAuthData) {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function toAuthUser(user: LocalUserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    avatarUrl: user.avatarUrl,
  };
}

export async function findLocalUserByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null> {
  const store = await readStore();
  const normalized = email.trim().toLowerCase();
  // prefer the most recently created matching entry in case duplicates exist
  for (let i = store.users.length - 1; i >= 0; i--) {
    const entry = store.users[i];
    if (entry.email.toLowerCase() === normalized) {
      return {
        ...toAuthUser(entry),
        passwordHash: entry.passwordHash,
      };
    }
  }
  return null;
}

export async function findLocalUserById(id: string): Promise<AuthUser | null> {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === id);
  return user ? toAuthUser(user) : null;
}

export async function createLocalUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "MEMBER";
  title?: string;
}): Promise<AuthUser> {
  const store = await readStore();
  const now = new Date().toISOString();
  const user: LocalUserRecord = {
    id: randomUUID(),
    name: data.name,
    email: data.email.trim().toLowerCase(),
    passwordHash: data.passwordHash,
    role: data.role,
    title: data.title,
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(user);
  await writeStore(store);
  return toAuthUser(user);
}
