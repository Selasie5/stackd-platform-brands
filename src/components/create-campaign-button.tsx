import { Link, useNavigate } from '@tanstack/react-router'
import { Plus, ChevronDown, Video, Briefcase, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const createCampaignSearch = { action: 'create' as const }

export function CreateCampaignButton() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center">
      <Button
        className="rounded-r-none border-r border-r-white/20 hover:border-r-white/30 pr-3 focus-visible:z-10"
        onClick={() =>
          navigate({ to: '/dashboard/campaigns', search: createCampaignSearch })
        }
      >
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
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard/campaigns" search={createCampaignSearch}>
              <Plus className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span>Create campaign</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              to="/dashboard/campaigns"
              search={{ action: 'create', campaign_type: 'UGC' }}
            >
              <Video className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span>Create UGC</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              to="/dashboard/campaigns"
              search={{ action: 'create', campaign_type: 'CPM' }}
            >
              <Briefcase className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span>Create CPM deal</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              to="/dashboard/campaigns"
              search={{ action: 'create', campaign_type: 'Contest' }}
            >
              <Trophy className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span>Create contest</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
