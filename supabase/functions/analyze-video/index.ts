import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, videoUrl } = await req.json();

    if (!sessionId || !videoUrl) {
      return new Response(
        JSON.stringify({ error: "sessionId and videoUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update status to analyzing
    await supabase
      .from("analysis_sessions")
      .update({ status: "analyzing" })
      .eq("id", sessionId);

    const systemPrompt = `Bạn là một chuyên gia vật lý và thị giác máy tính. Nhiệm vụ của bạn là phân tích video thí nghiệm cơ học.

Hãy phân tích video và trả về kết quả dưới dạng JSON với cấu trúc chính xác sau:

{
  "motion_type": "linear_uniform" | "linear_accelerated" | "circular" | "projectile" | "oscillation" | "free_fall" | "other",
  "motion_type_label": "Tên loại chuyển động bằng tiếng Việt",
  "confidence": 0.0-1.0,
  "ai_description": "Mô tả chi tiết bằng tiếng Việt về chuyển động quan sát được trong video, bao gồm đặc điểm, phương trình chuyển động nếu có thể ước lượng",
  "parameters": {
    "velocity": "giá trị ước lượng (m/s) hoặc null",
    "acceleration": "giá trị ước lượng (m/s²) hoặc null", 
    "period": "chu kỳ (s) hoặc null",
    "amplitude": "biên độ (m) hoặc null",
    "distance": "quãng đường (m) hoặc null",
    "duration": "thời gian quan sát (s) hoặc null",
    "initial_velocity": "vận tốc ban đầu (m/s) hoặc null",
    "angle": "góc ném (độ) hoặc null",
    "radius": "bán kính quỹ đạo (m) hoặc null",
    "angular_velocity": "vận tốc góc (rad/s) hoặc null",
    "equation": "phương trình chuyển động nếu xác định được"
  },
  "trajectory_data": [{"x": 0, "y": 0}, {"x": 1, "y": 2}, ...],
  "position_time_data": [{"t": 0, "s": 0}, {"t": 0.1, "s": 0.5}, ...],
  "velocity_time_data": [{"t": 0, "v": 0}, {"t": 0.1, "v": 1.0}, ...],
  "acceleration_time_data": [{"t": 0, "a": 9.8}, {"t": 0.1, "a": 9.8}, ...]
}

Lưu ý:
- Tạo ít nhất 10-20 điểm dữ liệu cho mỗi biểu đồ dựa trên quan sát
- Ước lượng các thông số dựa trên video (kích thước vật thể tham chiếu, thời gian, v.v.)
- Nếu không thể xác định chính xác, hãy ước lượng hợp lý và ghi chú trong description
- Mô tả phải chuyên nghiệp, phù hợp cho báo cáo nghiên cứu`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Hãy phân tích video thí nghiệm cơ học này. Xác định loại chuyển động, trích xuất các thông số động học và tạo dữ liệu biểu đồ. Trả về kết quả dưới dạng JSON.",
                },
                {
                  type: "image_url",
                  image_url: { url: videoUrl },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_motion",
                description: "Return structured motion analysis results from video",
                parameters: {
                  type: "object",
                  properties: {
                    motion_type: {
                      type: "string",
                      enum: ["linear_uniform", "linear_accelerated", "circular", "projectile", "oscillation", "free_fall", "other"],
                    },
                    motion_type_label: { type: "string" },
                    confidence: { type: "number" },
                    ai_description: { type: "string" },
                    parameters: {
                      type: "object",
                      properties: {
                        velocity: { type: ["string", "null"] },
                        acceleration: { type: ["string", "null"] },
                        period: { type: ["string", "null"] },
                        amplitude: { type: ["string", "null"] },
                        distance: { type: ["string", "null"] },
                        duration: { type: ["string", "null"] },
                        initial_velocity: { type: ["string", "null"] },
                        angle: { type: ["string", "null"] },
                        radius: { type: ["string", "null"] },
                        angular_velocity: { type: ["string", "null"] },
                        equation: { type: ["string", "null"] },
                      },
                    },
                    trajectory_data: {
                      type: "array",
                      items: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } } },
                    },
                    position_time_data: {
                      type: "array",
                      items: { type: "object", properties: { t: { type: "number" }, s: { type: "number" } } },
                    },
                    velocity_time_data: {
                      type: "array",
                      items: { type: "object", properties: { t: { type: "number" }, v: { type: "number" } } },
                    },
                    acceleration_time_data: {
                      type: "array",
                      items: { type: "object", properties: { t: { type: "number" }, a: { type: "number" } } },
                    },
                  },
                  required: ["motion_type", "motion_type_label", "confidence", "ai_description", "parameters", "trajectory_data", "position_time_data", "velocity_time_data", "acceleration_time_data"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "analyze_motion" } },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        await supabase.from("analysis_sessions").update({ status: "failed", ai_description: "Rate limit exceeded. Vui lòng thử lại sau." }).eq("id", sessionId);
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        await supabase.from("analysis_sessions").update({ status: "failed", ai_description: "Hết credit AI. Vui lòng nạp thêm." }).eq("id", sessionId);
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      await supabase.from("analysis_sessions").update({ status: "failed", ai_description: `Lỗi AI: ${errorText}` }).eq("id", sessionId);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log("AI response:", JSON.stringify(aiResult));

    let analysisData;
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      analysisData = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: try parsing content as JSON
      const content = aiResult.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    // Update session with results
    const { error: updateError } = await supabase
      .from("analysis_sessions")
      .update({
        status: "completed",
        motion_type: analysisData.motion_type,
        motion_type_label: analysisData.motion_type_label,
        confidence: analysisData.confidence,
        ai_description: analysisData.ai_description,
        parameters: analysisData.parameters,
        trajectory_data: analysisData.trajectory_data,
        position_time_data: analysisData.position_time_data,
        velocity_time_data: analysisData.velocity_time_data,
        acceleration_time_data: analysisData.acceleration_time_data,
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, data: analysisData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
