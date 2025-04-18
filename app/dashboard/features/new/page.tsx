import { FeatureForm } from "@/components/features/feature-form"

export default function NewFeaturePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem]  font-bold tracking-tight">Add New Feature</h1>
      <FeatureForm />
    </div>
  )
}
