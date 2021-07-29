/// <reference types="@sveltejs/kit" />

import { WorkflowExecutionInfo } from '$types/temporal/api/workflow/v1/message';

type Heroicon = { [key: string]: string }[][];

type WorkflowsAPIResponse = {
  executions: WorkflowExecutionInfo[];
  nextPageToken: string;
};
