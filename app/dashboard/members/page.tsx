import { MembersList } from "@/components/members/members-list"
import Layout from "@/components/Layout"

export default function MembersPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[0.85rem]  font-bold tracking-tight">Members</h1>
        </div>
        <MembersList />
      </div>
    </Layout>
  )
}
