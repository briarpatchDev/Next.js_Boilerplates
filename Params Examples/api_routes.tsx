// Getting params in api routes
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string; variant: string }> }
) {
  const { productId, variant } = await params;

  // Get searchParams from the request URL
  const { searchParams } = new URL(request.url);
  const color = searchParams.get("color");
  const quantity = searchParams.get("quantity");

  return Response.json({
    product: productId,
    variant,
    color,
    quantity,
    available: true,
  });
}
