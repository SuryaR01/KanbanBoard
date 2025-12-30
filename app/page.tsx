"use client";

import { useSession } from "next-auth/react"
import BoardsPage from './boards/page'
import User from './components/User'

const Page = () => {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === "authenticated") {
    return <BoardsPage />
  }

  return <User />
}


export default Page