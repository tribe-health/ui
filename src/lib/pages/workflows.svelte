<script lang="ts">
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflowsSearch } from '$lib/stores/workflows';
  import { workflows, loading, updating } from '$lib/stores/workflows';
  import { namespaceSelectorOpen } from '$lib/stores/nav-open';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { viewFeature } from '$lib/stores/new-feature-tags';

  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import WorkflowFilters from '$lib/components/workflow/workflow-filters.svelte';
  import WorkflowsLoading from '$lib/components/workflow/workflows-loading.svelte';
  import { onDestroy, onMount } from 'svelte';
  import FeatureTag from '$lib/holocene/feature-tag.svelte';

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
  });

  onDestroy(() => {
    const query = $page.url.searchParams.get('query');
    const parameters = query ? toListWorkflowParameters(query) : {};
    $workflowsSearch = { parameters, searchType };
  });

  function toggleNamespaceSelector() {
    $namespaceSelectorOpen = !$namespaceSelectorOpen;
    viewFeature('namespaceSelector');
  }
</script>

<div>
  <h1 class="text-2xl">
    Recent Workflows
    <button
      class="relative"
      on:click={toggleNamespaceSelector}
      data-cy="namespace-select-button"
    >
      <Icon
        name="namespaceSelect"
        scale={1.6}
        class="mx-2 inline cursor-pointer"
      />
      <FeatureTag feature="namespaceSelector" />
    </button>
  </h1>
  <p class="text-sm text-gray-600">{$page.params.namespace}</p>
</div>
<WorkflowFilters bind:searchType />
{#if $loading}
  <WorkflowsLoading />
{:else if $workflows.length}
  <Pagination items={$workflows} updating={$updating} let:visibleItems>
    <WorkflowsSummaryTable>
      {#each visibleItems as event}
        <WorkflowsSummaryRow
          workflow={event}
          namespace={$page.params.namespace}
          timeFormat={$timeFormat}
        />
      {/each}
    </WorkflowsSummaryTable>
  </Pagination>
{:else}
  <EmptyState title={'No Workflows Found'} content={errorMessage} />
{/if}
