import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function ownedDeal(id: string, workspaceId: string) {
  const d = await prisma.deal.findUnique({ where: { id } });
  return d && d.workspaceId === workspaceId ? d : null;
}

// Link an existing contact (or create+link a new one) to this deal.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;
  const deal = await ownedDeal(id, user.workspaceId);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const b = await req.json().catch(() => ({}));

  let contactId: string | undefined = b.contactId;

  // Create a new contact inline if no existing one was chosen.
  if (!contactId) {
    if (!b.name?.trim()) return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
    const created = await prisma.contact.create({
      data: {
        workspaceId: user.workspaceId,
        accountId: deal.accountId, // attach to the deal's company by default
        name: b.name.trim(),
        email: b.email?.trim() || null,
        title: b.title?.trim() || null,
        buyingRole: b.buyingRole || null,
      },
    });
    contactId = created.id;
  } else {
    // Validate the existing contact belongs to this workspace.
    const c = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!c || c.workspaceId !== user.workspaceId) {
      return NextResponse.json({ error: "Invalid contact." }, { status: 400 });
    }
  }

  await prisma.deal.update({
    where: { id },
    data: { contacts: { connect: { id: contactId } } },
  });
  return NextResponse.json({ ok: true, contactId });
}

// Unlink a contact from this deal (does not delete the contact).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;
  const deal = await ownedDeal(id, user.workspaceId);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const contactId = req.nextUrl.searchParams.get("contactId");
  if (!contactId) return NextResponse.json({ error: "contactId required" }, { status: 400 });
  await prisma.deal.update({ where: { id }, data: { contacts: { disconnect: { id: contactId } } } });
  return NextResponse.json({ ok: true });
}
