import { useMemo } from "react";
import { BaseChart } from "./BaseChart";

interface ChartProps {
  data: number[];
  maxDataPoints: number;
  fill?: string;
  stroke?: string;
}

function Chart(props: ChartProps) {
  const preparedData = useMemo(() => {
    const points = props.data.map((value) => ({
      value: value * 100,
    }));
    return [
      ...points,
      ...Array.from({ length: props.maxDataPoints - points.length }).map(() => ({
        value: undefined,
      })),
    ];
  }, [props.data, props.maxDataPoints]);

  return (
    <BaseChart
      data={preparedData}
      fill={props.fill ?? "#1d4ed8"}
      stroke={props.stroke ?? "#93c5fd"}
    />
  );
}

export default Chart;
