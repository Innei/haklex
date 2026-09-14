export { $captureSelection } from './captureSelection';
export { AGENT_PIN_SELECTION_COMMAND } from './commands';
export { AgentActionBar } from './components/AgentActionBar';
export { AgentAskAIAction } from './components/AgentAskAIAction';
export type { UseAgentLoopOptions } from './hooks/useAgentLoop';
export { useAgentLoop } from './hooks/useAgentLoop';
export type { AgentMessagesEngineOptions } from './messageEngine';
export {
  AgentMessagesEngine,
  defaultAgentSystemMessage,
  defaultAgentSystemRole,
  defaultDocumentToolSystemRole,
} from './messageEngine';
export { AgentDiffEditNode } from './nodes/AgentDiffEditNode';
export type { AgentDiffNodePayload, AgentDiffOpType } from './nodes/diff-node-state';
export { projectAgentDiffNodesToFactualState } from './nodes/diff-node-state';
export { AgentPanelPlugin } from './plugins/AgentPanelPlugin';
export { AgentSelectionPinPlugin } from './plugins/AgentSelectionPinPlugin';
export type { AgentDiffReviewActions } from './plugins/diff-node-controller';
export {
  getAgentDiffReviewController,
  setAgentDiffReviewController,
} from './plugins/diff-node-controller';
export { DiffApplyPlugin } from './plugins/DiffApplyPlugin';
export { DiffReviewOverlayPlugin } from './plugins/DiffReviewOverlayPlugin';
export type { AgentActionConfig } from './registry';
export { builtInActions, registerAgentAction } from './registry';
