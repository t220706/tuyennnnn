import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VideoUploader } from "@/components/VideoUploader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Stage = "idle" | "uploading" | "analyzing" | "done" | "error";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const handleFileSelect = (f: File) => {
    setFile(f);
    setVideoPreview(URL.createObjectURL(f));
  };

  const handleClear = () => {
    setFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setStage("idle");
    setProgress(0);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    try {
      // Step 1: Upload video
      setStage("uploading");
      setStatusText("Đang tải video lên...");
      setProgress(10);

      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);
      const videoUrl = urlData.publicUrl;

      setProgress(30);

      // Step 2: Create session
      setStatusText("Đang tạo phiên phân tích...");
      const { data: session, error: sessionError } = await supabase
        .from("analysis_sessions")
        .insert({
          video_url: videoUrl,
          video_name: file.name,
          video_size: file.size,
          status: "pending",
        })
        .select()
        .single();

      if (sessionError || !session) throw sessionError || new Error("Không thể tạo phiên");

      setProgress(40);

      // Step 3: Call AI analysis
      setStage("analyzing");
      setStatusText("AI đang phân tích chuyển động...");
      setProgress(50);

      // Simulate progress while waiting
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 2, 90));
      }, 1000);

      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "analyze-video",
        { body: { sessionId: session.id, videoUrl } }
      );

      clearInterval(progressInterval);

      if (fnError) {
        throw new Error(fnError.message || "Lỗi khi gọi AI");
      }

      if (fnData?.error) {
        throw new Error(fnData.error);
      }

      setProgress(100);
      setStage("done");
      setStatusText("Phân tích hoàn tất!");

      toast({
        title: "Phân tích thành công!",
        description: "AI đã hoàn tất phân tích chuyển động trong video.",
      });

      setTimeout(() => {
        navigate(`/results/${session.id}`);
      }, 1000);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setStage("error");
      setStatusText(err.message || "Đã xảy ra lỗi");
      toast({
        title: "Lỗi phân tích",
        description: err.message || "Đã xảy ra lỗi khi phân tích video",
        variant: "destructive",
      });
    }
  };

  const isProcessing = stage === "uploading" || stage === "analyzing";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Phân tích Video Chuyển động</h1>
        <p className="text-muted-foreground">
          Upload video thí nghiệm cơ học để AI phân tích và trích xuất thông số chuyển động
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Chọn Video</CardTitle>
          <CardDescription>Hỗ trợ MP4, AVI, MOV, WebM • Tối đa 20MB</CardDescription>
        </CardHeader>
        <CardContent>
          <VideoUploader
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={handleClear}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {videoPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Xem trước Video</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              src={videoPreview}
              controls
              className="w-full rounded-lg bg-foreground/5"
              style={{ maxHeight: 400 }}
            />
          </CardContent>
        </Card>
      )}

      {file && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Phân tích bằng AI</CardTitle>
            <CardDescription>
              AI sẽ nhận dạng loại chuyển động, tính toán quỹ đạo và trích xuất các thông số động học
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{statusText}</span>
                  <span className="font-mono text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {stage === "error" && (
              <p className="text-sm text-destructive">{statusText}</p>
            )}

            {stage === "done" && (
              <p className="text-sm text-success font-medium">✅ {statusText}</p>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isProcessing || stage === "done"}
              className="w-full gap-2"
              size="lg"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isProcessing ? "Đang phân tích..." : "Phân tích bằng AI"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
