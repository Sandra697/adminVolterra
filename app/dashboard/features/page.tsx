import { FeaturesList } from "@/components/features/features-list"


export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[0.85rem]  font-bold tracking-tight">Features</h1>
        
      </div>
      <FeaturesList />
    </div>
  )
}
