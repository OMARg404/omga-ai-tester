import React, { useState, useRef, useEffect } from "react";
import { Card, ProgressBar, Table, Button, Alert } from "react-bootstrap";
import "../App.css";

const OMRGrader = () => {
  const [file, setFile] = useState(null);
  const [modelAnswers, setModelAnswers] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [optionsPerQuestion, setOptionsPerQuestion] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraMsg, setCameraMsg] = useState("📷 انتظر قليلاً... جارٍ تشغيل الكاميرا");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // 🔹 تحليل الإطار (لتحديد الإضاءة والموضع)
  const analyzeFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let brightness = 0, leftBright = 0, rightBright = 0, topBright = 0, bottomBright = 0;
    const centerX = width / 2, centerY = height / 2;

    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x += 20) {
        const i = (y * width + x) * 4;
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        brightness += avg;
        if (x < centerX) leftBright += avg; else rightBright += avg;
        if (y < centerY) topBright += avg; else bottomBright += avg;
      }
    }

    brightness /= (width / 20) * (height / 20);
    const diffX = rightBright - leftBright;
    const diffY = bottomBright - topBright;

    let msg = "";
    if (brightness < 60) msg = "💡 الإضاءة ضعيفة، قرّب من مصدر ضوء.";
    else if (brightness > 230) msg = "⚠ الإضاءة قوية جدًا، خففها قليلًا.";
    else if (Math.abs(diffX) > 300000)
      msg = diffX > 0 ? "⬅ حرّك الورقة لليسار." : "➡ حرّك الورقة لليمين.";
    else if (Math.abs(diffY) > 300000)
      msg = diffY > 0 ? "⬆ ارفع الورقة قليلاً." : "⬇ انزل الورقة قليلاً.";
    else msg = "✅ الوضع ممتاز! سيتم الالتقاط الآن...";

    setCameraMsg(msg);
    return brightness >= 60 && brightness <= 230 && Math.abs(diffX) < 300000 && Math.abs(diffY) < 300000;
  };

  // 🔹 تشغيل الكاميرا والتصوير التلقائي
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraOn(true);
      setCameraMsg("📷 وجّه الورقة في منتصف الكاميرا بإضاءة مناسبة...");

      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const good = analyzeFrame();
          if (good) {
            clearInterval(intervalRef.current);
            triggerFlashAndCapture(stream);
          }
        }, 1000);
      }, 2000);
    } catch (err) {
      console.error("Camera error:", err);
      setError(`❌ لا يمكن الوصول إلى الكاميرا: ${err.message}`);
    }
  };

  // 🔹 فلاش + صوت + التقاط
  const triggerFlashAndCapture = (stream) => {
    // فلاش أبيض
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "white";
    flash.style.opacity = "1";
    flash.style.transition = "opacity 0.4s";
    flash.style.zIndex = 9999;
    document.body.appendChild(flash);

    // صوت الكاميرا
    const snapSound = new Audio("https://actions.google.com/sounds/v1/camera/camera_shutter_click.ogg");
    snapSound.play();

    setTimeout(() => {
      flash.style.opacity = "0";
      setTimeout(() => flash.remove(), 500);
    }, 200);

    setTimeout(() => capturePhoto(stream), 400);
  };

  // 🔹 التقاط الصورة + عرضها
  const capturePhoto = (stream) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const photo = new File([blob], "captured_exam.jpg", { type: "image/jpeg" });
      setFile(photo);
      setCameraMsg("✅ تم التقاط الصورة بنجاح!");

      // عرض الصورة للمستخدم
      const previewURL = URL.createObjectURL(blob);
      const imgPreview = document.createElement("img");
      imgPreview.src = previewURL;
      imgPreview.style.width = "100%";
      imgPreview.style.borderRadius = "10px";
      imgPreview.style.marginTop = "10px";
      document.querySelector(".camera-preview").appendChild(imgPreview);

      stopCamera();
    }, "image/jpeg");

    stream.getTracks().forEach((track) => track.stop());
  };

  // 🔹 إيقاف الكاميرا
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    clearInterval(intervalRef.current);
    setCameraOn(false);
  };

  // 🔹 إرسال الصورة إلى السيرفر
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("رجاءً اختر أو التقط صورة أولاً");

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_answers", modelAnswers);
    if (numQuestions) formData.append("num_questions", numQuestions);
    if (optionsPerQuestion) formData.append("options_per_question", optionsPerQuestion);

    try {
      const response = await fetch("http://127.0.0.1:51234/api/grade", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) setError(data.error);
      else setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="container my-5">
      <Card className="p-4 shadow">
        <h2 className="mb-4 text-center">📘 OMR Grader Interface</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">📁 اختر أو التقط صورة الإجابة:</label>
            <input type="file" className="form-control mb-2" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
            {!cameraOn ? (
              <Button variant="success" onClick={startCamera}>
                🎥 تشغيل الكاميرا
              </Button>
            ) : (
              <Button variant="danger" onClick={stopCamera}>
                ⏹ إيقاف الكاميرا
              </Button>
            )}
          </div>

          {cameraOn && (
            <div className="camera-preview mb-3 text-center">
              <video ref={videoRef} autoPlay playsInline width="100%" style={{ borderRadius: "10px" }} />
              <canvas ref={canvasRef} hidden></canvas>
              {cameraMsg && <Alert className="mt-3">{cameraMsg}</Alert>}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">الإجابات النموذجية:</label>
            <input
              type="text"
              className="form-control"
              value={modelAnswers}
              onChange={(e) => setModelAnswers(e.target.value)}
              placeholder="مثال: 0,1,2,3,4..."
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">عدد الأسئلة:</label>
              <input
                type="number"
                className="form-control"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">عدد الخيارات لكل سؤال:</label>
              <input
                type="number"
                className="form-control"
                value={optionsPerQuestion}
                onChange={(e) => setOptionsPerQuestion(e.target.value)}
                placeholder="4"
              />
            </div>
          </div>

          <Button className="w-100" variant="primary" type="submit" disabled={loading}>
            {loading ? "⏳ جاري التصحيح..." : "✅ تصحيح الاختبار"}
          </Button>
        </form>

        {error && <Alert variant="danger" className="mt-4">{error}</Alert>}

        {results && (
          <Card className="mt-4 p-3 shadow-sm">
            <h3>نتيجة الاختبار: {results.score ?? "غير متوفرة"}</h3>
            <p>
              الإجابات الصحيحة: {results.correct} | الخاطئة: {results.incorrect} | الوقت: {results.timestamp}
            </p>
            <ProgressBar
              now={(results.correct / results.total_questions) * 100}
              label={`${results.score}%`}
              className="mb-3"
            />
            {results.details && (
              <Table striped bordered hover size="sm" responsive>
                <thead>
                  <tr>
                    <th>السؤال</th>
                    <th>إجابتك</th>
                    <th>الإجابة الصحيحة</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {results.details.map((item) => (
                    <tr key={item.question} className={item.is_correct ? "table-success" : "table-danger"}>
                      <td>{item.question}</td>
                      <td>{item.student_answer}</td>
                      <td>{item.correct_answer}</td>
                      <td>{item.is_correct ? "✅ صحيح" : "❌ خاطئ"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        )}
      </Card>
    </div>
  );
};

export default OMRGrader;
