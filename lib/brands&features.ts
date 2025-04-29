import prisma from "@/lib/prisma"

export async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
    })

    console.log(`Fetched ${brands.length} brands`)
    return brands
  } catch (error) {
    console.error("Error fetching brands:", error)
    return []
  }
}

export async function getFeatures() {
  try {
    const features = await prisma.feature.findMany({
      orderBy: {
        name: "asc",
      },
    })

    console.log(`Fetched ${features.length} features`)
    return features
  } catch (error) {
    console.error("Error fetching features:", error)
    return []
  }
}
