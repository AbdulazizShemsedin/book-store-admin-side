import { Category } from '@/types/domain';

export interface CategoryTreeNode extends Category {
  depth: number; // 1 to 5
  path: string[]; // Ancestor path names: e.g. ['Fiction', 'Historical', 'Medieval']
  fullPath: string; // 'Fiction › Historical › Medieval'
  children: CategoryTreeNode[];
}

/**
 * Builds a multi-level taxonomy tree supporting up to 5 nested levels.
 * Handles cycle prevention and orphan category fallback gracefully.
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const byId = new Map<string, Category>();
  categories.forEach((cat) => byId.set(cat.id, cat));

  // Map of direct children grouped by parent ID
  const childrenByParent = new Map<string, Category[]>();
  categories.forEach((cat) => {
    if (cat.parentId && byId.has(cat.parentId)) {
      const list = childrenByParent.get(cat.parentId) || [];
      list.push(cat);
      childrenByParent.set(cat.parentId, list);
    }
  });

  // Recursive node constructor
  function buildNode(
    cat: Category,
    depth: number,
    parentPath: string[],
    visited = new Set<string>()
  ): CategoryTreeNode {
    visited.add(cat.id);
    const currentPath = [...parentPath, cat.name];
    const rawChildren = childrenByParent.get(cat.id) || [];

    const childrenNodes: CategoryTreeNode[] = [];
    // Only nest up to depth 5
    if (depth < 5) {
      for (const child of rawChildren) {
        if (!visited.has(child.id)) {
          childrenNodes.push(buildNode(child, depth + 1, currentPath, new Set(visited)));
        }
      }
    }

    return {
      ...cat,
      depth,
      path: currentPath,
      fullPath: currentPath.join(' › '),
      children: childrenNodes,
    };
  }

  // Root categories are those with no parentId or parent not found in array
  const roots = categories.filter((c) => !c.parentId || !byId.has(c.parentId));
  return roots.map((root) => buildNode(root, 1, []));
}

/**
 * Flattens tree into hierarchical order with depth and path metadata.
 */
export function flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  function traverse(list: CategoryTreeNode[]) {
    for (const node of list) {
      result.push(node);
      if (node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  traverse(nodes);
  return result;
}

/**
 * Computes depth of a specific category by parent ID in the existing taxonomy.
 */
export function getCategoryDepth(categoryId: string, categories: Category[]): number {
  const byId = new Map<string, Category>();
  categories.forEach((c) => byId.set(c.id, c));

  let depth = 1;
  let curr = byId.get(categoryId);
  const visited = new Set<string>();

  while (curr && curr.parentId && byId.has(curr.parentId) && !visited.has(curr.id) && depth < 5) {
    visited.add(curr.id);
    curr = byId.get(curr.parentId);
    depth++;
  }

  return depth;
}
