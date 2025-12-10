// Getting params in server components
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string; variant: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { productId, variant } = await params;
  const search = await searchParams;
  return (
    <div>
      <p>Product ID: {productId}</p>
      <p>Variant: {variant}</p>
      <p>Color: {search?.color}</p>
      <p>Quantity: {search?.quantity}</p>
    </div>
  );
}

// Layouts / Templates
async function layoutOrTemplate({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ variant: string; code: string }>;
}) {
  const { variant, code } = await params;
  return (
    <div>
      <h1>{variant}</h1>
      <main>{children}</main>
    </div>
  );
}

// Metadata from params
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string; variant: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { productId, variant } = await params;
  const search = await searchParams;
  return {
    title: `${productId} - ${variant}`,
    description: `Product details for ${productId}. Color: ${
      search?.color || "default"
    }`,
  };
}

// Error
async function Error({
  error,
  reset,
  params,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  params: Promise<{ productId: string; variant: string }>;
}) {
  const { productId, variant } = await params;
  return (
    <div>
      <h2>Something went wrong finding item #{productId}</h2>
      <p>Error: {error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}