import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import NewCandidateAdminClientForm from "./NewCandidateAdminClientForm"

export default async function NewCandidatePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  return <NewCandidateAdminClientForm />
}