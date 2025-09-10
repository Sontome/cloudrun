import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Endpoint nhận Pub/Sub push
app.post("/", async (req, res) => {
  try {
    // Giải mã message từ Pub/Sub
    const messageData = req.body?.message?.data
      ? Buffer.from(req.body.message.data, "base64").toString()
      : "{}";
    const payload = JSON.parse(messageData);

    console.log("Nhận từ Pub/Sub:", payload);

    // Gọi Apps Script (đặt link thật vào đây)
    const scriptUrl = "https://script.google.com/macros/s/AKfycbxxx/exec";
    const response = await fetch(scriptUrl, {
      method: "POST",
      redirect: "follow", // Quan trọng để auto follow redirect
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.text();
    console.log("Phản hồi từ Apps Script:", result);

    // Phải trả 200 cho Pub/Sub để tránh retry
    res.status(200).send("OK");
  } catch (err) {
    console.error("Lỗi:", err);
    res.status(500).send("Error");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Cloud Run service chạy ở cổng ${port}`);
});
