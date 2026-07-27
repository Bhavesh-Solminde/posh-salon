"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma, TX_OPTS } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { ok, zodFail, type ActionResult } from "@/lib/actions";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  sku: z.string().optional(),
  category: z.string().optional(),
  use: z.enum(["RETAIL", "IN_SALON", "BOTH"]),
  salePrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().int().min(0),
});

export async function saveProduct(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireStaff();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, sku, category, ...rest } = parsed.data;
  const data = {
    ...rest,
    sku: sku || null,
    category: category || null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) await prisma.product.update({ where: { id }, data });
  else await prisma.product.create({ data });
  revalidatePath("/admin/products");
  return ok(id ? "Product updated." : "Product created.");
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  revalidatePath("/admin/products");
  return ok("Product removed.");
}

const stockSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["PURCHASE", "ADJUSTMENT"]),
  quantity: z.coerce.number().int(),
  unitCost: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  note: z.string().optional(),
});

/** Record a stock movement (supplier restock or manual adjustment) and keep the
 *  cached Product.stock in sync. A restock also posts a supplier-purchase expense
 *  to the finance ledger. All atomic. */
export async function recordStock(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireStaff();
  const parsed = stockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { productId, type, quantity, unitCost, note } = parsed.data;

  if (quantity === 0) return { ok: false, error: "Quantity can't be zero." };
  // PURCHASE always adds stock; ADJUSTMENT uses the signed quantity.
  const delta = type === "PURCHASE" ? Math.abs(quantity) : quantity;
  const cost = unitCost === "" || unitCost === undefined ? null : Number(unitCost);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Product not found." };

  await prisma.$transaction(async (tx) => {
    await tx.stockMovement.create({
      data: {
        productId,
        type,
        quantity: type === "PURCHASE" ? Math.abs(quantity) : quantity,
        unitCost: cost,
        note: note || null,
      },
    });
    await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: delta } },
    });
    if (type === "PURCHASE" && cost && cost > 0) {
      await tx.financialTransaction.create({
        data: {
          type: "EXPENSE",
          category: "SUPPLIER_PURCHASE",
          amount: cost * Math.abs(quantity),
          description: `Restock: ${Math.abs(quantity)} × ${product.name}`,
          productId,
        },
      });
    }
  }, TX_OPTS);

  revalidatePath("/admin/products");
  return ok(type === "PURCHASE" ? "Stock added." : "Stock adjusted.");
}
