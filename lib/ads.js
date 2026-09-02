export function urlImagePub(path) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pubs-images/${path}`;
}
