import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { MotionBadge } from "@/components/MotionBadge";
import { ParametersTable } from "@/components/ParametersTable";
import { AnalysisCharts } from "@/components/AnalysisCharts";
import type { AnalysisSession, MotionType, MotionParameters, TrajectoryPoint, PositionTimePoint, VelocityTimePoint, AccelerationTimePoint } from "@/lib/types";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data } = await supabase
        .from("analysis_sessions")
        .select("*")
        .eq("id", id)
        .single();
      setSession(data as unknown as AnalysisSession);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-muted-foreground">Không tìm thấy kết quả phân tích</p>
        <Link to="/upload"><Button variant="outline">Quay lại Upload</Button></Link>
      </div>
    );
  }

  const confidence = session.confidence ? Math.round(session.confidence * 100) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/history">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Kết quả Phân tích</h1>
            <p className="text-sm text-muted-foreground">{session.video_name}</p>
          </div>
        </div>
      </div>

      {/* Motion type & confidence */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          {session.motion_type && (
            <MotionBadge type={session.motion_type as MotionType} label={session.motion_type_label} />
          )}
          {confidence !== null && (
            <Badge variant="outline" className="gap-1">
              Độ tin cậy: <span className="font-mono font-bold">{confidence}%</span>
            </Badge>
          )}
          <span className="text-sm text-muted-foreground ml-auto">
            {new Date(session.created_at).toLocaleString("vi-VN")}
          </span>
        </CardContent>
      </Card>

      {/* Video */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4" /> Video gốc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <video src={session.video_url} controls className="w-full rounded-lg" style={{ maxHeight: 400 }} />
        </CardContent>
      </Card>

      {/* AI Description */}
      {session.ai_description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🤖 Phân tích AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{session.ai_description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parameters */}
      <ParametersTable parameters={session.parameters as MotionParameters} />

      {/* Charts */}
      <AnalysisCharts
        trajectoryData={session.trajectory_data as TrajectoryPoint[]}
        positionTimeData={session.position_time_data as PositionTimePoint[]}
        velocityTimeData={session.velocity_time_data as VelocityTimePoint[]}
        accelerationTimeData={session.acceleration_time_data as AccelerationTimePoint[]}
      />
    </div>
  );
}
