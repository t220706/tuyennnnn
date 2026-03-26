import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MotionParameters } from "@/lib/types";

interface ParametersTableProps {
  parameters: MotionParameters | null;
}

const paramLabels: Record<string, { label: string; unit: string }> = {
  velocity: { label: "Vận tốc", unit: "m/s" },
  acceleration: { label: "Gia tốc", unit: "m/s²" },
  period: { label: "Chu kỳ", unit: "s" },
  amplitude: { label: "Biên độ", unit: "m" },
  distance: { label: "Quãng đường", unit: "m" },
  duration: { label: "Thời gian", unit: "s" },
  initial_velocity: { label: "Vận tốc ban đầu", unit: "m/s" },
  angle: { label: "Góc ném", unit: "°" },
  radius: { label: "Bán kính", unit: "m" },
  angular_velocity: { label: "Vận tốc góc", unit: "rad/s" },
  equation: { label: "Phương trình", unit: "" },
};

export function ParametersTable({ parameters }: ParametersTableProps) {
  if (!parameters) return null;

  const entries = Object.entries(parameters).filter(
    ([, val]) => val !== null && val !== undefined && val !== ""
  );

  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">📋 Bảng Thông số Động học</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thông số</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Đơn vị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([key, value]) => {
              const meta = paramLabels[key] || { label: key, unit: "" };
              return (
                <TableRow key={key}>
                  <TableCell className="font-medium">{meta.label}</TableCell>
                  <TableCell className="font-mono">{String(value)}</TableCell>
                  <TableCell className="text-muted-foreground">{meta.unit}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
