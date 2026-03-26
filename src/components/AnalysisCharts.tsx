import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  TrajectoryPoint,
  PositionTimePoint,
  VelocityTimePoint,
  AccelerationTimePoint,
} from "@/lib/types";

interface AnalysisChartsProps {
  trajectoryData: TrajectoryPoint[] | null;
  positionTimeData: PositionTimePoint[] | null;
  velocityTimeData: VelocityTimePoint[] | null;
  accelerationTimeData: AccelerationTimePoint[] | null;
}

const chartStyle = {
  stroke: "hsl(217, 71%, 35%)",
  grid: "hsl(214, 20%, 88%)",
  accent: "hsl(199, 89%, 48%)",
  green: "hsl(142, 71%, 45%)",
  orange: "hsl(38, 92%, 50%)",
};

export function AnalysisCharts({
  trajectoryData,
  positionTimeData,
  velocityTimeData,
  accelerationTimeData,
}: AnalysisChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {positionTimeData && positionTimeData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📈 Vị trí – Thời gian (s-t)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={positionTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="t" label={{ value: "t (s)", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "s (m)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="s" stroke={chartStyle.stroke} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {velocityTimeData && velocityTimeData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📉 Vận tốc – Thời gian (v-t)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={velocityTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="t" label={{ value: "t (s)", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "v (m/s)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke={chartStyle.accent} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {accelerationTimeData && accelerationTimeData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📊 Gia tốc – Thời gian (a-t)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={accelerationTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="t" label={{ value: "t (s)", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "a (m/s²)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="a" stroke={chartStyle.green} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {trajectoryData && trajectoryData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🎯 Quỹ đạo Chuyển động (x-y)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="x" type="number" label={{ value: "x (m)", position: "insideBottomRight", offset: -5 }} />
                <YAxis dataKey="y" type="number" label={{ value: "y (m)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Scatter data={trajectoryData} fill={chartStyle.orange} line={{ stroke: chartStyle.orange, strokeWidth: 2 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
