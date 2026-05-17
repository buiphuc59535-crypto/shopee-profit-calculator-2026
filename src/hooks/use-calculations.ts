"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeCalculations } from "@/lib/firestore";
import type { CalculationRecord } from "@/types/domain";

export function useCalculations(userId?: string) {
  const [records, setRecords] = useState<CalculationRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeCalculations(userId, (items) => {
      setRecords(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const stats = useMemo(() => {
    const total = records.length;
    const avgMargin =
      total > 0 ? records.reduce((sum, item) => sum + item.netMargin, 0) / total : 0;
    const roasRecords = records.filter((item) => item.roas > 0);
    const avgRoas =
      roasRecords.length > 0
        ? roasRecords.reduce((sum, item) => sum + item.roas, 0) / roasRecords.length
        : 0;
    const totalProfit = records.reduce((sum, item) => sum + item.realProfit, 0);

    return { total, avgMargin, avgRoas, totalProfit };
  }, [records]);

  return { records, loading, stats };
}

