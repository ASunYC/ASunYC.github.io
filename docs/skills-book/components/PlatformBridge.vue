<template>
  <section class="bridge-section" aria-labelledby="bridge-title">
    <div>
      <p class="section-label">Skills Wiki Network</p>
      <h2 id="bridge-title">From marketplace CLI to global skill shops.</h2>
      <p>
        Skills Book remains the local agent marketplace CLI. Its index is rebuilt into <code>skills.db</code>,
        exported as static data, and then projected into Skills Shop as a searchable wiki, graph, and 3D storefront.
      </p>
    </div>
    <div class="bridge-grid">
      <article>
        <strong>1. Discover</strong>
        <span>Fetch, rank, search, and install skills from community repositories.</span>
      </article>
      <article>
        <strong>2. Combine</strong>
        <span>Use recommended tool stacks for repeatable agent workflows.</span>
      </article>
      <article>
        <strong>3. Publish</strong>
        <span>Export skills into the Skills Shop wiki, map, graph, and future author storefronts.</span>
      </article>
    </div>
  </section>
</template>

<style scoped>
.bridge-section {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 22px;
  margin: 0 0 44px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 24px;
  background: var(--vp-c-bg-soft);
}

.section-label {
  margin: 0 0 8px;
  color: var(--vp-c-brand);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.bridge-section h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: 0;
}

.bridge-section p {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.bridge-grid {
  display: grid;
  gap: 12px;
}

.bridge-grid article {
  display: grid;
  gap: 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 15px;
  background: var(--vp-c-bg);
}

.bridge-grid span {
  color: var(--vp-c-text-2);
  line-height: 1.55;
}

@media (max-width: 760px) {
  .bridge-section {
    grid-template-columns: 1fr;
  }
}
</style>
