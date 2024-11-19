'use client'
import { useMemberId } from '@/hooks/use-member-id'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import React from 'react'

function page() {
    const workspaceId = useWorkspaceId()
    const memberId = useMemberId()
  return (
    <div>page</div>
  )
}

export default page