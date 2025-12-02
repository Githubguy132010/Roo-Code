import { memo } from "react"
import { useTranslation } from "react-i18next"
import { Layers, Play, Pause, Loader2 } from "lucide-react"

import { TaskStatus } from "@roo-code/types"

import { cn } from "@src/lib/utils"
import { StandardTooltip, Button } from "@src/components/ui"
import { useExtensionState } from "@src/context/ExtensionStateContext"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu"

interface BackgroundTasksIndicatorProps {
	className?: string
}

const getStatusIcon = (status: TaskStatus) => {
	switch (status) {
		case TaskStatus.Running:
			return <Loader2 className="size-3 animate-spin text-green-500" />
		case TaskStatus.Interactive:
			return <Pause className="size-3 text-yellow-500" />
		case TaskStatus.Background:
			return <Play className="size-3 text-blue-500" />
		default:
			return <Pause className="size-3 text-gray-500" />
	}
}

const getStatusLabel = (status: TaskStatus) => {
	switch (status) {
		case TaskStatus.Running:
			return "Running"
		case TaskStatus.Interactive:
			return "Waiting"
		case TaskStatus.Background:
			return "Background"
		default:
			return "Paused"
	}
}

export const BackgroundTasksIndicator = memo(({ className }: BackgroundTasksIndicatorProps) => {
	const { t } = useTranslation()
	const { backgroundTasks, bringTaskToForeground, sendTaskToBackground, currentTaskItem } = useExtensionState()

	// Only show if there are background tasks
	if (!backgroundTasks || backgroundTasks.length === 0) {
		return null
	}

	return (
		<DropdownMenu>
			<StandardTooltip content={t("chat:backgroundTasks.tooltip", { count: backgroundTasks.length })}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"relative h-7 px-2 gap-1.5",
							"text-vscode-foreground opacity-85 hover:opacity-100",
							"hover:bg-[rgba(255,255,255,0.03)]",
							"focus:outline-none focus-visible:ring-1 focus-visible:ring-vscode-focusBorder",
							className,
						)}>
						<Layers className="size-4" />
						<span className="text-xs font-medium">{backgroundTasks.length}</span>
						{backgroundTasks.some((t) => t.status === TaskStatus.Running) && (
							<span className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						)}
					</Button>
				</DropdownMenuTrigger>
			</StandardTooltip>
			<DropdownMenuContent align="end" className="w-64">
				<div className="px-2 py-1.5 text-xs font-medium text-vscode-descriptionForeground border-b border-vscode-panel-border mb-1">
					{t("chat:backgroundTasks.title")}
				</div>
				{backgroundTasks.map((task) => (
					<DropdownMenuItem
						key={task.taskId}
						className="flex items-center gap-2 cursor-pointer"
						onClick={() => bringTaskToForeground(task.taskId)}>
						{getStatusIcon(task.status)}
						<div className="flex-1 min-w-0">
							<div className="text-sm truncate">{task.task || t("chat:backgroundTasks.untitled")}</div>
							<div className="text-xs text-vscode-descriptionForeground">
								{getStatusLabel(task.status)} • ${task.totalCost.toFixed(2)}
							</div>
						</div>
					</DropdownMenuItem>
				))}
				{currentTaskItem && (
					<>
						<div className="border-t border-vscode-panel-border my-1" />
						<DropdownMenuItem
							className="flex items-center gap-2 cursor-pointer text-vscode-descriptionForeground"
							onClick={() => sendTaskToBackground()}>
							<Layers className="size-3" />
							<span className="text-sm">{t("chat:backgroundTasks.sendCurrent")}</span>
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
})

BackgroundTasksIndicator.displayName = "BackgroundTasksIndicator"
