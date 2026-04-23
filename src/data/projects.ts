import type { Project } from '../types/project';
import type { QueryState } from '../types/query';

function joinExists(state: QueryState, tableA: string, tableB: string): boolean {
  return state.joins.some((j) => {
    const lt = state.canvasTables.find((t) => t.id === j.leftTableId)?.tableName;
    const rt = state.canvasTables.find((t) => t.id === j.rightTableId)?.tableName;
    return (lt === tableA && rt === tableB) || (lt === tableB && rt === tableA);
  });
}

export const PROJECTS: Project[] = [
  {
    id: 'top-category-per-customer',
    title: "Each Customer's Favorite Category",
    description:
      'Build a query that counts how many order lines each customer has in each product category, then sorts so their most-ordered category appears first.',
    steps: [
      {
        id: 'add-customers',
        title: 'Add Customers',
        description: 'Drag the Customers table onto the canvas. Every order belongs to a customer, so this is our starting point.',
        hints: [
          'Switch to the Tables tab and drag the Customers card to the canvas.',
        ],
        check: (s) => s.canvasTables.some((t) => t.tableName === 'customers'),
      },
      {
        id: 'join-orders',
        title: 'Join Orders',
        description: 'Add the Orders table and connect it to Customers. Orders are linked by customerID.',
        hints: [
          'Drag the Orders table onto the canvas.',
          "Click 'Auto Join' between Customers and Orders — they share customerID.",
        ],
        check: (s) =>
          s.canvasTables.some((t) => t.tableName === 'orders') &&
          joinExists(s, 'customers', 'orders'),
      },
      {
        id: 'join-order-details',
        title: 'Join Order Lines',
        description: 'Add the Order Lines table and join it to Orders. Each row here is one product within one order.',
        hints: [
          "Drag 'Order Lines' onto the canvas.",
          "Click 'Auto Join' between Orders and Order Lines — they share orderID.",
        ],
        check: (s) =>
          s.canvasTables.some((t) => t.tableName === 'order_details') &&
          joinExists(s, 'orders', 'order_details'),
      },
      {
        id: 'join-products',
        title: 'Join Products',
        description: 'Add the Products table and join it to Order Lines. This gives us the productID we need to look up the category.',
        hints: [
          'Drag the Products table onto the canvas.',
          "Click 'Auto Join' between Order Lines and Products — they share productID.",
        ],
        check: (s) =>
          s.canvasTables.some((t) => t.tableName === 'products') &&
          joinExists(s, 'order_details', 'products'),
      },
      {
        id: 'join-categories',
        title: 'Join Categories',
        description: 'Add the Categories table and join it to Products. Now we can see which category each ordered product belongs to.',
        hints: [
          'Drag the Categories table onto the canvas.',
          "Click 'Auto Join' between Products and Categories — they share categoryID.",
        ],
        check: (s) =>
          s.canvasTables.some((t) => t.tableName === 'categories') &&
          joinExists(s, 'products', 'categories'),
      },
      {
        id: 'group-and-count',
        title: 'Group and Count',
        description: 'Add GROUP BY rows for companyName (from Customers) and categoryName (from Categories), then add a third row with the Count All aggregate.',
        hints: [
          "Click 'Add GROUP BY / aggregate' in the Clauses panel.",
          'Add one row for Customers → companyName (no aggregate), one for Categories → categoryName (no aggregate), and a third row with any column and Count All as the aggregate.',
        ],
        check: (s) =>
          s.groupBy.some((g) => g.aggregate === 'COUNT_STAR' || g.aggregate === 'COUNT') &&
          s.groupBy.filter((g) => !g.aggregate && g.column !== '').length >= 2,
      },
      {
        id: 'order-by-count',
        title: 'Sort by Count',
        description: "Add an ORDER BY for your count column in descending order so each customer's most-ordered category appears first.",
        hints: [
          "Click 'Add ORDER BY' in the Clauses panel.",
          'Set the direction to DESC. Pick the count column (it will appear with a 📊 icon in the dropdown).',
        ],
        check: (s) => s.orderBy.some((o) => o.direction === 'DESC'),
      },
    ],
  },
];
