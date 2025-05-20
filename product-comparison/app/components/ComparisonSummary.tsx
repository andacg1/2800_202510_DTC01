import React, { useEffect, useState } from "react";
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

export type ProductComparison = {
  id: string;
  collectionId: string;
  originalProductId: string;
  comparedProducts: string[];
  comparedAt: Date;
  sessionId: string | null;
  shop: string | null;
};

type ComparisonSummaryProps = {
  className?: string;
  children?: React.ReactNode;
  comparisons: ProductComparison[];
  productTitles: { id: `gid://shopify/Product/${string}`; title: string }[];
};

export const ComparisonSummary = ({
  className,
  children,
  comparisons,
  productTitles,
}: ComparisonSummaryProps) => {
  const getComparisonData = () => {
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
    productTitles.map(({ id, title }) => [getShortId(id), title]),
  );
  const allComparisons = Object.entries(getComparisonData()).map(
    ([id, compared]) => {
      if (!(String(id) in productTitleMap)) {
        return { name: id, compared };
      }
      return { name: productTitleMap[id], compared };
    },
  );
  useEffect(() => {
    console.log({ productTitles });
  }, [productTitles]);

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
        <YAxis dataKey="name" type="category" />
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
