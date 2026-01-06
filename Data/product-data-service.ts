import { createClient } from "@supabase/supabase-js"
import type { ProductCategory, ProductAttribute } from "@/types/auction-types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ✅ Fetch all main categories
// ✅ Fetch all main categories (fixed)
export async function fetchCategories(): Promise<ProductCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, handle, title")

  if (error) throw error

  return data.map((cat) => ({
    id: cat.id,
    name: cat.title,
    handle: cat.handle,
    level: 0,
    subcategories: []
  }))
}


// ✅ Fetch subcategories for a given category
export async function fetchSubcategories(categoryHandle: string): Promise<ProductCategory[]> {
  const { data, error } = await supabase
    .from("categories_subcategories_view")
    .select("sub_handle, sub_title, category_handle")
    .eq("category_handle", categoryHandle)

  if (error) throw error

  return data.map((sub) => ({
    id: sub.sub_handle,
    name: sub.sub_title,
    parentId: sub.category_handle,
    level: 1,
  }))
}

// ✅ Fetch attributes for a subcategory
export async function fetchAttributes(subHandle: string): Promise<ProductAttribute[]> {
  const { data, error } = await supabase
    .from("categories_subcategories_view")
    .select("attributes")
    .eq("sub_handle", subHandle)
    .single();

  // Only log real errors if there is no data

  const attributes = data?.attributes
    ? typeof data.attributes === "string"
      ? JSON.parse(data.attributes)
      : data.attributes
    : [];
  return Array.isArray(attributes) ? attributes : [];
}




