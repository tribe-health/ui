<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import { getWorkflowStackTrace } from '$lib/services/query-service';
  import type { ParsedQuery } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
  import Button from '$holocene/button.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  const { namespace } = $page.params;
  const { workflow } = $workflowRun;

  let currentdate = new Date();
  let isLoading = false;

  const getStackTrace = () =>
    getWorkflowStackTrace({
      workflow,
      namespace,
    });

  let stackTrace: Eventual<ParsedQuery>;
  $: {
    if (workflow.isRunning) stackTrace = getStackTrace();
  }

  const refreshStackTrace = () => {
    stackTrace = getWorkflowStackTrace({
      workflow,
      namespace,
    });

    stackTrace.then(() => {
      currentdate = new Date();
    });
  };
</script>

<section>
  {#if workflow.isRunning}
    {#await stackTrace}
      <div class="text-center">
        <h2 class="font-bold text-2xl mb-4">Loading…</h2>
        <p>(This will fail if you have no workers running.)</p>
      </div>
    {:then result}
      <div class="flex items-center gap-4">
        <Button
          on:click={refreshStackTrace}
          iconScale={0.8}
          icon="refresh"
          loading={isLoading}
        >
          Refresh
        </Button>
        <p>Stack Trace at {currentdate.toLocaleTimeString()}</p>
      </div>
      <div class="flex items-start h-full">
        <CodeBlock
          content={result}
          language="text"
          dataCy="query-stack-trace"
        />
      </div>
    {:catch _error}
      <EmptyState
        title="An Error Occured"
        content="Please make sure you have at least one worker running."
      />
    {/await}
  {:else}
    <EmptyState
      title="No Stack Traces Found"
      dataCy="query-stack-trace-empty"
    />
  {/if}
</section>
