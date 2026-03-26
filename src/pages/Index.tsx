import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Upload, Video, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MotionBadge } from "@/components/MotionBadge";
import type { AnalysisSession, MotionType } from "@/lib/types";
import { MOTION_TYPE_LABELS } from "@/lib/types";

export default function Index() {
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("analysis_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setSessions((data as unknown as AnalysisSession[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const totalCount = sessions.length;
  const motionTypes = [...new Set(sessions.filter((s) => s.motion_type).map((s) => s.motion_type!))];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 text-primary-foreground">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-accent text-accent-foreground">
            AI-Powered Research Tool
          </Badge>
          <h1 className="mb-3 text-3xl font-bold tracking-tight lg:text-4xl">
            Phân tích Chuyển động Cơ học từ Video Thực nghiệm
          </h1>
          <p className="mb-6 text-primary-foreground/80 lg:text-lg">
            Sử dụng AI thị giác máy tính để tự động nhận dạng loại chuyển động,
            trích xuất quỹ đạo và tính toán các thông số động học từ video thí nghiệm.
          </p>
          <Link to="/upload">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Upload className="h-5 w-5" />
              Upload Video Mới
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Video đã upload</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Phân tích hoàn tất</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{motionTypes.length}</p>
              <p className="text-sm text-muted-foreground">Loại chuyển động</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Phân tích gần đây</CardTitle>
          <Link to="/history">
            <Button variant="ghost" size="sm" className="gap-1">
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Đang tải...</p>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">Chưa có phiên phân tích nào</p>
              <Link to="/upload">
                <Button variant="outline" size="sm">Upload video đầu tiên</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  to={s.status === "completed" ? `/results/${s.id}` : "#"}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Video className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.video_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.motion_type && (
                      <MotionBadge type={s.motion_type as MotionType} label={s.motion_type_label} />
                    )}
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
