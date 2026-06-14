import React from 'react'
import { Plus, ChevronDown, Video, Briefcase, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function CreateCampaignButton() {
  return (
    <div className="flex items-center">
      <Button className="rounded-r-none border-r border-r-white/20 hover:border-r-white/30 pr-3 focus-visible:z-10">
        <Plus className="w-4 h-4 mr-1" />
        Create
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-l-none px-2 focus-visible:z-10" size="icon">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span>Create campaign</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Video className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span>Create UGC</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Briefcase className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span>Create CPM deal</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Trophy className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span>Create contest</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
