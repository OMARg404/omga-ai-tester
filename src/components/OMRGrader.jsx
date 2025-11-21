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
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const webcamRef = useRef(null);

  // ✅ جلب الكاميرات المتاحة
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0) setSelectedDeviceId(videoDevices[0].deviceId);
      })
      .catch((err) => console.error("Camera enumeration error:", err));
  }, []);

  // ✅ نصائح الكاميرا
  useEffect(() => {
    if (cameraOn && webcamRef.current) {
      const tips = [
        "📄 تأكد أن الورقة ظاهرة بالكامل",
        "↔️ حرّك الكاميرا قليلاً لليمين",
        "↕️ قرّب الكاميرا أكثر",
        "💡 الإضاءة منخفضة قليلاً",
        "📷 ثبّت الكاميرا وتأكد من وضوح الصورة",
      ];
      const interval = setInterval(() => {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setCameraMsg(randomTip);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [cameraOn]);

  // ✅ تحويل Base64 إلى Blob
  const base64ToBlob = (base64Data, contentType = "image/jpeg") => {
    const sliceSize = 512;
    const byteCharacters = atob(base64Data.split(",")[1]);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  // 📸 التقاط الصورة
  const capturePhoto = async () => {
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return setError("⚠️ لم يتم التقاط الصورة");

      const blob = base64ToBlob(imageSrc, "image/jpeg");
      const photo = new File([blob], "captured_exam.jpg", { type: "image/jpeg" });

      if (photo.size < 5000) {
        setError("⚠️ الصورة صغيرة جدًا أو غير واضحة، حاول مجددًا");
        return;
      }

      setFile(photo);
      setCameraMsg("✅ تم التقاط الصورة بنجاح!");
      setCameraOn(false);
      localStorage.setItem("lastCapturedPhoto", imageSrc);
    } catch (err) {
      setError("❌ فشل التقاط الصورة من الكاميرا");
      console.error(err);
    }
  };

  // 📤 إرسال الصورة للسيرفر مع تحقق إضافي
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("⚠️ رجاءً اختر أو التقط صورة أولاً");

    // ✅ تحقق من عدد الإجابات مقابل عدد الأسئلة
    const answersArray = modelAnswers.split(",").map((a) => a.trim()).filter((a) => a);
    if (numQuestions && answersArray.length !== parseInt(numQuestions)) {
      setError(`⚠️ عدد الإجابات (${answersArray.length}) لا يطابق عدد الأسئلة (${numQuestions}).`);
      return;
    }

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
      else {
        setResults(data);
        setCameraMsg("✅ تم تحليل الصورة بنجاح!");
        localStorage.removeItem("lastCapturedPhoto");
        setFile(null);
      }
    } catch (err) {
      setError("❌ فشل الاتصال بالسيرفر، تأكد أنه يعمل على البورت 51234");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearCapturedPhoto = () => {
    localStorage.removeItem("lastCapturedPhoto");
    setFile(null);
    setCameraMsg("");
  };

  const answerCount = modelAnswers.split(",").filter((a) => a.trim() !== "").length;

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
              <label className="form-label">🎥 اختر الكاميرا:</label>
              <select
                className="form-select w-auto d-inline-block mb-2"
                value={selectedDeviceId || ""}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
              >
                {availableCameras.map((cam, i) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `كاميرا ${i + 1}`}
                  </option>
                ))}
              </select>

              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                  width: 640,
                  height: 480,
                }}
                className="rounded shadow"
              />

              {cameraMsg && <Alert className="mt-3">{cameraMsg}</Alert>}
            </div>
          )}

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

          {/* 🧮 حقل الإجابات النموذجية + العداد */}
          <div className="mb-3 mt-4">
            <label className="form-label">
              الإجابات النموذجية{" "}
              {answerCount > 0 && (
                <span className="text-muted">({answerCount} إجابة مدخلة)</span>
              )}
            </label>
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
    <h3 className="text-center mb-3">🎯 نتيجة الاختبار</h3>

    <div className="text-center mb-3">
      <h4>🔢 الدرجة: {results.score}%</h4>
      <ProgressBar
        now={results.score}
        variant={results.score >= 90 ? "success" : results.score >= 70 ? "info" : "warning"}
        label={`${results.score}%`}
      />
    </div>

    <div className="d-flex flex-wrap justify-content-around text-center mb-3">
      <div><strong>✅ الصحيحة:</strong> {results.correct}</div>
      <div><strong>❌ الخاطئة:</strong> {results.incorrect}</div>
      <div><strong>⏳ غير مجابة:</strong> {results.unanswered}</div>
      <div><strong>🧮 الإجمالي:</strong> {results.total_questions}</div>
    </div>

    <hr />

    <div className="mb-3 text-center">
      <p><strong>🆔 رقم الطالب:</strong> {results.student_id}</p>
      <p><strong>🕒 وقت التصحيح:</strong> {results.timestamp}</p>
    </div>

    {/* ✅ الأسئلة الخاطئة */}
    {results.wrong_answers?.length > 0 && (
      <div className="mb-3">
        <h5>❌ الأسئلة الخاطئة:</h5>
        <Table striped bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>رقم السؤال</th>
              <th>إجابتك</th>
              <th>الإجابة الصحيحة</th>
            </tr>
          </thead>
          <tbody>
            {results.wrong_answers.map((item, idx) => (
              <tr key={idx} className="table-danger">
                <td>{item.question_number}</td>
                <td>{item.student_answer}</td>
                <td>{item.correct_answer}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    )}

    <hr />

    {/* ✅ تفاصيل كل الأسئلة */}
    <h5 className="mb-3">📋 جميع الأسئلة:</h5>
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
  </Card>
)}

      </Card>
    </div>
  );
};

export default OMRGrader;
