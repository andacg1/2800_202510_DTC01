import type { ProductComparison } from "@prisma/client";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getShortId } from "../routes/app._index";

export type Comparison = ProductComparison & {
  comparedProducts: string[];
  comparedAt: string;
};

type ComparisonSummaryProps = {
  className?: string;
  children?: React.ReactNode;
  comparisons: Comparison[];
  productTitles: { id: `gid://shopify/Product/${string}`; title: string }[];
};

export const ComparisonSummary = ({
  className,
  children,
  comparisons,
  productTitles,
}: ComparisonSummaryProps) => {
  const getComparisonData = (): Record<string, number> => {
    const allComparisons = new Map();
    for (const comparison of comparisons) {
      if (!comparison?.comparedProducts) {
        continue;
      }
      for (const comparedProductId of comparison.comparedProducts) {
        if (comparedProductId === comparison.originalProductId) {
          continue;
        }
        if (!allComparisons.has(comparedProductId)) {
          allComparisons.set(comparedProductId, 0);
        }
        allComparisons.set(
          comparedProductId,
          allComparisons.get(comparedProductId) + 1,
        );
      }
    }
    return Object.fromEntries(allComparisons.entries());
  };

  const productTitleMap = Object.fromEntries(
    productTitles
      .filter((title) => !!title)
      .map(({ id, title }) => [getShortId(id), title]),
  );

  const allComparisons = Object.entries(getComparisonData())
    .map(([id, compared]) => {
      if (!(String(id) in productTitleMap)) {
        return { name: id, compared };
      }
      return { name: productTitleMap[id], compared };
    })
    .sort((a, b) => b.compared - a.compared)
    .slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={allComparisons}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="compared"
          fill="#82ca9d"
          activeBar={<Rectangle fill="white" stroke="#82ca9d" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ComparisonSummary;
