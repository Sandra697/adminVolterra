import { MembersList } from "@/components/members/members-list"

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem]  font-bold tracking-tight">Members</h1>
      <MembersList />
    </div>
  )
}
