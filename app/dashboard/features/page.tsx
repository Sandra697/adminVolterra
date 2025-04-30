import { FeaturesList } from "@/components/features/features-list"
import Layout from "@/components/Layout"


export default function FeaturesPage() {
  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[0.85rem]  font-bold tracking-tight">Features</h1>
        
      </div>
      <FeaturesList />
    </div>
    </Layout>
  )
}
