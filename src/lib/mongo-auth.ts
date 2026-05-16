import { ObjectId } from "mongodb";
import connectMongo from "./mongo";
import bcrypt from "bcryptjs";
import type { AuthUser } from "./contracts";
import { createLocalUser, findLocalUserByEmail, findLocalUserById } from "./local-auth-store";

export interface MongoUser {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "MEMBER";
  title?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const db = await connectMongo();
    if (!db) {
      const local = await findLocalUserByEmail(email);
      if (!local) return null;
      return {
        id: local.id,
        name: local.name,
        email: local.email,
        role: local.role,
        title: local.title,
        avatarUrl: local.avatarUrl,
      };
    }

    const coll = db.db.collection<MongoUser>("users");
    const user = await coll.findOne({ email });
    if (!user) return null;

    return {
      id: user._id?.toString() || user.id || "",
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatarUrl: user.avatarUrl,
    };
  } catch (error) {
    console.warn("MongoDB findUserByEmail failed, using local auth store:", error);
    const local = await findLocalUserByEmail(email);
    if (!local) return null;
    return {
      id: local.id,
      name: local.name,
      email: local.email,
      role: local.role,
      title: local.title,
      avatarUrl: local.avatarUrl,
    };
  }
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  try {
    const db = await connectMongo();
    if (!db) {
      return findLocalUserById(id);
    }

    const coll = db.db.collection<MongoUser>("users");
    const user = await coll.findOne({ _id: new ObjectId(id) });
    if (!user) return null;

    return {
      id: user._id?.toString() || "",
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatarUrl: user.avatarUrl,
    };
  } catch (error) {
    console.warn("MongoDB findUserById failed, using local auth store:", error);
    return findLocalUserById(id);
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "MEMBER";
  title?: string;
}): Promise<AuthUser> {
  try {
    const db = await connectMongo();
    if (!db) {
      return createLocalUser(data);
    }

    const coll = db.db.collection<MongoUser>("users");
    const result = await coll.insertOne({
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      title: data.title,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      title: data.title,
    };
  } catch (error) {
    console.warn("MongoDB createUser failed, using local auth store:", error);
    return createLocalUser(data);
  }
}

export async function verifyUserPassword(email: string, password: string): Promise<AuthUser | null> {
  try {
    const db = await connectMongo();
    if (!db) {
      const local = await findLocalUserByEmail(email);
      if (!local) return null;

      const isValidLocal = await bcrypt.compare(password, local.passwordHash);
      if (!isValidLocal) return null;

      return {
        id: local.id,
        name: local.name,
        email: local.email,
        role: local.role,
        title: local.title,
        avatarUrl: local.avatarUrl,
      };
    }

    const coll = db.db.collection<MongoUser>("users");
    const user = await coll.findOne({ email });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return {
      id: user._id?.toString() || "",
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatarUrl: user.avatarUrl,
    };
  } catch (error) {
    console.warn("MongoDB verifyUserPassword failed, using local auth store:", error);
    const local = await findLocalUserByEmail(email);
    if (!local) return null;

    const isValid = await bcrypt.compare(password, local.passwordHash);
    if (!isValid) return null;

    return {
      id: local.id,
      name: local.name,
      email: local.email,
      role: local.role,
      title: local.title,
      avatarUrl: local.avatarUrl,
    };
  }
}
