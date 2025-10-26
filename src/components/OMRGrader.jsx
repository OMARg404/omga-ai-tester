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
  const [cameraMsg, setCameraMsg] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // تشغيل الكاميرا
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraOn(true);
      setCameraMsg("📷 وجّه الورقة في منتصف الكاميرا بإضاءة جيدة");
    } catch (err) {
      setError("لا يمكن الوصول إلى الكاميرا، رجاءً تأكد من السماح للمتصفح.");
    }
  };

  // إيقاف الكاميرا
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraOn(false);
  };

  // التقاط الصورة من الكاميرا
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const newFile = new File([blob], "captured_exam.jpg", { type: "image/jpeg" });
      setFile(newFile);
      analyzeImageQuality(canvas);
      setCameraMsg("✅ تم التقاط الصورة بنجاح، يمكنك تصحيحها الآن.");
      stopCamera();
    }, "image/jpeg");
  };

  // تحليل جودة الصورة (إضاءة وميل بسيط)
  const analyzeImageQuality = (canvas) => {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let brightness = 0;

    // نحسب متوسط السطوع
    for (let i = 0; i < pixels.length; i += 4) {
      brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    }
    brightness /= pixels.length / 4;

    if (brightness < 60) setCameraMsg("💡 الإضاءة ضعيفة، قرّب من مصدر ضوء");
    else if (brightness > 230) setCameraMsg("⚠ الإضاءة قوية جدًا، قللها قليلًا");
    else setCameraMsg("✅ الإضاءة ممتازة، الصورة مناسبة للتصحيح.");
  };

  // رفع الصورة ومعالجتها
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

  useEffect(() => {
    return () => stopCamera(); // تأكد من إيقاف الكاميرا عند الخروج
  }, []);

  return (
    <div className="container my-5">
      <Card className="p-4 shadow">
        <h2 className="mb-4 text-center">📘 OMR Grader Interface</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">📁 اختر أو التقط صورة الإجابة:</label>
            <input
              type="file"
              className="form-control mb-2"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*"
            />
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
              <Button className="mt-3" variant="primary" onClick={capturePhoto}>
                📸 التقط الصورة
              </Button>
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
              الإجابات الصحيحة: {results.correct} | الخاطئة: {results.incorrect} | الوقت:{" "}
              {results.timestamp}
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
