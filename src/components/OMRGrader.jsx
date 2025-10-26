import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Card, Button, Alert, ProgressBar, Table } from "react-bootstrap";
import "../App.css";

const OMRGrader = () => {
  const [file, setFile] = useState(null);
  const [modelAnswers, setModelAnswers] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [optionsPerQuestion, setOptionsPerQuestion] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraMsg, setCameraMsg] = useState("");
  const webcamRef = useRef(null);

  // ✅ تشغيل الفلاش (لو مدعوم)
  useEffect(() => {
    if (cameraOn && webcamRef.current) {
      const stream = webcamRef.current.video?.srcObject;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        if (track.getCapabilities && track.getCapabilities().torch) {
          track
            .applyConstraints({ advanced: [{ torch: true }] })
            .then(() => console.log("💡 Flash ON"))
            .catch(() => console.warn("⚠️ الفلاش غير مدعوم في هذا الجهاز"));
        }
      }
    }
  }, [cameraOn]);

  // ✅ نصائح تلقائية أثناء الكاميرا
  useEffect(() => {
    if (cameraOn && webcamRef.current) {
      const tips = [
        "📄 تأكد أن الورقة ظاهرة بالكامل",
        "↔️ حرّك الكاميرا قليلاً لليمين",
        "↕️ قرّب الكاميرا أكثر",
        "💡 الإضاءة منخفضة قليلاً، شغّل الفلاش",
        "📷 ثبّت الكاميرا وتأكد من وضوح الصورة",
      ];
      const interval = setInterval(() => {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setCameraMsg(randomTip);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [cameraOn]);

  // 📸 التقاط الصورة من الكاميرا
  const capturePhoto = () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("⚠️ لم يتم التقاط الصورة، حاول مرة أخرى");
        return;
      }
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const photo = new File([blob], "captured_exam.jpg", { type: "image/jpeg" });
          setFile(photo);
          setCameraMsg("✅ تم التقاط الصورة بنجاح!");
          setCameraOn(false);
          localStorage.setItem("lastCapturedPhoto", imageSrc);
        });
    } catch (err) {
      setError("❌ فشل التقاط الصورة من الكاميرا");
      console.error("Camera capture error:", err);
    }
  };

  // 📤 إرسال الصورة للسيرفر وتحليلها
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("⚠️ رجاءً اختر أو التقط صورة أولاً");

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

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
        setCameraMsg("✅ تم تحليل الصورة بنجاح!");

        // 🧹 حذف الصورة من localStorage بعد التحليل
        localStorage.removeItem("lastCapturedPhoto");
        setFile(null);
      }
    } catch (err) {
      setError("❌ فشل الاتصال بالسيرفر، تأكد أنه يعمل على البورت 51234");
      console.error("Server Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧹 مسح الصورة يدويًا (زر اختياري)
  const clearCapturedPhoto = () => {
    localStorage.removeItem("lastCapturedPhoto");
    setFile(null);
    setCameraMsg("");
  };

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
              <Button variant="success" onClick={() => setCameraOn(true)}>
                🎥 تشغيل الكاميرا
              </Button>
            ) : (
              <Button variant="secondary" onClick={capturePhoto}>
                📸 التقط الصورة
              </Button>
            )}
          </div>

          {cameraOn && (
            <div className="text-center mb-3">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment",
                  width: 640,
                  height: 480,
                }}
                className="rounded shadow"
              />
              {cameraMsg && <Alert className="mt-3">{cameraMsg}</Alert>}
            </div>
          )}

          {/* ✅ عرض آخر صورة تم التقاطها */}
          {localStorage.getItem("lastCapturedPhoto") && !cameraOn && (
            <div className="text-center mt-3">
              <h6>📷 الصورة الملتقطة:</h6>
              <img
                src={localStorage.getItem("lastCapturedPhoto")}
                alt="Captured"
                className="rounded shadow"
                width="300"
              />
              <div className="mt-2">
                <Button variant="outline-danger" size="sm" onClick={clearCapturedPhoto}>
                  🗑️ حذف الصورة
                </Button>
              </div>
            </div>
          )}

          <div className="mb-3 mt-4">
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
              {results.timestamp} | ⏱ {results.processing_time}
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
                    <tr
                      key={item.question}
                      className={item.is_correct ? "table-success" : "table-danger"}
                    >
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
