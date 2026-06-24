export function buildKnowledgeGraph(items) {
  const nodes = new Map();
  const edges = new Map();

  for (const item of items) {
    addNode(nodes, {
      id: `knowledge:${item.id}`,
      type: 'knowledge',
      label: item.title,
      knowledgeId: item.id
    });

    addLinkedValue(nodes, edges, item, 'category', item.category, 'belongs_to');

    for (const tag of item.tags || []) {
      addLinkedValue(nodes, edges, item, 'tag', tag, 'tagged_as');
    }

    for (const scenario of item.scenarios || []) {
      addLinkedValue(nodes, edges, item, 'scenario', scenario, 'applies_to');
    }

    for (const concept of item.concepts || []) {
      addLinkedValue(nodes, edges, item, 'concept', concept, 'mentions');
    }

    const steps = item.steps || [];
    steps.forEach((step, index) => {
      const stepId = `step:${item.id}:${index}`;
      addNode(nodes, {
        id: stepId,
        type: 'step',
        label: step,
        order: index + 1,
        knowledgeId: item.id
      });
      addEdge(edges, {
        from: `knowledge:${item.id}`,
        to: stepId,
        type: 'has_step'
      });
      if (index > 0) {
        addEdge(edges, {
          from: `step:${item.id}:${index - 1}`,
          to: stepId,
          type: 'next_step'
        });
      }
    });
  }

  return {
    nodes: [...nodes.values()],
    edges: [...edges.values()]
  };
}

export function buildGraphContext(matches) {
  if (!matches.length) {
    return '知识图谱没有命中相关节点。';
  }

  return matches
    .map((item) => {
      const parts = [`知识：${item.title}`];
      if (item.category) {
        parts.push(`分类：${item.category}`);
      }
      if (item.scenarios?.length) {
        parts.push(`适用场景：${item.scenarios.join('、')}`);
      }
      if (item.concepts?.length) {
        parts.push(`关键概念：${item.concepts.join('、')}`);
      }
      if (item.steps?.length) {
        parts.push(`处理步骤：${item.steps.map((step, index) => `${index + 1}. ${step}`).join('；')}`);
      }
      return parts.join('\n');
    })
    .join('\n\n---\n\n');
}

function addLinkedValue(nodes, edges, item, type, value, edgeType) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return;
  }

  const nodeId = `${type}:${normalized}`;
  addNode(nodes, { id: nodeId, type, label: normalized });
  addEdge(edges, {
    from: `knowledge:${item.id}`,
    to: nodeId,
    type: edgeType
  });
}

function addNode(nodes, node) {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, node);
  }
}

function addEdge(edges, edge) {
  const id = `${edge.from}->${edge.type}->${edge.to}`;
  if (!edges.has(id)) {
    edges.set(id, { id, ...edge });
  }
}
