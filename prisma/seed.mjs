import { PrismaClient, Role, Priority, ProjectStatus, TaskStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@taskflow.dev" },
    update: {},
    create: {
      name: "Avery Stone",
      email: "admin@taskflow.dev",
      passwordHash,
      role: Role.ADMIN,
      title: "Product Ops Lead",
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@taskflow.dev" },
    update: {},
    create: {
      name: "Jordan Lee",
      email: "member@taskflow.dev",
      passwordHash,
      role: Role.MEMBER,
      title: "Frontend Engineer",
    },
  });

  const team = await prisma.team.upsert({
    where: { slug: "north-star" },
    update: {},
    create: {
      name: "North Star",
      slug: "north-star",
      description: "Core delivery squad for the internal platform.",
      members: {
        create: [
          { user: { connect: { id: admin.id } } },
          { user: { connect: { id: member.id } } },
        ],
      },
    },
  });

  const project = await prisma.project.upsert({
    where: { key: "NORTH-01" },
    update: {},
    create: {
      name: "Q3 Platform Refresh",
      key: "NORTH-01",
      description: "Revamp onboarding, billing, and reporting flows.",
      status: ProjectStatus.ACTIVE,
      color: "#22d3ee",
      teamId: team.id,
      ownerId: admin.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Design the billing upgrade flow",
        description: "Map the subscription journey and edge cases.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        order: 1,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assigneeId: member.id,
        creatorId: admin.id,
        labels: ["billing", "ux"],
      },
      {
        title: "Implement analytics panel",
        description: "Add charts for completion rate and overdue work.",
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        order: 2,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        projectId: project.id,
        assigneeId: member.id,
        creatorId: admin.id,
        labels: ["charts", "dashboard"],
      },
    ],
  });

  console.log({ admin: admin.email, member: member.email, team: team.slug, project: project.key });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
