import type { Table, ForeignKeyRelationship } from '../types/query';

export const NORTHWIND_SCHEMA: Table[] = [
  {
    name: 'customers',
    label: 'Customers',
    description: 'People and companies who buy things',
    columns: [
      { name: 'customerID', type: 'string' },
      { name: 'companyName', type: 'string' },
      { name: 'contactName', type: 'string' },
      { name: 'contactTitle', type: 'string' },
      { name: 'address', type: 'string' },
      { name: 'city', type: 'string' },
      { name: 'region', type: 'string' },
      { name: 'postalCode', type: 'string' },
      { name: 'country', type: 'string' },
      { name: 'phone', type: 'string' },
      { name: 'fax', type: 'string' },
    ],
  },
  {
    name: 'orders',
    label: 'Orders',
    description: 'Every purchase made by a customer',
    columns: [
      { name: 'orderID', type: 'number' },
      { name: 'customerID', type: 'string', foreignKey: { table: 'customers', column: 'customerID' } },
      { name: 'employeeID', type: 'number', foreignKey: { table: 'employees', column: 'employeeID' } },
      { name: 'orderDate', type: 'date' },
      { name: 'requiredDate', type: 'date' },
      { name: 'shippedDate', type: 'date' },
      { name: 'shipVia', type: 'number' },
      { name: 'freight', type: 'number' },
      { name: 'shipName', type: 'string' },
      { name: 'shipAddress', type: 'string' },
      { name: 'shipCity', type: 'string' },
      { name: 'shipRegion', type: 'string' },
      { name: 'shipPostalCode', type: 'string' },
      { name: 'shipCountry', type: 'string' },
    ],
  },
  {
    name: 'order_details',
    label: 'Order Lines',
    description: 'Each product in an order',
    columns: [
      { name: 'orderID', type: 'number', foreignKey: { table: 'orders', column: 'orderID' } },
      { name: 'productID', type: 'number', foreignKey: { table: 'products', column: 'productID' } },
      { name: 'unitPrice', type: 'number' },
      { name: 'quantity', type: 'number' },
      { name: 'discount', type: 'number' },
    ],
  },
  {
    name: 'products',
    label: 'Products',
    description: 'Things you can buy from Northwind',
    columns: [
      { name: 'productID', type: 'number' },
      { name: 'productName', type: 'string' },
      { name: 'supplierID', type: 'number' },
      { name: 'categoryID', type: 'number', foreignKey: { table: 'categories', column: 'categoryID' } },
      { name: 'quantityPerUnit', type: 'string' },
      { name: 'unitPrice', type: 'number' },
      { name: 'unitsInStock', type: 'number' },
      { name: 'unitsOnOrder', type: 'number' },
      { name: 'reorderLevel', type: 'number' },
      { name: 'discontinued', type: 'boolean' },
    ],
  },
  {
    name: 'categories',
    label: 'Categories',
    description: 'Product types (Beverages, Dairy, etc.)',
    columns: [
      { name: 'categoryID', type: 'number' },
      { name: 'categoryName', type: 'string' },
      { name: 'description', type: 'string' },
    ],
  },
  {
    name: 'employees',
    label: 'Employees',
    description: 'Northwind staff who handle orders',
    columns: [
      { name: 'employeeID', type: 'number' },
      { name: 'lastName', type: 'string' },
      { name: 'firstName', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'titleOfCourtesy', type: 'string' },
      { name: 'birthDate', type: 'date' },
      { name: 'hireDate', type: 'date' },
      { name: 'address', type: 'string' },
      { name: 'city', type: 'string' },
      { name: 'region', type: 'string' },
      { name: 'postalCode', type: 'string' },
      { name: 'country', type: 'string' },
      { name: 'homePhone', type: 'string' },
      { name: 'notes', type: 'string' },
      { name: 'reportsTo', type: 'number', foreignKey: { table: 'employees', column: 'employeeID' } },
    ],
  },
];

export const NORTHWIND_FOREIGN_KEYS: ForeignKeyRelationship[] = NORTHWIND_SCHEMA.flatMap((table) =>
  table.columns
    .filter((col) => col.foreignKey !== undefined)
    .map((col) => ({
      fromTable: table.name,
      fromColumn: col.name,
      toTable: col.foreignKey!.table,
      toColumn: col.foreignKey!.column,
    })),
);

export const NORTHWIND_CSV_FILES: Array<{ tableName: string; filename: string; url: string }> =
  NORTHWIND_SCHEMA.map(({ name }) => ({
    tableName: name,
    filename: `northwind_${name}.csv`,
    url: `${import.meta.env.BASE_URL}data/northwind/${name}.csv`,
  }));

export function suggestJoinColumns(
  tableA: string,
  tableB: string,
): ForeignKeyRelationship | undefined {
  return NORTHWIND_FOREIGN_KEYS.find(
    (fk) =>
      (fk.fromTable === tableA && fk.toTable === tableB) ||
      (fk.fromTable === tableB && fk.toTable === tableA),
  );
}

export function getRelatedTables(tableName: string): ForeignKeyRelationship[] {
  return NORTHWIND_FOREIGN_KEYS.filter(
    (fk) => fk.fromTable === tableName || fk.toTable === tableName,
  );
}

export const TABLE_COLORS: Record<string, string> = {
  customers: 'blue',
  orders: 'green',
  order_details: 'orange',
  products: 'purple',
  categories: 'pink',
  employees: 'teal',
};

export const AGG_LABELS: Record<string, string> = {
  COUNT: 'Count (non-null)',
  COUNT_STAR: 'Count All',
  COUNT_DISTINCT: 'Count Unique',
  SUM: 'Total',
  AVG: 'Average',
  MEDIAN: 'Middle Value',
  MIN: 'Smallest',
  MAX: 'Largest',
  MODE: 'Most Common',
  STDDEV: 'Spread',
  STRING_AGG: 'Join Text',
};
