import { FeatureForm } from "@/components/features/feature-form"
import Layout from "@/components/Layout"

export default function NewFeaturePage() {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-[0.85rem]  font-bold mb-6">Add New Feature</h1>
        <FeatureForm />
      </div>
    </Layout>
  )
}
