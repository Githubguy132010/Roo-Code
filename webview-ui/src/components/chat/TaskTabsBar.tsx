import { memo } from "react"

import type { TaskTabState } from "@roo/ExtensionMessage"
import { TaskStatus } from "@roo-code/types"

import { cn } from "@/lib/utils"

interface TaskTabsBarProps {
	tabs: TaskTabState[]
	onSelect: (taskId: string) => void
	onClose: (taskId: string) => void
	onCreate: () => void
	newTabLabel: string
}

const getStatusColor = (status: TaskStatus) => {
	switch (status) {
		case TaskStatus.Idle:
			return "var(--vscode-testing-iconPassed)"
		case TaskStatus.Interactive:
		case TaskStatus.Resumable:
			return "var(--vscode-editorWarning-foreground)"
		case TaskStatus.Running:
			return "var(--vscode-textLink-activeForeground)"
		default:
			return "var(--vscode-descriptionForeground)"
	}
}

const TaskTabsBarComponent = ({ tabs, onSelect, onClose, onCreate, newTabLabel }: TaskTabsBarProps) => {
	return (
		<div className="flex items-center gap-2 px-3 pt-3">
			<div className="flex flex-1 items-center gap-2 overflow-x-auto">
				{tabs.map((tab) => {
					const label = tab.label || newTabLabel
					return (
						<button
							key={tab.id}
							type="button"
							className={cn(
								"group flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
								tab.isActive
									? "border-vscode-focusBorder bg-vscode-editor-background text-vscode-foreground"
									: "border-transparent bg-transparent text-vscode-descriptionForeground hover:border-vscode-focusBorder/30 hover:bg-vscode-editor-background",
							)}
							title={label}
							onClick={() => onSelect(tab.id)}>
							<span
								aria-hidden="true"
								className="inline-flex size-2.5 rounded-full"
								style={{ backgroundColor: getStatusColor(tab.status) }}
							/>
							<span className="max-w-[160px] truncate">{label}</span>
							<span
								role="button"
								tabIndex={-1}
								aria-label={`Close ${label}`}
								className="codicon codicon-close ml-1 opacity-0 transition-opacity group-hover:opacity-100"
								onClick={(event) => {
									event.stopPropagation()
									onClose(tab.id)
								}}
								onMouseDown={(event) => event.preventDefault()}
							/>
						</button>
					)
				})}
			</div>
			<button
				type="button"
				className="flex size-7 items-center justify-center rounded-full border border-transparent text-base text-vscode-foreground transition-colors hover:border-vscode-focusBorder/40 hover:bg-vscode-editor-background"
				aria-label={newTabLabel}
				onClick={onCreate}>
				<span className="codicon codicon-add" aria-hidden="true" />
			</button>
		</div>
	)
}

export const TaskTabsBar = memo(TaskTabsBarComponent)

export default TaskTabsBar
