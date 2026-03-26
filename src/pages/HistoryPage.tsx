import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { MotionBadge } from "@/components/MotionBadge";
import { toast } from "@/hooks/use-toast";
import type { AnalysisSession, MotionType } from "@/lib/types";
import { MOTION_TYPE_LABELS } from "@/lib/types";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    let query = supabase
      .from("analysis_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("motion_type", filter);
    }

    const { data } = await query;
    setSessions((data as unknown as AnalysisSession[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analysis_sessions").delete().eq("id", id);
    if (error) {
      toast({ title: "Lỗi", description: "Không thể xóa", variant: "destructive" });
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Đã xóa" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử Phân tích</h1>
          <p className="text-muted-foreground">Tất cả các video đã phân tích</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Lọc theo loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại chuyển động</SelectItem>
            {Object.entries(MOTION_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-center text-muted-foreground">Đang tải...</p>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Video className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">Không có kết quả</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Loại chuyển động</TableHead>
                  <TableHead>Độ tin cậy</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {s.video_name}
                    </TableCell>
                    <TableCell>
                      {s.motion_type ? (
                        <MotionBadge type={s.motion_type as MotionType} label={s.motion_type_label} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.confidence ? (
                        <span className="font-mono">{Math.round(s.confidence * 100)}%</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === "completed" ? "default" :
                          s.status === "analyzing" ? "secondary" :
                          s.status === "failed" ? "destructive" : "outline"
                        }
                      >
                        {s.status === "completed" ? "Hoàn tất" :
                         s.status === "analyzing" ? "Đang phân tích" :
                         s.status === "failed" ? "Lỗi" : "Chờ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === "completed" && (
                          <Link to={`/results/${s.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
